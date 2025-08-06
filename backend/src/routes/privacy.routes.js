const express = require('express');

const router = express.Router();

// GET /api/privacy-policy - Return HTML privacy policy
router.get('/', (req, res) => {
    const currentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Privacy Policy - Verma Sanitary Solutions</title>
        <style>
                body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        color: #333;
                        background-color: #f8f9fa;
                }
                .container {
                        background: white;
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        border-top: 4px solid #0066cc;
                }
                .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #e9ecef;
                }
                .logo-text {
                        color: #0066cc;
                        font-size: 1.2em;
                        font-weight: bold;
                        margin-bottom: 10px;
                }
                h1 {
                        color: #2c3e50;
                        margin-bottom: 10px;
                }
                h2 {
                        color: #34495e;
                        margin-top: 30px;
                        border-left: 4px solid #0066cc;
                        padding-left: 15px;
                }
                h3 {
                        color: #2c3e50;
                        margin-top: 20px;
                }
                .last-updated {
                        text-align: center;
                        font-style: italic;
                        color: #7f8c8d;
                        margin-bottom: 30px;
                        background: #f8f9fa;
                        padding: 10px;
                        border-radius: 5px;
                }
                .contact-info {
                        background: #e8f4fd;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                        border-left: 4px solid #0066cc;
                }
                ul {
                        padding-left: 20px;
                }
                li {
                        margin-bottom: 8px;
                }
                .highlight {
                        background: #fff3cd;
                        padding: 15px;
                        border-left: 5px solid #ffc107;
                        margin: 15px 0;
                        border-radius: 5px;
                }
                .important {
                        background: #d1ecf1;
                        padding: 15px;
                        border-left: 5px solid #0066cc;
                        margin: 15px 0;
                        border-radius: 5px;
                }
                @media (max-width: 600px) {
                        body { padding: 10px; }
                        .container { padding: 20px; }
                        h1 { font-size: 1.8em; }
                }
        </style>
</head>
<body>
        <div class="container">
                <div class="header">
                        <div class="logo-text">🚿 Verma Sanitary Solutions</div>
                        <h1>Privacy Policy</h1>
                        <div class="last-updated">Last updated: ${currentDate}</div>
                </div>

                <div class="important">
                        <strong>Welcome to Verma Sanitary Solutions!</strong> We are committed to protecting your privacy while helping you find and manage sanitary facilities. This policy explains how we handle your information in our platform.
                </div>

                <h2>1. Information We Collect</h2>
                <p>To provide you with the best sanitary facility management experience, we collect:</p>
                <ul>
                        <li><strong>Account Information:</strong> Name, email, phone number when you register</li>
                        <li><strong>Business Details:</strong> Sanitary facility locations, services offered, business hours</li>
                        <li><strong>Customer Reviews:</strong> Ratings, feedback, and photos of facilities</li>
                        <li><strong>Location Data:</strong> GPS coordinates to help users find nearby facilities</li>
                        <li><strong>Usage Analytics:</strong> How you interact with our platform to improve services</li>
                        <li><strong>Communication Data:</strong> Messages between customers and facility providers</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <h3>For Facility Providers:</h3>
                <ul>
                        <li>List your sanitary facilities on our platform</li>
                        <li>Process bookings and manage appointments</li>
                        <li>Handle payments and generate invoices</li>
                        <li>Send notifications about new bookings or reviews</li>
                        <li>Provide analytics about your facility performance</li>
                </ul>

                <h3>For Customers:</h3>
                <ul>
                        <li>Help you find nearby sanitary facilities</li>
                        <li>Show ratings, reviews, and facility information</li>
                        <li>Process your bookings and payments</li>
                        <li>Send booking confirmations and reminders</li>
                        <li>Provide customer support</li>
                </ul>

                <h2>3. Data Sharing and Disclosure</h2>
                <p>We respect your privacy and limit data sharing to essential purposes:</p>
                <ul>
                        <li><strong>Between Users:</strong> Customer reviews and ratings are visible to other users</li>
                        <li><strong>Facility Information:</strong> Business details are publicly displayed on our platform</li>
                        <li><strong>Payment Processing:</strong> Transaction details shared with secure payment partners</li>
                        <li><strong>Legal Compliance:</strong> Information disclosed when required by law</li>
                        <li><strong>Service Providers:</strong> Trusted partners who help us operate the platform</li>
                </ul>

                <div class="highlight">
                        <strong>We Never:</strong> Sell your personal information to third parties or use it for purposes unrelated to our sanitary facility services.
                </div>

                <h2>4. Security and Data Protection</h2>
                <ul>
                        <li><strong>Secure Hosting:</strong> Data stored on encrypted, secure servers in India</li>
                        <li><strong>Payment Security:</strong> PCI DSS compliant payment processing</li>
                        <li><strong>Access Controls:</strong> Limited employee access on need-to-know basis</li>
                        <li><strong>Regular Backups:</strong> Daily encrypted backups to prevent data loss</li>
                        <li><strong>SSL Encryption:</strong> All data transmission secured with HTTPS</li>
                        <li><strong>Regular Updates:</strong> Security patches and system updates</li>
                </ul>

                <h2>5. Your Rights and Controls</h2>
                <p>You have full control over your information:</p>
                <ul>
                        <li><strong>Profile Management:</strong> Update your details anytime in your account</li>
                        <li><strong>Review Control:</strong> Edit or delete your reviews and ratings</li>
                        <li><strong>Location Settings:</strong> Control when we can access your location</li>
                        <li><strong>Notification Preferences:</strong> Choose what communications you receive</li>
                        <li><strong>Data Export:</strong> Download your data in a portable format</li>
                        <li><strong>Account Deletion:</strong> Delete your account and associated data</li>
                </ul>

                <h3>For Facility Owners:</h3>
                <ul>
                        <li>Manage your facility listings and information</li>
                        <li>Control booking availability and settings</li>
                        <li>Respond to customer reviews and feedback</li>
                        <li>Access business analytics and reports</li>
                </ul>

                <h2>6. Cookies and Tracking</h2>
                <p>We use cookies and similar technologies to:</p>
                <ul>
                        <li>Remember your login status and preferences</li>
                        <li>Analyze website traffic and user behavior</li>
                        <li>Personalize content and recommendations</li>
                        <li>Prevent fraud and ensure security</li>
                </ul>

                <h2>7. Third-Party Services</h2>
                <p>Our platform integrates with trusted third-party services:</p>
                <ul>
                        <li><strong>Payment Gateways:</strong> Razorpay, Paytm for secure transactions</li>
                        <li><strong>Maps:</strong> Google Maps for location services</li>
                        <li><strong>Analytics:</strong> Google Analytics for usage insights</li>
                        <li><strong>Communication:</strong> SMS and email service providers</li>
                </ul>

                <h2>8. Data Retention</h2>
                <p>We keep your information only as long as necessary:</p>
                <ul>
                        <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                        <li><strong>Inactive Accounts:</strong> Deleted after 3 years of inactivity</li>
                        <li><strong>Transaction Records:</strong> Kept for 7 years for tax and legal purposes</li>
                        <li><strong>Reviews and Ratings:</strong> May be retained to maintain service quality</li>
                </ul>

                <h2>9. Children's Privacy</h2>
                <p>Verma Sanitary Solutions is intended for users 18 years and older. We do not knowingly collect information from minors under 18. If you're a parent and believe your child has provided us with personal information, please contact us.</p>

                <h2>10. Legal Compliance</h2>
                <p>This privacy policy complies with applicable Indian laws including:</p>
                <ul>
                        <li>Information Technology Act, 2000</li>
                        <li>Information Technology (Reasonable Security Practices) Rules, 2011</li>
                        <li>Digital Personal Data Protection Act, 2023</li>
                        <li>Consumer Protection Act, 2019</li>
                </ul>

                <h2>11. Contact Us</h2>
                <div class="contact-info">
                        <h3>Verma Sanitary Solutions - Privacy Team</h3>
                        <p><strong>Email:</strong> privacy@vermasanitary.com</p>
                        <p><strong>Phone:</strong> +91-98765-43210</p>
                        <p><strong>WhatsApp:</strong> +91-98765-43210</p>
                        <p><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
                        <p><strong>Address:</strong> Verma Sanitary Solutions Pvt. Ltd.<br>
                           Plot No. 45, Industrial Area Phase-2<br>
                           Chandigarh - 160002, India</p>
                        <p><strong>Response Time:</strong> We respond to privacy inquiries within 7-10 business days</p>
                </div>

                <h2>12. Policy Updates</h2>
                <p>We may update this privacy policy to reflect changes in our practices or legal requirements. We will notify you through:</p>
                <ul>
                        <li>Email notification to registered users</li>
                        <li>In-app notification banner</li>
                        <li>Website announcement</li>
                        <li>Updated date at the top of this policy</li>
                </ul>

                <div class="important">
                        <strong>Effective Date:</strong> This privacy policy is effective from ${currentDate} and applies to all users of the Verma Sanitary Solutions platform.
                        <br><br>
                        <strong>Questions?</strong> If you have any questions about this privacy policy or how we handle your information, please don't hesitate to contact our privacy team using the details above.
                </div>
        </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
});

module.exports = router;
