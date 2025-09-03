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
    
    let name = '';
    let messagePrefix = '';
    
    console.log('Looking for name associated with email:', email);
    
    // Get the full page source for comprehensive search
    const pageSource = document.documentElement.outerHTML;
    const emailPattern = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Method 1: Look for Product Hunt specific patterns where email and name are directly associated
    
    // Pattern A: JSON objects with email and name together
    const jsonPatterns = [
      // {"email":"user@domain.com","name":"Full Name"}
      new RegExp(`\\{[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*\\}`, 'i'),
      // {"name":"Full Name","email":"user@domain.com"}  
      new RegExp(`\\{[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*\\}`, 'i'),
      // Product Hunt user objects: "user":{"name":"Full Name",...,"email":"user@domain.com"}
      new RegExp(`"user"\\s*:\\s*\\{[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*\\}`, 'i'),
      new RegExp(`"user"\\s*:\\s*\\{[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*\\}`, 'i')
    ];
    
    for (const pattern of jsonPatterns) {
      const match = pageSource.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        console.log('Found name from JSON pattern:', name);
        break;
      }
    }
    
    // Pattern B: If no JSON match, look for username-based patterns
    if (!name) {
      // Extract username from email (part before @)
      const emailUsername = email.split('@')[0];
      
      // Look for @username links associated with this email
      const usernamePattern = new RegExp(`href="[^"]*/@([^"]+)"[^>]*>[^<]*${emailPattern}|${emailPattern}[^<]*<[^>]*href="[^"]*/@([^"]+)"`, 'i');
      const usernameMatch = pageSource.match(usernamePattern);
      
      if (usernameMatch) {
        const username = usernameMatch[1] || usernameMatch[2];
        console.log('Found username associated with email:', username);
        
        // Now look for the display name for this username
        const displayNamePattern = new RegExp(`alt="([^"]+)"[^>]*>[^<]*href="[^"]*/@${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i');
        const displayNameMatch = pageSource.match(displayNamePattern);
        
        if (displayNameMatch && displayNameMatch[1]) {
          name = displayNameMatch[1].trim();
          console.log('Found display name for username:', name);
        } else {
          // Fallback: Convert username to readable name
          // e.g., "romeobellon" -> "Romeo Bellon", "rohanrecommends" -> "Rohan Recommends"
          const cleanUsername = username.replace(/[0-9]+$/, ''); // Remove trailing numbers
          const nameParts = cleanUsername.split(/[._-]/);
          name = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
          console.log('Generated name from username:', name);
        }
      }
    }
    
    // Pattern C: If still no name, look for alt attributes in img tags near the email
    if (!name) {
      // Find image alt attributes that might contain names near the email
      const emailRegex = new RegExp(emailPattern, 'gi');
      let match;
      
      while ((match = emailRegex.exec(pageSource)) !== null) {
        const emailIndex = match.index;
        
        // Look in a wider context around the email (300 chars each direction)
        const contextStart = Math.max(0, emailIndex - 300);
        const contextEnd = Math.min(pageSource.length, emailIndex + email.length + 300);
        const context = pageSource.substring(contextStart, contextEnd);
        
        // Look for alt attributes with names
        const altMatches = context.match(/alt="([^"]+)"/g);
        if (altMatches) {
          for (const altMatch of altMatches) {
            const altText = altMatch.match(/alt="([^"]+)"/)[1];
            // Check if this looks like a person's name (2-4 words, each starting with capital)
            if (/^[A-Z][a-z]+(?: [A-Z][a-z]*){1,3}$/.test(altText) && altText.length > 3) {
              name = altText.trim();
              console.log('Found name from alt attribute:', name);
              break;
            }
          }
          if (name) break;
        }
      }
    }
    
    // Clean up the name if found
    if (name) {
      // Remove common suffixes like "(@username)" or "- Title"
      name = name.replace(/\s*\([^)]*\).*$/, '').replace(/\s*[-–—].*$/, '').trim();
      
      // Extract first name for greeting
      const firstName = name.split(' ')[0];
      if (firstName && firstName.length > 1) {
        messagePrefix = `Hi ${firstName},\n\n`;
      }
    }
    
    console.log('Final extracted name:', name || 'None found');
    
    // Populate and show email panel
    if (!document.getElementById('email-intercom-panel')) {
      createEmailPanel();
    }
    
    document.getElementById('email-recipient-email').value = email;
    document.getElementById('email-recipient-name').value = name;
    document.getElementById('email-message').value = messagePrefix;
    
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

  // Function to initialize the extension
  function initializeExtension() {
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
  }

  // Multiple initialization strategies to handle different loading scenarios
  if (document.readyState === 'loading') {
    // Document is still loading
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeExtension, 500);
    });
  } else if (document.readyState === 'interactive') {
    // Document is done loading but resources may still be loading
    setTimeout(initializeExtension, 1000);
  } else {
    // Document and resources are done loading
    setTimeout(initializeExtension, 500);
  }

  // Also try after window load as final fallback
  window.addEventListener('load', () => {
    setTimeout(initializeExtension, 2000);
  });
});
