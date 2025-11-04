import database from '../config/db.js';

export const createProductsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID NOT NULL,
        farm_id UUID NOT NULL,
        category_id UUID NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price_per_unit DECIMAL(10,2) NOT NULL,
        unit_type VARCHAR(20) CHECK (unit_type IN ('kg', 'gram', 'piece', 'liter', 'box', 'bag')),
        available_quantity DECIMAL(10,2) NOT NULL,
        min_order_quantity DECIMAL(10,2) DEFAULT 1,
        quality_grade VARCHAR(20) CHECK (quality_grade IN ('organic', 'premium', 'standard', 'economy')),
        harvest_date DATE,
        expiry_date DATE,
        images TEXT[],
        is_organic BOOLEAN DEFAULT FALSE,
        is_available BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3,2) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_farmer
          FOREIGN KEY (farmer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_farm
          FOREIGN KEY (farm_id) 
          REFERENCES farms(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_category
          FOREIGN KEY (category_id) 
          REFERENCES product_categories(id)
          ON DELETE RESTRICT
      );
    `;

    await database.query(query);
    console.log('✅ Products table created successfully');
  } catch (error) {
    console.error('❌ Error creating products table:', error);
    throw error;
  }
};