document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('saveButton');
  const appCodeInput = document.getElementById('appCodeInput');
  const statusElement = document.getElementById('status');
  const allowedDomainsInput = document.getElementById('allowedDomainsInput');

  // Load saved app code if it exists
  try {
    chrome.storage.local.get(['intercomAppCode', 'allowedDomains'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        return;
      }
      if (result.intercomAppCode) {
        appCodeInput.value = result.intercomAppCode;
      }
      if (result.allowedDomains && Array.isArray(result.allowedDomains)) {
        allowedDomainsInput.value = result.allowedDomains.join('\n');
      }
    });
  } catch (error) {
    console.error('Error accessing chrome API:', error);
  }

  saveButton.addEventListener('click', function() {
    const appCode = appCodeInput.value.trim();
    const allowedDomains = allowedDomainsInput.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    if (appCode) {
      try {
        chrome.storage.local.set({intercomAppCode: appCode, allowedDomains: allowedDomains}, function() {
          if (chrome.runtime.lastError) {
            statusElement.textContent = 'Error saving settings. Please try again.';
            console.error('Chrome runtime error:', chrome.runtime.lastError);
          } else {
            statusElement.textContent = 'Settings saved successfully!';
            setTimeout(() => { window.close(); }, 1500);
          }
        });
      } catch (error) {
        console.error('Error accessing chrome API:', error);
        statusElement.textContent = 'Error saving settings. Please try again.';
      }
    } else {
      statusElement.textContent = 'Please enter a valid app code.';
    }
  });
});
