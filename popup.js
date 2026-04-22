document.addEventListener('DOMContentLoaded', function() {
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const testConnectionBtn = document.getElementById('testConnectionBtn');
  const statusElement = document.getElementById('status');

  // Open options page
  openOptionsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  // Test Intercom connection
  testConnectionBtn.addEventListener('click', async function() {
    const testBtn = testConnectionBtn;
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
      
      if (error.message.includes('credentials not configured')) {
        showStatus('Please configure Intercom credentials in Settings first', 'error');
      } else {
        showStatus('Connection failed: ' + error.message, 'error');
      }
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = originalText;
    }
  });

  function showStatus(message, type) {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => statusElement.style.display = 'none', 5000);
    }
  }
});
