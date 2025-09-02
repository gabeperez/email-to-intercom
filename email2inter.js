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

// Inject CSS styles
function injectStyles() {
  if (document.getElementById('email-intercom-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'email-intercom-styles';
  style.textContent = `
    /* Email Panel */
    #email-intercom-panel {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: #ffffff;
      border-left: 1px solid #e1e8ed;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      transition: right 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    #email-intercom-panel.panel-visible {
      right: 0;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid #e1e8ed;
      background: #f8f9fa;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .settings-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .settings-btn:hover {
      background: #e1e8ed;
      color: #333;
      transform: scale(1.05);
    }

    .panel-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }

    .close-btn:hover {
      background: #e1e8ed;
    }

    .panel-content {
      padding: 20px;
      height: calc(100vh - 81px);
      overflow-y: auto;
    }

    .recipient-info {
      margin-bottom: 24px;
    }

    .info-item {
      margin-bottom: 16px;
    }

    .info-item label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .info-item input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .info-item input:focus {
      outline: none;
      border-color: #007bff;
    }

    .email-form {
      margin-bottom: 20px;
    }

    .form-field {
      margin-bottom: 20px;
    }

    .form-field label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s ease;
      resize: vertical;
      box-sizing: border-box;
    }

    .form-field input:focus,
    .form-field textarea:focus {
      outline: none;
      border-color: #007bff;
    }

    .form-field textarea {
      min-height: 120px;
      line-height: 1.5;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #666;
      border: 1px solid #e1e8ed;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-loading {
      color: #007bff;
    }

    .required {
      color: #dc3545;
    }

    .email-status {
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .status-success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .status-error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    /* Mobile Responsiveness */
    @media (max-width: 480px) {
      #email-intercom-panel {
        width: 100%;
        right: -100%;
      }
    }
  `;
  
  document.head.appendChild(style);
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

  // Create email panel
  function createEmailPanel() {
    if (document.getElementById('email-intercom-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'email-intercom-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>📧 Send Email via Intercom</h3>
        <div class="header-actions">
          <button class="settings-btn" id="email-settings-btn" title="Settings">⚙️</button>
          <button class="close-btn" id="email-close-panel">✕</button>
        </div>
      </div>
      
      <div class="panel-content">
        <div class="recipient-info" id="recipient-info">
          <div class="info-item">
            <label>To Email:</label>
            <input type="email" id="email-recipient-email" placeholder="recipient@example.com" readonly>
          </div>
          <div class="info-item">
            <label>Recipient Name:</label>
            <input type="text" id="email-recipient-name" placeholder="Optional">
          </div>
        </div>
        
        <div class="email-form">
          <div class="form-field">
            <label>Subject <span class="required">*</span></label>
            <input type="text" id="email-subject" placeholder="Enter email subject" required>
          </div>
          
          <div class="form-field">
            <label>Message <span class="required">*</span></label>
            <textarea id="email-message" rows="8" placeholder="Enter your message..." required></textarea>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-secondary" id="email-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="email-send-btn">
              <span class="btn-text">Send Email</span>
              <span class="btn-loading" style="display:none;">Sending...</span>
            </button>
          </div>
        </div>
        
        <div class="email-status" id="email-status" style="display:none;"></div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('email-close-panel').addEventListener('click', hideEmailPanel);
    document.getElementById('email-settings-btn').addEventListener('click', openSettings);
    document.getElementById('email-cancel-btn').addEventListener('click', hideEmailPanel);
    document.getElementById('email-send-btn').addEventListener('click', sendEmail);
  }

  // Show email panel
  function showEmailPanel() {
    if (!document.getElementById('email-intercom-panel')) {
      createEmailPanel();
    }
    document.getElementById('email-intercom-panel').classList.add('panel-visible');
  }

  // Hide email panel
  function hideEmailPanel() {
    const panel = document.getElementById('email-intercom-panel');
    if (panel) panel.classList.remove('panel-visible');
  }

  // Open settings
  function openSettings() {
    chrome.runtime.sendMessage({ action: 'openOptionsPage' });
  }

  // Send email
  async function sendEmail() {
    const sendBtn = document.getElementById('email-send-btn');
    const btnText = sendBtn.querySelector('.btn-text');
    const btnLoading = sendBtn.querySelector('.btn-loading');
    const statusDiv = document.getElementById('email-status');
    
    const data = {
      toEmail: document.getElementById('email-recipient-email').value.trim(),
      toName: document.getElementById('email-recipient-name').value.trim() || null,
      subject: document.getElementById('email-subject').value.trim(),
      htmlBody: `<p>${document.getElementById('email-message').value.trim().replace(/\n/g, '</p><p>')}</p>`,
      openConversation: true
    };
    
    if (!data.toEmail || !data.subject || !data.htmlBody) {
      showStatus('Please fill in all required fields', 'error');
      return;
    }
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    sendBtn.disabled = true;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'sendEmail',
        data: data
      });
      
      if (response.success) {
        showStatus(`✅ Email sent successfully! Message ID: ${response.messageId}`, 'success');
        
        // Clear form
        document.getElementById('email-subject').value = '';
        document.getElementById('email-message').value = '';
        
        // Auto-close after success
        setTimeout(() => {
          hideEmailPanel();
        }, 2000);
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      showStatus(`❌ Failed to send email: ${error.message}`, 'error');
    } finally {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      sendBtn.disabled = false;
    }
  }

  // Show status message
  function showStatus(message, type) {
    const statusDiv = document.getElementById('email-status');
    if (!statusDiv) return;
    statusDiv.textContent = message;
    statusDiv.className = `email-status status-${type}`;
    statusDiv.style.display = 'block';
    if (type === 'success') {
      setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
    }
  }

  // Function to handle email click
  function handleEmailClick(e, email) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    // Try to extract name from multiple sources
    let name = '';
    
    // 1. Check for original tooltip data (stored before we modified it)
    const target = e.target;
    if (target.dataset.originalTooltip && target.dataset.originalTooltip.trim()) {
      name = target.dataset.originalTooltip.trim();
    }
    
    // 1b. Check for current tooltip data (title attribute) as fallback
    if (!name && target.title && target.title.trim() && !target.title.includes('@') && !target.title.includes('Intercom')) {
      name = target.title.trim();
    }
    
    // 2. Check for data attributes that might contain name
    if (!name && target.dataset) {
      const possibleNameFields = ['name', 'fullname', 'fullName', 'userName', 'username', 'displayName'];
      for (const field of possibleNameFields) {
        if (target.dataset[field] && target.dataset[field].trim()) {
          name = target.dataset[field].trim();
          break;
        }
      }
    }
    
    // 3. Check for aria-label (accessibility attribute)
    if (!name && target.getAttribute('aria-label')) {
      const ariaLabel = target.getAttribute('aria-label').trim();
      if (ariaLabel && !ariaLabel.includes('@')) {
        name = ariaLabel;
      }
    }
    
    // 4. Look for name in nearby text (existing logic)
    if (!name) {
      const parentElement = e.target.parentElement;
      if (parentElement) {
        const textContent = parentElement.textContent;
        const emailIndex = textContent.indexOf(email);
        
        if (emailIndex > 0) {
          // Look for name before email
          const beforeEmail = textContent.substring(0, emailIndex).trim();
          if (beforeEmail && beforeEmail.length < 50 && !beforeEmail.includes('@')) {
            name = beforeEmail;
          }
        } else if (emailIndex >= 0 && emailIndex + email.length < textContent.length) {
          // Look for name after email
          const afterEmail = textContent.substring(emailIndex + email.length).trim();
          if (afterEmail && afterEmail.length < 50 && !afterEmail.includes('@')) {
            name = afterEmail.replace(/^[^\w\s]*/, '').replace(/[^\w\s]*$/, '');
          }
        }
      }
    }
    
    // 5. Look for name in parent elements (broader search)
    if (!name) {
      let currentElement = e.target.parentElement;
      let searchDepth = 0;
      const maxDepth = 3; // Don't go too deep in the DOM
      
      while (currentElement && searchDepth < maxDepth) {
        // Look for common name patterns in the element
        const elementText = currentElement.textContent || '';
        const emailIndex = elementText.indexOf(email);
        
        if (emailIndex > 0) {
          // Check text before email
          const beforeEmail = elementText.substring(0, emailIndex).trim();
          // Look for name patterns (2-4 words, no special chars)
          const nameMatch = beforeEmail.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
          if (nameMatch && nameMatch[1] && nameMatch[1].length < 50) {
            name = nameMatch[1];
            break;
          }
        }
        
        currentElement = currentElement.parentElement;
        searchDepth++;
      }
    }
    
    // Clean up the name if found
    if (name) {
      // Remove extra whitespace and common prefixes/suffixes
      name = name
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .replace(/^[^\w\s]*/, '') // Remove leading non-word chars
        .replace(/[^\w\s]*$/, '') // Remove trailing non-word chars
        .trim();
      
      // If name is too long or contains email-like content, discard it
      if (name.length > 50 || name.includes('@') || name.includes('http')) {
        name = '';
      }
    }
    
    // Populate and show email panel
    if (!document.getElementById('email-intercom-panel')) {
      createEmailPanel();
    }
    
    document.getElementById('email-recipient-email').value = email;
    document.getElementById('email-recipient-name').value = name;
    
    showEmailPanel();
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
        
        // Store original tooltip/title from parent element before we override it
        let originalTooltip = '';
        if (node.parentNode && node.parentNode.title) {
          originalTooltip = node.parentNode.title;
        }
        
        // Store original tooltip as a data attribute for later retrieval
        if (originalTooltip && !originalTooltip.includes('@')) {
          link.dataset.originalTooltip = originalTooltip;
        }
        
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
      
      // Inject styles first
      injectStyles();
      
      // Create email panel (but don't show it yet)
      createEmailPanel();
      
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
