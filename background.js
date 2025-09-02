let intercomTabId = null;
const MAX_ATTEMPTS = 3;
let attemptCount = 0;

// Intercom API configuration
const API_ENDPOINTS = {
  US: 'https://api.intercom.io',
  EU: 'https://api.eu.intercom.io',
  AU: 'https://api.au.intercom.io'
};

// Get stored Intercom settings
async function getIntercomSettings() {
  const result = await chrome.storage.sync.get([
    'intercomToken', 'intercomAdminId', 'intercomRegion', 'intercomTeamId'
  ]);
  
  return {
    token: result.intercomToken,
    adminId: result.intercomAdminId,
    region: result.intercomRegion || 'US',
    teamId: result.intercomTeamId,
    apiBase: API_ENDPOINTS[result.intercomRegion || 'US']
  };
}

// Make API request to Intercom
async function makeIntercomRequest(endpoint, method = 'GET', data = null) {
  const settings = await getIntercomSettings();
  
  if (!settings.token || !settings.adminId) {
    throw new Error('Intercom credentials not configured. Please set them in the extension options.');
  }
  
  const response = await fetch(`${settings.apiBase}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${settings.token}`,
      'Content-Type': 'application/json',
      'Intercom-Version': '2.11'
    },
    body: data ? JSON.stringify(data) : null
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${responseData.errors?.[0]?.message || responseData.message || 'Unknown error'}`);
  }
  
  return responseData;
}

// Core Intercom functions
async function searchContactByEmail(email) {
  const payload = {
    query: {
      operator: 'AND',
      value: [{ field: 'email', operator: '=', value: email }]
    }
  };
  
  const response = await makeIntercomRequest('/contacts/search', 'POST', payload);
  return response.data?.[0] || null;
}

async function createContact(email, name) {
  return await makeIntercomRequest('/contacts', 'POST', { email, name: name || null });
}

async function sendAdminMessage({ contactId, subject, htmlBody, openConversation = true }) {
  const settings = await getIntercomSettings();
  
  const payload = {
    message_type: 'email',
    subject,
    body: htmlBody,
    template: 'plain',
    from: { type: 'admin', id: Number(settings.adminId) },
    to: { type: 'user', id: contactId },
    create_conversation_without_contact_reply: Boolean(openConversation)
  };
  
  return await makeIntercomRequest('/messages', 'POST', payload);
}

async function assignConversation(conversationId, teamId, adminId) {
  if (!teamId) {
    await makeIntercomRequest(`/conversations/${conversationId}/run_assignment_rules`, 'POST');
    return;
  }
  
  const payload = {
    type: 'team',
    admin_id: String(adminId),
    assignee_id: String(teamId),
    message_type: 'assignment',
    body: 'Auto-assigned by extension.'
  };
  
  await makeIntercomRequest(`/conversations/${conversationId}/parts`, 'POST', payload);
}

// Main email sending function
async function handleSendEmail(data) {
  const { toEmail, toName, subject, htmlBody, openConversation = true } = data;
  
  // 1. Find or create contact
  let contact = await searchContactByEmail(toEmail);
  if (!contact) {
    contact = await createContact(toEmail, toName);
  }
  
  // 2. Send message
  const message = await sendAdminMessage({
    contactId: contact.id,
    subject,
    htmlBody,
    openConversation
  });
  
  // 3. Assign conversation (optional)
  if (openConversation && message.conversation_id) {
    const settings = await getIntercomSettings();
    try {
      await assignConversation(message.conversation_id, settings.teamId, settings.adminId);
    } catch (error) {
      console.error('Assignment error (non-fatal):', error);
    }
  }
  
  return {
    messageId: message.id,
    conversationId: message.conversation_id,
    contactId: contact.id
  };
}

// Test connection
async function testConnection() {
  const admin = await makeIntercomRequest('/me');
  return { admin: { id: admin.id, name: admin.name, email: admin.email } };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openPopup") {
    chrome.action.openPopup();
  } else if (request.action === "openIntercomTab") {
    openOrUpdateIntercomTab(request.url);
  } else if (request.action === "sendEmail") {
    handleSendEmail(request.data)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  } else if (request.action === "testConnection") {
    testConnection()
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

function openOrUpdateIntercomTab(url) {
  if (intercomTabId === null) {
    chrome.tabs.create({ url: url }, (tab) => {
      intercomTabId = tab.id;
      attemptCount = 0;
    });
  } else {
    chrome.tabs.get(intercomTabId, (tab) => {
      if (chrome.runtime.lastError) {
        // Tab doesn't exist anymore
        if (attemptCount < MAX_ATTEMPTS) {
          chrome.tabs.create({ url: url }, (newTab) => {
            intercomTabId = newTab.id;
            attemptCount++;
          });
        } else {
          console.error('Max attempts reached. Please try again later.');
          attemptCount = 0;
        }
      } else {
        // Tab exists, update its URL and focus it
        chrome.tabs.update(intercomTabId, { url: url, active: true });
        attemptCount = 0;
      }
    });
  }
}

// Listen for tab removal to reset intercomTabId
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === intercomTabId) {
    intercomTabId = null;
    attemptCount = 0;
  }
});
