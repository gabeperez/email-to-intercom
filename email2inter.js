// Check if current page matches allowed domains/pages
function matchesAllowedDomains(url, allowedDomains) {
  if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) return false;
  const pageUrl = new URL(url);
  
  return allowedDomains.some(pattern => {
    pattern = pattern.trim();
    if (!pattern) return false;
    
    console.log(`Checking pattern "${pattern}" against URL "${url}"`);
    
    // If pattern is a full URL
    if (pattern.startsWith('http://') || pattern.startsWith('https://')) {
      try {
        const patternUrl = new URL(pattern);
        
        // Exact URL match (ignoring trailing slash and query params)
        const pageBase = pageUrl.origin + pageUrl.pathname.replace(/\/$/, '');
        const patternBase = patternUrl.origin + patternUrl.pathname.replace(/\/$/, '');
        
        if (pageBase === patternBase) {
          console.log(`✅ Exact URL match: ${pattern}`);
          return true;
        }
        
        // Path prefix match (e.g., https://example.com/admin matches https://example.com/admin/users)
        if (pageUrl.origin === patternUrl.origin && 
            pageUrl.pathname.startsWith(patternUrl.pathname.replace(/\/$/, ''))) {
          console.log(`✅ URL prefix match: ${pattern}`);
          return true;
        }
        
      } catch (e) {
        console.log(`❌ Invalid URL pattern: ${pattern}`);
        return false;
      }
    } 
    // Wildcard subdomain pattern (e.g., *.example.com)
    else if (pattern.startsWith('*.')) {
      const baseDomain = pattern.slice(2); // Remove *.
      const isSubdomainMatch = pageUrl.hostname === baseDomain || 
                              pageUrl.hostname.endsWith('.' + baseDomain);
      if (isSubdomainMatch) {
        console.log(`✅ Wildcard subdomain match: ${pattern}`);
        return true;
      }
    }
    // Domain-only pattern (e.g., example.com, subdomain.example.com)
    else {
      // Exact domain match
      if (pageUrl.hostname === pattern) {
        console.log(`✅ Exact domain match: ${pattern}`);
        return true;
      }
      
      // Subdomain match (e.g., pattern "example.com" matches "www.example.com")
      if (pageUrl.hostname.endsWith('.' + pattern)) {
        console.log(`✅ Subdomain match: ${pattern}`);
        return true;
      }
      
      // Parent domain match (e.g., pattern "www.example.com" matches "example.com")
      if (pattern.includes('.') && pattern.startsWith(pageUrl.hostname.replace(/^[^.]+\./, ''))) {
        console.log(`✅ Parent domain match: ${pattern}`);
        return true;
      }
    }
    
    console.log(`❌ No match: ${pattern}`);
    return false;
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

    /* Product Hunt Email Styling */
    .email-intercom-processed {
      position: relative;
    }
    
    .email-intercom-processed::after {
      content: "📧";
      margin-left: 4px;
      font-size: 12px;
      opacity: 0.7;
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
    console.log('Checking domain restrictions...', allowedDomains);
    if (!matchesAllowedDomains(window.location.href, allowedDomains)) {
      console.log('❌ Current website not in allowed domains. Extension disabled.');
      return;
    }
    console.log('✅ Current website matches allowed domains. Extension enabled.');
  } else {
    console.log('✅ No domain restrictions set. Extension enabled on all websites.');
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

  // Enhanced name extraction specifically for Product Hunt moderator interface
  function handleEmailClick(e, email) {
    e.preventDefault();
    e.stopPropagation();
    
    let name = '';
    let messagePrefix = '';
    
    console.log('Looking for name associated with email:', email);
    
    // Method 1: Look for Product Hunt moderator interface patterns (PRIMARY)
    // - Native tooltips/hover elements (HIGHEST PRIORITY)
    // - Launch Team matching (SECOND PRIORITY)
    // - Traditional patterns (THIRD PRIORITY)
    name = extractNameFromModeratorInterface(email);
    
    // Method 2: If no name found, try general page patterns (FALLBACK 1)
    if (!name) {
      name = extractNameFromPageContext(email);
    }
    
    // Method 3: Look for username-based patterns (FALLBACK 2)
    if (!name) {
      name = extractNameFromUsernamePatterns(email);
    }
    
    // Method 4: Extract from email username as final fallback (FALLBACK 3)
    if (!name) {
      name = extractNameFromEmailUsername(email);
    }
    
    // Method 5: Alt attributes search (FALLBACK 4)
    if (!name) {
      name = extractNameFromAltAttributes(email);
    }
    
    // Clean up the name if found
    if (name) {
      // Remove common suffixes and prefixes
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

  // Method 1: Extract name from Product Hunt moderator interface
  // Priority order:
  // 1. Product Hunt Hunter section (HIGHEST)
  // 2. Native tooltips/hover elements (SECOND)
  // 3. Launch Team matching (THIRD)
  // 4. Traditional patterns (FOURTH)
  function extractNameFromModeratorInterface(email) {
    console.log('Searching moderator interface for name...');
    
    // NEW: Product Hunt Hunter Section Detection (HIGHEST PRIORITY)
    const hunterSectionName = extractNameFromHunterSection(email);
    if (hunterSectionName) {
      console.log('Found name from Hunter section:', hunterSectionName);
      return hunterSectionName;
    }
    
    // Native Tooltip/Hover Detection (SECOND PRIORITY)
    const nativeTooltipName = extractNameFromNativeTooltips(email);
    if (nativeTooltipName) {
      console.log('Found name from native tooltip:', nativeTooltipName);
      return nativeTooltipName;
    }
    
    // Product Hunt Launch Team Matching (THIRD PRIORITY)
    const launchTeamName = extractNameFromLaunchTeam(email);
    if (launchTeamName) {
      console.log('Found name from Launch Team matching:', launchTeamName);
      return launchTeamName;
    }
    
    // Find the email element
    const emailElements = document.querySelectorAll('a[href*="mailto"], a[title*="email"], *');
    let emailElement = null;
    
    for (const element of emailElements) {
      if (element.textContent.includes(email) || element.href?.includes(email)) {
        emailElement = element;
        break;
      }
    }
    
    if (!emailElement) {
      // Try finding by text content
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      while (walker.nextNode()) {
        if (walker.currentNode.textContent.includes(email)) {
          emailElement = walker.currentNode.parentElement;
          break;
        }
      }
    }
    
    if (emailElement) {
      console.log('Found email element:', emailElement);
      
      // Pattern A: Look for name in the same container/section
      const container = emailElement.closest('div, section, article, .row, .item, .entry');
      if (container) {
        console.log('Searching in container:', container);
        
        // Look for "Hunter" or "Makers" labels followed by email
        const containerText = container.textContent;
        
        // Extract pattern: "Hunter [name] email" or "Makers [name] email"
        const hunterPattern = /Hunter\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+[\w.+-]+@[\w.-]+/;
        const makerPattern = /Makers?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+[\w.+-]+@[\w.-]+/;
        
        let match = containerText.match(hunterPattern) || containerText.match(makerPattern);
        if (match && match[1]) {
          console.log('Found name from Hunter/Maker pattern:', match[1]);
          return match[1].trim();
        }
        
        // Pattern B: Look for names that appear before the email in the same container
        const lines = containerText.split('\n').map(line => line.trim()).filter(line => line);
        const emailLineIndex = lines.findIndex(line => line.includes(email));
        
        if (emailLineIndex > 0) {
          // Check previous lines for names
          for (let i = emailLineIndex - 1; i >= Math.max(0, emailLineIndex - 3); i--) {
            const line = lines[i];
            // Look for names (2-3 words, properly capitalized)
            if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(line) && line.length > 3) {
              console.log('Found name from previous line:', line);
              return line;
            }
          }
        }
        
        // Pattern C: Look for nearby elements with names
        const nameElements = container.querySelectorAll('span, div, p, strong, b');
        for (const element of nameElements) {
          const text = element.textContent.trim();
          if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(text) && 
              text.length > 3 && 
              !text.includes('@') &&
              !text.includes('Hunter') &&
              !text.includes('Maker')) {
            console.log('Found name in nearby element:', text);
            return text;
          }
        }
        
        // Pattern D: Look for black background elements (like "Jacky Zheng" tooltip)
        const darkElements = container.querySelectorAll('[style*="background"], .tooltip, .popup, .overlay');
        for (const element of darkElements) {
          const text = element.textContent.trim();
          if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(text) && text.length > 3) {
            console.log('Found name in dark element:', text);
            return text;
          }
        }
      }
      
      // Pattern E: Look for data attributes or aria-labels
      const nameFromAttributes = extractNameFromAttributes(emailElement);
      if (nameFromAttributes) {
        return nameFromAttributes;
      }
    }
    
    return null;
  }

  // NEW: Extract name from native tooltips/hover elements (HIGHEST PRIORITY)
  function extractNameFromNativeTooltips(email) {
    console.log('Searching for native tooltips near email...');
    
    // Find elements that contain the email
    const emailElements = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.includes(email)) {
        emailElements.push(walker.currentNode.parentElement);
      }
    }
    
    console.log('Found email elements:', emailElements.length);
    
    for (const emailElement of emailElements) {
      // Look for elements near the email that might have tooltips
      const nearbyElements = [
        emailElement,
        emailElement.parentElement,
        emailElement.previousElementSibling,
        emailElement.nextElementSibling
      ].filter(el => el);
      
      // Also look for elements in the same container
      const container = emailElement.closest('div, section, article, .row, .item, .entry');
      if (container) {
        const containerElements = container.querySelectorAll('*[title], *[data-tooltip], *[aria-label]');
        nearbyElements.push(...containerElements);
      }
      
      for (const element of nearbyElements) {
        if (!element) continue;
        
        // Check for existing tooltips in title attribute
        const titleAttr = element.getAttribute('title');
        if (titleAttr && isValidPersonName(titleAttr)) {
          console.log('Found name in title attribute:', titleAttr);
          return titleAttr.trim();
        }
        
        // Check for data-tooltip attributes
        const dataTooltip = element.getAttribute('data-tooltip') || 
                           element.getAttribute('data-title') ||
                           element.getAttribute('aria-label');
        if (dataTooltip && isValidPersonName(dataTooltip)) {
          console.log('Found name in data attribute:', dataTooltip);
          return dataTooltip.trim();
        }
        
        // Look for elements that might show tooltips on hover
        // These often have specific classes or data attributes
        const tooltipClasses = ['tooltip', 'hover-tooltip', 'user-tooltip', 'profile-tooltip'];
        const hasTooltipClass = tooltipClasses.some(cls => element.classList.contains(cls));
        
        if (hasTooltipClass) {
          const tooltipText = element.textContent.trim();
          if (isValidPersonName(tooltipText)) {
            console.log('Found name in tooltip element:', tooltipText);
            return tooltipText;
          }
        }
        
        // Look for hidden/overlay elements that might be tooltips
        const hiddenTooltips = container?.querySelectorAll('[style*="position:"], [style*="z-index"], .popup, .overlay') || [];
        for (const tooltip of hiddenTooltips) {
          const tooltipText = tooltip.textContent.trim();
          if (isValidPersonName(tooltipText) && tooltipText.length <= 50) {
            console.log('Found name in hidden tooltip:', tooltipText);
            return tooltipText;
          }
        }
        
        // Special handling for Product Hunt user elements
        // Look for elements that might contain user names near emails
        if (element.textContent.includes('Hunter') || element.textContent.includes('Maker')) {
          const userNameElements = element.querySelectorAll('span, div, strong, b');
          for (const nameEl of userNameElements) {
            const nameText = nameEl.textContent.trim();
            if (isValidPersonName(nameText) && 
                !nameText.includes('Hunter') && 
                !nameText.includes('Maker') &&
                !nameText.includes('@')) {
              console.log('Found name near Hunter/Maker label:', nameText);
              return nameText;
            }
          }
        }
      }
    }
    
    console.log('No native tooltip names found');
    return null;
  }

  // Helper function to validate if text looks like a person's name
  function isValidPersonName(text) {
    if (!text || typeof text !== 'string') return false;
    
    const trimmed = text.trim();
    
    // Must be 2-50 characters
    if (trimmed.length < 2 || trimmed.length > 50) return false;
    
    // Must not contain email, URLs, or common non-name patterns
    if (trimmed.includes('@') || 
        trimmed.includes('http') || 
        trimmed.includes('.com') ||
        trimmed.includes('Click') ||
        trimmed.includes('Email') ||
        trimmed.includes('Send')) return false;
    
    // Exclude common business/company name patterns
    const businessKeywords = [
      'social', 'business', 'company', 'corp', 'inc', 'llc', 'ltd', 'co',
      'studio', 'design', 'dev', 'tech', 'app', 'web', 'digital', 'media',
      'marketing', 'consulting', 'solutions', 'services', 'group', 'team',
      'agency', 'creative', 'labs', 'works', 'pro', 'plus', 'official',
      'enterprises', 'ventures', 'industries', 'technologies', 'systems'
    ];
    
    const lowerText = trimmed.toLowerCase();
    if (businessKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('❌ Rejected business name:', trimmed);
      return false;
    }
    
    // Exclude navigation and UI text patterns
    const navigationKeywords = [
      'forum', 'threads', 'launches', 'products', 'news', 'advertise',
      'submit', 'search', 'sign', 'login', 'subscribe', 'about', 'faq',
      'terms', 'privacy', 'cookies', 'blog', 'newsletter', 'apps'
    ];
    
    if (navigationKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('❌ Rejected navigation text:', trimmed);
      return false;
    }
    
    // Must match person name pattern (1-3 words, properly capitalized)
    const namePattern = /^[A-Z][a-z]+(?: [A-Z][a-z]*){0,2}$/;
    const isValidPattern = namePattern.test(trimmed);
    
    if (!isValidPattern) {
      console.log('❌ Rejected invalid name pattern:', trimmed);
    }
    
    return isValidPattern;
  }

  // NEW: Extract name from Product Hunt Hunter section (HIGHEST PRIORITY)
  function extractNameFromHunterSection(email) {
    console.log('Searching Hunter section for name...');
    
    // Look for "Hunter" sections that contain the email
    const hunterSections = document.querySelectorAll('*');
    
    for (const section of hunterSections) {
      const text = section.textContent;
      
      // Check if this section contains both "Hunter" and the email
      if (text.includes('Hunter') && text.includes(email)) {
        console.log('Found Hunter section with email:', section);
        
        // Look for the name pattern in the Hunter section
        // Pattern: "Hunter [Name] [optional arrow] [email]"
        const hunterNamePattern = /Hunter\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:↗)?\s*[📧]?[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}/i;
        const match = text.match(hunterNamePattern);
        
        if (match && match[1]) {
          const name = match[1].trim();
          console.log('Found name from Hunter section pattern:', name);
          return name;
        }
        
        // Alternative pattern: Look for names that appear before the email in the same section
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const emailLineIndex = lines.findIndex(line => line.includes(email));
        
        if (emailLineIndex > 0) {
          // Check previous lines for names
          for (let i = emailLineIndex - 1; i >= Math.max(0, emailLineIndex - 3); i--) {
            const line = lines[i];
            // Look for names (2-3 words, properly capitalized, not containing "Hunter")
            if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(line) && 
                line.length > 3 && 
                !line.includes('Hunter') &&
                !line.includes('@')) {
              console.log('Found name from previous line in Hunter section:', line);
              return line;
            }
          }
        }
        
        // Look for names in the same container as the email
        const container = section.closest('div, section, article, .row, .item, .entry, .card');
        if (container) {
          const nameElements = container.querySelectorAll('span, div, p, strong, b, h1, h2, h3, h4, h5, h6');
          for (const element of nameElements) {
            const text = element.textContent.trim();
            // Look for names that don't contain email or "Hunter"
            if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(text) && 
                text.length > 3 && 
                text.length <= 50 &&
                !text.includes('@') &&
                !text.includes('Hunter') &&
                !text.includes('↗') &&
                !text.includes('📧')) {
              console.log('Found name in Hunter section container:', text);
              return text;
            }
          }
        }
      }
    }
    
    console.log('No Hunter section name found');
    return null;
  }

  // Extract name by matching email with Launch Team members
  function extractNameFromLaunchTeam(email) {
    console.log('Searching Launch Team for email match...');
    
    // Look for "Launch Team" or "Built With" sections
    const launchSections = document.querySelectorAll('*');
    let launchTeamSection = null;
    
    for (const element of launchSections) {
      const text = element.textContent;
      if ((text.includes('Launch Team') || text.includes('Built With')) && 
          text.length < 500) { // Avoid getting huge sections
        launchTeamSection = element;
        console.log('Found Launch Team section:', element);
        break;
      }
    }
    
    if (launchTeamSection) {
      // Get all team member names from the launch team section
      const teamNames = [];
      const nameElements = launchTeamSection.querySelectorAll('*');
      
      for (const element of nameElements) {
        const text = element.textContent.trim();
        // Look for names (2-3 words, properly capitalized, reasonable length)
        if (/^[A-Z][a-z]+(?: [A-Z][a-z]+){1,2}$/.test(text) && 
            text.length >= 4 && text.length <= 50 &&
            !text.includes('@') && 
            !text.includes('Team') &&
            !text.includes('Show') &&
            !text.includes('more')) {
          teamNames.push(text);
          console.log('Found team member name:', text);
        }
      }
      
      console.log('All team member names found:', teamNames);
      
      // Extract the main part of the email (before @ and common suffixes)
      const emailUser = email.split('@')[0].toLowerCase();
      console.log('Email username to match:', emailUser);
      
      // Try to match team names with email
      for (const teamName of teamNames) {
        const firstName = teamName.split(' ')[0].toLowerCase();
        const lastName = teamName.split(' ')[1]?.toLowerCase() || '';
        
        console.log(`Checking team member: ${teamName} (${firstName}, ${lastName})`);
        
        // Method 1: First name match
        if (emailUser.includes(firstName) && firstName.length >= 3) {
          console.log(`✅ First name match: ${firstName} found in ${emailUser}`);
          return teamName;
        }
        
        // Method 2: Last name match
        if (lastName && emailUser.includes(lastName) && lastName.length >= 3) {
          console.log(`✅ Last name match: ${lastName} found in ${emailUser}`);
          return teamName;
        }
        
        // Method 3: Combined name match (e.g., "jackyzheng" matches "Jacky Zheng")
        const combinedName = (firstName + lastName).toLowerCase();
        if (combinedName.length >= 6 && emailUser.includes(combinedName)) {
          console.log(`✅ Combined name match: ${combinedName} found in ${emailUser}`);
          return teamName;
        }
        
        // Method 4: Initials + last name (e.g., "jzheng" matches "Jacky Zheng")
        if (lastName && firstName.length >= 1 && lastName.length >= 3) {
          const initialsLastName = (firstName[0] + lastName).toLowerCase();
          if (emailUser.includes(initialsLastName)) {
            console.log(`✅ Initials + last name match: ${initialsLastName} found in ${emailUser}`);
            return teamName;
          }
        }
      }
    }
    
    console.log('No Launch Team name matches found');
    return null;
  }

  // Method 2: Extract name from general page context (JSON patterns)
  function extractNameFromPageContext(email) {
    console.log('Searching general page context...');
    
    const pageSource = document.documentElement.outerHTML;
    const emailPattern = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // JSON patterns for user objects
    const jsonPatterns = [
      new RegExp(`\\{[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*\\}`, 'i'),
      new RegExp(`\\{[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*\\}`, 'i'),
      new RegExp(`"user"\\s*:\\s*\\{[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*\\}`, 'i'),
      new RegExp(`"user"\\s*:\\s*\\{[^{}]*"email"\\s*:\\s*"${emailPattern}"[^{}]*"name"\\s*:\\s*"([^"]+)"[^{}]*\\}`, 'i')
    ];
    
    for (const pattern of jsonPatterns) {
      const match = pageSource.match(pattern);
      if (match && match[1]) {
        console.log('Found name from JSON pattern:', match[1]);
        return match[1].trim();
      }
    }
    
    return null;
  }

  // Method 3: Extract name from username patterns
  function extractNameFromUsernamePatterns(email) {
    console.log('Searching username patterns...');
    
    const pageSource = document.documentElement.outerHTML;
    const emailPattern = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
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
        console.log('Found display name for username:', displayNameMatch[1]);
        return displayNameMatch[1].trim();
      } else {
        // Fallback: Convert username to readable name
        // e.g., "romeobellon" -> "Romeo Bellon", "rohanrecommends" -> "Rohan Recommends"
        const cleanUsername = username.replace(/[0-9]+$/, ''); // Remove trailing numbers
        const nameParts = cleanUsername.split(/[._-]/);
        const generatedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        console.log('Generated name from username:', generatedName);
        return generatedName;
      }
    }
    
    return null;
  }

  // Method 4: Extract name from email username (ENHANCED)
  function extractNameFromEmailUsername(email) {
    console.log('Extracting name from email username...');
    
    let username = email.split('@')[0].toLowerCase();
    console.log('Original username:', username);
    
    // Remove common business/domain suffixes first
    const businessSuffixes = [
      'business', 'biz', 'company', 'corp', 'inc', 'llc', 'ltd', 'co',
      'studio', 'design', 'dev', 'tech', 'app', 'web', 'digital', 'media',
      'marketing', 'consulting', 'solutions', 'services', 'group', 'team',
      'agency', 'creative', 'labs', 'works', 'pro', 'plus', 'official'
    ];
    
    // Remove business suffixes (with dot separation awareness)
    for (const suffix of businessSuffixes) {
      // Remove suffix if it's at the end with a dot (e.g., "jacky.business")
      if (username.endsWith('.' + suffix)) {
        username = username.slice(0, -(suffix.length + 1));
        console.log(`Removed business suffix ".${suffix}":`, username);
        break;
      }
      // Remove suffix if it's at the end without dot (e.g., "jackybusiness")
      else if (username.endsWith(suffix) && username.length > suffix.length + 2) {
        username = username.slice(0, -suffix.length);
        console.log(`Removed business suffix "${suffix}":`, username);
        break;
      }
    }
    
    // Remove numbers at the end (e.g., "jacky123" -> "jacky")
    username = username.replace(/\d+$/, '');
    console.log('After removing numbers:', username);
    
    // Now extract meaningful name parts
    let nameParts = [];
    
    if (username.includes('.')) {
      // Split by dots (e.g., "john.smith")
      nameParts = username.split('.');
    } else if (username.includes('_')) {
      // Split by underscores (e.g., "john_smith")
      nameParts = username.split('_');
    } else if (username.includes('-')) {
      // Split by hyphens (e.g., "john-smith")
      nameParts = username.split('-');
    } else {
      // Try to detect camelCase (e.g., "johnSmith")
      const camelSplit = username.split(/(?=[A-Z])/);
      if (camelSplit.length > 1 && camelSplit.every(part => part.length > 0)) {
        nameParts = camelSplit;
      } else {
        // Single word - keep as is if it looks like a name
        if (username.length >= 2 && username.length <= 15 && /^[a-z]+$/.test(username)) {
          nameParts = [username];
          } else {
          console.log('Username does not look like a name, skipping');
          return null;
        }
      }
    }
    
    // Filter and clean name parts
    const cleanParts = nameParts
      .filter(part => part && part.length >= 2) // At least 2 characters
      .filter(part => /^[a-z]+$/i.test(part)) // Only letters
      .filter(part => !businessSuffixes.includes(part.toLowerCase())) // No remaining business terms
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
    
    // Only return if we have 1-2 reasonable name parts
    if (cleanParts.length >= 1 && cleanParts.length <= 2) {
      const name = cleanParts.join(' ');
      console.log('Generated smart name from email username:', name);
      return name;
    }
    
    console.log('Could not extract meaningful name from username');
    return null;
  }

  // Method 5: Extract name from alt attributes
  function extractNameFromAltAttributes(email) {
    console.log('Searching alt attributes...');
    
    const pageSource = document.documentElement.outerHTML;
    const emailPattern = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
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
            console.log('Found name from alt attribute:', altText);
            return altText.trim();
          }
        }
      }
    }
    
    return null;
  }

  // Helper function to extract names from element attributes
  function extractNameFromAttributes(element) {
    const attributes = ['title', 'aria-label', 'data-name', 'data-title', 'alt'];
    
    for (const attr of attributes) {
      const value = element.getAttribute(attr);
      if (value && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(value)) {
        console.log(`Found name from ${attr} attribute:`, value);
        return value;
      }
    }
    
    // Check parent elements too
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 3) {
      for (const attr of attributes) {
        const value = parent.getAttribute(attr);
        if (value && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(value)) {
          console.log(`Found name from parent ${attr} attribute:`, value);
          return value;
        }
      }
      parent = parent.parentElement;
      depth++;
    }
    
    return null;
  }

  // Enhanced function to make emails clickable with Product Hunt moderation interface support
  function makeEmailsClickable() {
    // First, handle Product Hunt moderation interface emails specifically
    handleProductHuntModerationEmails();
    
    // For general email detection, be very precise - only target elements that contain ONLY the email
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim();
      if (emailRegex.test(text) && text === walker.currentNode.textContent.trim()) {
        // This text node contains only an email
        textNodes.push(walker.currentNode);
      }
    }
    
    for (const textNode of textNodes) {
      const email = textNode.textContent.trim();
      const parent = textNode.parentElement;
      
      // Only process if parent is a simple element and not already processed
      if (parent && 
          !parent.classList.contains('email-intercom-processed') && 
          parent.textContent.trim() === email &&
          (parent.tagName === 'SPAN' || parent.tagName === 'A' || parent.tagName === 'TD')) {
        
        parent.style.cssText += 'color: #007bff !important; text-decoration: underline !important; cursor: pointer !important;';
        parent.title = 'Click to send email via Intercom';
        parent.setAttribute('data-email', email);
        parent.classList.add('email-intercom-processed');
        
        parent.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEmailClick(e, email);
        });
        
        console.log(`✅ Made general email clickable: ${email}`);
      }
    }
  }

  // Specialized function to handle Product Hunt moderation interface emails
  function handleProductHuntModerationEmails() {
    console.log('Checking for Product Hunt moderation interface emails...');
    
    // Look for the specific email span elements in Product Hunt's DOM structure
    // Target only the actual email text spans, not their containers
    const emailSpans = document.querySelectorAll('span[title*="@"]');
    
    for (const span of emailSpans) {
      // Skip if already processed or if element is not in the DOM
      if (span.classList.contains('email-intercom-processed') || !span.parentNode) {
        continue;
      }
      
      const email = span.textContent.trim();
      const title = span.getAttribute('title');
      
      // Check if this is actually an email
      if (emailRegex.test(email) && title && title.includes('@')) {
        console.log('Found Product Hunt email span:', span, 'email:', email);
        
        // Style as a normal clickable link (blue text, underline, no background)
        span.style.cssText += 'color: #007bff !important; text-decoration: underline !important; cursor: pointer !important;';
        span.title = 'Click to send email via Intercom';
        span.setAttribute('data-email', email);
        
        // Add click handler
        span.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEmailClick(e, email);
        });
        
        // Mark as processed
        span.classList.add('email-intercom-processed');
        
        console.log(`✅ Made Product Hunt email clickable: ${email}`);
      }
    }
    
    // Also look for emails in the specific Product Hunt email pattern: 📧email@domain.com✓
    const phEmailPattern = /📧([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7})✓?/g;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.match(phEmailPattern)) {
        textNodes.push(walker.currentNode);
      }
    }
    
    for (const textNode of textNodes) {
      const matches = [...textNode.textContent.matchAll(phEmailPattern)];
      for (const match of matches) {
        const email = match[1];
        const fullMatch = match[0];
        
        // Find the parent span or div that contains this text
        let parent = textNode.parentElement;
        while (parent && !parent.classList.contains('email-intercom-processed')) {
          if (parent.tagName === 'SPAN' || parent.tagName === 'DIV') {
            // Only style if this is a small container (likely just the email)
            if (parent.textContent.trim() === fullMatch || parent.textContent.trim() === email) {
              parent.style.cssText += 'color: #007bff !important; text-decoration: underline !important; cursor: pointer !important;';
              parent.title = 'Click to send email via Intercom';
              parent.setAttribute('data-email', email);
              parent.classList.add('email-intercom-processed');
              
              parent.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEmailClick(e, email);
              });
              
              console.log(`✅ Made Product Hunt pattern email clickable: ${email}`);
              break;
            }
          }
          parent = parent.parentElement;
        }
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
    console.log('🚀 Initializing Email to Intercom Linker');
    console.log('📍 Current URL:', window.location.href);
    
    // Check if this is a Product Hunt moderation page
    const isProductHuntModeration = window.location.href.includes('producthunt.com/my/moderation');
    if (isProductHuntModeration) {
      console.log('🎯 Product Hunt moderation page detected! Enhanced email detection enabled.');
    }
    
    console.log('🔍 Looking for emails on the page...');
    
    // Inject styles first
    injectStyles();
    
    // Create email panel (but don't show it yet)
    createEmailPanel();
    
    // Make emails clickable
    makeEmailsClickable();

    // Set up MutationObserver for dynamic content
    const observer = new MutationObserver(mutations => {
      if (mutations.some(mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0)) {
        console.log('🔄 Page content changed, re-scanning for emails...');
        debouncedMakeEmailsClickable();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('✅ Email to Intercom Linker initialized successfully');
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
