const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server ready to send emails');
  }
});

/**
 * Send order confirmation email to buyer
 */
exports.sendOrderConfirmationEmail = async (order, buyer) => {
  try {
    const itemsList = order.items.map(item => 
      `- ${item.title} (₹${item.price} x ${item.quantity})`
    ).join('\n');

    const mailOptions = {
      from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
      to: buyer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Order Confirmed!</h2>
          <p>Hi ${buyer.name},</p>
          <p>Your order has been placed successfully.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            
            <h4>Items:</h4>
            <pre style="white-space: pre-wrap;">${itemsList}</pre>
          </div>
          
          <p>You can track your order status in the Orders section of your dashboard.</p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for using Thapar Marketplace!
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${buyer.email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

/**
 * Send order notification to seller
 */
exports.sendNewOrderNotificationToSeller = async (order, seller, items) => {
  try {
    const itemsList = items.map(item => 
      `- ${item.title} (₹${item.price} x ${item.quantity})`
    ).join('\n');

    const mailOptions = {
      from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
      to: seller.email,
      subject: `New Order Received - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">New Order Received!</h2>
          <p>Hi ${seller.name},</p>
          <p>You have received a new order for your listing(s).</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            
            <h4>Your Items:</h4>
            <pre style="white-space: pre-wrap;">${itemsList}</pre>
          </div>
          
          <p>Please log in to your dashboard to view order details and coordinate with the buyer.</p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for selling on Thapar Marketplace!
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New order notification sent to seller ${seller.email}`);
  } catch (error) {
    console.error('Error sending seller notification:', error);
  }
};

/**
 * Send order delivery confirmation request
 */
exports.sendDeliveryConfirmationRequest = async (order, user, role) => {
  try {
    const mailOptions = {
      from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Confirm Order Delivery - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Confirm Order Delivery</h2>
          <p>Hi ${user.name},</p>
          <p>The ${role === 'buyer' ? 'seller has marked' : 'buyer has marked'} order ${order.orderNumber} as delivered.</p>
          <p>Please confirm that you have ${role === 'buyer' ? 'received' : 'delivered'} the items.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Confirm Delivery
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Order Number: ${order.orderNumber}<br>
            Total Amount: ₹${order.totalAmount}
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Delivery confirmation request sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending delivery confirmation:', error);
  }
};

/**
 * Send order completed email
 */
exports.sendOrderCompletedEmail = async (order, user) => {
  try {
    const mailOptions = {
      from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Order Completed - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Order Completed! ✅</h2>
          <p>Hi ${user.name},</p>
          <p>Your order ${order.orderNumber} has been marked as completed.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>Completed At:</strong> ${new Date(order.completedAt).toLocaleString()}</p>
          </div>
          
          <p>Thank you for using Thapar Marketplace. We hope to see you again!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Leave a Review
            </a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order completed email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending order completed email:', error);
  }
};

/**
 * Send email verification
 */
exports.sendVerificationEmail = async (user, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Verify Your Email - Thapar Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Thapar Marketplace!</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link:<br>
            ${verificationUrl}
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Thapar Marketplace" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Request - Thapar Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the button below to set a new password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this, please ignore this email.<br>
            This link will expire in 1 hour.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

module.exports = transporter;
