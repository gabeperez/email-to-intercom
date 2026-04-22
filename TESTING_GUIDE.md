# 🧪 Email to Intercom Extension - Testing Guide

This guide provides comprehensive testing procedures for the email formatting fix before deploying to production.

## 📋 Pre-Testing Checklist

### 1. Environment Setup
- [ ] Chrome browser with Developer Mode enabled
- [ ] Extension loaded in Developer Mode
- [ ] Intercom credentials configured and tested
- [ ] Test email addresses available for sending

### 2. Files to Test
- [ ] `email2inter.js` - Main content script with formatting fix
- [ ] `background.js` - API handling
- [ ] `options.html/js` - Settings configuration
- [ ] `popup.html/js` - Extension interface

## 🧪 Testing Procedures

### Phase 1: Local HTML Testing

1. **Open the test page:**
   ```bash
   open test_email_formatting.html
   ```

2. **Test the formatting function:**
   - Enter the Product Hunt message in the manual test section
   - Click "Test Manual Input"
   - Verify the HTML output matches expected format
   - Check that rendered result preserves spacing

3. **Run automated tests:**
   - Click "Run All Tests"
   - Verify all test cases pass
   - Review any failed tests and fix issues

### Phase 2: Extension Integration Testing

1. **Load the extension:**
   - Go to `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked" and select the extension folder

2. **Configure credentials:**
   - Click the extension icon → "Open Settings"
   - Enter Intercom Personal Access Token
   - Enter Admin ID
   - Select correct region
   - Test connection

3. **Test email detection:**
   - Open `test_extension.html`
   - Verify email addresses are clickable (blue and underlined)
   - Click on test email addresses
   - Verify email composer panel opens

### Phase 3: Email Sending Tests

1. **Basic message test:**
   ```
   Subject: Test Email - Basic Formatting
   Message:
   Hello,

   This is a basic test email to verify that the extension works correctly.

   Thank you for testing!

   Best regards,
   Test User
   ```

2. **Product Hunt message test:**
   ```
   Subject: Product Hunt Account Review
   Message: [Use the full Product Hunt message from the test page]
   ```

3. **Special characters test:**
   ```
   Subject: Special Characters & HTML Test
   Message:
   Hi there!

   This message contains special characters: < > & " '

   It also has multiple line breaks and formatting.

   Let's see if everything works correctly!

   Cheers,
   Developer
   ```

### Phase 4: Validation Tests

1. **Check received emails in Intercom:**
   - Log into Intercom
   - Find the test conversations
   - Verify formatting is preserved
   - Check that line breaks and spacing are correct

2. **Console error checking:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any JavaScript errors
   - Verify no errors during email sending

## 🔍 What to Look For

### ✅ Expected Results

1. **Email Detection:**
   - Email addresses appear blue and underlined
   - Clicking emails opens composer panel
   - Panel appears on the right side of the screen

2. **Message Formatting:**
   - Double line breaks create paragraph separations
   - Single line breaks create line breaks within paragraphs
   - Special characters are properly escaped
   - HTML structure is valid

3. **Email Sending:**
   - Success message appears after sending
   - Email appears in Intercom inbox
   - Formatting is preserved in received email
   - Contact is created automatically if needed

### ❌ Common Issues to Check

1. **Formatting Problems:**
   - Text appears bunched together (no spacing)
   - Line breaks are missing
   - Special characters break HTML
   - Paragraphs run together

2. **Extension Issues:**
   - Emails not clickable
   - Composer panel doesn't open
   - API errors in console
   - Connection test fails

3. **Intercom Issues:**
   - Emails not received
   - Contacts not created
   - Wrong region selected
   - Invalid credentials

## 🐛 Troubleshooting

### Extension Not Working
1. Check if extension is enabled
2. Verify permissions are granted
3. Check browser console for errors
4. Reload the extension

### Formatting Issues
1. Check the `convertTextToHtml` function in `email2inter.js`
2. Verify HTML output in test page
3. Test with different message formats
4. Check Intercom API documentation

### Connection Issues
1. Verify Intercom credentials
2. Check network connectivity
3. Test connection in settings
4. Verify API endpoints are correct

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Extension Version: ___________

### Phase 1: Local Testing
- [ ] HTML formatting function works
- [ ] All automated tests pass
- [ ] Edge cases handled correctly

### Phase 2: Extension Testing
- [ ] Extension loads without errors
- [ ] Email addresses are clickable
- [ ] Composer panel opens correctly
- [ ] Settings page works

### Phase 3: Email Sending
- [ ] Basic message sends successfully
- [ ] Product Hunt message sends successfully
- [ ] Special characters handled correctly
- [ ] No console errors

### Phase 4: Validation
- [ ] Emails received in Intercom
- [ ] Formatting preserved in received emails
- [ ] Contacts created correctly
- [ ] All functionality works as expected

### Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

### Overall Result: [ ] PASS [ ] FAIL
```

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] No console errors
- [ ] Formatting works correctly
- [ ] Extension functions properly
- [ ] Intercom integration works
- [ ] Edge cases handled
- [ ] Documentation updated
- [ ] Version number incremented

## 📞 Support

If you encounter issues during testing:

1. Check this guide first
2. Review browser console for errors
3. Test with different browsers
4. Verify Intercom API status
5. Contact the development team

---

**Remember:** Always test thoroughly before deploying to production. The email formatting fix affects how messages appear to recipients, so it's critical to get it right!
