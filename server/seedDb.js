// server/setupDb.js

const pool = require("./db");
const fs = require("fs");
const path = require("path");

async function setup() {
  try {
    const set_up_sql_path = path.join(__dirname, "sql_queries/seed_data.sql");

    const sql = fs.readFileSync(set_up_sql_path, "utf-8");

    await pool.query(sql);
    console.log("Database seeded.");
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error("Error seeding database:", err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
}

module.exports = setup;

if (require.main === module) {
  setup();
}
