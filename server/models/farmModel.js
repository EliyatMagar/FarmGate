import database from '../config/db.js';

export const createFarmTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS farms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        location VARCHAR(150) NOT NULL,
        coordinates POINT,
        total_area DECIMAL(10,2),
        cultivated_area DECIMAL(10,2),
        soil_type VARCHAR(50),
        certification VARCHAR(100),
        images TEXT[],
        
        -- Verification fields
        verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        verified_by UUID,
        verified_at TIMESTAMP,
        rejection_reason TEXT,
        
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_farmer
          FOREIGN KEY (farmer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE,
        
        CONSTRAINT fk_verified_by
          FOREIGN KEY (verified_by) 
          REFERENCES users(id)
          ON DELETE SET NULL
      );
    `;

    await database.query(query);
    console.log('✅ Farms table created successfully');
  } catch (error) {
    console.error('❌ Error creating farms table:', error);
    throw error;
  }
};