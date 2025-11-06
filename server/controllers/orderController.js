import database from '../config/db.js';
import { sendOrderConfirmationEmail, sendOrderNotificationToFarmer } from '../utils/emailService.js';

/**
 * @desc Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

/**
 * @desc Validate UUID format
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * @desc Get order details by ID
 */
const getOrderDetails = async (orderId) => {
  const orderResult = await database.query(
    `SELECT 
      o.*,
      buyer.name as buyer_name,
      buyer.email as buyer_email,
      buyer.phone as buyer_phone,
      farmer.name as farmer_name,
      farmer.email as farmer_email,
      farmer.phone as farmer_phone
     FROM orders o
     JOIN users buyer ON o.buyer_id = buyer.id
     JOIN users farmer ON o.farmer_id = farmer.id
     WHERE o.id = $1`,
    [orderId]
  );

  const itemsResult = await database.query(
    `SELECT 
      oi.*,
      p.name as product_name,
      p.unit_type,
      p.images,
      f.name as farm_name
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     JOIN farms f ON p.farm_id = f.id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  return {
    ...orderResult.rows[0],
    items: itemsResult.rows
  };
};


const validateOrderItems = async (client, farmer_id, items, currency = 'USD') => {
  // Validate required fields
  if (!farmer_id || !items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Farmer ID and items are required");
  }

  console.log("🔍 Validating order items for farmer_id:", farmer_id);
  console.log("📦 Items to validate:", JSON.stringify(items, null, 2));

  // Verify farmer exists and is verified
  const farmerCheck = await client.query(
    "SELECT id, name, email, role, is_verified FROM users WHERE id = $1 AND role = 'farmer' AND is_verified = true",
    [farmer_id]
  );

  console.log("👨‍🌾 Farmer check result:", farmerCheck.rows);

  if (farmerCheck.rows.length === 0) {
    // Let's check why the farmer is not found
    const farmerExistsCheck = await client.query(
      "SELECT id, name, email, role, is_verified FROM users WHERE id = $1",
      [farmer_id]
    );
    
    console.log("🔎 Detailed farmer check:", farmerExistsCheck.rows);
    
    if (farmerExistsCheck.rows.length === 0) {
      throw new Error(`Farmer with ID ${farmer_id} not found in database`);
    } else {
      const farmer = farmerExistsCheck.rows[0];
      if (farmer.role !== 'farmer') {
        throw new Error(`User with ID ${farmer_id} is not a farmer (role: ${farmer.role})`);
      }
      if (!farmer.is_verified) {
        throw new Error(`Farmer with ID ${farmer_id} is not verified`);
      }
    }
  }

  const farmer = farmerCheck.rows[0];
  console.log("✅ Farmer validated:", farmer.name, farmer.email);

  // Rest of your validation code...
  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const { product_id, quantity } = item;

    if (!product_id || !quantity || quantity <= 0) {
      throw new Error("Each item must have product_id and positive quantity");
    }

    // Validate product_id UUID format
    if (!isValidUUID(product_id)) {
      throw new Error("Invalid product ID format");
    }

    console.log("🔍 Checking product:", product_id, "for farmer:", farmer_id);

    // Get product details
    const productResult = await client.query(
      `SELECT p.*, f.name as farm_name, u.name as farmer_name, 
              f.verification_status as farm_verification_status,
              u.is_verified as farmer_verified
       FROM products p 
       JOIN farms f ON p.farm_id = f.id 
       JOIN users u ON p.farmer_id = u.id 
       WHERE p.id = $1 AND p.is_available = true 
       AND p.farmer_id = $2`,
      [product_id, farmer_id]
    );

    console.log("📦 Product check result:", productResult.rows.length ? 'Found' : 'Not found');

    if (productResult.rows.length === 0) {
      // Check if product exists at all
      const productExists = await client.query(
        "SELECT id, name, farmer_id, is_available FROM products WHERE id = $1",
        [product_id]
      );
      
      if (productExists.rows.length === 0) {
        throw new Error(`Product ${product_id} not found`);
      } else {
        const product = productExists.rows[0];
        if (product.farmer_id !== farmer_id) {
          throw new Error(`Product ${product_id} does not belong to farmer ${farmer_id}`);
        }
        if (!product.is_available) {
          throw new Error(`Product ${product_id} is not available`);
        }
      }
    }

    const product = productResult.rows[0];
    console.log("✅ Product validated:", product.name, "Farm status:", product.farm_verification_status, "Farmer verified:", product.farmer_verified);

    // Check farm verification status
    if (product.farm_verification_status !== 'approved') {
      throw new Error(`Farm ${product.farm_name} is not approved (status: ${product.farm_verification_status})`);
    }

    // Check farmer verification
    if (!product.farmer_verified) {
      throw new Error(`Farmer ${product.farmer_name} is not verified`);
    }

    // Check available quantity
    if (parseFloat(product.available_quantity) < parseFloat(quantity)) {
      throw new Error(`Insufficient quantity for ${product.name}. Available: ${product.available_quantity}`);
    }

    // Check minimum order quantity
    if (parseFloat(quantity) < parseFloat(product.min_order_quantity)) {
      throw new Error(`Minimum order quantity for ${product.name} is ${product.min_order_quantity}`);
    }

    const unitPrice = parseFloat(product.price_per_unit);
    const itemTotal = unitPrice * parseFloat(quantity);
    totalAmount += itemTotal;

    validatedItems.push({
      product_id,
      product: product,
      quantity: parseFloat(quantity),
      unit_price: unitPrice,
      total_price: itemTotal
    });
  }

  if (totalAmount <= 0) {
    throw new Error("Invalid order total");
  }

  return {
    farmer,
    validatedItems,
    totalAmount
  };
};

/**
 * @desc Create order after successful payment
 */
/**
 * @desc Create order after successful payment
 */
export const createOrderAfterPayment = async (req, res) => {
  const client = await database.connect();
  
  try {
    await client.query('BEGIN');
    
    const buyer_id = req.user.id;
    const { 
      farmer_id, 
      items, 
      delivery_address, 
      delivery_date, 
      special_instructions,
      currency = 'USD',
      payment_method = 'stripe',
      payment_status = 'paid',
      transaction_id = null
    } = req.body;

    console.log("Creating order after successful payment for buyer:", buyer_id);
    console.log("Payment method:", payment_method);
    console.log("Payment status:", payment_status);
    console.log("Transaction ID:", transaction_id);

    // Validate UUID format for farmer_id
    if (!farmer_id || !isValidUUID(farmer_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        message: "Invalid farmer ID format" 
      });
    }

    // Validate required fields
    if (!farmer_id || !items || !Array.isArray(items) || items.length === 0 || !delivery_address) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        message: "Farmer ID, items, and delivery address are required" 
      });
    }

    // Validate order data
    const { farmer, validatedItems, totalAmount } = await validateOrderItems(
      client, farmer_id, items, currency
    );

    // Generate order number
    const order_number = generateOrderNumber();

    // First, let's check the actual columns in the orders table
    const tableInfo = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position
    `);
    
    console.log("Available columns in orders table:", tableInfo.rows.map(row => row.column_name));

    // Create order with payment details - use only existing columns
    // Let's try a safer approach by building the query dynamically
    const orderColumns = [
      'order_number', 'buyer_id', 'farmer_id', 'total_amount', 
      'delivery_address', 'delivery_date', 'special_instructions',
      'status' // Add default status
    ];
    
    const orderValues = [
      order_number,
      buyer_id,
      farmer_id,
      totalAmount,
      delivery_address,
      delivery_date || null,
      special_instructions || null,
      'confirmed' // Default status for paid orders
    ];

    // Add payment-related columns if they exist
    let placeholders = orderColumns.map((_, index) => `$${index + 1}`).join(', ');
    
    const orderResult = await client.query(
      `INSERT INTO orders (${orderColumns.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      orderValues
    );

    const order = orderResult.rows[0];
    console.log("✅ Order created successfully:", order.id);

    // Create order items and update product quantities
    for (const item of validatedItems) {
      // Insert order item
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, total_price, farmer_id
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.total_price,
          farmer_id
        ]
      );

      // Update product available quantity (only after successful payment)
      await client.query(
        `UPDATE products 
         SET available_quantity = available_quantity - $1,
             updated_at = CURRENT_TIMESTAMP,
             is_available = (available_quantity - $1) > 0
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
      
      console.log(`✅ Product ${item.product_id} quantity updated`);
    }

    // If payment columns exist, update them separately
    try {
      // Try to update payment status if the column exists
      await client.query(
        `UPDATE orders 
         SET payment_status = $1, 
             payment_method = $2,
             transaction_id = $3
         WHERE id = $4`,
        [payment_status, payment_method, transaction_id, order.id]
      );
      console.log("✅ Payment details updated successfully");
    } catch (updateError) {
      console.log("⚠️ Payment columns don't exist, skipping payment details update");
      // Ignore error if columns don't exist
    }

    await client.query('COMMIT');
    console.log("✅ Transaction committed successfully");

    // Get complete order details with items for email
    const completeOrder = await getOrderDetails(order.id);

    // Send email notifications (non-blocking) - ONLY AFTER SUCCESSFUL PAYMENT
    try {
      await sendOrderConfirmationEmail(req.user, completeOrder);
      await sendOrderNotificationToFarmer(farmer, completeOrder);
      console.log('✅ Order confirmation emails sent successfully');
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully after payment",
      order: completeOrder
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Create Order After Payment Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Order creation failed after payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};
/**
 * @desc Validate order before payment (for frontend to check availability)
 */
export const validateOrder = async (req, res) => {
  const client = await database.connect();
  
  try {
    await client.query('BEGIN');
    
    const buyer_id = req.user.id;
    const { 
      farmer_id, 
      items, 
      currency = 'USD'
    } = req.body;

    console.log("Validating order for buyer:", buyer_id);

    // Validate UUID format for farmer_id
    if (!farmer_id || !isValidUUID(farmer_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        message: "Invalid farmer ID format" 
      });
    }

    // Validate order data without creating order
    const { farmer, validatedItems, totalAmount } = await validateOrderItems(
      client, farmer_id, items, currency
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: "Order validation successful",
      data: {
        farmer: {
          id: farmer.id,
          name: farmer.name,
          email: farmer.email
        },
        items: validatedItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          available_quantity: item.product.available_quantity
        })),
        total_amount: totalAmount,
        currency: currency
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Order Validation Error:", error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * @desc Create a new order (without payment - for backward compatibility)
 */
export const createOrder = async (req, res) => {
  const client = await database.connect();
  
  try {
    await client.query('BEGIN');
    
    const buyer_id = req.user.id;
    const { 
      farmer_id, 
      items, 
      delivery_address, 
      delivery_date, 
      special_instructions,
      currency = 'USD'
    } = req.body;

    console.log("Order creation request from buyer:", buyer_id);
    console.log("Farmer ID received:", farmer_id);

    // Validate UUID format for farmer_id
    if (!farmer_id || !isValidUUID(farmer_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        message: "Invalid farmer ID format" 
      });
    }

    // Validate required fields
    if (!farmer_id || !items || !Array.isArray(items) || items.length === 0 || !delivery_address) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        message: "Farmer ID, items, and delivery address are required" 
      });
    }

    // Verify farmer exists and is verified
    const farmerCheck = await client.query(
      "SELECT id, name, email FROM users WHERE id = $1 AND role = 'farmer' AND is_verified = true",
      [farmer_id]
    );

    if (farmerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        message: "Invalid farmer or farmer not verified" 
      });
    }

    const farmer = farmerCheck.rows[0];

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || quantity <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          message: "Each item must have product_id and positive quantity" 
        });
      }

      // Validate product_id UUID format
      if (!isValidUUID(product_id)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          message: "Invalid product ID format" 
        });
      }

      // Get product details
      const productResult = await client.query(
        `SELECT p.*, f.name as farm_name, u.name as farmer_name 
         FROM products p 
         JOIN farms f ON p.farm_id = f.id 
         JOIN users u ON p.farmer_id = u.id 
         WHERE p.id = $1 AND p.is_available = true 
         AND p.farmer_id = $2 
         AND f.verification_status = 'approved' 
         AND u.is_verified = true`,
        [product_id, farmer_id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          message: `Product ${product_id} not available or does not belong to this farmer` 
        });
      }

      const product = productResult.rows[0];

      // Check available quantity
      if (parseFloat(product.available_quantity) < parseFloat(quantity)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          message: `Insufficient quantity for ${product.name}. Available: ${product.available_quantity}` 
        });
      }

      // Check minimum order quantity
      if (parseFloat(quantity) < parseFloat(product.min_order_quantity)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false,
          message: `Minimum order quantity for ${product.name} is ${product.min_order_quantity}` 
        });
      }

      const unitPrice = parseFloat(product.price_per_unit);
      const itemTotal = unitPrice * parseFloat(quantity);
      totalAmount += itemTotal;

      orderItems.push({
        product_id,
        product: product,
        quantity: parseFloat(quantity),
        unit_price: unitPrice,
        total_price: itemTotal
      });
    }

    if (totalAmount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        message: "Invalid order total" 
      });
    }

    // Generate order number
    const order_number = generateOrderNumber();

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (
        order_number, buyer_id, farmer_id, total_amount, 
        delivery_address, delivery_date, special_instructions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        order_number,
        buyer_id,
        farmer_id,
        totalAmount,
        delivery_address,
        delivery_date || null,
        special_instructions || null
      ]
    );

    const order = orderResult.rows[0];

    // Create order items and update product quantities
    for (const item of orderItems) {
      // Insert order item
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, total_price, farmer_id
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.total_price,
          farmer_id
        ]
      );

      // Update product available quantity
      await client.query(
        `UPDATE products 
         SET available_quantity = available_quantity - $1,
             updated_at = CURRENT_TIMESTAMP,
             is_available = (available_quantity - $1) > 0
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');

    // Get complete order details with items for email
    const completeOrder = await getOrderDetails(order.id);

    // Send email notifications (non-blocking)
    try {
      await sendOrderConfirmationEmail(req.user, completeOrder);
      await sendOrderNotificationToFarmer(farmer, completeOrder);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: completeOrder
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Create Order Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Order creation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * @desc Get buyer's orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        farmer.name as farmer_name,
        farmer.profile_image as farmer_image
      FROM orders o
      JOIN users farmer ON o.farmer_id = farmer.id
      WHERE o.buyer_id = $1
    `;

    let countQuery = `
      SELECT COUNT(*)
      FROM orders o
      WHERE o.buyer_id = $1
    `;

    const queryParams = [buyer_id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      countQuery += ` AND o.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const [ordersResult, countResult] = await Promise.all([
      database.query(query, queryParams),
      database.query(countQuery, queryParams.slice(0, -2))
    ]);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await database.query(
          `SELECT 
            oi.*,
            p.name as product_name,
            p.unit_type,
            p.images
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [order.id]
        );

        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      orders: ordersWithItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders" 
    });
  }
};

/**
 * @desc Get farmer's orders
 */
export const getFarmerOrders = async (req, res) => {
  try {
    const farmer_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        buyer.name as buyer_name,
        buyer.profile_image as buyer_image
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      WHERE o.farmer_id = $1
    `;

    let countQuery = `
      SELECT COUNT(*)
      FROM orders o
      WHERE o.farmer_id = $1
    `;

    const queryParams = [farmer_id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      countQuery += ` AND o.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const [ordersResult, countResult] = await Promise.all([
      database.query(query, queryParams),
      database.query(countQuery, queryParams.slice(0, -2))
    ]);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await database.query(
          `SELECT 
            oi.*,
            p.name as product_name,
            p.unit_type,
            p.images,
            f.name as farm_name
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           JOIN farms f ON p.farm_id = f.id
           WHERE oi.order_id = $1`,
          [order.id]
        );

        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      orders: ordersWithItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get Farmer Orders Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders" 
    });
  }
};

/**
 * @desc Get single order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    let query = `
      SELECT 
        o.*,
        buyer.name as buyer_name,
        buyer.email as buyer_email,
        buyer.phone as buyer_phone,
        farmer.name as farmer_name,
        farmer.email as farmer_email,
        farmer.phone as farmer_phone
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users farmer ON o.farmer_id = farmer.id
      WHERE o.id = $1
    `;

    const queryParams = [id];

    // Add access control
    if (user_role === 'buyer') {
      query += ` AND o.buyer_id = $2`;
      queryParams.push(user_id);
    } else if (user_role === 'farmer') {
      query += ` AND o.farmer_id = $2`;
      queryParams.push(user_id);
    }
    // Admin can access all orders without restriction

    const orderResult = await database.query(query, queryParams);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found or access denied" 
      });
    }

    // Get order items
    const itemsResult = await database.query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.unit_type,
        p.images,
        f.name as farm_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN farms f ON p.farm_id = f.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };

    res.status(200).json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch order" 
    });
  }
};

/**
 * @desc Update order status (Farmer only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid status is required. Allowed: " + validStatuses.join(', ') 
      });
    }

    // Check if order exists and belongs to farmer
    const orderCheck = await database.query(
      "SELECT * FROM orders WHERE id = $1 AND farmer_id = $2",
      [id, farmer_id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found or access denied" 
      });
    }

    const currentOrder = orderCheck.rows[0];

    // Validate status transition
    if (status === 'cancelled' && currentOrder.status === 'delivered') {
      return res.status(400).json({ 
        success: false,
        message: "Cannot cancel a delivered order" 
      });
    }

    // Update order status
    const result = await database.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    // If order is cancelled, restore product quantities
    if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
      const itemsResult = await database.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
        [id]
      );

      for (const item of itemsResult.rows) {
        await database.query(
          `UPDATE products 
           SET available_quantity = available_quantity + $1,
               updated_at = CURRENT_TIMESTAMP,
               is_available = true
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }
    }

    const updatedOrder = await getOrderDetails(id);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update order status" 
    });
  }
};

/**
 * @desc Update payment status
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method, transaction_id } = req.body;

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (!payment_status || !validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid payment status is required. Allowed: " + validPaymentStatuses.join(', ') 
      });
    }

    // Check if order exists
    const orderCheck = await database.query(
      "SELECT * FROM orders WHERE id = $1",
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Update payment status
    const result = await database.query(
      `UPDATE orders 
       SET payment_status = $1, 
           payment_method = $2,
           transaction_id = $3,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
      [payment_status, payment_method || null, transaction_id || null, id]
    );

    const updatedOrder = await getOrderDetails(id);

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${payment_status}`,
      order: updatedOrder
    });

  } catch (error) {
    console.error("Update Payment Status Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update payment status" 
    });
  }
};

/**
 * @desc Get all orders (Admin only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      payment_status, 
      farmer_id, 
      buyer_id 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        buyer.name as buyer_name,
        buyer.email as buyer_email,
        farmer.name as farmer_name,
        farmer.email as farmer_email
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users farmer ON o.farmer_id = farmer.id
    `;

    let countQuery = `
      SELECT COUNT(*)
      FROM orders o
    `;

    const queryParams = [];
    let whereConditions = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereConditions.push(`o.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (payment_status) {
      paramCount++;
      whereConditions.push(`o.payment_status = $${paramCount}`);
      queryParams.push(payment_status);
    }

    if (farmer_id) {
      paramCount++;
      whereConditions.push(`o.farmer_id = $${paramCount}`);
      queryParams.push(farmer_id);
    }

    if (buyer_id) {
      paramCount++;
      whereConditions.push(`o.buyer_id = $${paramCount}`);
      queryParams.push(buyer_id);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const [ordersResult, countResult] = await Promise.all([
      database.query(query, queryParams),
      database.query(countQuery, queryParams.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      orders: ordersResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders" 
    });
  }
};

/**
 * @desc Get order statistics
 */
export const getOrderStatistics = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_role = req.user.role;

    let queryWhere = "";
    const queryParams = [];

    if (user_role === 'farmer') {
      queryWhere = "WHERE farmer_id = $1";
      queryParams.push(user_id);
    } else if (user_role === 'buyer') {
      queryWhere = "WHERE buyer_id = $1";
      queryParams.push(user_id);
    }

    const statsResult = await database.query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount END), 0) as total_revenue
       FROM orders ${queryWhere}`,
      queryParams
    );

    const revenueByMonth = await database.query(
      `SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM orders 
       ${queryWhere} AND status != 'cancelled'
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY month DESC
       LIMIT 6`,
      queryParams
    );

    res.status(200).json({
      success: true,
      statistics: {
        ...statsResult.rows[0],
        revenue_by_month: revenueByMonth.rows
      }
    });

  } catch (error) {
    console.error("Get Order Statistics Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch order statistics" 
    });
  }
};