import database from '../config/db.js';

export const createMessagesTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL,
        receiver_id UUID NOT NULL,
        product_id UUID,
        message_text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_sender
          FOREIGN KEY (sender_id) 
          REFERENCES users(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_receiver
          FOREIGN KEY (receiver_id) 
          REFERENCES users(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_product
          FOREIGN KEY (product_id) 
          REFERENCES products(id)
          ON DELETE SET NULL
      );
    `;

    await database.query(query);
    console.log('✅ Messages table created successfully');
  } catch (error) {
    console.error('❌ Error creating messages table:', error);
    throw error;
  }
};