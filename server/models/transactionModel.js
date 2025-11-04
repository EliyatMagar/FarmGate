import database from '../config/db.js';

export const createTransactionsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        farmer_id UUID NOT NULL,
        buyer_id UUID NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        transaction_type VARCHAR(20) CHECK (transaction_type IN ('sale', 'refund', 'payout')),
        payment_method VARCHAR(50),
        transaction_status VARCHAR(20) CHECK (transaction_status IN ('pending', 'completed', 'failed', 'refunded')),
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_gateway_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_order
          FOREIGN KEY (order_id) 
          REFERENCES orders(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_farmer
          FOREIGN KEY (farmer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_buyer
          FOREIGN KEY (buyer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;

    await database.query(query);
    console.log('✅ Transactions table created successfully');
  } catch (error) {
    console.error('❌ Error creating transactions table:', error);
    throw error;
  }
};