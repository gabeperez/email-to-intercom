document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('settingsForm').addEventListener('submit', saveSettings);
document.getElementById('testBtn').addEventListener('click', testConnection);

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'intercomToken', 'intercomAdminId', 'intercomRegion', 'intercomTeamId'
    ]);
    
    if (result.intercomToken) document.getElementById('token').value = result.intercomToken;
    if (result.intercomAdminId) document.getElementById('adminId').value = result.intercomAdminId;
    if (result.intercomRegion) document.getElementById('region').value = result.intercomRegion;
    if (result.intercomTeamId) document.getElementById('teamId').value = result.intercomTeamId;
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings: ' + error.message, 'error');
  }
}

async function saveSettings(e) {
  e.preventDefault();
  
  const settings = {
    intercomToken: document.getElementById('token').value.trim(),
    intercomAdminId: document.getElementById('adminId').value.trim(),
    intercomRegion: document.getElementById('region').value,
    intercomTeamId: document.getElementById('teamId').value.trim() || null
  };
  
  // Validate required fields
  if (!settings.intercomToken || !settings.intercomAdminId) {
    showStatus('Please fill in all required fields', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set(settings);
    showStatus('Settings saved successfully!', 'success');
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
