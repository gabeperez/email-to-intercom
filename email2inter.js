// Check if current page matches allowed domains/pages
function matchesAllowedDomains(url, allowedDomains) {
  if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) return false;
  const pageUrl = new URL(url);
  return allowedDomains.some(pattern => {
    pattern = pattern.trim();
    if (!pattern) return false;
    // If pattern is a full URL
    if (pattern.startsWith('http://') || pattern.startsWith('https://')) {
      try {
        const patternUrl = new URL(pattern);
        // Match full URL (ignoring trailing slash)
        return (
          pageUrl.href.replace(/\/$/, '') === patternUrl.href.replace(/\/$/, '')
        );
      } catch (e) {
        return false;
      }
    } else {
      // Otherwise, treat as domain match (e.g. example.com)
      return (
        pageUrl.hostname === pattern ||
        pageUrl.hostname.endsWith('.' + pattern)
      );
    }
  });
}

chrome.storage.local.get(['allowedDomains'], function(result) {
  if (chrome.runtime.lastError) {
    console.error('Chrome runtime error:', chrome.runtime.lastError);
    return;
  }
  const allowedDomains = result.allowedDomains;
  // If allowedDomains is empty or not set, run everywhere (default behavior)
  if (Array.isArray(allowedDomains) && allowedDomains.length > 0) {
    if (!matchesAllowedDomains(window.location.href, allowedDomains)) {
      // Not allowed, do nothing
      return;
    }
  }

  // Improved email regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;

  // Set to keep track of processed nodes
  const processedNodes = new WeakSet();

  // Function to open email composer popup
  function openEmailComposer(email, name = '') {
    const popupUrl = chrome.runtime.getURL('email-composer.html');
    const params = new URLSearchParams({ email: email });
    if (name) params.append('name', name);
    
    const fullUrl = `${popupUrl}?${params.toString()}`;
    
    // Create popup window
    const popup = window.open(
      fullUrl,
      'emailComposer',
      'width=450,height=500,scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no'
    );
    
    // Focus the popup if it was created successfully
    if (popup) {
      popup.focus();
    }
  }

  // Function to make emails clickable
  function makeEmailsClickable() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === Node.TEXT_NODE && !processedNodes.has(node) && node.textContent.match(emailRegex)) {
        nodesToReplace.push(node);
      }
    }

    for (const node of nodesToReplace) {
      if (!node.parentNode) continue;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      const matches = node.textContent.matchAll(emailRegex);
      for (const match of matches) {
        fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex, match.index)));
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = match[0];
        link.style.cssText = 'color: #007bff; text-decoration: underline; cursor: pointer; font-weight: 500;';
        link.title = "Click to send email via Intercom";
        link.addEventListener('click', (e) => handleEmailClick(e, match[0]));
        fragment.appendChild(link);
        lastIndex = match.index + match[0].length;
      }
      fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
      
      if (node.parentNode) {
        node.parentNode.replaceChild(fragment, node);
        processedNodes.add(fragment);
      }
    }
  }

  // Function to handle email click
  function handleEmailClick(e, email) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    // Try to extract name from nearby text (look for common patterns)
    let name = '';
    const parentElement = e.target.parentElement;
    if (parentElement) {
      // Look for name patterns like "John Doe <john@example.com>" or "john@example.com (John Doe)"
      const textContent = parentElement.textContent;
      const emailIndex = textContent.indexOf(email);
      
      if (emailIndex > 0) {
        // Look for name before email
        const beforeEmail = textContent.substring(0, emailIndex).trim();
        if (beforeEmail && beforeEmail.length < 50) {
          name = beforeEmail;
        }
      } else if (emailIndex >= 0 && emailIndex + email.length < textContent.length) {
        // Look for name after email
        const afterEmail = textContent.substring(emailIndex + email.length).trim();
        if (afterEmail && afterEmail.length < 50 && !afterEmail.includes('@')) {
          name = afterEmail.replace(/^[^\w]*/, '').replace(/[^\w]*$/, '');
        }
      }
    }
    
    // Open email composer popup
    openEmailComposer(email, name);
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Debounced version of makeEmailsClickable
  const debouncedMakeEmailsClickable = debounce(makeEmailsClickable, 300);

  // Initialize extension after window load and a delay
  window.addEventListener('load', function() {
    setTimeout(() => {
      console.log('Initializing Email to Intercom Linker');
      makeEmailsClickable();

      // Set up MutationObserver
      const observer = new MutationObserver(mutations => {
        if (mutations.some(mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0)) {
          debouncedMakeEmailsClickable();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }, 2000); // 2 second delay after window load
  });
});
