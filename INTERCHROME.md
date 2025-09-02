# Chrome Extension + Intercom Integration Guide

A step-by-step guide to add Intercom email sending capabilities to any Chrome extension.

## 🎯 Overview

This guide shows you how to integrate Intercom's messaging API into Chrome extensions, allowing you to send emails directly from your tools without opening Intercom. Perfect for support tools, feedback systems, outreach automation, etc.

**✅ IMPLEMENTED**: The Email to Intercom Linker extension now includes full Intercom API integration for sending emails directly from the extension.

## 📋 Prerequisites

### Intercom Setup
1. **Intercom Account** with admin access
2. **Personal Access Token** from Intercom Developer Hub
3. **Admin ID** from your Intercom profile
4. **Team IDs** (optional) for conversation routing

### Chrome Extension Basics
- Basic understanding of Chrome extension development
- Manifest V3 knowledge (recommended)
- JavaScript/API experience

## 🔧 Step 1: Extension Manifest Setup

Add these permissions to your `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Your Tool Name",
  "version": "1.0.0",
  
  "permissions": [
    "storage",
    "activeTab"
  ],
  
  "host_permissions": [
    "https://api.intercom.io/*",
    "https://api.eu.intercom.io/*",
    "https://api.au.intercom.io/*"
  ],
  
  "background": {
    "service_worker": "background.js"
  },
  
  "content_scripts": [
    {
      "matches": ["https://example.com/*"],
      "js": ["content.js"]
    }
  ],
  
  "action": {
    "default_popup": "popup.html"
  },
  
  "options_page": "options.html"
}
```

**Key Points:**
- `storage` permission for saving Intercom credentials
- `host_permissions` for all Intercom API regions
- `background` service worker for API calls
- `options_page` for credential configuration

## 🔑 Step 2: Credential Management

### Options Page (`options.html`)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Intercom Settings</title>
  <style>
    body { font-family: system-ui; padding: 20px; max-width: 600px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    .status { margin-top: 12px; padding: 8px; border-radius: 4px; display: none; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>Intercom Integration Settings</h1>
  
  <form id="settingsForm">
    <div class="form-group">
      <label for="token">Personal Access Token *</label>
      <input type="password" id="token" placeholder="sk_live_..." required>
      <small>Get from <a href="https://developers.intercom.com/" target="_blank">Intercom Developer Hub</a></small>
    </div>
    
    <div class="form-group">
      <label for="adminId">Admin ID *</label>
      <input type="text" id="adminId" placeholder="394051" required>
      <small>Your admin user ID (number)</small>
    </div>
    
    <div class="form-group">
      <label for="region">Region</label>
      <select id="region">
        <option value="US">US (api.intercom.io)</option>
        <option value="EU">EU (api.eu.intercom.io)</option>
        <option value="AU">AU (api.au.intercom.io)</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="teamId">Default Team ID (Optional)</label>
      <input type="text" id="teamId" placeholder="530165">
      <small>For automatic conversation assignment</small>
    </div>
    
    <button type="submit">Save Settings</button>
    <button type="button" id="testBtn">Test Connection</button>
  </form>
  
  <div id="status" class="status"></div>
  
  <script src="options.js"></script>
</body>
</html>
```

### Options Script (`options.js`)
```javascript
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('settingsForm').addEventListener('submit', saveSettings);
document.getElementById('testBtn').addEventListener('click', testConnection);

async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'intercomToken', 'intercomAdminId', 'intercomRegion', 'intercomTeamId'
  ]);
  
  if (settings.intercomToken) document.getElementById('token').value = settings.intercomToken;
  if (settings.intercomAdminId) document.getElementById('adminId').value = settings.intercomAdminId;
  if (settings.intercomRegion) document.getElementById('region').value = settings.intercomRegion;
  if (settings.intercomTeamId) document.getElementById('teamId').value = settings.intercomTeamId;
}

async function saveSettings(e) {
  e.preventDefault();
  
  const settings = {
    intercomToken: document.getElementById('token').value.trim(),
    intercomAdminId: document.getElementById('adminId').value.trim(),
    intercomRegion: document.getElementById('region').value,
    intercomTeamId: document.getElementById('teamId').value.trim() || null
  };
  
  try {
    await chrome.storage.sync.set(settings);
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

async function testConnection() {
  const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
  
  if (response.success) {
    showStatus(`Connected as ${response.admin.name} (${response.admin.email})`, 'success');
  } else {
    showStatus('Connection failed: ' + response.error, 'error');
  }
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => status.style.display = 'none', 5000);
  }
}
```

## 🌐 Step 3: Background Script (API Handler)

### Background Script (`background.js`)
```javascript
// Intercom API configuration
const API_ENDPOINTS = {
  US: 'https://api.intercom.io',
  EU: 'https://api.eu.intercom.io',
  AU: 'https://api.au.intercom.io'
};

// Get stored settings
async function getSettings() {
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
  const settings = await getSettings();
  
  if (!settings.token || !settings.adminId) {
    throw new Error('Intercom credentials not configured');
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
    throw new Error(`API error: ${response.status} - ${responseData.errors?.[0]?.message || responseData.message}`);
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
  const settings = await getSettings();
  
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

// Message handlers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendEmail') {
    handleSendEmail(request.data)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'testConnection') {
    testConnection()
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

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
    const settings = await getSettings();
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
```

## 🎨 Step 4: Content Script Integration

### Content Script (`content.js`)
```javascript
// Your tool's main functionality
console.log('Extension loaded');

// Example: Add email sending to existing UI
function addEmailSendingToTool() {
  // Find your existing buttons/forms
  const existingButton = document.querySelector('.your-existing-button');
  
  if (existingButton) {
    existingButton.addEventListener('click', handleSendEmail);
  }
}

// Email sending function
async function handleSendEmail() {
  // Extract data from your page/form
  const emailData = {
    toEmail: extractEmailFromPage(),
    toName: extractNameFromPage(),
    subject: generateSubject(),
    htmlBody: generateEmailBody(),
    openConversation: true
  };
  
  // Validate required fields
  if (!emailData.toEmail || !emailData.subject || !emailData.htmlBody) {
    alert('Missing required email data');
    return;
  }
  
  try {
    // Send via background script
    const response = await chrome.runtime.sendMessage({
      action: 'sendEmail',
      data: emailData
    });
    
    if (response.success) {
      showSuccessMessage(`Email sent! Message ID: ${response.messageId}`);
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    showErrorMessage(`Failed to send email: ${error.message}`);
  }
}

// Helper functions (customize for your tool)
function extractEmailFromPage() {
  // Your logic to get email from page
  return document.querySelector('[data-email]')?.textContent || '';
}

function extractNameFromPage() {
  // Your logic to get name from page
  return document.querySelector('[data-name]')?.textContent || '';
}

function generateSubject() {
  // Your logic to generate subject
  return 'Subject from your tool';
}

function generateEmailBody() {
  // Your logic to generate email body
  return `
    <p>Hello,</p>
    <p>This email was sent from your Chrome extension tool.</p>
    <p>Best regards,<br>Your Team</p>
  `;
}

function showSuccessMessage(message) {
  // Your UI feedback logic
  console.log('Success:', message);
}

function showErrorMessage(message) {
  // Your UI feedback logic
  console.error('Error:', message);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addEmailSendingToTool);
} else {
  addEmailSendingToTool();
}
```

## 📱 Step 5: Popup Interface (Optional)

### Popup HTML (`popup.html`)
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 300px; padding: 16px; font-family: system-ui; }
    .form-group { margin-bottom: 12px; }
    label { display: block; margin-bottom: 4px; font-size: 12px; color: #666; }
    input, textarea { width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
    textarea { height: 60px; resize: vertical; }
    button { width: 100%; background: #007bff; color: white; padding: 8px; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { opacity: 0.6; }
    .status { margin-top: 8px; padding: 6px; border-radius: 4px; font-size: 12px; display: none; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h3>Quick Email</h3>
  
  <div class="form-group">
    <label>To Email:</label>
    <input type="email" id="toEmail" placeholder="recipient@example.com">
  </div>
  
  <div class="form-group">
    <label>Subject:</label>
    <input type="text" id="subject" placeholder="Email subject">
  </div>
  
  <div class="form-group">
    <label>Message:</label>
    <textarea id="message" placeholder="Your message..."></textarea>
  </div>
  
  <button id="sendBtn">Send via Intercom</button>
  <div id="status" class="status"></div>
  
  <script src="popup.js"></script>
</body>
</html>
```

### Popup Script (`popup.js`)
```javascript
document.getElementById('sendBtn').addEventListener('click', sendEmail);

async function sendEmail() {
  const sendBtn = document.getElementById('sendBtn');
  const status = document.getElementById('status');
  
  const data = {
    toEmail: document.getElementById('toEmail').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    htmlBody: `<p>${document.getElementById('message').value.trim()}</p>`,
    openConversation: true
  };
  
  if (!data.toEmail || !data.subject || !data.htmlBody) {
    showStatus('Please fill in all fields', 'error');
    return;
  }
  
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending...';
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'sendEmail',
      data: data
    });
    
    if (response.success) {
      showStatus('Email sent successfully!', 'success');
      // Clear form
      document.getElementById('toEmail').value = '';
      document.getElementById('subject').value = '';
      document.getElementById('message').value = '';
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    showStatus('Failed to send: ' + error.message, 'error');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send via Intercom';
  }
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => status.style.display = 'none', 3000);
  }
}
```

## 🔒 Step 6: Security & Best Practices

### Credential Security
```javascript
// ✅ Good: Store in Chrome sync storage
chrome.storage.sync.set({ intercomToken: 'sk_live_...' });

// ❌ Bad: Store in localStorage or global variables
localStorage.setItem('token', 'sk_live_...');
window.intercomToken = 'sk_live_...';
```

### Error Handling
```javascript
async function safeApiCall(apiFunction, ...args) {
  try {
    return await apiFunction(...args);
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error types
    if (error.message.includes('401')) {
      throw new Error('Invalid Intercom credentials. Please check settings.');
    } else if (error.message.includes('429')) {
      throw new Error('Rate limited. Please try again later.');
    } else if (error.message.includes('404')) {
      throw new Error('Resource not found. Contact may not exist.');
    }
    
    throw error;
  }
}
```

### Rate Limiting
```javascript
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.requests = [];
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length < this.maxRequests;
  }
  
  recordRequest() {
    this.requests.push(Date.now());
  }
}

const rateLimiter = new RateLimiter();

async function sendEmailWithRateLimit(data) {
  if (!rateLimiter.canMakeRequest()) {
    throw new Error('Rate limit exceeded. Please wait a moment.');
  }
  
  rateLimiter.recordRequest();
  return await handleSendEmail(data);
}
```

## 🚀 Step 7: Testing & Deployment

### Testing Checklist
- [ ] Extension loads without errors
- [ ] Settings page saves/loads credentials
- [ ] Test connection works
- [ ] Email sending works
- [ ] Error handling works
- [ ] Rate limiting works (if implemented)
- [ ] UI feedback is clear

### Deployment
1. **Pack extension**: `chrome://extensions/` → "Pack extension"
2. **Test with team**: Share `.crx` file for testing
3. **Chrome Web Store**: For public distribution
4. **Internal distribution**: Share unpacked folder or `.crx`

## 🎛️ Customization Examples

### Template System
```javascript
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to our platform!',
    body: (name) => `<p>Hi ${name},</p><p>Welcome aboard!</p>`
  },
  follow_up: {
    subject: 'Following up on your request',
    body: (name) => `<p>Hi ${name},</p><p>Just following up...</p>`
  }
};

function sendTemplateEmail(templateKey, recipientData) {
  const template = EMAIL_TEMPLATES[templateKey];
  return chrome.runtime.sendMessage({
    action: 'sendEmail',
    data: {
      toEmail: recipientData.email,
      toName: recipientData.name,
      subject: template.subject,
      htmlBody: template.body(recipientData.name),
      openConversation: true
    }
  });
}
```

### Bulk Email Sending
```javascript
async function sendBulkEmails(recipients, template) {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendTemplateEmail(template, recipient);
      results.push({ email: recipient.email, success: true, ...result });
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ email: recipient.email, success: false, error: error.message });
    }
  }
  
  return results;
}
```

### Integration with Existing Tools
```javascript
// Example: Integrate with CRM data
function extractCRMData() {
  return {
    email: document.querySelector('.contact-email').textContent,
    name: document.querySelector('.contact-name').textContent,
    company: document.querySelector('.contact-company').textContent
  };
}

// Example: Send personalized emails
function sendPersonalizedEmail() {
  const crmData = extractCRMData();
  
  const emailData = {
    toEmail: crmData.email,
    toName: crmData.name,
    subject: `Follow up with ${crmData.company}`,
    htmlBody: `
      <p>Hi ${crmData.name},</p>
      <p>Thanks for your interest in our services. Based on our conversation about ${crmData.company}...</p>
      <p>Best regards,<br>Your Team</p>
    `,
    openConversation: true
  };
  
  return chrome.runtime.sendMessage({ action: 'sendEmail', data: emailData });
}
```

## 📚 Common Use Cases

### Support Tools
- **Feedback collection**: Send follow-up emails after support tickets
- **Onboarding**: Automated welcome sequences
- **Check-ins**: Regular customer health checks

### Sales Tools
- **Lead follow-up**: Immediate responses to form submissions
- **Demo scheduling**: Automated demo confirmation emails
- **Proposal delivery**: Send proposals with tracking

### Community Management
- **Moderation feedback**: Like your PH feedback tool
- **Event notifications**: Community event reminders
- **Welcome messages**: New member onboarding

### Content Tools
- **Newsletter sending**: Quick newsletter distribution
- **Content notifications**: Notify when new content is published
- **Collaboration**: Team communication for content workflows

## ⚡ Quick Integration Checklist

For any new tool:

1. **Add permissions** to manifest.json
2. **Copy background.js** Intercom handler
3. **Add options page** for credentials
4. **Modify content script** to call `chrome.runtime.sendMessage`
5. **Add UI feedback** for success/error states
6. **Test thoroughly** before deploying

This modular approach lets you add Intercom email sending to any Chrome extension in about 30 minutes!

## 🎉 Implementation Status

**✅ COMPLETED**: The Email to Intercom Linker extension now includes:
- Full Intercom API integration
- Email composer popup
- Automatic contact creation
- Multi-region support (US, EU, Australia)
- Credential management via options page
- Direct email sending without opening Intercom

The extension is ready for use and demonstrates all the concepts outlined in this guide.