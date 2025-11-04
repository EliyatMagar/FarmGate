import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { sendToken } from "../utils/sendToken.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

/**
 * @desc Register a new user (farmer/buyer)
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, location } = req.body;
    const imageFile = req.files?.image_profile;

    console.log("Registration request body:", { name, email, role, phone, address, location });
    console.log("Image file:", imageFile ? "Present" : "Not present");

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload image to Cloudinary (optional) - with better error handling
    let imageUrl = null;
    if (imageFile) {
      try {
        console.log("Uploading image to Cloudinary...");
        imageUrl = await uploadToCloudinary(imageFile.tempFilePath, "agroconnect/users");
        console.log("✅ Image uploaded successfully:", imageUrl);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed, continuing without image:", uploadError.message);
        // Don't fail registration if image upload fails
        imageUrl = null;
      }
    }

    // Insert into database with all fields
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, address, location, profile_image, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        name, 
        email, 
        hashedPassword, 
        role, 
        phone || null, 
        address || null, 
        location || null, 
        imageUrl, 
        false
      ]
    );

    const user = result.rows[0];

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      success: true,
      message: "Registration successful. Wait for admin verification.",
      user: userResponse,
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ 
      message: "Registration failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Login user
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Invalid password for:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if verified
    if (!user.is_verified) {
      console.log("User not verified:", email);
      return res.status(403).json({
        message: "Your account is not yet verified by the admin.",
      });
    }

    console.log("Login successful for:", email);
    // Send JWT token
    sendToken(user, res, "Login successful");
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/**
 * @desc Get profile of logged-in user
 */
export const getProfile = async (req, res) => {
  try {
    // Remove password from user object
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Failed to get profile" });
  }
};

/**
 * @desc Admin: Get all pending (unverified) users
 */
export const getPendingUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, phone, address, location, profile_image, created_at FROM users WHERE is_verified = false AND role != 'admin' ORDER BY created_at DESC"
    );
    res.status(200).json({ success: true, users: result.rows });
  } catch (error) {
    console.error("Fetch Pending Users Error:", error);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};

/**
 * @desc Admin: Verify user
 */
export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE users SET is_verified = true, verification_date = NOW() WHERE id = $1 RETURNING id, name, email, role",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "User verified successfully.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Verify User Error:", error);
    res.status(500).json({ message: "Failed to verify user" });
  }
};