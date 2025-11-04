// utils/emailService.js
import nodemailer from 'nodemailer';
import { sendEmailWithFarmerConfig } from '../controllers/emailConfigController.js';

// AgroConnect's default transporter (for buyer emails)
const agroTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test AgroConnect transporter
agroTransporter.verify(function (error, success) {
  if (error) {
    console.log('❌ AgroConnect email transporter error:', error);
  } else {
    console.log('✅ AgroConnect email server is ready');
  }
});

/**
 * @desc Send order confirmation email to buyer (using AgroConnect SMTP)
 */
export const sendOrderConfirmationEmail = async (buyer, order) => {
  try {
    const mailOptions = {
      from: `"AgroConnect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: buyer.email,
      subject: `Order Confirmation - ${order.order_number}`,
      html: generateOrderConfirmationTemplate(buyer, order)
    };

    await agroTransporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation sent to buyer: ${buyer.email}`);

  } catch (error) {
    console.error("❌ Failed to send order confirmation to buyer:", error);
    throw error;
  }
};

/**
 * @desc Send order notification to farmer (using farmer's own SMTP)
 */
export const sendOrderNotificationToFarmer = async (farmer, order) => {
  try {
    const mailOptions = {
      from: `"${farmer.name}" <${farmer.email}>`, // Farmer's own email as sender
      to: farmer.email, // Send to themselves for notification
      subject: `New Order Received - ${order.order_number}`,
      html: generateFarmerNotificationTemplate(farmer, order)
    };

    // Try to send using farmer's SMTP configuration
    await sendEmailWithFarmerConfig(farmer.id, mailOptions);
    console.log(`✅ Order notification sent to farmer using their SMTP: ${farmer.email}`);

  } catch (error) {
    console.error("❌ Failed to send notification with farmer SMTP, falling back to AgroConnect:", error);
    
    // Fallback: Send using AgroConnect SMTP
    try {
      const fallbackMailOptions = {
        from: `"AgroConnect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: farmer.email,
        subject: `New Order Received - ${order.order_number}`,
        html: generateFarmerNotificationTemplate(farmer, order)
      };

      await agroTransporter.sendMail(fallbackMailOptions);
      console.log(`✅ Order notification sent to farmer via AgroConnect: ${farmer.email}`);
    } catch (fallbackError) {
      console.error("❌ Fallback email also failed:", fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * @desc Send order status update to buyer
 */
export const sendOrderStatusUpdateEmail = async (order, previousStatus, newStatus) => {
  try {
    const mailOptions = {
      from: `"AgroConnect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: order.buyer_email,
      subject: `Order Update - ${order.order_number}`,
      html: generateStatusUpdateTemplate(order, previousStatus, newStatus)
    };

    await agroTransporter.sendMail(mailOptions);
    console.log(`✅ Status update sent to buyer: ${order.buyer_email}`);

  } catch (error) {
    console.error("❌ Failed to send status update:", error);
    throw error;
  }
};

// Email template generators (keep your existing templates)
const generateOrderConfirmationTemplate = (buyer, order) => {
  return `... your existing order confirmation template ...`;
};

const generateFarmerNotificationTemplate = (farmer, order) => {
  return `... your existing farmer notification template ...`;
};

const generateStatusUpdateTemplate = (order, previousStatus, newStatus) => {
  return `... your existing status update template ...`;
};