document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('settingsForm').addEventListener('submit', saveSettings);
document.getElementById('testBtn').addEventListener('click', testConnection);

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'intercomToken', 'intercomAdminId', 'intercomRegion', 'intercomTeamId', 'allowedDomains'
    ]);
    
    if (result.intercomToken) document.getElementById('token').value = result.intercomToken;
    if (result.intercomAdminId) document.getElementById('adminId').value = result.intercomAdminId;
    if (result.intercomRegion) document.getElementById('region').value = result.intercomRegion;
    if (result.intercomTeamId) document.getElementById('teamId').value = result.intercomTeamId;
    if (result.allowedDomains) {
      // Convert array back to newline-separated string
      const domainsText = Array.isArray(result.allowedDomains) 
        ? result.allowedDomains.join('\n') 
        : result.allowedDomains;
      document.getElementById('allowedDomains').value = domainsText;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings: ' + error.message, 'error');
  }
}

async function saveSettings(e) {
  e.preventDefault();
  
  // Process allowed domains
  const allowedDomainsText = document.getElementById('allowedDomains').value.trim();
  let allowedDomains = [];
  
  if (allowedDomainsText) {
    // Split by newlines and clean up each domain
    allowedDomains = allowedDomainsText
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0)
      .map(domain => {
        // Validate and clean up domain format
        if (domain.startsWith('http://') || domain.startsWith('https://')) {
          // Full URL - keep as is
          return domain;
        } else if (domain.includes('.')) {
          // Domain only - add protocol for validation but store without it
          try {
            new URL('https://' + domain); // Validate it's a valid domain
            return domain;
          } catch (e) {
            throw new Error(`Invalid domain format: ${domain}`);
          }
        } else {
          throw new Error(`Invalid domain format: ${domain}. Use domain.com or https://full-url.com`);
        }
      });
  }
  
  const settings = {
    intercomToken: document.getElementById('token').value.trim(),
    intercomAdminId: document.getElementById('adminId').value.trim(),
    intercomRegion: document.getElementById('region').value,
    intercomTeamId: document.getElementById('teamId').value.trim() || null,
    allowedDomains: allowedDomains
  };
  
  // Validate required fields
  if (!settings.intercomToken || !settings.intercomAdminId) {
    showStatus('Please fill in all required fields', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set(settings);
    
    // Also save to local storage for the content script
    await chrome.storage.local.set({ allowedDomains: allowedDomains });
    
    let statusMessage = 'Settings saved successfully!';
    if (allowedDomains.length > 0) {
      statusMessage += ` Extension will work on ${allowedDomains.length} specified website(s).`;
    } else {
      statusMessage += ' Extension will work on all websites.';
    }
    
    showStatus(statusMessage, 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

async function testConnection() {
  const testBtn = document.getElementById('testBtn');
  const originalText = testBtn.textContent;
  
  testBtn.disabled = true;
  testBtn.textContent = 'Testing...';
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
    
    if (response.success) {
      showStatus(`Connected successfully as ${response.admin.name} (${response.admin.email})`, 'success');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    showStatus('Connection failed: ' + error.message, 'error');
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = originalText;
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
