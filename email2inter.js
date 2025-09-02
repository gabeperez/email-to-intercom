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
    
    // 1. First, check if email is associated with Launch Team members
    const pageSource = document.documentElement.outerHTML;
    
    // Look for Launch Team section and extract names from it
    // Try multiple patterns for different Product Hunt page structures
    
    // Pattern 1: Launch Team followed by content until next major section
    let launchTeamMatch = pageSource.match(/Launch Team.*?(?=<(?:div|section)[^>]*(?:class|id)[^>]*(?:comment|review|similar|footer|bottom)|$)/si);
    
    // Pattern 2: More specific Launch Team / Built With pattern
    if (!launchTeamMatch) {
      launchTeamMatch = pageSource.match(/Launch Team.*?Built With.*?(?=<(?:div|section|h[1-6])[^>]*|$)/si);
    }
    
    // Pattern 3: Just Launch Team section
    if (!launchTeamMatch) {
      launchTeamMatch = pageSource.match(/Launch Team.*?<\/div>/s);
    }
    
    if (launchTeamMatch) {
      const launchTeamSection = launchTeamMatch[0];
      console.log('Launch Team section found:', launchTeamSection.substring(0, 500) + '...');
      
      // Method 1: Extract from alt attributes (for image-based names)
      const altMatches = launchTeamSection.match(/alt="([^"]+)"/g);
      if (altMatches) {
        for (const altMatch of altMatches) {
          const altName = altMatch.match(/alt="([^"]+)"/)[1];
          if (altName && altName !== 'undefined' && altName.trim() && altName.length > 1) {
            const namePattern = altName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const emailPattern = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const proximityPattern = new RegExp(`(?:${namePattern}[\\s\\S]{0,500}${emailPattern}|${emailPattern}[\\s\\S]{0,500}${namePattern})`, 'i');
            
            if (proximityPattern.test(pageSource)) {
              name = altName.trim();
              console.log('Found name from alt attribute:', name);
              break;
            }
          }
        }
      }
      
      // Method 2: Extract from href patterns like /@username
      if (!name) {
        const hrefMatches = launchTeamSection.match(/href="[^"]*\/@([^"\/]+)"/g);
        if (hrefMatches) {
          for (const hrefMatch of hrefMatches) {
            const username = hrefMatch.match(/href="[^"]*\/@([^"\/]+)"/)[1];
            if (username && username.trim() && username.length > 1) {
              // Look for the actual name near this username
              const usernamePattern = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const emailPattern = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              
              // Find name associated with this username in the page
              const nameNearUsernamePattern = new RegExp(`(?:>\\s*([^<]+)\\s*<[^>]*href="[^"]*\\/@${usernamePattern}"|href="[^"]*\\/@${usernamePattern}"[^>]*>\\s*([^<]+)\\s*<)`, 'i');
              const nameMatch = pageSource.match(nameNearUsernamePattern);
              
              if (nameMatch) {
                const foundName = (nameMatch[1] || nameMatch[2] || '').trim();
                if (foundName && foundName.length > 1) {
                  const proximityPattern = new RegExp(`(?:${foundName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,500}${emailPattern}|${emailPattern}[\\s\\S]{0,500}${foundName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
                  
                  if (proximityPattern.test(pageSource)) {
                    name = foundName;
                    console.log('Found name from username pattern:', name);
                    break;
                  }
                }
              }
            }
          }
        }
      }
      
      // Method 3: Extract names from text content in Launch Team section
      if (!name) {
        // Look for common name patterns (First Last, First Middle Last)
        const namePatterns = launchTeamSection.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]*){1,3}\b/g);
        if (namePatterns) {
          for (const possibleName of namePatterns) {
            if (possibleName && possibleName.trim() && possibleName.length > 3) {
              const namePattern = possibleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const emailPattern = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const proximityPattern = new RegExp(`(?:${namePattern}[\\s\\S]{0,500}${emailPattern}|${emailPattern}[\\s\\S]{0,500}${namePattern})`, 'i');
              
              if (proximityPattern.test(pageSource)) {
                name = possibleName.trim();
                console.log('Found name from text pattern:', name);
                break;
              }
            }
          }
        }
      }
    }
    
    // 2. Fallback: Look for JSON patterns if Launch Team didn't yield results
    if (!name) {
      console.log('Launch Team search failed, trying JSON patterns for email:', email);
      
      // Look for JSON patterns where email and name are in the same object
      const emailPattern = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex chars
      
      // Most specific patterns: look for complete JSON objects with both email and name
      // Pattern 1: {"email":"[email]",...,"name":"[name]",...} - within same object, email first
      const strictPattern1 = new RegExp(`\\{[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*\\}`, 'gi');
      
      // Pattern 2: {"name":"[name]",...,"email":"[email]",...} - within same object, name first  
      const strictPattern2 = new RegExp(`\\{[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*\\}`, 'gi');
      
      // Pattern 3: Look for Product Hunt specific patterns like user objects
      const phUserPattern1 = new RegExp(`"user"\\s*:\\s*\\{[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*\\}`, 'gi');
      const phUserPattern2 = new RegExp(`"user"\\s*:\\s*\\{[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*\\}`, 'gi');
      
      // Find all matches and use the first valid one
      let matches = [];
      
      // Collect matches from all patterns
      let match;
      while ((match = strictPattern1.exec(pageSource)) !== null) {
        matches.push(match[1]);
        console.log('Found JSON match (pattern 1):', match[1]);
      }
      
      strictPattern2.lastIndex = 0;
      while ((match = strictPattern2.exec(pageSource)) !== null) {
        matches.push(match[1]);
        console.log('Found JSON match (pattern 2):', match[1]);
      }
      
      phUserPattern1.lastIndex = 0;
      while ((match = phUserPattern1.exec(pageSource)) !== null) {
        matches.push(match[1]);
        console.log('Found PH user match (pattern 1):', match[1]);
      }
      
      phUserPattern2.lastIndex = 0;
      while ((match = phUserPattern2.exec(pageSource)) !== null) {
        matches.push(match[1]);
        console.log('Found PH user match (pattern 2):', match[1]);
      }
      
      // Use the first valid name found
      if (matches.length > 0) {
        name = matches[0].trim();
        console.log('Using JSON pattern name:', name);
      } else {
        console.log('No JSON patterns found for email:', email);
      }
    }
    
    // No fallback - leave name empty if JSON pattern not found
    // This ensures we only use names that are directly associated with the clicked email
    
    // Extract first name for greeting if name was found
    if (name) {
      // Clean up name (remove things like "(@username)" from "Gabe Perez (@gabe)")
      const cleanName = name.replace(/\s*\([^)]*\).*$/, '').trim();
      const firstName = cleanName.split(' ')[0];
      if (firstName) {
        messagePrefix = `Hi ${firstName},\n\n`;
      }
    }
    
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
