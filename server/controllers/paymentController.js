import database from "../config/db.js";
import { razorpayUtils } from "../utils/razorpay.js";

// ✅ Create payment
export const createPayment = async (req, res) => {
  const client = await database.connect();
  const { order_id, total_amount, buyer_id, payment_method } = req.body;

  try {
    await client.query("BEGIN");

    const razorpayOrder = await razorpayUtils.createOrder(
      total_amount,
      "INR",
      order_id
    );

    const insertQuery = `
      INSERT INTO payments (
        order_id, buyer_id, payment_method, payment_status,
        payment_gateway_order_id, amount, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      order_id,
      buyer_id,
      payment_method,
      "pending",
      razorpayOrder.id,
      total_amount,
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        payment: result.rows[0],
        razorpayOrder,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ✅ Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  const client = await database.connect();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    const isValid = razorpayUtils.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid)
      return res.status(400).json({ success: false, message: "Invalid signature" });

    const razorpayPayment = await razorpayUtils.fetchPayment(razorpay_payment_id);

    await client.query("BEGIN");

    await client.query(
      `
      UPDATE payments
      SET payment_status = $1,
          payment_gateway_payment_id = $2,
          payment_gateway_response = $3,
          updated_at = NOW()
      WHERE payment_gateway_order_id = $4
      `,
      ["paid", razorpay_payment.id, JSON.stringify(razorpayPayment), razorpay_order_id]
    );

    await client.query("COMMIT");

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ✅ Razorpay webhook
export const processWebhook = async (req, res) => {
  const payload = req.body;
  const signature = req.headers["x-razorpay-signature"];

  try {
    const isValid = razorpayUtils.verifyWebhookSignature(payload, signature);
    if (!isValid)
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });

    const eventType = payload.event;
    const payment = payload.payload.payment?.entity;

    const client = await database.connect();
    await client.query("BEGIN");

    if (eventType === "payment.captured") {
      await client.query(
        `
        UPDATE payments
        SET payment_status = 'paid',
            payment_gateway_payment_id = $1,
            payment_gateway_response = $2,
            updated_at = NOW()
        WHERE payment_gateway_order_id = $3
        `,
        [payment.id, JSON.stringify(payment), payment.order_id]
      );
    } else if (eventType === "payment.failed") {
      await client.query(
        `
        UPDATE payments
        SET payment_status = 'failed',
            payment_gateway_response = $1,
            updated_at = NOW()
        WHERE payment_gateway_order_id = $2
        `,
        [JSON.stringify(payment), payment.order_id]
      );
    }

    await client.query("COMMIT");
    client.release();

    res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Confirm COD Payment
export const confirmCODPayment = async (req, res) => {
  const client = await database.connect();
  const { order_id, farmer_id } = req.body;

  try {
    await client.query("BEGIN");

    const payment = await client.query("SELECT * FROM payments WHERE order_id = $1", [order_id]);
    if (payment.rows.length === 0)
      return res.status(404).json({ success: false, message: "Payment not found" });

    await client.query(
      `
      UPDATE payments
      SET payment_status = 'paid',
          confirmed_by = $2,
          confirmed_at = NOW()
      WHERE order_id = $1
      `,
      [order_id, farmer_id]
    );

    await client.query("COMMIT");
    res.status(200).json({ success: true, message: "COD payment confirmed successfully" });
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
      `
      SELECT * FROM payments
      WHERE order_id = $1 AND (buyer_id = $2 OR $3 = 'admin')
      `,
      [orderId, userId, role]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Payment not found" });

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Refund
export const initiateRefund = async (req, res) => {
  const client = await database.connect();
  const { payment_id, amount } = req.body;

  try {
    await client.query("BEGIN");

    const paymentResult = await client.query(
      "SELECT * FROM payments WHERE id = $1",
      [payment_id]
    );
    const payment = paymentResult.rows[0];

    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    const refunded = parseFloat(payment.refund_amount || 0) || 0;
    const maxRefundAmount = parseFloat(payment.amount) - refunded;

    if (amount > maxRefundAmount)
      return res.status(400).json({ success: false, message: "Refund exceeds limit" });

    const refund = await razorpayUtils.initiateRefund(
      payment.payment_gateway_payment_id,
      amount
    );

    await client.query(
      `
      UPDATE payments
      SET refund_amount = refund_amount + $1,
          refund_response = $2,
          updated_at = NOW()
      WHERE id = $3
      `,
      [amount, JSON.stringify(refund), payment_id]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: refund,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ✅ Get payment methods
export const getPaymentMethods = async (req, res) => {
  res.status(200).json({
    success: true,
    methods: [
      { name: "Credit/Debit Card", type: "card" },
      { name: "UPI", type: "upi" },
      { name: "Net Banking", type: "netbanking" },
      { name: "Wallet", type: "wallet" },
      { name: "Cash on Delivery", type: "cod" },
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
        SUM(amount) AS total_amount
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
