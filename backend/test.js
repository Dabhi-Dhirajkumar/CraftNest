const db = require('./config/db');

async function check() {
  try {
    const res = await db.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1', ['users']);
    console.log("COLUMNS:");
    res.rows.forEach(r => console.log(r.column_name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
check();
