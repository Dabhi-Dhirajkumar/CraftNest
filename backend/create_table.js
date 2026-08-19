const db = require('./config/db');

async function run() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Notifications (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES Users(id) ON DELETE CASCADE,
          type VARCHAR(50) DEFAULT 'info',
          text TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Notifications table created successfully.');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    process.exit(0);
  }
}

run();
