// controllers/emailConfigController.js
import database from '../config/db.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Encryption key (store this securely in .env)
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * @desc Encrypt email password
 */
const encryptPassword = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    });
  } catch (error) {
    throw new Error('Password encryption failed');
  }
};

/**
 * @desc Decrypt email password
 */
const decryptPassword = (encryptedData) => {
  try {
    const encryptedObj = JSON.parse(encryptedData);
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
    let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Password decryption failed');
  }
};

/**
 * @desc Test SMTP connection
 */
const testSMTPConnection = async (emailConfig) => {
  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtp_host,
      port: emailConfig.smtp_port,
      secure: false,
      auth: {
        user: emailConfig.smtp_user,
        pass: emailConfig.smtp_pass,
      },
    });

    await transporter.verify();
    transporter.close();
    return true;
  } catch (error) {
    console.error('SMTP connection test failed:', error.message);
    return false;
  }
};

/**
 * @desc Configure farmer's email settings
 */
export const configureEmailSettings = async (req, res) => {
  try {
    const farmer_id = req.user.id;
    const { smtp_host, smtp_port, smtp_user, smtp_pass, email_provider } = req.body;

    console.log("Email configuration request from farmer:", farmer_id);

    // Validate required fields
    if (!smtp_host || !smtp_user || !smtp_pass) {
      return res.status(400).json({ 
        message: "SMTP host, user email, and password are required" 
      });
    }

    // Verify user is a farmer
    const userCheck = await database.query(
      "SELECT role FROM users WHERE id = $1",
      [farmer_id]
    );

    if (userCheck.rows[0].role !== 'farmer') {
      return res.status(403).json({ 
        message: "Only farmers can configure email settings" 
      });
    }

    // Test SMTP connection before saving
    const testConfig = {
      smtp_host: smtp_host || 'smtp.gmail.com',
      smtp_port: smtp_port || 587,
      smtp_user: smtp_user,
      smtp_pass: smtp_pass
    };

    const isConnectionValid = await testSMTPConnection(testConfig);

    if (!isConnectionValid) {
      return res.status(400).json({ 
        message: "Failed to connect to email server. Please check your credentials." 
      });
    }

    // Encrypt the password
    const encryptedPassword = encryptPassword(smtp_pass);

    // Save email configuration
    const result = await database.query(
      `UPDATE users 
       SET smtp_host = $1, 
           smtp_port = $2, 
           smtp_user = $3, 
           smtp_pass = $4,
           email_provider = $5,
           is_email_configured = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, smtp_host, smtp_port, smtp_user, email_provider, is_email_configured`,
      [
        smtp_host || 'smtp.gmail.com',
        smtp_port || 587,
        smtp_user,
        encryptedPassword,
        email_provider || 'custom',
        farmer_id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Email configuration saved and verified successfully",
      email_config: result.rows[0]
    });

  } catch (error) {
    console.error("Configure Email Error:", error);
    res.status(500).json({ 
      message: "Email configuration failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get farmer's email configuration
 */
export const getEmailSettings = async (req, res) => {
  try {
    const farmer_id = req.user.id;

    const result = await database.query(
      `SELECT id, name, smtp_host, smtp_port, smtp_user, email_provider, is_email_configured
       FROM users 
       WHERE id = $1`,
      [farmer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    
    // Don't return the encrypted password for security
    const emailConfig = {
      smtp_host: user.smtp_host,
      smtp_port: user.smtp_port,
      smtp_user: user.smtp_user,
      email_provider: user.email_provider,
      is_email_configured: user.is_email_configured
    };

    res.status(200).json({
      success: true,
      email_config: emailConfig
    });

  } catch (error) {
    console.error("Get Email Settings Error:", error);
    res.status(500).json({ message: "Failed to fetch email settings" });
  }
};

/**
 * @desc Update email configuration
 */
export const updateEmailSettings = async (req, res) => {
  try {
    const farmer_id = req.user.id;
    const { smtp_host, smtp_port, smtp_user, smtp_pass, email_provider } = req.body;

    // Check if user has existing configuration
    const existingConfig = await database.query(
      "SELECT smtp_host, smtp_user FROM users WHERE id = $1",
      [farmer_id]
    );

    if (existingConfig.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update configuration
    const updateConfig = {
      smtp_host: smtp_host || existingConfig.rows[0].smtp_host,
      smtp_port: smtp_port || existingConfig.rows[0].smtp_port,
      smtp_user: smtp_user || existingConfig.rows[0].smtp_user,
      smtp_pass: smtp_pass
    };

    // If password is provided, test the new configuration
    if (smtp_pass) {
      const isConnectionValid = await testSMTPConnection(updateConfig);
      if (!isConnectionValid) {
        return res.status(400).json({ 
          message: "Failed to connect with new credentials. Please check your settings." 
        });
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;

    if (smtp_host) {
      paramCount++;
      updateFields.push(`smtp_host = $${paramCount}`);
      queryParams.push(smtp_host);
    }

    if (smtp_port) {
      paramCount++;
      updateFields.push(`smtp_port = $${paramCount}`);
      queryParams.push(smtp_port);
    }

    if (smtp_user) {
      paramCount++;
      updateFields.push(`smtp_user = $${paramCount}`);
      queryParams.push(smtp_user);
    }

    if (smtp_pass) {
      paramCount++;
      updateFields.push(`smtp_pass = $${paramCount}`);
      queryParams.push(encryptPassword(smtp_pass));
    }

    if (email_provider) {
      paramCount++;
      updateFields.push(`email_provider = $${paramCount}`);
      queryParams.push(email_provider);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    paramCount++;
    queryParams.push(farmer_id);

    const result = await database.query(
      `UPDATE users 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, name, smtp_host, smtp_port, smtp_user, email_provider, is_email_configured`,
      queryParams
    );

    res.status(200).json({
      success: true,
      message: "Email settings updated successfully",
      email_config: result.rows[0]
    });

  } catch (error) {
    console.error("Update Email Settings Error:", error);
    res.status(500).json({ message: "Failed to update email settings" });
  }
};

/**
 * @desc Remove email configuration
 */
export const removeEmailSettings = async (req, res) => {
  try {
    const farmer_id = req.user.id;

    const result = await database.query(
      `UPDATE users 
       SET smtp_host = NULL,
           smtp_port = NULL,
           smtp_user = NULL,
           smtp_pass = NULL,
           email_provider = NULL,
           is_email_configured = false,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, name, is_email_configured`,
      [farmer_id]
    );

    res.status(200).json({
      success: true,
      message: "Email configuration removed successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Remove Email Settings Error:", error);
    res.status(500).json({ message: "Failed to remove email settings" });
  }
};

/**
 * @desc Send email using farmer's SMTP configuration
 */
export const sendEmailWithFarmerConfig = async (farmer_id, mailOptions) => {
  try {
    // Get farmer's email configuration
    const farmerResult = await database.query(
      `SELECT smtp_host, smtp_port, smtp_user, smtp_pass 
       FROM users 
       WHERE id = $1 AND is_email_configured = true`,
      [farmer_id]
    );

    if (farmerResult.rows.length === 0) {
      throw new Error('Farmer email not configured');
    }

    const farmerConfig = farmerResult.rows[0];
    
    // Decrypt password
    const decryptedPassword = decryptPassword(farmerConfig.smtp_pass);

    // Create transporter with farmer's SMTP settings
    const farmerTransporter = nodemailer.createTransport({
      host: farmerConfig.smtp_host,
      port: farmerConfig.smtp_port,
      secure: false,
      auth: {
        user: farmerConfig.smtp_user,
        pass: decryptedPassword,
      },
    });

    // Send email
    await farmerTransporter.sendMail(mailOptions);
    farmerTransporter.close();
    
    console.log(`✅ Email sent using farmer's SMTP (${farmerConfig.smtp_user})`);
    return true;

  } catch (error) {
    console.error('❌ Failed to send email with farmer SMTP:', error.message);
    throw error;
  }
};