import database from '../config/db.js';

export const createNotificationsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) CHECK (type IN ('order_update', 'price_alert', 'system', 'message')),
        related_id UUID,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_user
          FOREIGN KEY (user_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;

    await database.query(query);
    console.log('✅ Notifications table created successfully');
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    throw error;
  }
};