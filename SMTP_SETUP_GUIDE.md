# 📧 SMTP Email Setup Guide for Thapar Marketplace

## Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. **Visit**: https://myaccount.google.com/security
2. **Enable 2-Step Verification** (if not already enabled)
3. **Go to App Passwords**: https://myaccount.google.com/apppasswords
4. **Select**:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Name: **Thapar Marketplace**
5. **Click Generate**
6. **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)
   - Remove spaces when copying
   - Example: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

### Step 2: Update .env File

Open `server/.env` and update these lines:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_16_char_app_password_here
```

**Important:** 
- Replace `your_actual_email@gmail.com` with your Gmail address
- Replace `your_16_char_app_password_here` with the app password (no spaces!)

### Step 3: Test SMTP Connection

Run the test script:

```bash
cd server
node test-smtp.js
```

**Expected Output:**
```
🔍 Testing SMTP Configuration...
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your_email@gmail.com
SMTP Pass: ***configured***

🔌 Testing connection to SMTP server...

✅ SMTP Server is ready to send emails!

📧 Sending test email...

✅ Test email sent successfully!
Message ID: <random_id@gmail.com>

📬 Check your inbox: your_email@gmail.com

🎉 SMTP setup complete! Your marketplace can now send emails.
```

### Step 4: Check Your Inbox

You should receive a test email with:
- Subject: "✅ SMTP Test - Thapar Marketplace"
- Beautiful HTML formatting
- Confirmation that SMTP is working

---

## 🔧 Troubleshooting

### Error: "Invalid login"

**Solution:**
1. Make sure you're using **App Password**, NOT your regular Gmail password
2. Check for spaces in the password (remove them)
3. Regenerate the app password if needed

### Error: "Connection timeout"

**Solution:**
1. Check your internet connection
2. Some networks block SMTP ports (try different network)
3. Try using port 465 with `secure: true`

```env
SMTP_PORT=465
```

Update `server/utils/emailService.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

### Error: "Authentication failed"

**Solution:**
1. Enable "Less secure app access" (not recommended)
   - Visit: https://myaccount.google.com/lesssecureapps
2. Better: Use App Passwords (recommended above)

### Test Email Not Received

**Check:**
1. Spam/Junk folder
2. Gmail's "All Mail" folder
3. Wait 1-2 minutes (can be delayed)

---

## 🌐 Alternative Email Providers

### Using Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

### Using Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
```

### Using SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com (Free: 100 emails/day)
2. Create API Key
3. Configure:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### Using Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_mailgun_password
```

---

## 📧 Email Templates Available

Once SMTP is configured, these emails will be sent automatically:

### 1. Order Confirmation (Buyer)
**When:** Order placed  
**To:** Buyer  
**Contains:** Order details, items, total, tracking link

### 2. New Order Notification (Seller)
**When:** Order placed  
**To:** Seller(s)  
**Contains:** Order number, items sold, buyer info

### 3. Delivery Confirmation Request
**When:** Seller confirms delivery  
**To:** Buyer  
**Contains:** Confirmation button, order details

### 4. Order Completed
**When:** Buyer completes order  
**To:** Buyer & Seller  
**Contains:** Completion confirmation, review link

### 5. Email Verification (Ready for future use)
**When:** New user registers  
**To:** User  
**Contains:** Verification link (24h expiry)

### 6. Password Reset (Ready for future use)
**When:** User requests reset  
**To:** User  
**Contains:** Reset link (1h expiry)

---

## 🚀 Deployment to Render

### Add Environment Variables

1. Go to your Render dashboard
2. Select your backend service
3. **Environment** tab → **Add Environment Variable**

Add these variables:

| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Your 16-char app password |

4. Click **Save Changes**
5. Render will automatically redeploy

### Verify on Render

Check the logs for:
```
✅ SMTP Server ready to send emails
```

---

## 🧪 Testing Emails in Development

### Option 1: Ethereal (Fake SMTP for testing)

```javascript
// In server/utils/emailService.js (for development only)
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass
  }
});

// After sending
console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
```

Click the preview URL to see the email without actually sending it.

### Option 2: MailHog (Local SMTP server)

```bash
# Install MailHog
# Windows: Download from https://github.com/mailhog/MailHog/releases

# Run MailHog
mailhog
```

Update `.env` for development:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
```

View emails at: http://localhost:8025

---

## 📊 Email Usage Limits

### Gmail
- **Free:** 500 emails/day
- **Workspace:** 2,000 emails/day

### SendGrid (Recommended for Production)
- **Free:** 100 emails/day
- **Essentials ($19.95/mo):** 50,000 emails/month
- **Pro ($89.95/mo):** 100,000 emails/month

### Mailgun
- **Free:** 5,000 emails/month (first 3 months)
- **Pay as you go:** $0.80 per 1,000 emails

---

## 🎨 Customizing Email Templates

Edit `server/utils/emailService.js`:

```javascript
exports.sendOrderConfirmationEmail = async (order, buyer) => {
  const mailOptions = {
    from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
    to: buyer.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <!-- Your custom HTML here -->
      <div style="font-family: Arial; max-width: 600px;">
        <h2 style="color: #2563eb;">Custom Header</h2>
        <!-- Add your branding, logos, colors -->
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
```

---

## 🔒 Security Best Practices

1. **Never commit .env file** (already in .gitignore)
2. **Use App Passwords** instead of regular passwords
3. **Rotate passwords** every 90 days
4. **Monitor email sending** for suspicious activity
5. **Use SendGrid/Mailgun** for production (better security)
6. **Enable SPF/DKIM** records for your domain (reduces spam)

---

## 📈 Monitoring Email Delivery

### Track Email Status

Add this to your email service:

```javascript
const info = await transporter.sendMail(mailOptions);
console.log('Message sent: %s', info.messageId);
console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

// Save to database
await EmailLog.create({
  to: buyer.email,
  subject: mailOptions.subject,
  messageId: info.messageId,
  status: 'sent',
  sentAt: new Date()
});
```

### Create Email Log Model

```javascript
// server/models/EmailLog.js
const emailLogSchema = new mongoose.Schema({
  to: String,
  subject: String,
  type: String, // order_confirmation, delivery_request, etc.
  messageId: String,
  status: { type: String, enum: ['sent', 'failed', 'bounced'] },
  error: String,
  sentAt: Date
});
```

---

## ✅ Checklist

- [ ] Created Gmail App Password
- [ ] Updated SMTP_USER in .env
- [ ] Updated SMTP_PASS in .env (no spaces!)
- [ ] Ran `node test-smtp.js`
- [ ] Received test email
- [ ] Added environment variables to Render
- [ ] Verified SMTP in production logs
- [ ] Tested order creation email flow

---

## 🆘 Still Having Issues?

1. **Check the console output** when running test-smtp.js
2. **Verify .env file** has no extra spaces
3. **Try a different email provider** (Outlook, SendGrid)
4. **Check firewall settings** (corporate networks may block SMTP)
5. **Review server logs** for error messages

---

**Need help?** Check the error message in the console - it usually tells you exactly what's wrong!

🎉 Once you see "✅ SMTP Server ready to send emails" in your logs, you're all set!
