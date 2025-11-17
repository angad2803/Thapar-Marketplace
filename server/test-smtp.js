require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("🔍 Testing SMTP Configuration...\n");
console.log("SMTP Host:", process.env.SMTP_HOST);
console.log("SMTP Port:", process.env.SMTP_PORT);
console.log("SMTP User:", process.env.SMTP_USER);
console.log(
  "SMTP Pass:",
  process.env.SMTP_PASS ? "***configured***" : "❌ NOT SET"
);
console.log("\n");

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test connection
console.log("🔌 Testing connection to SMTP server...\n");

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP Connection Failed!");
    console.log("Error:", error.message);
    console.log("\n📝 Common Issues:");
    console.log(
      "1. Make sure you're using App Password, not your regular Gmail password"
    );
    console.log("2. Enable 2-Step Verification in your Google Account");
    console.log("3. Go to: https://myaccount.google.com/apppasswords");
    console.log('4. Create new app password for "Mail"');
    console.log("5. Copy the 16-character password (no spaces)");
    console.log("6. Update SMTP_PASS in .env file");
    process.exit(1);
  } else {
    console.log("✅ SMTP Server is ready to send emails!");
    console.log("Success:", success);

    // Send a test email
    console.log("\n📧 Sending test email...\n");

    const mailOptions = {
      from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: "✅ SMTP Test - Thapar Marketplace",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🎉 SMTP Configuration Successful!</h2>
          <p>Your email service is now properly configured for Thapar Marketplace.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ What's Working:</h3>
            <ul>
              <li>SMTP connection established</li>
              <li>Authentication successful</li>
              <li>Email delivery working</li>
            </ul>
          </div>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📬 Email Notifications Enabled:</h3>
            <ul>
              <li>Order confirmations</li>
              <li>Delivery notifications</li>
              <li>Order completion emails</li>
              <li>New order alerts to sellers</li>
              <li>Email verification (future)</li>
              <li>Password reset (future)</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Test Date: ${new Date().toLocaleString()}<br>
            Server: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}<br>
            From: ${process.env.SMTP_USER}
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Failed to send test email:", error.message);
        process.exit(1);
      } else {
        console.log("✅ Test email sent successfully!");
        console.log("Message ID:", info.messageId);
        console.log("\n📬 Check your inbox:", process.env.SMTP_USER);
        console.log(
          "\n🎉 SMTP setup complete! Your marketplace can now send emails."
        );
        process.exit(0);
      }
    });
  }
});
