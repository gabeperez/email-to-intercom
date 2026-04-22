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

    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
    }

    /* Macros */
    .macros-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }
    .macros-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .macros-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    .btn-macro-add {
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      color: #007bff;
      background: transparent;
      border: 1px solid #007bff;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .btn-macro-add:hover {
      background: #007bff;
      color: #fff;
    }
    .macros-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .macro-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 13px;
    }
    .macro-item-name {
      flex: 1;
      min-width: 0;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .macro-item-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .macro-item-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #666;
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      cursor: pointer;
      transition: color 0.15s, background 0.15s, border-color 0.15s;
    }
    .macro-item-btn:hover {
      color: #007bff;
      background: #f0f7ff;
      border-color: #b3d7ff;
    }
    .macro-item-btn.insert {
      font-size: 12px;
      padding: 0 8px;
      width: auto;
    }
    .macro-item-btn.delete:hover {
      color: #dc3545;
      background: #fff5f5;
      border-color: #f5c6cb;
    }
    .macro-editor {
      margin-top: 12px;
      padding: 12px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }
    .macro-editor-name {
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 8px;
      font-size: 13px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      box-sizing: border-box;
    }
    .macro-editor-name:focus {
      outline: none;
      border-color: #007bff;
    }
    .macro-editor-subject {
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 8px;
      font-size: 13px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      box-sizing: border-box;
    }
    .macro-editor-subject:focus {
      outline: none;
      border-color: #007bff;
    }
    .macro-editor-body {
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 10px;
      font-size: 13px;
      line-height: 1.5;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      resize: vertical;
      min-height: 60px;
      box-sizing: border-box;
    }
    .macro-editor-body:focus {
      outline: none;
      border-color: #007bff;
    }
    .macro-editor-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .macros-list:empty::after {
      content: "No macros yet. Click + Add to create one.";
      display: block;
      padding: 16px;
      text-align: center;
      font-size: 13px;
      color: #868e96;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px dashed #dee2e6;
    }

    /* Product Hunt Email Styling */
    .email-intercom-processed {
      position: relative;
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

  // Improved email regex - more strict to avoid false matches
  const emailRegex = /\b[A-Za-z0-9]([A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,7}\b/g;

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
        
        <section class="macros-section" id="macros-section">
          <div class="macros-header">
            <h4 class="macros-title">Macros</h4>
            <button type="button" class="btn-macro-add" id="macro-add-btn" title="Add macro">+ Add</button>
          </div>
          <ul class="macros-list" id="macros-list"></ul>
          <div class="macro-editor" id="macro-editor" style="display:none;">
            <input type="text" class="macro-editor-name" id="macro-editor-name" placeholder="Macro name" maxlength="80">
            <input type="text" class="macro-editor-subject" id="macro-editor-subject" placeholder="Subject (optional)" maxlength="200">
            <textarea class="macro-editor-body" id="macro-editor-body" placeholder="Message text to insert..." rows="3"></textarea>
            <div class="macro-editor-actions">
              <button type="button" class="btn btn-secondary btn-sm" id="macro-editor-cancel">Cancel</button>
              <button type="button" class="btn btn-primary btn-sm" id="macro-editor-save">Save</button>
            </div>
          </div>
        </section>
        
        <div class="email-status" id="email-status" style="display:none;"></div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('email-close-panel').addEventListener('click', hideEmailPanel);
    document.getElementById('email-settings-btn').addEventListener('click', openSettings);
    document.getElementById('email-cancel-btn').addEventListener('click', hideEmailPanel);
    document.getElementById('email-send-btn').addEventListener('click', sendEmail);
    
    initMacros();
  }
  
  const MACROS_STORAGE_KEY = 'intercomEmailMacros';
  
  function initMacros() {
    document.getElementById('macro-add-btn').addEventListener('click', () => openMacroEditor());
    document.getElementById('macro-editor-cancel').addEventListener('click', closeMacroEditor);
    document.getElementById('macro-editor-save').addEventListener('click', saveMacroFromEditor);
    loadMacros().then(renderMacros);
  }
  
  function loadMacros() {
    return new Promise(resolve => {
      chrome.storage.local.get([MACROS_STORAGE_KEY], (result) => {
        const list = result[MACROS_STORAGE_KEY];
        resolve(Array.isArray(list) ? list : []);
      });
    });
  }
  
  function saveMacros(macros) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [MACROS_STORAGE_KEY]: macros }, resolve);
    });
  }
  
  function renderMacros(macros) {
    macros = macros.slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const listEl = document.getElementById('macros-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    macros.forEach((macro, index) => {
      const li = document.createElement('li');
      li.className = 'macro-item';
      li.dataset.macroId = macro.id;
      li.innerHTML = `
        <span class="macro-item-name" title="${escapeAttr(macro.name)}">${escapeHtml(macro.name)}</span>
        <div class="macro-item-actions">
          <button type="button" class="macro-item-btn insert" data-action="insert" title="Insert into message">Insert</button>
          <button type="button" class="macro-item-btn" data-action="edit" title="Edit">✎</button>
          <button type="button" class="macro-item-btn" data-action="delete" title="Delete">🗑</button>
          <button type="button" class="macro-item-btn" data-action="up" title="Move up" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="macro-item-btn" data-action="down" title="Move down" ${index === macros.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
      `;
      listEl.appendChild(li);
    });
    listEl.querySelectorAll('.macro-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.macro-item').dataset.macroId;
        const action = btn.getAttribute('data-action');
        if (action === 'insert') insertMacro(id);
        else if (action === 'edit') openMacroEditor(id);
        else if (action === 'delete') deleteMacro(id);
        else if (action === 'up') moveMacro(id, -1);
        else if (action === 'down') moveMacro(id, 1);
      });
    });
  }
  
  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
  function openMacroEditor(existingId) {
    const editor = document.getElementById('macro-editor');
    const nameEl = document.getElementById('macro-editor-name');
    const subjectEl = document.getElementById('macro-editor-subject');
    const bodyEl = document.getElementById('macro-editor-body');
    editor.dataset.macroId = existingId || '';
    nameEl.value = '';
    subjectEl.value = '';
    bodyEl.value = '';
    if (existingId) {
      loadMacros().then(macros => {
        const m = macros.find(x => x.id === existingId);
        if (m) {
          nameEl.value = m.name;
          subjectEl.value = m.subject || '';
          bodyEl.value = m.body || '';
        }
      });
    }
    editor.style.display = 'block';
    nameEl.focus();
  }
  
  function closeMacroEditor() {
    document.getElementById('macro-editor').style.display = 'none';
  }
  
  async function saveMacroFromEditor() {
    const editor = document.getElementById('macro-editor');
    const id = editor.dataset.macroId;
    const name = document.getElementById('macro-editor-name').value.trim();
    const subject = document.getElementById('macro-editor-subject').value.trim();
    const body = document.getElementById('macro-editor-body').value;
    if (!name) return;
    let macros = await loadMacros();
    const now = Date.now();
    if (id) {
      const idx = macros.findIndex(m => m.id === id);
      if (idx !== -1) {
        macros[idx] = { ...macros[idx], name, subject: subject || undefined, body };
      }
    } else {
      const maxOrder = macros.length === 0 ? 0 : Math.max(...macros.map(m => m.order ?? 0));
      const newMacro = { id: 'm' + now, name, subject: subject || undefined, body, lastUsedAt: 0, order: maxOrder + 1 };
      macros.push(newMacro);
    }
    await saveMacros(macros);
    closeMacroEditor();
    renderMacros(macros);
  }
  
  async function deleteMacro(id) {
    if (!confirm('Delete this macro?')) return;
    let macros = await loadMacros();
    macros = macros.filter(m => m.id !== id);
    await saveMacros(macros);
    renderMacros(macros);
  }
  
  async function insertMacro(id) {
    let macros = await loadMacros();
    const macro = macros.find(m => m.id === id);
    if (!macro) return;
    if (macro.subject) {
      const subjectEl = document.getElementById('email-subject');
      if (subjectEl) subjectEl.value = macro.subject;
    }
    const textarea = document.getElementById('email-message');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const insert = macro.body || '';
    const newVal = text.slice(0, start) + insert + text.slice(end);
    textarea.value = newVal;
    textarea.selectionStart = textarea.selectionEnd = start + insert.length;
    textarea.focus();
    macro.lastUsedAt = Date.now();
    macro.order = 0;
    const maxOrder = Math.max(0, ...macros.map(m => m.order ?? 0));
    macros = macros.map(m => {
      if (m.id === id) return macro;
      const o = m.order ?? maxOrder + 1;
      return { ...m, order: o + 1 };
    });
    await saveMacros(macros);
    renderMacros(macros);
  }
  
  async function moveMacro(id, direction) {
    let macros = await loadMacros();
    macros = macros.slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const idx = macros.findIndex(m => m.id === id);
    if (idx === -1) return;
    const next = idx + direction;
    if (next < 0 || next >= macros.length) return;
    const o1 = macros[idx].order ?? idx;
    const o2 = macros[next].order ?? next;
    macros[idx].order = o2;
    macros[next].order = o1;
    await saveMacros(macros);
    renderMacros(macros);
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

  // Convert plain text to HTML while preserving formatting (valid fragment, no nested <p>)
  function convertTextToHtml(text) {
    if (!text) return '';
    
    // Preserve line breaks with markers, escape HTML, then convert markers to HTML
    let html = text
      .replace(/\n{3,}/g, '|||TRIPLE_LINE_BREAK|||')
      .replace(/\n{2}/g, '|||DOUBLE_LINE_BREAK|||')
      .replace(/\n/g, '|||SINGLE_LINE_BREAK|||')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\|\|\|TRIPLE_LINE_BREAK\|\|\|/g, '</p><br><p>')
      .replace(/\|\|\|DOUBLE_LINE_BREAK\|\|\|/g, '</p><p>')
      .replace(/\|\|\|SINGLE_LINE_BREAK\|\|\|/g, '<br>');
    
    // Ensure well-formed fragment: wrap leading/trailing text in <p>...</p> (no nested <p>)
    if (html.length > 0) {
      if (html.charAt(0) !== '<') html = '<p>' + html;
      if (html.charAt(html.length - 1) !== '>') html = html + '</p>';
    }
    return html;
  }

  // Send email
  async function sendEmail() {
    const sendBtn = document.getElementById('email-send-btn');
    const btnText = sendBtn.querySelector('.btn-text');
    const btnLoading = sendBtn.querySelector('.btn-loading');
    const statusDiv = document.getElementById('email-status');
    
    const messageText = document.getElementById('email-message').value.trim();
    
    const data = {
      toEmail: document.getElementById('email-recipient-email').value.trim(),
      toName: document.getElementById('email-recipient-name').value.trim() || null,
      subject: document.getElementById('email-subject').value.trim(),
      htmlBody: convertTextToHtml(messageText),
      bodyPlainText: messageText,
      openConversation: true
    };
    
    if (!data.toEmail || !data.subject || !(data.htmlBody || data.bodyPlainText)) {
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
    
    // Method 1: Look for Product Hunt Hunter section patterns (HIGHEST PRIORITY)
    name = extractNameFromHunterSection(email);
    
    // Method 2: If no name found, try other Product Hunt patterns
    if (!name) {
      name = extractNameFromModeratorInterface(email);
    }
    
    // Method 3: If no name found, try general page patterns (FALLBACK 1)
    if (!name) {
      name = extractNameFromPageContext(email);
    }
    
    // Method 4: Look for username-based patterns (FALLBACK 2)
    if (!name) {
      name = extractNameFromUsernamePatterns(email);
    }
    
    // Method 5: Extract from email username as final fallback (FALLBACK 3)
    if (!name) {
      name = extractNameFromEmailUsername(email);
    }
    
    // Method 6: Alt attributes search (FALLBACK 4)
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

  // NEW: Extract name from Product Hunt Hunter/Makers section (HIGHEST PRIORITY)
  function extractNameFromHunterSection(email) {
    console.log('Searching Hunter/Makers section for name...');
    
    // Look for the specific email span first
    const emailSpans = document.querySelectorAll('span[title*="@"]');
    let emailSpan = null;
    
    for (const span of emailSpans) {
      if (span.textContent.trim() === email || span.getAttribute('title') === email) {
        emailSpan = span;
        break;
      }
    }
    
    if (emailSpan) {
      console.log('Found email span:', emailSpan);
      
      // Look for the name in the same container (Makers or UserInfo)
      const makersContainer = emailSpan.closest('[data-sentry-component="Makers"]');
      const userInfoContainer = emailSpan.closest('[data-sentry-component="UserInfo"]');
      const container = makersContainer || userInfoContainer;
      
      if (container) {
        console.log('Found container:', container);
        
        // Look for the name in the same flex container as the email
        const flexContainer = emailSpan.closest('.flex.items-center, .flex.flex-row');
        if (flexContainer) {
          console.log('Found flex container:', flexContainer);
          
          // Look for name in aria-label of links in the same container
          const nameLinks = flexContainer.querySelectorAll('a[aria-label]');
          for (const link of nameLinks) {
            const ariaLabel = link.getAttribute('aria-label');
            console.log('Found aria-label in flex container:', ariaLabel);
            
            // Check if this looks like a person's name
            if (ariaLabel && 
                !ariaLabel.includes('@') && 
                !ariaLabel.includes('Logo') &&
                !ariaLabel.includes('Product Hunt') &&
                !ariaLabel.includes('Navigation') &&
                !ariaLabel.includes('icon') &&
                !ariaLabel.includes('button') &&
                !ariaLabel.includes('link') &&
                !ariaLabel.includes('Main') &&
                /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(ariaLabel) &&
                ariaLabel.length > 3 &&
                ariaLabel.length < 50) {
              console.log('Found name from flex container aria-label:', ariaLabel);
              return ariaLabel;
            }
          }
          
          // Look for name in text content of links in the same container
          const textLinks = flexContainer.querySelectorAll('a[href*="/@"]');
          for (const link of textLinks) {
            const text = link.textContent.trim();
            console.log('Found text in flex container:', text);
            
            if (text && 
                !text.includes('@') &&
                !text.includes('Logo') &&
                !text.includes('Product Hunt') &&
                !text.includes('Navigation') &&
                !text.includes('Main') &&
                /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(text) &&
                text.length > 3 &&
                text.length < 50) {
              console.log('Found name from flex container text:', text);
              return text;
            }
          }
        }
        
        // Fallback: Look for name in the broader container
        const nameLinks = container.querySelectorAll('a[aria-label]');
        for (const link of nameLinks) {
          const ariaLabel = link.getAttribute('aria-label');
          console.log('Found aria-label in container:', ariaLabel);
          
          if (ariaLabel && 
              !ariaLabel.includes('@') && 
              !ariaLabel.includes('Logo') &&
              !ariaLabel.includes('Product Hunt') &&
              !ariaLabel.includes('Navigation') &&
              !ariaLabel.includes('icon') &&
              !ariaLabel.includes('button') &&
              !ariaLabel.includes('link') &&
              !ariaLabel.includes('Main') &&
              /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(ariaLabel) &&
              ariaLabel.length > 3 &&
              ariaLabel.length < 50) {
            console.log('Found name from container aria-label:', ariaLabel);
            return ariaLabel;
          }
        }
      }
    }
    
    // Fallback: Look for "Hunter" or "Makers" sections that contain the email
    const hunterSections = document.querySelectorAll('[data-sentry-component="Makers"], [data-sentry-component="UserInfo"]');
    
    for (const section of hunterSections) {
      const text = section.textContent;
      
      // Check if this section contains the email
      if (text.includes(email)) {
        console.log('Found Hunter/Makers section with email:', section);
        
        // Look for names in the same container as the email
        const container = section.closest('div, section, article, .row, .item, .entry, .card');
        if (container) {
          // Look for aria-label attributes first, but be more specific
          const ariaElements = container.querySelectorAll('[aria-label]');
          for (const element of ariaElements) {
            const ariaLabel = element.getAttribute('aria-label');
            if (ariaLabel && 
                !ariaLabel.includes('@') && 
                !ariaLabel.includes('Suspicious') &&
                !ariaLabel.includes('Logo') &&
                !ariaLabel.includes('Product Hunt') &&
                !ariaLabel.includes('Navigation') &&
                !ariaLabel.includes('icon') &&
                !ariaLabel.includes('button') &&
                !ariaLabel.includes('link') &&
                !ariaLabel.includes('Main')) {
              const cleanName = ariaLabel.replace(/\s*\([^)]*\).*$/, '').trim();
              if (cleanName && 
                  /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(cleanName) &&
                  cleanName.length > 3 &&
                  cleanName.length < 50) {
                console.log('Found name from aria-label in Hunter/Makers section:', cleanName);
                return cleanName;
              }
            }
          }
          
          // Look for link text content
          const nameElements = container.querySelectorAll('a[href*="/@"]');
          for (const element of nameElements) {
            const text = element.textContent.trim();
            const cleanName = text.replace(/\s*\([^)]*\).*$/, '').trim();
            if (cleanName && 
                /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(cleanName) && 
                !cleanName.includes('@') &&
                !cleanName.includes('Logo') &&
                !cleanName.includes('Product Hunt') &&
                !cleanName.includes('Navigation') &&
                !cleanName.includes('Main') &&
                cleanName.length > 3 &&
                cleanName.length < 50) {
              console.log('Found name from link in Hunter/Makers section:', cleanName);
              return cleanName;
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

  // Enhanced function to make emails clickable with Product Hunt support
  function makeEmailsClickable() {
    // First, handle Product Hunt pages specifically
    if (window.location.href.includes('producthunt.com/')) {
      if (window.location.href.includes('/my/moderation')) {
        handleProductHuntModerationEmails();
      } else {
        handleProductHuntProfileEmails();
      }
    }
    
    // Method 1: Enhanced CSS selector-based detection for Product Hunt and other sites
    handleEmailDetectionBySelectors();
    
    // Method 2: General text-based email detection (enhanced to be less restrictive)
    handleGeneralEmailDetection();
    
    // Method 3: Fallback detection for any remaining emails
    handleFallbackEmailDetection();

    // Method 0: Global robust scan after other methods to catch anything missed
    handleGlobalTextNodeScan();
  }

  // Method 1: Enhanced CSS selector-based detection
  function handleEmailDetectionBySelectors() {
    console.log('🔍 Enhanced selector-based email detection...');
    
    // Comprehensive list of selectors that might contain emails
    const emailSelectors = [
      // Product Hunt specific selectors
      'span[title*="@"]',
      'span[data-sentry-element="Trigger"]',
      'span[data-sentry-element="Component"]',
      'div[data-sentry-component="InfoItem"] span',
      'div[data-sentry-component="UserInfo"] span',
      'div[data-sentry-component="Makers"] span',
      '.text-14.font-semibold.text-dark-gray span',
      '.text-14.font-normal.text-light-gray + .text-14.font-semibold.text-dark-gray',
      
      // Product Hunt profile page selectors
      'td span', // Table cells containing spans with emails
      'table td', // Direct table cells
      'tbody td span', // Table body cells with spans
      'tr td span', // Table row cells with spans
      '.profile-details span', // Profile details sections
      '.user-info span', // User info sections
      
      // General email selectors
      'a[href^="mailto:"]',
      '[title*="@"]',
      '[data-email]',
      
      // Common email container patterns
      '.email',
      '.user-email',
      '.contact-email',
      '.email-address',
      '.mailto'
    ];
    
    const processedElements = new Set();
    
    for (const selector of emailSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Selector "${selector}" found ${elements.length} elements`);
        
        for (const element of elements) {
          if (processedElements.has(element) || element.classList.contains('email-intercom-processed')) {
            continue;
          }
          
          const text = element.textContent.trim();
          
          // Skip elements that are only emojis or special characters
          if (isOnlyEmojisOrSpecialChars(text)) {
            continue;
          }
          
          const emailMatch = text.match(emailRegex);
          
          if (emailMatch) {
            const email = emailMatch[0];
            const cleanEmail = email.replace(/\s*\([^)]*\).*$/, '').trim();
            
            // Only process if this looks like a reasonable email element
            if (isValidEmailElement(element, cleanEmail)) {
              makeElementClickable(element, cleanEmail);
              processedElements.add(element);
              console.log(`✅ Selector-based email found: ${cleanEmail}`);
            }
          }
        }
      } catch (e) {
        console.log(`Selector "${selector}" failed:`, e.message);
      }
    }
  }

  // Method 0: Global text-node scanner that linkifies all emails robustly
  function handleGlobalTextNodeScan() {
    console.log('Scanning all text nodes for plain emails...');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodesToProcess = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue;
      if (!text || !text.includes('@')) continue;
      if (emailRegex.test(text)) nodesToProcess.push(node);
      emailRegex.lastIndex = 0; // reset regex state
    }

    for (const textNode of nodesToProcess) {
      const parent = textNode.parentElement;
      if (!parent) continue;
      if (parent.closest('#email-intercom-panel')) continue; // ignore our UI
      if (parent.classList && parent.classList.contains('email-intercom-processed')) continue;
      if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'NOSCRIPT') continue;

      const text = textNode.nodeValue;
      const matches = [...text.matchAll(emailRegex)];
      if (matches.length === 0) continue;

      const frag = document.createDocumentFragment();
      let lastEnd = 0;
      for (const match of matches) {
        if (match.index > lastEnd) {
          frag.appendChild(document.createTextNode(text.slice(lastEnd, match.index)));
        }
        const email = match[0].replace(/\s*\([^)]*\).*$/, '').trim();
        const span = document.createElement('span');
        span.textContent = email;
        makeElementClickable(span, email);
        frag.appendChild(span);
        lastEnd = match.index + match[0].length;
      }
      if (lastEnd < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastEnd)));
      }
      parent.replaceChild(frag, textNode);
    }
  }

  // Method 2: Enhanced general email detection (less restrictive)
  function handleGeneralEmailDetection() {
    console.log('🔍 Enhanced general email detection...');
    
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const processedElements = new Set();
    
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      const text = textNode.textContent;
      
      // Find all email matches in this text node
      const emailMatches = [...text.matchAll(emailRegex)];
      
      for (const match of emailMatches) {
        const email = match[0];
        const cleanEmail = email.replace(/\s*\([^)]*\).*$/, '').trim();
        
        // Find the best parent element to make clickable
        const targetElement = findBestParentForEmail(textNode, cleanEmail);
        
        if (targetElement && !processedElements.has(targetElement) && 
            !targetElement.classList.contains('email-intercom-processed')) {
          
          if (isValidEmailElement(targetElement, cleanEmail)) {
            makeElementClickable(targetElement, cleanEmail);
            processedElements.add(targetElement);
            console.log(`✅ General detection email found: ${cleanEmail}`);
          }
        }
      }
    }
  }

  // Method 3: Fallback detection for comprehensive coverage
  function handleFallbackEmailDetection() {
    console.log('🔍 Fallback email detection...');
    
    // Get all text content and find emails that might have been missed
    const pageText = document.body.textContent;
    const allEmails = [...pageText.matchAll(emailRegex)];
    
    for (const match of allEmails) {
      const email = match[0];
        const cleanEmail = email.replace(/\s*\([^)]*\).*$/, '').trim();
        
      // Find elements containing this email that haven't been processed
      const elements = document.querySelectorAll('*');
      for (const element of elements) {
        if (element.classList.contains('email-intercom-processed') || 
            element.textContent.trim() !== email) {
          continue;
        }
        
        // This element contains only the email and hasn't been processed
        if (isValidEmailElement(element, cleanEmail)) {
          makeElementClickable(element, cleanEmail);
          console.log(`✅ Fallback email found: ${cleanEmail}`);
          break; // Only process one element per email
        }
      }
    }
  }

  // Helper function to find the best parent element for an email
  function findBestParentForEmail(textNode, email) {
    let element = textNode.parentElement;
    let bestElement = null;
    
    // Walk up the DOM tree to find the best container
    while (element && element !== document.body) {
      const text = element.textContent.trim();
      
      // If the element contains only the email (or email + minimal surrounding text)
      if (text === email || 
          (text.length <= email.length + 10 && text.includes(email))) {
        bestElement = element;
      }
      
      // Stop if we find a container that's too large or complex
      if (text.length > email.length + 50 || 
          element.children.length > 3 ||
          element.tagName === 'BODY') {
        break;
      }
      
      element = element.parentElement;
    }
    
    return bestElement || textNode.parentElement;
  }

  // Helper function to validate if an element should be made clickable
  function isValidEmailElement(element, email) {
    // Skip if already processed
    if (element.classList.contains('email-intercom-processed')) {
      return false;
    }
    
    // Skip if element is hidden or not visible
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    
    // Check if this is a Product Hunt profile page (more lenient validation)
    const isProductHuntProfile = window.location.href.includes('producthunt.com/') && 
                                 !window.location.href.includes('/my/moderation');
    
    // Skip very large elements (likely containers) - but be more lenient for Product Hunt profiles
    const maxLength = isProductHuntProfile ? email.length + 200 : email.length + 100;
    if (element.textContent.length > maxLength) {
      return false;
    }
    
    // Skip elements with too many children (likely containers)
    if (element.children.length > 5) {
      return false;
    }
    
    // Skip certain element types that shouldn't be clickable
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'];
    if (skipTags.includes(element.tagName)) {
      return false;
    }
    
    // Skip elements that are already links (unless they're mailto links)
    if (element.tagName === 'A' && !element.href?.startsWith('mailto:')) {
      return false;
    }
    
    // Skip elements that contain only emojis or special characters
    if (isOnlyEmojisOrSpecialChars(element.textContent)) {
      return false;
    }
    
    // Skip elements where the email is not the primary content
    if (!isEmailPrimaryContent(element, email)) {
      return false;
    }
    
    return true;
  }

  // Helper function to check if content is only emojis or special characters
  function isOnlyEmojisOrSpecialChars(text) {
    // Remove whitespace and check if remaining content is only emojis/special chars
    const cleanText = text.trim();
    
    // Check for common emoji patterns
    const emojiPatterns = [
      /^📧+$/,  // Only email emojis
      /^[📧✓✅❌⚠️🔍📊📈📉]+$/,  // Only common UI emojis
      /^[\u{1F300}-\u{1F9FF}]+$/u,  // Only emoji characters
      /^[^\w\s@.-]+$/  // Only special characters (no letters, numbers, @, dots, hyphens)
    ];
    
    return emojiPatterns.some(pattern => pattern.test(cleanText));
  }

  // Helper function to check if email is the primary content of the element
  function isEmailPrimaryContent(element, email) {
    const text = element.textContent.trim();
    
    // If the element contains only the email, it's primary
    if (text === email) {
      return true;
    }
    
    // If the element contains the email plus minimal surrounding content
    const emailIndex = text.indexOf(email);
    if (emailIndex !== -1) {
      const beforeEmail = text.substring(0, emailIndex).trim();
      const afterEmail = text.substring(emailIndex + email.length).trim();
      
      // Allow minimal surrounding content (like status indicators)
      const allowedSurrounding = /^[📧✓✅❌⚠️🔍\s()]*$/;
      
      if (allowedSurrounding.test(beforeEmail) && allowedSurrounding.test(afterEmail)) {
        return true;
      }
    }
    
    // If the element is primarily the email (at least 70% of the content)
    const emailRatio = email.length / text.length;
    if (emailRatio >= 0.7) {
      return true;
    }
    
    return false;
  }

  // Helper function to make an element clickable
  function makeElementClickable(element, cleanEmail) {
    // Style the element
    element.style.cssText += 'color: #007bff !important; text-decoration: underline !important; cursor: pointer !important;';
    element.title = 'Click to send email via Intercom';
    element.setAttribute('data-email', cleanEmail);
    element.classList.add('email-intercom-processed');
        
        // Add click handler
    element.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEmailClick(e, cleanEmail);
        });
  }

  // Specialized function to handle Product Hunt moderation interface emails
  function handleProductHuntModerationEmails() {
    console.log('🔍 Checking for Product Hunt moderation interface emails...');
    
    // Enhanced Product Hunt email detection patterns
    const phSelectors = [
      'span[title*="@"]',
      'span[data-sentry-element="Trigger"]',
      'span[data-sentry-element="Component"]',
      'div[data-sentry-component="InfoItem"] span',
      'div[data-sentry-component="UserInfo"] span',
      'div[data-sentry-component="Makers"] span',
      '.text-14.font-semibold.text-dark-gray',
      '.text-14.font-semibold.text-dark-gray span',
      '.flex.flex-row.gap-2 span',
      '.flex.items-center span'
    ];
    
    const processedElements = new Set();
    
    for (const selector of phSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`PH Selector "${selector}" found ${elements.length} elements`);
        
        for (const element of elements) {
          if (processedElements.has(element) || element.classList.contains('email-intercom-processed')) {
            continue;
          }
          
          const text = element.textContent.trim();
          const title = element.getAttribute('title') || '';
          
          // Skip elements that are only emojis or special characters
          if (isOnlyEmojisOrSpecialChars(text)) {
            continue;
          }
          
          // Check if this element contains an email
          const emailMatch = text.match(emailRegex);
          const titleEmailMatch = title.match(emailRegex);
          
          if (emailMatch || titleEmailMatch) {
            const email = emailMatch ? emailMatch[0] : titleEmailMatch[0];
            const cleanEmail = email.replace(/\s*\([^)]*\).*$/, '').trim();
            
            console.log('Found PH email element:', element, 'text:', text, 'title:', title, 'email:', cleanEmail);
            
            if (isValidEmailElement(element, cleanEmail)) {
              makeElementClickable(element, cleanEmail);
              processedElements.add(element);
              console.log(`✅ Made Product Hunt email clickable: ${cleanEmail}`);
            }
          }
        }
      } catch (e) {
        console.log(`PH Selector "${selector}" failed:`, e.message);
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
        
        // Clean the email, removing any status text
        const cleanEmail = email.replace(/\s*\([^)]*\).*$/, '').trim();
        
        // Find the parent span or div that contains this text
        let parent = textNode.parentElement;
        while (parent && !parent.classList.contains('email-intercom-processed')) {
          if (parent.tagName === 'SPAN' || parent.tagName === 'DIV') {
            // Only style if this is a small container (likely just the email)
            if (parent.textContent.trim() === fullMatch || parent.textContent.trim() === email) {
              if (isValidEmailElement(parent, cleanEmail)) {
                makeElementClickable(parent, cleanEmail);
              console.log(`✅ Made Product Hunt pattern email clickable: ${cleanEmail}`);
              }
              break;
            }
          }
          parent = parent.parentElement;
        }
      }
    }
    
    // Additional Product Hunt specific detection for complex nested structures
    handleProductHuntComplexStructures();
  }

  // Additional method for Product Hunt complex nested structures
  function handleProductHuntComplexStructures() {
    console.log('🔍 Checking Product Hunt complex nested structures...');
    
    // Look for all elements that might contain emails in Product Hunt's complex DOM
    const allElements = document.querySelectorAll('*');
    const processedElements = new Set();
    
    for (const element of allElements) {
      if (processedElements.has(element) || element.classList.contains('email-intercom-processed')) {
        continue;
      }
      
      const text = element.textContent.trim();
      const emailMatch = text.match(emailRegex);
      
      if (emailMatch && text.length <= 100) { // Only process relatively small elements
        const email = emailMatch[0];
        const cleanEmail = email.replace(/\s*\([^)]*\).*$/, '').trim();
        
        // Check if this element is likely to be an email display element
        if (isProductHuntEmailElement(element, cleanEmail)) {
          if (isValidEmailElement(element, cleanEmail)) {
            makeElementClickable(element, cleanEmail);
            processedElements.add(element);
            console.log(`✅ Made PH complex structure email clickable: ${cleanEmail}`);
          }
        }
      }
    }
  }

  // Helper function to identify Product Hunt email elements
  function isProductHuntEmailElement(element, email) {
    // Check if element is in a Product Hunt context
    const phIndicators = [
      'data-sentry-component',
      'data-sentry-element',
      'data-sentry-source-file',
      'text-14',
      'font-semibold',
      'text-dark-gray'
    ];
    
    const hasPhIndicator = phIndicators.some(indicator => 
      element.hasAttribute(indicator) || element.classList.contains(indicator)
    );
    
    // Check if element is in a Product Hunt container
    const phContainer = element.closest('[data-sentry-component]');
    
    // Check if element has Product Hunt-like styling
    const computedStyle = window.getComputedStyle(element);
    const hasPhStyling = computedStyle.fontSize === '14px' || 
                        element.classList.contains('text-14') ||
                        element.classList.contains('font-semibold');
    
    return hasPhIndicator || phContainer || hasPhStyling;
  }

  // Handle Product Hunt profile page emails
  function handleProductHuntProfileEmails() {
    console.log('🔍 Checking for Product Hunt profile page emails...');
    
    // Product Hunt profile page specific selectors
    const profileSelectors = [
      'td span', // Table cells with spans (most common for profile emails)
      'table td', // Direct table cells
      'tbody td', // Table body cells
      'tr td', // Table row cells
      '.profile-details span', // Profile details sections
      '.user-info span', // User info sections
      'span[data-testid*="email"]', // Elements with email test IDs
      'span:contains("@")', // Spans containing @ symbol
    ];
    
    const processedElements = new Set();
    
    for (const selector of profileSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`Profile Selector "${selector}" found ${elements.length} elements`);
        
        for (const element of elements) {
          if (processedElements.has(element) || element.classList.contains('email-intercom-processed')) {
            continue;
          }
          
          const text = element.textContent.trim();
          
          // Skip elements that are only emojis or special characters
          if (isOnlyEmojisOrSpecialChars(text)) {
            continue;
          }
          
          // Check if this element contains an email
          const emailMatch = text.match(emailRegex);
          
          if (emailMatch) {
            const email = emailMatch[0];
            const cleanEmail = email.replace(/\s*\([^)]*\).*$/, '').trim();
            
            console.log('Found profile email element:', element, 'text:', text, 'email:', cleanEmail);
            
            if (isValidEmailElement(element, cleanEmail)) {
              makeElementClickable(element, cleanEmail);
              processedElements.add(element);
              console.log(`✅ Made Product Hunt profile email clickable: ${cleanEmail}`);
            }
          }
        }
      } catch (e) {
        console.log(`Profile Selector "${selector}" failed:`, e.message);
      }
    }
    
    // Also check for emails in the specific Product Hunt profile pattern
    const profileEmailPattern = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z|a-z]{2,7})\s*\(verified\)/g;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.match(profileEmailPattern)) {
        textNodes.push(walker.currentNode);
      }
    }
    
    for (const textNode of textNodes) {
      const matches = [...textNode.textContent.matchAll(profileEmailPattern)];
      for (const match of matches) {
        const email = match[1]; // Get the email part without "(verified)"
        const fullMatch = match[0]; // Get the full match including "(verified)"
        
        // Find the parent span or div that contains this text
        let parent = textNode.parentElement;
        while (parent && !parent.classList.contains('email-intercom-processed')) {
          if (parent.tagName === 'SPAN' || parent.tagName === 'TD' || parent.tagName === 'DIV') {
            // Only style if this is a reasonable container
            if (parent.textContent.trim() === fullMatch || 
                parent.textContent.trim().includes(email) ||
                (parent.textContent.length <= 100 && parent.textContent.includes(email))) {
              if (isValidEmailElement(parent, email)) {
                makeElementClickable(parent, email);
                console.log(`✅ Made Product Hunt profile pattern email clickable: ${email}`);
              }
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
    
    // Check if this is a Product Hunt page
    const isProductHunt = window.location.href.includes('producthunt.com/');
    const isProductHuntModeration = window.location.href.includes('producthunt.com/my/moderation');
    const isProductHuntProfile = isProductHunt && !isProductHuntModeration;
    
    if (isProductHuntModeration) {
      console.log('🎯 Product Hunt moderation page detected! Enhanced email detection enabled.');
    } else if (isProductHuntProfile) {
      console.log('👤 Product Hunt profile page detected! Profile email detection enabled.');
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
