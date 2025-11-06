// controllers/paymentController.js
import database from "../config/db.js";
import { stripeUtils } from "../utils/paymentUtils.js";
import { v4 as uuidv4 } from 'uuid';

// ✅ Create payment (Stripe only)
export const createPayment = async (req, res) => {
  const client = await database.connect();
  const { order_id, total_amount, buyer_id, payment_method, payment_gateway = 'stripe', currency = 'USD' } = req.body;

  console.log("🔄 Creating payment with order_id:", order_id, "amount:", total_amount);

  // Validate payment method
  if (!['cod', 'stripe'].includes(payment_method)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid payment method. Only 'cod' and 'stripe' are supported." 
    });
  }

  // Validate amount
  if (!total_amount || total_amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid amount for payment"
    });
  }

  try {
    await client.query("BEGIN");

    let gatewayResponse = null;
    let gatewayOrderId = null;

    // Handle temporary orders (when order_id is 'temp' or not provided)
    let finalOrderId = order_id;
    let isTemporary = false;
    let tempPaymentId = null;
    
    if (order_id === 'temp' || !order_id) {
      // Generate a temporary ID for tracking
      tempPaymentId = `temp_${uuidv4()}`;
      isTemporary = true;
      finalOrderId = null; // Set order_id to NULL for temporary payments
      console.log("🔄 Creating temporary payment with temp_id:", tempPaymentId);
    }

    // Handle Stripe payments
    if (payment_method === 'stripe') {
      try {
        console.log('Creating Stripe payment with amount:', total_amount, 'currency:', currency);
        
        const paymentIntent = await stripeUtils.createPaymentIntent(total_amount, currency.toLowerCase(), { 
          order_id: tempPaymentId || finalOrderId,
          buyer_id,
          is_temporary: isTemporary
        });
        
        gatewayResponse = paymentIntent;
        gatewayOrderId = paymentIntent.id;
        console.log('Stripe payment intent created successfully:', paymentIntent.id);
        
      } catch (stripeError) {
        console.error('Stripe payment creation failed:', stripeError);
        await client.query("ROLLBACK");
        return res.status(400).json({ 
          success: false, 
          message: stripeError.message 
        });
      }
    }

    // Insert payment with temp_payment_id for temporary payments
    const insertQuery = `
      INSERT INTO payments (
        order_id, temp_payment_id, is_temporary, buyer_id, payment_method, payment_status, payment_gateway,
        payment_gateway_order_id, payment_gateway_response, amount, currency, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      finalOrderId, // NULL for temporary payments
      tempPaymentId, // Temporary ID for tracking
      isTemporary,   // Flag to identify temporary payments
      buyer_id,
      payment_method,
      payment_method === 'cod' ? 'pending' : 'processing',
      payment_method === 'cod' ? 'none' : payment_gateway,
      gatewayOrderId,
      gatewayResponse ? JSON.stringify(gatewayResponse) : null,
      total_amount,
      currency
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        payment: result.rows[0],
        gatewayData: gatewayResponse,
        isTemporary: isTemporary
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create Payment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
};

// ✅ Create COD Payment
export const createCODPayment = async (req, res) => {
  const client = await database.connect();
  const { order_id, total_amount, buyer_id, currency = 'USD' } = req.body;

  console.log("🔄 Creating COD payment with order_id:", order_id, "amount:", total_amount);

  try {
    await client.query("BEGIN");

    // Handle temporary orders
    let finalOrderId = order_id;
    let isTemporary = false;
    let tempPaymentId = null;
    
    if (order_id === 'temp' || !order_id) {
      // Generate a temporary ID for tracking
      tempPaymentId = `temp_${uuidv4()}`;
      isTemporary = true;
      finalOrderId = null; // Set order_id to NULL for temporary payments
      console.log("🔄 Creating temporary COD payment with temp_id:", tempPaymentId);
    }

    const insertQuery = `
      INSERT INTO payments (
        order_id, temp_payment_id, is_temporary, buyer_id, payment_method, payment_status, payment_gateway,
        amount, currency, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      finalOrderId, // NULL for temporary payments
      tempPaymentId, // Temporary ID for tracking
      isTemporary,   // Flag to identify temporary payments
      buyer_id,
      'cod',
      'pending',
      'none',
      total_amount,
      currency
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "COD order created successfully",
      data: {
        payment: result.rows[0],
        isTemporary: isTemporary
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create COD Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ✅ Update payment with real order ID after order creation
export const updatePaymentOrderId = async (req, res) => {
  const client = await database.connect();
  const { payment_id, order_id } = req.body;

  try {
    await client.query("BEGIN");

    // Find temporary payments
    const result = await client.query(
      `UPDATE payments 
       SET order_id = $1, 
           temp_payment_id = NULL,
           is_temporary = false,
           updated_at = NOW()
       WHERE id = $2 AND is_temporary = true
       RETURNING *`,
      [order_id, payment_id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Payment not found or not a temporary payment"
      });
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Payment order ID updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update Payment Order ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// The rest of your existing functions remain the same...
export const confirmStripePayment = async (req, res) => {
  const client = await database.connect();
  const { payment_intent_id } = req.body;

  try {
    const paymentIntent = await stripeUtils.confirmPayment(payment_intent_id);

    await client.query("BEGIN");

    await client.query(
      `UPDATE payments
       SET payment_status = $1,
           payment_gateway_payment_id = $2,
           payment_gateway_response = $3,
           payment_date = NOW(),
           updated_at = NOW()
       WHERE payment_gateway_order_id = $4`,
      [
        paymentIntent.status === 'succeeded' ? 'paid' : 'failed',
        paymentIntent.id,
        JSON.stringify(paymentIntent),
        paymentIntent.id
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: paymentIntent.status === 'succeeded',
      message: `Payment ${paymentIntent.status}`,
      data: paymentIntent
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ✅ Confirm COD Payment (by farmer/admin)
export const confirmCODPayment = async (req, res) => {
  const client = await database.connect();
  const { order_id, confirmed_by } = req.body;

  try {
    await client.query("BEGIN");

    const paymentResult = await client.query(
      "SELECT * FROM payments WHERE order_id = $1 AND payment_method = 'cod'",
      [order_id]
    );
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "COD payment not found" });
    }

    await client.query(
      `UPDATE payments
       SET payment_status = 'paid',
           confirmed_by = $1,
           confirmed_at = NOW(),
           payment_date = NOW(),
           updated_at = NOW()
       WHERE order_id = $2 AND payment_method = 'cod'`,
      [confirmed_by, order_id]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "COD payment confirmed successfully"
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ✅ Stripe webhook
export const processStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeUtils.constructWebhookEvent(req.body, sig);
  } catch (error) {
    return res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }

  const client = await database.connect();

  try {
    await client.query("BEGIN");

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await client.query(
          `UPDATE payments
           SET payment_status = 'paid',
               payment_gateway_payment_id = $1,
               payment_gateway_response = $2,
               payment_date = NOW(),
               updated_at = NOW()
           WHERE payment_gateway_order_id = $3`,
          [paymentIntent.id, JSON.stringify(paymentIntent), paymentIntent.id]
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await client.query(
          `UPDATE payments
           SET payment_status = 'failed',
               payment_gateway_response = $1,
               updated_at = NOW()
           WHERE payment_gateway_order_id = $2`,
          [JSON.stringify(failedPayment), failedPayment.id]
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await client.query("COMMIT");
    res.json({ received: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Stripe webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ✅ Enhanced Refund function
export const initiateRefund = async (req, res) => {
  const client = await database.connect();
  const { payment_id, amount, reason } = req.body;

  try {
    await client.query("BEGIN");

    const paymentResult = await client.query(
      "SELECT * FROM payments WHERE id = $1",
      [payment_id]
    );
    const payment = paymentResult.rows[0];

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: "Only paid payments can be refunded" });
    }

    const refunded = parseFloat(payment.refund_amount || 0);
    const maxRefundAmount = parseFloat(payment.amount) - refunded;

    if (amount > maxRefundAmount) {
      return res.status(400).json({ success: false, message: "Refund amount exceeds available balance" });
    }

    let refundResponse = null;

    // Process refund for Stripe payments
    if (payment.payment_gateway === 'stripe' && payment.payment_gateway_payment_id) {
      refundResponse = await stripeUtils.createRefund(
        payment.payment_gateway_payment_id, 
        amount, 
        payment.currency
      );
    }

    // Update payment record
    await client.query(
      `UPDATE payments
       SET refund_amount = refund_amount + $1,
           refund_reason = $2,
           refund_date = NOW(),
           payment_status = (CASE WHEN refund_amount + $1 >= amount THEN 'refunded' ELSE 'paid' END),
           updated_at = NOW()
       WHERE id = $3`,
      [amount, reason, payment_id]
    );

    // Record transaction
    await client.query(
      `INSERT INTO payment_transactions (
        payment_id, transaction_type, transaction_status, amount, currency,
        gateway_transaction_id, gateway_response, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        payment_id,
        'refund',
        'success',
        amount,
        payment.currency,
        refundResponse?.id,
        refundResponse ? JSON.stringify(refundResponse) : null
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: refundResponse,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ✅ Get payment details
export const getPaymentDetails = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;

  try {
    const result = await database.query(
      `SELECT p.*, 
              json_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email
              ) as buyer_info
       FROM payments p
       LEFT JOIN users u ON p.buyer_id = u.id
       WHERE p.order_id = $1 AND (p.buyer_id = $2 OR $3 = 'admin')`,
      [orderId, userId, role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get payment methods
export const getPaymentMethods = async (req, res) => {
  res.status(200).json({
    success: true,
    methods: [
      { name: "Stripe Payments", type: "stripe", gateways: ["stripe"] },
      { name: "Cash on Delivery", type: "cod", gateways: ["none"] },
    ],
  });
};

// ✅ Payment statistics
export const getPaymentStatistics = async (req, res) => {
  try {
    const result = await database.query(`
      SELECT
        COUNT(*) AS total_payments,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS successful_payments,
        SUM(CASE WHEN payment_status = 'failed' THEN 1 ELSE 0 END) AS failed_payments,
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) AS pending_payments,
        SUM(CASE WHEN payment_method = 'cod' THEN 1 ELSE 0 END) AS cod_payments,
        SUM(amount) AS total_amount,
        SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) AS successful_amount
      FROM payments;
    `);

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get payments by user
export const getUserPayments = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;

    const result = await database.query(
      `SELECT p.*, o.order_number
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       WHERE p.buyer_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await database.query(
      "SELECT COUNT(*) FROM payments WHERE buyer_id = $1",
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};