import database from '../config/db.js';

export const createOrdersTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        buyer_id UUID NOT NULL,
        farmer_id UUID NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
        payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
        delivery_address TEXT NOT NULL,
        delivery_date DATE,
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_buyer
          FOREIGN KEY (buyer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_farmer
          FOREIGN KEY (farmer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;

    await database.query(query);
    console.log('✅ Orders table created successfully');
  } catch (error) {
    console.error('❌ Error creating orders table:', error);
    throw error;
  }
};