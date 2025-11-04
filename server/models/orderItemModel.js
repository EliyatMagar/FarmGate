import database from '../config/db.js';

export const createOrderItemsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        product_id UUID NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        farmer_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_order
          FOREIGN KEY (order_id) 
          REFERENCES orders(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_product
          FOREIGN KEY (product_id) 
          REFERENCES products(id)
          ON DELETE RESTRICT,
          
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