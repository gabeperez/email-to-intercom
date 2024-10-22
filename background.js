let intercomTabId = null;
const MAX_ATTEMPTS = 3;
let attemptCount = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openPopup") {
    chrome.action.openPopup();
  } else if (request.action === "openIntercomTab") {
    openOrUpdateIntercomTab(request.url);
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
