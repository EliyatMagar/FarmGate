// models/orderModel.js
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

export const createOrderItemsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        product_id UUID NOT NULL,
        farmer_id UUID NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_order
          FOREIGN KEY (order_id) 
          REFERENCES orders(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_product
          FOREIGN KEY (product_id) 
          REFERENCES products(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_farmer
          FOREIGN KEY (farmer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;

    await database.query(query);
    console.log('✅ Order items table created successfully');
  } catch (error) {
    console.error('❌ Error creating order items table:', error);
    throw error;
  }
};