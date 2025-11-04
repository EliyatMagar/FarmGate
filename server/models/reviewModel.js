import database from '../config/db.js';

export const createReviewsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL,
        buyer_id UUID NOT NULL,
        order_id UUID NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        images TEXT[],
        is_verified_purchase BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_product
          FOREIGN KEY (product_id) 
          REFERENCES products(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_buyer
          FOREIGN KEY (buyer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_order
          FOREIGN KEY (order_id) 
          REFERENCES orders(id)
          ON DELETE CASCADE,
          
        CONSTRAINT unique_order_review
          UNIQUE (order_id, product_id)
      );
    `;

    await database.query(query);
    console.log('✅ Reviews table created successfully');
  } catch (error) {
    console.error('❌ Error creating reviews table:', error);
    throw error;
  }
};