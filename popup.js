document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('saveButton');
  const appCodeInput = document.getElementById('appCodeInput');
  const statusElement = document.getElementById('status');

  // Load saved app code if it exists
  try {
    chrome.storage.local.get(['intercomAppCode'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        return;
      }
      if (result.intercomAppCode) {
        appCodeInput.value = result.intercomAppCode;
      }
    });
  } catch (error) {
    console.error('Error accessing chrome API:', error);
  }

  saveButton.addEventListener('click', function() {
    const appCode = appCodeInput.value.trim();
    if (appCode) {
      try {
        chrome.storage.local.set({intercomAppCode: appCode}, function() {
          if (chrome.runtime.lastError) {
            statusElement.textContent = 'Error saving app code. Please try again.';
            console.error('Chrome runtime error:', chrome.runtime.lastError);
          } else {
            statusElement.textContent = 'App code saved successfully!';
            setTimeout(() => { window.close(); }, 1500);
          }
        });
      } catch (error) {
        console.error('Error accessing chrome API:', error);
        statusElement.textContent = 'Error saving app code. Please try again.';
      }
    } else {
      statusElement.textContent = 'Please enter a valid app code.';
    }
  });
});
