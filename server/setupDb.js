// server/setupDb.js

const pool = require("./db");
const fs = require("fs");
const path = require("path");

async function setup() {
  try {
    const set_up_sql_path = path.join(__dirname, "sql_queries/set_up.sql");

    const sql = fs.readFileSync(set_up_sql_path, "utf-8");

    await pool.query(sql);
    console.log("Database setup completed.");
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error("Error setting up database:", err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
}

module.exports = { setup };

if (require.main === module) {
  setup();
}
