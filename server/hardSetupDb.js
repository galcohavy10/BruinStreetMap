// server/setupDb.js
const pool = require("./db.js");
const fs = require("fs");
const path = require("path");
const { setup } = require("./setupDb.js");

async function hardSetUp() {
  try {
    const reset_path = path.join(__dirname, "./sql_queries/reset_db.sql");
    const reset_sql = fs.readFileSync(reset_path, "utf-8");
    await pool.query(reset_sql);
    await setup();
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error("Error resetting database:", err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
}

// anonymous function
(async () => {
  await hardSetUp();
})();

module.exports = hardSetUp;
