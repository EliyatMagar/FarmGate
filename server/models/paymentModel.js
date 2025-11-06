// models/paymentModel.js
import database from '../config/db.js';

export const createPaymentsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        buyer_id UUID NOT NULL,
        payment_method VARCHAR(20) CHECK (payment_method IN ('cod', 'stripe')) NOT NULL,
        payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled', 'processing')) DEFAULT 'pending',
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        transaction_id VARCHAR(255),
        payment_gateway VARCHAR(50) CHECK (payment_gateway IN ('stripe', 'none')),
        payment_gateway_order_id VARCHAR(255),
        payment_gateway_payment_id VARCHAR(255),
        payment_gateway_response JSONB,
        refund_amount DECIMAL(10,2) DEFAULT 0,
        refund_reason TEXT,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        billing_address JSONB,
        payment_date TIMESTAMP,
        refund_date TIMESTAMP,
        confirmed_by UUID,
        confirmed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_payment_order
          FOREIGN KEY (order_id) 
          REFERENCES orders(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_payment_buyer
          FOREIGN KEY (buyer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;

    await database.query(query);
    console.log('✅ Payments table created successfully');
  } catch (error) {
    console.error('❌ Error creating payments table:', error);
    throw error;
  }
};

export const createPaymentTransactionsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payment_id UUID NOT NULL,
        transaction_type VARCHAR(20) CHECK (transaction_type IN ('payment', 'refund', 'capture', 'authorize')) NOT NULL,
        transaction_status VARCHAR(20) CHECK (transaction_status IN ('success', 'failed', 'pending')) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        gateway_transaction_id VARCHAR(255),
        gateway_response JSONB,
        error_code VARCHAR(100),
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_transaction_payment
          FOREIGN KEY (payment_id) 
          REFERENCES payments(id)
          ON DELETE CASCADE
      );
    `;

    await database.query(query);
    console.log('✅ Payment transactions table created successfully');
  } catch (error) {
    console.error('❌ Error creating payment transactions table:', error);
    throw error;
  }
};