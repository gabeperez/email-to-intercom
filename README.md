# Email to Intercom Linker

## Description
Email to Intercom Linker is a Chrome extension designed to enhance the user experience by automatically detecting email addresses on web pages and linking them to Intercom searches. This extension allows users to quickly look up customer information in Intercom by clicking on email addresses found on any webpage.

## Features
- **Email Detection:** Automatically detects email addresses on web pages.
- **Clickable Emails:** Converts detected email addresses into clickable links.
- **Intercom Integration:** Opens Intercom search for the clicked email address.
- **Persistent Intercom Tab:** Manages a single Intercom tab for all searches.
- **Customizable Setup:** Allows users to input their Intercom App Code for personalized use.
- **Domain/Page Restriction:** Optionally restricts the extension to only work on specified domains or pages via the popup settings.

## Installation
To install Email to Intercom Linker, follow these steps:

1. **Download the Extension:**
   - Clone this repository or download all the provided files (manifest.json, background.js, email2inter.js, popup.html, popup.js).

2. **Install the Extension:**
   - Go to `chrome://extensions/` in your Chrome browser.
   - Enable "Developer mode" by toggling the switch in the top right corner.
   - Click on "Load unpacked" and select the directory containing the extension files.

## Usage
Once installed, the extension will be active on all web pages:
- Email addresses on web pages will be automatically detected and made clickable.
- Click on any email address to open an Intercom search for that email in a new or existing tab.
- Use the extension popup to set your Intercom App Code (required for the extension to function).
- (Optional) Use the popup to specify allowed domains or pages. If you add entries, the extension will only work on those pages/domains. If left empty, it works everywhere.

### Restricting to Specific Domains or Pages
In the popup, you can enter a list of allowed domains or full URLs (one per line):

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
- `storage`: To store the Intercom App Code. The code is stored locally.
- `tabs`: To manage the Intercom search tab.

## Development
The main components of the extension are:

- `email2inter.js`: Content script that detects emails and makes them clickable.
- `background.js`: Manages the Intercom tab and handles message passing.
- `popup.html` and `popup.js`: Provide the interface for setting the Intercom App Code.

Key functions include:
- `makeEmailsClickable()`: Detects and converts emails to clickable links.
- `handleEmailClick()`: Manages the click event on email links.
- `openOrUpdateIntercomTab()`: Opens or updates the Intercom search tab.

## Customization
To customize the extension:
- Modify the email regex in `email2inter.js` to adjust email detection patterns.
- Edit the `createIntercomSearchUrl()` function to change how Intercom URLs are constructed.
- Adjust the styling of clickable emails in the `makeEmailsClickable()` function.
- Use the popup to restrict the extension to specific domains or pages as described above.

## Troubleshooting
- If emails are not clickable, check if the Intercom App Code is set correctly in the extension popup.
- If the Intercom tab is not opening, ensure you have the necessary permissions to access Intercom.

## License
This project is licensed under the MIT License.
