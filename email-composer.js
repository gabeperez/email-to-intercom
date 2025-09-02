document.addEventListener('DOMContentLoaded', function() {
  const emailForm = document.getElementById('emailForm');
  const sendBtn = document.getElementById('sendBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const closeBtn = document.getElementById('closeBtn');
  const statusElement = document.getElementById('status');
  
  // Get email from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const recipientEmail = urlParams.get('email');
  const recipientName = urlParams.get('name');
  
  // Display recipient information
  if (recipientEmail) {
    document.getElementById('recipientEmail').textContent = recipientEmail;
  }
  
  // Handle form submission
  emailForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!subject || !message) {
      showStatus('Please fill in all required fields', 'error');
      return;
    }
    
    // Disable send button and show loading state
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {
      // Send email via background script
      const response = await chrome.runtime.sendMessage({
        action: 'sendEmail',
        data: {
          toEmail: recipientEmail,
          toName: recipientName,
          subject: subject,
          htmlBody: `<p>${message.replace(/\n/g, '</p><p>')}</p>`,
          openConversation: true
        }
      });
      
      if (response.success) {
        showStatus(`Email sent successfully! Message ID: ${response.messageId}`, 'success');
        
        // Clear form
        document.getElementById('subject').value = '';
        document.getElementById('message').value = '';
        
        // Auto-close after success
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      showStatus(`Failed to send email: ${error.message}`, 'error');
    } finally {
      // Re-enable send button
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Email';
    }
  });
  
  // Handle cancel button
  cancelBtn.addEventListener('click', function() {
    window.close();
  });
  
  // Handle close button
  closeBtn.addEventListener('click', function() {
    window.close();
  });
  
  // Handle escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.close();
    }
  });
  
  // Focus on subject field when popup opens
  document.getElementById('subject').focus();
  
  function showStatus(message, type) {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        statusElement.style.display = 'none';
      }, 5000);
    }
  }
});
