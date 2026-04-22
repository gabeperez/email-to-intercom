/**
 * Test Configuration Script for Email to Intercom Extension
 * This script helps set up test scenarios and validates the extension functionality
 */

// Same as extension: convert plain text to HTML (valid fragment, no nested <p>)
function convertTextToHtml(text) {
    if (!text) return '';
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
    if (html.length > 0) {
        if (html.charAt(0) !== '<') html = '<p>' + html;
        if (html.charAt(html.length - 1) !== '>') html = html + '</p>';
    }
    return html;
}

// Test data for different scenarios
const TEST_SCENARIOS = {
    basic: {
        name: "Basic Email Test",
        email: "test@example.com",
        subject: "Test Email - Basic Formatting",
        message: `Hello,

This is a basic test email to verify that the extension works correctly.

Thank you for testing!

Best regards,
Test User`,
        expectedFormatting: "Simple paragraph breaks and line breaks preserved"
    },
    
    productHunt: {
        name: "Product Hunt Message Test",
        email: "maker@producthunt.com",
        subject: "Product Hunt Account Review",
        message: `Thanks for preparing to launch on Product Hunt! While reviewing your launch, we noticed that your account looks to be set up as a company or branded account.

Personal account example: @john_doe

Company account example: @ProductHunt

To ensure you have the best experience and to align with our Community Guidelines, we recommend updating your profile to reflect yourself with your first + last name, along with a clear picture of yourself. Launches are meant to be tied to individuals versus companies, and this differentiation helps maintain authenticity within our community.

If you need assistance updating your username or anything else, please let us know.

Best,
Gabe`,
        expectedFormatting: "Multiple paragraphs with proper spacing and line breaks"
    },
    
    specialChars: {
        name: "Special Characters Test",
        email: "special@test.com",
        subject: "Special Characters & HTML Test",
        message: `Hi there!

This message contains special characters: < > & " '

It also has multiple line breaks and formatting.

Let's see if everything works correctly!

Cheers,
Developer`,
        expectedFormatting: "Special characters properly escaped, formatting preserved"
    },
    
    edgeCases: {
        name: "Edge Cases Test",
        email: "edge@test.com",
        subject: "Edge Cases Test",
        message: `Line 1
Line 2

Paragraph break


Multiple line breaks

Final paragraph`,
        expectedFormatting: "Various line break combinations handled correctly"
    }
};

// Test validation functions
const TEST_VALIDATORS = {
    // Validate that HTML is properly formatted (supports <p>...</p> and/or <br>)
    validateHtmlFormatting: (html) => {
        const onlyAllowedTags = (s) => {
            const stripped = s.replace(/<\/?p>|<\/?br\s*\/?>/gi, '').replace(/&amp;/g, '').replace(/&lt;/g, '').replace(/&gt;/g, '');
            return !stripped.includes('<') && !stripped.includes('>');
        };
        const checks = {
            hasParagraphTags: html.includes('<p>') && html.includes('</p>'),
            hasLineBreaks: html.includes('<br>') || html.includes('</p><p>'),
            noUnescapedHtml: html.length === 0 || onlyAllowedTags(html),
            properStructure: html.length === 0 || (html.startsWith('<p>') && html.endsWith('</p>'))
        };
        
        return {
            passed: Object.values(checks).every(check => check),
            details: checks
        };
    },
    
    // Validate that spacing is preserved
    validateSpacing: (original, html) => {
        // Convert HTML back to plain text for comparison
        const convertedBack = html
            .replace(/<\/p>/g, '\n\n')
            .replace(/<p>/g, '')
            .replace(/<br>/g, '\n')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        
        const originalLines = original.split('\n').length;
        const convertedLines = convertedBack.split('\n').length;
        
        return {
            passed: Math.abs(originalLines - convertedLines) <= 2, // Allow some variance
            originalLines,
            convertedLines,
            details: {
                originalText: original,
                convertedText: convertedBack,
                htmlOutput: html
            }
        };
    },
    
    // Validate Intercom API payload
    validateIntercomPayload: (payload) => {
        const required = ['toEmail', 'subject', 'htmlBody'];
        const checks = {
            hasRequiredFields: required.every(field => payload[field]),
            validEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.toEmail),
            hasSubject: payload.subject && payload.subject.length > 0,
            hasHtmlBody: payload.htmlBody && payload.htmlBody.length > 0,
            htmlBodyIsString: typeof payload.htmlBody === 'string'
        };
        
        return {
            passed: Object.values(checks).every(check => check),
            details: checks,
            payload: payload
        };
    }
};

// Test runner function
function runFormattingTests() {
    console.log('🧪 Starting Email Formatting Tests...');
    
    const results = {};
    
    Object.entries(TEST_SCENARIOS).forEach(([key, scenario]) => {
        console.log(`\n📋 Testing: ${scenario.name}`);
        
        // Simulate the convertTextToHtml function
        const html = convertTextToHtml(scenario.message);
        
        // Run validations
        const htmlValidation = TEST_VALIDATORS.validateHtmlFormatting(html);
        const spacingValidation = TEST_VALIDATORS.validateSpacing(scenario.message, html);
        
        results[key] = {
            scenario: scenario.name,
            htmlValidation,
            spacingValidation,
            htmlOutput: html,
            passed: htmlValidation.passed && spacingValidation.passed
        };
        
        console.log(`✅ HTML Validation: ${htmlValidation.passed ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ Spacing Validation: ${spacingValidation.passed ? 'PASSED' : 'FAILED'}`);
        
        if (!htmlValidation.passed) {
            console.log('❌ HTML Validation Details:', htmlValidation.details);
        }
        
        if (!spacingValidation.passed) {
            console.log('❌ Spacing Validation Details:', spacingValidation.details);
        }
        
        console.log(`📄 HTML Output:`, html);
    });
    
    return results;
}

// Function to test with actual extension (if available)
async function testWithExtension() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('🔌 Testing with actual extension...');
        
        try {
            // Test connection
            const connectionResponse = await chrome.runtime.sendMessage({ 
                action: 'testConnection' 
            });
            
            console.log('🔗 Connection Test:', connectionResponse);
            
            if (connectionResponse.success) {
                console.log('✅ Extension connection successful');
                
                // Test email sending with Product Hunt scenario
                const testData = {
                    toEmail: 'test@example.com',
                    toName: 'Test User',
                    subject: TEST_SCENARIOS.productHunt.subject,
                    htmlBody: convertTextToHtml(TEST_SCENARIOS.productHunt.message),
                    openConversation: true
                };
                
                const emailResponse = await chrome.runtime.sendMessage({
                    action: 'sendEmail',
                    data: testData
                });
                
                console.log('📧 Email Send Test:', emailResponse);
                
                return {
                    connectionTest: connectionResponse,
                    emailTest: emailResponse,
                    success: connectionResponse.success && emailResponse.success
                };
            } else {
                console.log('❌ Extension connection failed:', connectionResponse.error);
                return { success: false, error: connectionResponse.error };
            }
            
        } catch (error) {
            console.error('❌ Extension test error:', error);
            return { success: false, error: error.message };
        }
    } else {
        console.log('⚠️ Extension not available for testing');
        return { success: false, error: 'Extension not available' };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TEST_SCENARIOS,
        TEST_VALIDATORS,
        runFormattingTests,
        testWithExtension
    };
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        console.log('🚀 Email to Intercom Extension Test Suite Loaded');
        console.log('📖 Available functions: runFormattingTests(), testWithExtension()');
        
        // Uncomment to auto-run tests
        // runFormattingTests();
    });
}
