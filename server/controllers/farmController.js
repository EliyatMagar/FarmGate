import database from '../config/db.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

/**
 * @desc Create a new farm (automatically goes to pending verification)
 */
export const createFarm = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      latitude,
      longitude,
      total_area,
      cultivated_area,
      soil_type,
      certification
    } = req.body;

    const farmer_id = req.user.id;
    const imageFiles = req.files?.images;

    console.log("Farm creation request from farmer:", farmer_id);

    // Validate required fields
    if (!name || !location || !total_area) {
      return res.status(400).json({ 
        message: "Farm name, location, and total area are required" 
      });
    }

    // Check if farmer exists and is verified
    const farmerCheck = await database.query(
      "SELECT id, is_verified FROM users WHERE id = $1 AND role = 'farmer'",
      [farmer_id]
    );

    if (farmerCheck.rows.length === 0) {
      return res.status(403).json({ 
        message: "Only farmers can create farms" 
      });
    }

    if (!farmerCheck.rows[0].is_verified) {
      return res.status(403).json({ 
        message: "Your account needs to be verified by admin before creating farms" 
      });
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (imageFiles) {
      try {
        console.log("Uploading farm images to Cloudinary...");
        const uploadPromises = Array.isArray(imageFiles) 
          ? imageFiles.map(file => 
              uploadToCloudinary(file.tempFilePath, "agroconnect/farms")
            )
          : [uploadToCloudinary(imageFiles.tempFilePath, "agroconnect/farms")];
        
        imageUrls = await Promise.all(uploadPromises);
        console.log("✅ Farm images uploaded successfully");
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);
        imageUrls = [];
      }
    }

    // Prepare coordinates
    const coordinates = latitude && longitude ? `(${latitude},${longitude})` : null;

    // Insert farm into database with pending verification
    const result = await database.query(
      `INSERT INTO farms (
        farmer_id, name, description, location, coordinates, 
        total_area, cultivated_area, soil_type, certification, images,
        verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        farmer_id,
        name,
        description || null,
        location,
        coordinates,
        parseFloat(total_area),
        cultivated_area ? parseFloat(cultivated_area) : null,
        soil_type || null,
        certification || null,
        imageUrls.length > 0 ? imageUrls : null,
        'pending' // Default verification status
      ]
    );

    const farm = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Farm created successfully. Waiting for admin verification.",
      farm: farm
    });

  } catch (error) {
    console.error("Create Farm Error:", error);
    res.status(500).json({ 
      message: "Farm creation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Admin: Get all farms pending verification
 */
export const getPendingFarms = async (req, res) => {
  try {
    const result = await database.query(
      `SELECT f.*, u.name as farmer_name, u.email as farmer_email, u.phone as farmer_phone
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
       WHERE f.verification_status = 'pending'
       ORDER BY f.created_at DESC`
    );

    res.status(200).json({
      success: true,
      farms: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error("Get Pending Farms Error:", error);
    res.status(500).json({ message: "Failed to fetch pending farms" });
  }
};

/**
 * @desc Admin: Verify/Approve farm
 */
export const verifyFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const admin_id = req.user.id;

    // Check if farm exists and is pending
    const farmCheck = await database.query(
      "SELECT * FROM farms WHERE id = $1",
      [id]
    );

    if (farmCheck.rows.length === 0) {
      return res.status(404).json({ message: "Farm not found" });
    }

    if (farmCheck.rows[0].verification_status !== 'pending') {
      return res.status(400).json({ 
        message: `Farm is already ${farmCheck.rows[0].verification_status}` 
      });
    }

    // Update farm verification status
    const result = await database.query(
      `UPDATE farms SET 
        verification_status = 'approved',
        verified_by = $1,
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [admin_id, id]
    );

    // Get farm details with farmer info for response
    const farmResult = await database.query(
      `SELECT f.*, u.name as farmer_name, u.email as farmer_email
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
       WHERE f.id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Farm verified successfully",
      farm: farmResult.rows[0]
    });

  } catch (error) {
    console.error("Verify Farm Error:", error);
    res.status(500).json({ message: "Failed to verify farm" });
  }
};

/**
 * @desc Admin: Reject farm with reason
 */
export const rejectFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const admin_id = req.user.id;

    if (!rejection_reason) {
      return res.status(400).json({ 
        message: "Rejection reason is required" 
      });
    }

    // Check if farm exists and is pending
    const farmCheck = await database.query(
      "SELECT * FROM farms WHERE id = $1",
      [id]
    );

    if (farmCheck.rows.length === 0) {
      return res.status(404).json({ message: "Farm not found" });
    }

    if (farmCheck.rows[0].verification_status !== 'pending') {
      return res.status(400).json({ 
        message: `Farm is already ${farmCheck.rows[0].verification_status}` 
      });
    }

    // Update farm verification status to rejected
    const result = await database.query(
      `UPDATE farms SET 
        verification_status = 'rejected',
        verified_by = $1,
        verified_at = CURRENT_TIMESTAMP,
        rejection_reason = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [admin_id, rejection_reason, id]
    );

    // Get farm details with farmer info for response
    const farmResult = await database.query(
      `SELECT f.*, u.name as farmer_name, u.email as farmer_email
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
       WHERE f.id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Farm rejected successfully",
      farm: farmResult.rows[0]
    });

  } catch (error) {
    console.error("Reject Farm Error:", error);
    res.status(500).json({ message: "Failed to reject farm" });
  }
};

/**
 * @desc Get farm verification status (for farmer)
 */
export const getFarmVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;

    const result = await database.query(
      `SELECT id, name, verification_status, verified_at, rejection_reason
       FROM farms 
       WHERE id = $1 AND farmer_id = $2`,
      [id, farmer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: "Farm not found or access denied" 
      });
    }

    res.status(200).json({
      success: true,
      verification: result.rows[0]
    });

  } catch (error) {
    console.error("Get Farm Verification Status Error:", error);
    res.status(500).json({ message: "Failed to fetch verification status" });
  }
};

/**
 * @desc Get all my farms with verification status (for farmer)
 */
export const getMyFarms = async (req, res) => {
  try {
    const farmer_id = req.user.id;

    const result = await database.query(
      `SELECT * FROM farms 
       WHERE farmer_id = $1 
       ORDER BY 
         CASE verification_status 
           WHEN 'pending' THEN 1
           WHEN 'rejected' THEN 2
           WHEN 'approved' THEN 3
         END,
         created_at DESC`,
      [farmer_id]
    );

    res.status(200).json({
      success: true,
      farms: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error("Get My Farms Error:", error);
    res.status(500).json({ message: "Failed to fetch farms" });
  }
};

/**
 * @desc Get single farm by ID (farm owner only)
 */
export const getFarmById = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;

    const result = await database.query(
      `SELECT f.*, u.name as farmer_name, u.email as farmer_email
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
       WHERE f.id = $1 AND f.farmer_id = $2`,
      [id, farmer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: "Farm not found or access denied" 
      });
    }

    res.status(200).json({
      success: true,
      farm: result.rows[0]
    });

  } catch (error) {
    console.error("Get Farm Error:", error);
    res.status(500).json({ message: "Failed to fetch farm" });
  }
};

/**
 * @desc Update farm (only allowed for pending or rejected farms)
 */
export const updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;
    const {
      name,
      description,
      location,
      latitude,
      longitude,
      total_area,
      cultivated_area,
      soil_type,
      certification
    } = req.body;

    const imageFiles = req.files?.images;

    // Check if farm exists and belongs to farmer
    const farmCheck = await database.query(
      "SELECT * FROM farms WHERE id = $1 AND farmer_id = $2",
      [id, farmer_id]
    );

    if (farmCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Farm not found or access denied" 
      });
    }

    const currentFarm = farmCheck.rows[0];

    // Only allow updates for pending or rejected farms
    if (currentFarm.verification_status === 'approved') {
      return res.status(400).json({ 
        message: "Cannot update approved farm. Contact admin for modifications." 
      });
    }

    // Upload new images if provided
    let imageUrls = currentFarm.images || [];
    if (imageFiles) {
      try {
        console.log("Uploading new farm images to Cloudinary...");
        const uploadPromises = Array.isArray(imageFiles) 
          ? imageFiles.map(file => 
              uploadToCloudinary(file.tempFilePath, "agroconnect/farms")
            )
          : [uploadToCloudinary(imageFiles.tempFilePath, "agroconnect/farms")];
        
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
        console.log("✅ New farm images uploaded successfully");
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);
      }
    }

    // Prepare coordinates
    const coordinates = latitude && longitude ? `(${latitude},${longitude})` : currentFarm.coordinates;

    // Update farm and reset verification status to pending if it was rejected
    const result = await database.query(
      `UPDATE farms SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        location = COALESCE($3, location),
        coordinates = COALESCE($4, coordinates),
        total_area = COALESCE($5, total_area),
        cultivated_area = COALESCE($6, cultivated_area),
        soil_type = COALESCE($7, soil_type),
        certification = COALESCE($8, certification),
        images = $9,
        verification_status = CASE WHEN $10 THEN 'pending' ELSE verification_status END,
        verified_by = NULL,
        verified_at = NULL,
        rejection_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND farmer_id = $12
       RETURNING *`,
      [
        name,
        description,
        location,
        coordinates,
        total_area ? parseFloat(total_area) : null,
        cultivated_area ? parseFloat(cultivated_area) : null,
        soil_type,
        certification,
        imageUrls.length > 0 ? imageUrls : null,
        currentFarm.verification_status === 'rejected', // Reset to pending if rejected
        id,
        farmer_id
      ]
    );

    res.status(200).json({
      success: true,
      message: currentFarm.verification_status === 'rejected' 
        ? "Farm updated successfully. Resubmitted for verification." 
        : "Farm updated successfully.",
      farm: result.rows[0]
    });

  } catch (error) {
    console.error("Update Farm Error:", error);
    res.status(500).json({ message: "Failed to update farm" });
  }
};

/**
 * @desc Get all farms (Admin only) with filters
 */
export const getAllFarms = async (req, res) => {
  try {
    const { status, farmer_id } = req.query;
    
    let query = `
      SELECT f.*, u.name as farmer_name, u.email as farmer_email, u.phone as farmer_phone
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
    `;
    
    const queryParams = [];
    let whereConditions = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereConditions.push(`f.verification_status = $${paramCount}`);
      queryParams.push(status);
    }

    if (farmer_id) {
      paramCount++;
      whereConditions.push(`f.farmer_id = $${paramCount}`);
      queryParams.push(farmer_id);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY f.created_at DESC`;

    const result = await database.query(query, queryParams);

    res.status(200).json({
      success: true,
      farms: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error("Get All Farms Error:", error);
    res.status(500).json({ message: "Failed to fetch farms" });
  }
};

/**
 * @desc Get public farms (only approved and active farms)
 */
export const getPublicFarms = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT f.id, f.name, f.description, f.location, f.coordinates,
             f.total_area, f.cultivated_area, f.soil_type, f.certification,
             f.images, f.created_at, f.updated_at,
             u.name as farmer_name, u.profile_image as farmer_image
      FROM farms f
      JOIN users u ON f.farmer_id = u.id
      WHERE f.is_active = true AND f.verification_status = 'approved' AND u.is_verified = true
    `;
    
    let countQuery = `
      SELECT COUNT(*) 
      FROM farms f
      JOIN users u ON f.farmer_id = u.id
      WHERE f.is_active = true AND f.verification_status = 'approved' AND u.is_verified = true
    `;

    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (f.name ILIKE $${paramCount} OR f.location ILIKE $${paramCount} OR u.name ILIKE $${paramCount})`;
      countQuery += ` AND (f.name ILIKE $${paramCount} OR f.location ILIKE $${paramCount} OR u.name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY f.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const [farmsResult, countResult] = await Promise.all([
      database.query(query, queryParams),
      database.query(countQuery, search ? [queryParams[0]] : [])
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      farms: farmsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalFarms: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get Public Farms Error:", error);
    res.status(500).json({ message: "Failed to fetch farms" });
  }
};