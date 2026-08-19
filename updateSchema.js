const db = require('./backend/config/db');

async function updateSchema() {
  try {
    await db.query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`);
    await db.query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(10)`);
    await db.query(`ALTER TABLE Users ADD COLUMN IF NOT EXISTS reset_otp_expiry TIMESTAMP`);
    console.log('Schema updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema', err);
    process.exit(1);
  }
}

updateSchema();
