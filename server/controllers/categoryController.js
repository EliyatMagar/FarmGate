import database from '../config/db.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

/**
 * @desc Create a new product category (Admin only)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent_id } = req.body;
    const imageFile = req.files?.image;

    console.log("Category creation request:", { name, description, parent_id });

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: "Category name is required" 
      });
    }

    // Check if category already exists
    const existingCategory = await database.query(
      "SELECT * FROM product_categories WHERE name = $1",
      [name]
    );
    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Category name already exists" 
      });
    }

    // Validate parent category if provided
    if (parent_id) {
      const parentCheck = await database.query(
        "SELECT * FROM product_categories WHERE id = $1",
        [parent_id]
      );
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Parent category not found" 
        });
      }
    }

    // Upload image to Cloudinary
    let imageUrl = null;
    if (imageFile) {
      try {
        console.log("Uploading category image to Cloudinary...");
        imageUrl = await uploadToCloudinary(imageFile.tempFilePath, "agroconnect/categories");
        console.log("✅ Category image uploaded successfully:", imageUrl);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);
        imageUrl = null;
      }
    }

    // Insert category
    const result = await database.query(
      `INSERT INTO product_categories (name, description, image, parent_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description || null, imageUrl, parent_id || null]
    );

    const category = result.rows[0];

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: category
    });

  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Category creation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get all categories with hierarchy
 */
export const getAllCategories = async (req, res) => {
  try {
    const { include_inactive = 'false' } = req.query;
    const includeInactive = include_inactive === 'true';

    // Simple query without recursive CTE to avoid the type error
    const query = `
      SELECT 
        c.*,
        parent.name as parent_name,
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_available = true) as product_count
      FROM product_categories c
      LEFT JOIN product_categories parent ON c.parent_id = parent.id
      ${!includeInactive ? 'WHERE c.is_active = true' : ''}
      ORDER BY c.parent_id NULLS FIRST, c.name;
    `;

    const result = await database.query(query);
    
    // Build hierarchical structure on the backend
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create all category objects
    result.rows.forEach(row => {
      categoryMap.set(row.id, {
        id: row.id,
        name: row.name,
        description: row.description,
        image: row.image,
        parent_id: row.parent_id,
        parent_name: row.parent_name,
        is_active: row.is_active,
        created_at: row.created_at,
        product_count: parseInt(row.product_count) || 0,
        children: [],
        subcategories: []
      });
    });

    // Second pass: build hierarchy
    result.rows.forEach(row => {
      const category = categoryMap.get(row.id);
      if (row.parent_id && categoryMap.has(row.parent_id)) {
        const parent = categoryMap.get(row.parent_id);
        parent.children.push(category);
        parent.subcategories.push(category);
      } else {
        rootCategories.push(category);
      }
    });

    res.status(200).json({
      success: true,
      categories: rootCategories,
      count: rootCategories.length
    });

  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get single category by ID
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await database.query(
      `SELECT c.*, 
              parent.name as parent_name,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_available = true) as product_count
       FROM product_categories c
       LEFT JOIN product_categories parent ON c.parent_id = parent.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    // Get subcategories
    const subcategoriesResult = await database.query(
      `SELECT id, name, image, is_active, 
              (SELECT COUNT(*) FROM products WHERE category_id = product_categories.id AND is_available = true) as product_count
       FROM product_categories 
       WHERE parent_id = $1 
       ORDER BY name`,
      [id]
    );

    const category = {
      ...result.rows[0],
      product_count: parseInt(result.rows[0].product_count) || 0,
      subcategories: subcategoriesResult.rows.map(sub => ({
        ...sub,
        product_count: parseInt(sub.product_count) || 0
      }))
    };

    res.status(200).json({
      success: true,
      category: category
    });

  } catch (error) {
    console.error("Get Category Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch category",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Update category (Admin only) - FIXED: removed updated_at
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description, parent_id, is_active } = req.body;
    const imageFile = req.files?.image;

    console.log("🔍 Update category request received:", { 
      id, 
      name, 
      description, 
      parent_id, 
      is_active,
      hasImage: !!imageFile 
    });

    // Check if category exists
    const categoryCheck = await database.query(
      "SELECT * FROM product_categories WHERE id = $1",
      [id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    const currentCategory = categoryCheck.rows[0];

    // Convert is_active to boolean if provided
    if (is_active !== undefined) {
      is_active = is_active === 'true' || is_active === true;
    }

    // Check if new name already exists (excluding current category)
    if (name && name !== currentCategory.name) {
      const nameCheck = await database.query(
        "SELECT * FROM product_categories WHERE name = $1 AND id != $2",
        [name, id]
      );
      if (nameCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: "Category name already exists" 
        });
      }
    }

    // Prevent circular reference in parent_id
    if (parent_id) {
      if (parent_id === id) {
        return res.status(400).json({ 
          success: false,
          message: "Category cannot be its own parent" 
        });
      }

      // Check if parent exists
      const parentCheck = await database.query(
        "SELECT * FROM product_categories WHERE id = $1",
        [parent_id]
      );
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Parent category not found" 
        });
      }
    }

    // Upload new image if provided
    let imageUrl = currentCategory.image;
    if (imageFile) {
      try {
        console.log("Uploading new category image to Cloudinary...");
        imageUrl = await uploadToCloudinary(imageFile.tempFilePath, "agroconnect/categories");
        console.log("✅ New category image uploaded successfully:", imageUrl);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description || null);
      paramCount++;
    }

    if (imageUrl !== undefined) {
      updateFields.push(`image = $${paramCount}`);
      values.push(imageUrl);
      paramCount++;
    }

    if (parent_id !== undefined) {
      updateFields.push(`parent_id = $${paramCount}`);
      values.push(parent_id || null);
      paramCount++;
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }

    // Add updated_at manually (since we're not using trigger or trigger has issues)
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(id);

    const query = `
      UPDATE product_categories 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    console.log("🔄 Executing update query:", query);
    console.log("📦 With values:", values);

    const result = await database.query(query, values);
    const updatedCategory = result.rows[0];

    // Get parent name and product count
    let parentName = null;
    if (updatedCategory.parent_id) {
      const parentResult = await database.query(
        "SELECT name FROM product_categories WHERE id = $1",
        [updatedCategory.parent_id]
      );
      parentName = parentResult.rows[0]?.name || null;
    }

    const productCountResult = await database.query(
      "SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_available = true",
      [id]
    );
    const product_count = parseInt(productCountResult.rows[0].count) || 0;

    const categoryWithDetails = {
      ...updatedCategory,
      parent_name: parentName,
      product_count: product_count
    };

    console.log("✅ Category updated successfully:", categoryWithDetails);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: categoryWithDetails
    });

  } catch (error) {
    console.error("❌ Update Category Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update category",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Delete category (Admin only) - Soft delete by setting inactive
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryCheck = await database.query(
      "SELECT * FROM product_categories WHERE id = $1 AND is_active = true",
      [id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found or already inactive" 
      });
    }

    // Check for active products
    const productsCheck = await database.query(
      "SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_available = true",
      [id]
    );

    if (parseInt(productsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot deactivate category with active products" 
      });
    }

    // Check for active subcategories
    const subcategoriesCheck = await database.query(
      "SELECT COUNT(*) FROM product_categories WHERE parent_id = $1 AND is_active = true",
      [id]
    );

    if (parseInt(subcategoriesCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot deactivate category with active subcategories" 
      });
    }

    // Soft delete by setting inactive
    await database.query(
      "UPDATE product_categories SET is_active = false WHERE id = $1",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Category deactivated successfully"
    });

  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete category",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get categories for dropdown (active only, with basic info)
 */
// controllers/categoryController.js - Fix getCategoryOptions
export const getCategoryOptions = async (req, res) => {
  try {
    console.log('📡 Fetching category options from database...');
    
    const result = await database.query(
      `SELECT id, name, image, parent_id 
       FROM product_categories 
       WHERE is_active = true 
       ORDER BY parent_id NULLS FIRST, name`
    );

    console.log('📦 Raw database result rows count:', result.rows.length);
    
    // Validate and clean the data
    const validCategories = result.rows.filter(row => {
      const isValid = row.id && typeof row.id === 'string' && row.id.length > 0;
      if (!isValid) {
        console.error('❌ Invalid category found:', row);
      }
      return isValid;
    });

    console.log('✅ Valid categories count:', validCategories.length);
    
    // Log each valid category
    validCategories.forEach((row, index) => {
      console.log(`🔍 Valid Category ${index + 1}:`, {
        id: row.id,
        id_type: typeof row.id,
        name: row.name,
        parent_id: row.parent_id,
        parent_id_type: typeof row.parent_id
      });
    });

    res.status(200).json({
      success: true,
      categories: validCategories // Send only valid categories
    });

  } catch (error) {
    console.error("Get Category Options Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch category options",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};