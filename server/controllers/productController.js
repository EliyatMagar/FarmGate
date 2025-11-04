// controllers/productController.js
import database from '../config/db.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

/**
 * @desc Create a new product (Farmer only)
 */
export const createProduct = async (req, res) => {
  try {
    const {
      farm_id,
      category_id,
      name,
      description,
      price_per_unit,
      unit_type,
      available_quantity,
      min_order_quantity,
      quality_grade,
      harvest_date,
      expiry_date,
      is_organic
    } = req.body;

    const farmer_id = req.user.id;
    const imageFiles = req.files?.images;

    console.log("Product creation request from farmer:", farmer_id);

    // Validate required fields
    if (!farm_id || !category_id || !name || !price_per_unit || !unit_type || !available_quantity) {
      return res.status(400).json({ 
        message: "Farm, category, name, price, unit type, and available quantity are required" 
      });
    }

    // Verify farmer owns the farm and farm is approved
    const farmCheck = await database.query(
      `SELECT f.* 
       FROM farms f 
       WHERE f.id = $1 AND f.farmer_id = $2 AND f.verification_status = 'approved' AND f.is_active = true`,
      [farm_id, farmer_id]
    );

    if (farmCheck.rows.length === 0) {
      return res.status(403).json({ 
        message: "Farm not found, not approved, or you don't have permission to add products to this farm" 
      });
    }

    // Verify category exists and is active
    const categoryCheck = await database.query(
      "SELECT * FROM product_categories WHERE id = $1 AND is_active = true",
      [category_id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or inactive category" });
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (imageFiles) {
      try {
        console.log("Uploading product images to Cloudinary...");
        const uploadPromises = Array.isArray(imageFiles) 
          ? imageFiles.map(file => 
              uploadToCloudinary(file.tempFilePath, "agroconnect/products")
            )
          : [uploadToCloudinary(imageFiles.tempFilePath, "agroconnect/products")];
        
        imageUrls = await Promise.all(uploadPromises);
        console.log("✅ Product images uploaded successfully");
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);
        imageUrls = [];
      }
    }

    // Insert product
    const result = await database.query(
      `INSERT INTO products (
        farmer_id, farm_id, category_id, name, description, price_per_unit, unit_type,
        available_quantity, min_order_quantity, quality_grade, harvest_date, expiry_date,
        images, is_organic
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        farmer_id,
        farm_id,
        category_id,
        name,
        description || null,
        parseFloat(price_per_unit),
        unit_type,
        parseFloat(available_quantity),
        min_order_quantity ? parseFloat(min_order_quantity) : 1,
        quality_grade || null,
        harvest_date || null,
        expiry_date || null,
        imageUrls.length > 0 ? imageUrls : null,
        is_organic ? Boolean(is_organic) : false
      ]
    );

    const product = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: product
    });

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ 
      message: "Product creation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get all products with filters (Public)
 */
export const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category_id, 
      farm_id, 
      farmer_id, 
      quality_grade, 
      is_organic,
      min_price, 
      max_price,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*,
        f.name as farm_name,
        f.location as farm_location,
        f.certification as farm_certification,
        u.name as farmer_name,
        u.profile_image as farmer_image,
        c.name as category_name,
        c.image as category_image
      FROM products p
      JOIN farms f ON p.farm_id = f.id
      JOIN users u ON p.farmer_id = u.id
      JOIN product_categories c ON p.category_id = c.id
      WHERE p.is_available = true 
        AND f.is_active = true 
        AND f.verification_status = 'approved'
        AND u.is_verified = true
        AND c.is_active = true
    `;

    let countQuery = `
      SELECT COUNT(*)
      FROM products p
      JOIN farms f ON p.farm_id = f.id
      JOIN users u ON p.farmer_id = u.id
      JOIN product_categories c ON p.category_id = c.id
      WHERE p.is_available = true 
        AND f.is_active = true 
        AND f.verification_status = 'approved'
        AND u.is_verified = true
        AND c.is_active = true
    `;

    const queryParams = [];
    let paramCount = 0;

    // Apply filters
    if (category_id) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      countQuery += ` AND p.category_id = $${paramCount}`;
      queryParams.push(category_id);
    }

    if (farm_id) {
      paramCount++;
      query += ` AND p.farm_id = $${paramCount}`;
      countQuery += ` AND p.farm_id = $${paramCount}`;
      queryParams.push(farm_id);
    }

    if (farmer_id) {
      paramCount++;
      query += ` AND p.farmer_id = $${paramCount}`;
      countQuery += ` AND p.farmer_id = $${paramCount}`;
      queryParams.push(farmer_id);
    }

    if (quality_grade) {
      paramCount++;
      query += ` AND p.quality_grade = $${paramCount}`;
      countQuery += ` AND p.quality_grade = $${paramCount}`;
      queryParams.push(quality_grade);
    }

    if (is_organic !== undefined) {
      paramCount++;
      query += ` AND p.is_organic = $${paramCount}`;
      countQuery += ` AND p.is_organic = $${paramCount}`;
      queryParams.push(is_organic === 'true');
    }

    if (min_price) {
      paramCount++;
      query += ` AND p.price_per_unit >= $${paramCount}`;
      countQuery += ` AND p.price_per_unit >= $${paramCount}`;
      queryParams.push(parseFloat(min_price));
    }

    if (max_price) {
      paramCount++;
      query += ` AND p.price_per_unit <= $${paramCount}`;
      countQuery += ` AND p.price_per_unit <= $${paramCount}`;
      queryParams.push(parseFloat(max_price));
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR f.name ILIKE $${paramCount})`;
      countQuery += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR f.name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Validate sort column to prevent SQL injection
    const validSortColumns = ['created_at', 'price_per_unit', 'rating', 'name', 'harvest_date'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY p.${sortColumn} ${sortOrder} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const [productsResult, countResult] = await Promise.all([
      database.query(query, queryParams),
      database.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      products: productsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * @desc Get single product by ID (Public)
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await database.query(
      `SELECT 
        p.*,
        f.name as farm_name,
        f.location as farm_location,
        f.coordinates as farm_coordinates,
        f.certification as farm_certification,
        f.images as farm_images,
        u.name as farmer_name,
        u.profile_image as farmer_image,
        u.phone as farmer_phone,
        u.email as farmer_email,
        c.name as category_name,
        c.image as category_image
      FROM products p
      JOIN farms f ON p.farm_id = f.id
      JOIN users u ON p.farmer_id = u.id
      JOIN product_categories c ON p.category_id = c.id
      WHERE p.id = $1 
        AND p.is_available = true 
        AND f.is_active = true 
        AND f.verification_status = 'approved'
        AND u.is_verified = true
        AND c.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get related products from same farm
    const relatedProducts = await database.query(
      `SELECT id, name, price_per_unit, unit_type, images, rating
       FROM products 
       WHERE farm_id = $1 AND id != $2 AND is_available = true
       ORDER BY created_at DESC LIMIT 4`,
      [result.rows[0].farm_id, id]
    );

    const product = {
      ...result.rows[0],
      related_products: relatedProducts.rows
    };

    res.status(200).json({
      success: true,
      product: product
    });

  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/**
 * @desc Get farmer's products
 */
export const getMyProducts = async (req, res) => {
  try {
    const farmer_id = req.user.id;
    const { page = 1, limit = 10, is_available } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*,
        f.name as farm_name,
        f.verification_status as farm_status,
        c.name as category_name
      FROM products p
      JOIN farms f ON p.farm_id = f.id
      JOIN product_categories c ON p.category_id = c.id
      WHERE p.farmer_id = $1
    `;

    let countQuery = `
      SELECT COUNT(*)
      FROM products p
      WHERE p.farmer_id = $1
    `;

    const queryParams = [farmer_id];
    let paramCount = 1;

    if (is_available !== undefined) {
      paramCount++;
      query += ` AND p.is_available = $${paramCount}`;
      countQuery += ` AND p.is_available = $${paramCount}`;
      queryParams.push(is_available === 'true');
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const [productsResult, countResult] = await Promise.all([
      database.query(query, queryParams),
      database.query(countQuery, queryParams.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      products: productsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get My Products Error:", error);
    res.status(500).json({ message: "Failed to fetch your products" });
  }
};

/**
 * @desc Update product (Farmer only)
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;
    const {
      name,
      description,
      price_per_unit,
      unit_type,
      available_quantity,
      min_order_quantity,
      quality_grade,
      harvest_date,
      expiry_date,
      is_organic,
      is_available
    } = req.body;

    const imageFiles = req.files?.images;

    // Check if product exists and belongs to farmer
    const productCheck = await database.query(
      "SELECT * FROM products WHERE id = $1 AND farmer_id = $2",
      [id, farmer_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Product not found or access denied" 
      });
    }

    // Upload new images if provided
    let imageUrls = productCheck.rows[0].images || [];
    if (imageFiles) {
      try {
        console.log("Uploading new product images to Cloudinary...");
        const uploadPromises = Array.isArray(imageFiles) 
          ? imageFiles.map(file => 
              uploadToCloudinary(file.tempFilePath, "agroconnect/products")
            )
          : [uploadToCloudinary(imageFiles.tempFilePath, "agroconnect/products")];
        
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
        console.log("✅ New product images uploaded successfully");
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);
      }
    }

    // Update product
    const result = await database.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price_per_unit = COALESCE($3, price_per_unit),
           unit_type = COALESCE($4, unit_type),
           available_quantity = COALESCE($5, available_quantity),
           min_order_quantity = COALESCE($6, min_order_quantity),
           quality_grade = COALESCE($7, quality_grade),
           harvest_date = COALESCE($8, harvest_date),
           expiry_date = COALESCE($9, expiry_date),
           images = $10,
           is_organic = COALESCE($11, is_organic),
           is_available = COALESCE($12, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 AND farmer_id = $14
       RETURNING *`,
      [
        name,
        description,
        price_per_unit ? parseFloat(price_per_unit) : null,
        unit_type,
        available_quantity ? parseFloat(available_quantity) : null,
        min_order_quantity ? parseFloat(min_order_quantity) : null,
        quality_grade,
        harvest_date,
        expiry_date,
        imageUrls.length > 0 ? imageUrls : null,
        is_organic !== undefined ? Boolean(is_organic) : null,
        is_available !== undefined ? Boolean(is_available) : null,
        id,
        farmer_id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: result.rows[0]
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

/**
 * @desc Delete product (Farmer only) - Soft delete
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;

    // Check if product exists and belongs to farmer
    const productCheck = await database.query(
      "SELECT * FROM products WHERE id = $1 AND farmer_id = $2",
      [id, farmer_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Product not found or access denied" 
      });
    }

    // Soft delete by setting is_available to false
    await database.query(
      "UPDATE products SET is_available = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

/**
 * @desc Update product inventory/stock
 */
export const updateProductInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;
    const { available_quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    if (!available_quantity && available_quantity !== 0) {
      return res.status(400).json({ message: "Available quantity is required" });
    }

    // Check if product exists and belongs to farmer
    const productCheck = await database.query(
      "SELECT available_quantity FROM products WHERE id = $1 AND farmer_id = $2",
      [id, farmer_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Product not found or access denied" 
      });
    }

    let newQuantity;
    const currentQuantity = parseFloat(productCheck.rows[0].available_quantity);

    switch (operation) {
      case 'add':
        newQuantity = currentQuantity + parseFloat(available_quantity);
        break;
      case 'subtract':
        newQuantity = currentQuantity - parseFloat(available_quantity);
        if (newQuantity < 0) newQuantity = 0;
        break;
      case 'set':
      default:
        newQuantity = parseFloat(available_quantity);
        break;
    }

    // Update quantity
    const result = await database.query(
      `UPDATE products 
       SET available_quantity = $1, 
           updated_at = CURRENT_TIMESTAMP,
           is_available = $2
       WHERE id = $3
       RETURNING *`,
      [newQuantity, newQuantity > 0, id]
    );

    res.status(200).json({
      success: true,
      message: "Product inventory updated successfully",
      product: result.rows[0]
    });

  } catch (error) {
    console.error("Update Inventory Error:", error);
    res.status(500).json({ message: "Failed to update product inventory" });
  }
};