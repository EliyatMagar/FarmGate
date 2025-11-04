import database from '../config/db.js';

export const createProductCategoryTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS product_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(255),
        parent_id UUID,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_parent_category
          FOREIGN KEY (parent_id) 
          REFERENCES product_categories(id)
          ON DELETE SET NULL
      );

      -- Create trigger to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
      CREATE TRIGGER update_product_categories_updated_at
        BEFORE UPDATE ON product_categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    await database.query(query);
    console.log('✅ Product categories table created successfully');
  } catch (error) {
    console.error('❌ Error creating product categories table:', error);
    throw error;
  }
};