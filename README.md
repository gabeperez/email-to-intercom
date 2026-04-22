# Email to Intercom Linker

## Description
Email to Intercom Linker is a Chrome extension designed to enhance the user experience by automatically detecting email addresses on web pages and allowing users to send emails directly via Intercom. This extension allows users to quickly compose and send emails to any email address found on a webpage without opening Intercom manually.

## Features
- **Email Detection:** Automatically detects email addresses on web pages.
- **Clickable Emails:** Converts detected email addresses into clickable links.
- **Direct Email Sending:** Opens an email composer popup when clicking on email addresses.
- **Intercom API Integration:** Sends emails directly via Intercom's REST API.
- **Automatic Contact Creation:** Creates contacts in Intercom if they don't exist.
- **Smart Name Detection:** Attempts to extract recipient names from surrounding text.
- **Customizable Setup:** Allows users to configure Intercom credentials and region.
- **Domain/Page Restriction:** Optionally restricts the extension to only work on specified domains or pages via the popup settings.

## Prerequisites

### Intercom Setup
1. **Intercom Account** with admin access
2. **Personal Access Token** from Intercom Developer Hub
3. **Admin ID** from your Intercom profile
4. **Team IDs** (optional) for conversation routing

## Installation
To install Email to Intercom Linker, follow these steps:

1. **Download the Extension:**
   - Clone this repository or download all the provided files.

2. **Install the Extension:**
   - Go to `chrome://extensions/` in your Chrome browser.
   - Enable "Developer mode" by toggling the switch in the top right corner.
   - Click on "Load unpacked" and select the directory containing the extension files.

3. **Configure Intercom Credentials:**
   - Click on the extension icon in your browser toolbar.
   - Click "Open Settings" to access the options page.
   - Enter your Intercom Personal Access Token and Admin ID.
   - Select your Intercom workspace region (US, EU, or Australia).
   - Optionally enter a default Team ID for conversation assignment.
   - Click "Save Settings" and test the connection.

## Usage
Once installed and configured, the extension will be active on all web pages:
- Email addresses on web pages will be automatically detected and made clickable.
- Click on any email address to open an email composer popup.
- Fill in the subject and message, then click "Send Email" to send via Intercom.
- The extension will automatically create contacts in Intercom if they don't exist.
- Emails are sent from your Intercom admin account and create conversations.

### Restricting to Specific Domains or Pages
In the options page, you can enter a list of allowed domains or full URLs (one per line):

- Enter a full URL (starting with http/https) to restrict to that exact page (e.g., `https://www.producthunt.com/`).
- Enter a domain (like `example.com` or `www.example.com`) to enable the extension on all pages of that domain.

**Examples:**
```
example.com
https://www.producthunt.com/
```
The first entry enables the extension on all pages of example.com. The second entry enables it only on the homepage of Product Hunt.

## Permissions
The extension requires the following permissions:
- `activeTab`: To access the content of the current tab and make emails clickable.
- `storage`: To store Intercom credentials and settings.
- `tabs`: To manage the Intercom search tab (legacy functionality).

## Development
The main components of the extension are:

- `email2inter.js`: Content script that detects emails and makes them clickable.
- `background.js`: Manages Intercom API calls and email sending functionality.
- `popup.html` and `popup.js`: Provide the main extension interface.
- `options.html` and `options.js`: Manage Intercom credentials and settings.
- `email-composer.html` and `email-composer.js`: Email composition popup.

Key functions include:
- `makeEmailsClickable()`: Detects and converts emails to clickable links.
- `handleEmailClick()`: Manages the click event on email links.
- `openEmailComposer()`: Opens the email composer popup.
- `handleSendEmail()`: Sends emails via Intercom API.
- `searchContactByEmail()`: Searches for existing contacts in Intercom.
- `createContact()`: Creates new contacts in Intercom.

## Intercom API Integration
The extension integrates with Intercom's REST API to:
- Search for existing contacts by email
- Create new contacts automatically
- Send admin messages (emails)
- Assign conversations to teams
- Support multiple Intercom regions (US, EU, Australia)

## Customization
To customize the extension:
- Modify the email regex in `email2inter.js` to adjust email detection patterns.
- Edit the `openEmailComposer()` function to change how the popup is displayed.
- Adjust the styling of clickable emails in the `makeEmailsClickable()` function.
- Modify the email composer popup styling in `email-composer.html`.
- Use the options page to configure Intercom credentials and region.

## Troubleshooting
- If emails are not clickable, check if the extension is enabled and has the necessary permissions.
- If email sending fails, verify your Intercom credentials in the extension options.
- If you get API errors, check your Intercom Personal Access Token and Admin ID.
- Ensure your Intercom workspace region is correctly selected.
- Check the browser console for any error messages.

## License
This project is licensed under the MIT License.
