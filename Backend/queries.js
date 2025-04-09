const db = require("./db"); // Import your database connection

// Function to verify staff credentials
const verifyStaffCredentials = (username, callback) => {
  console.log(`🔍 Checking staff user in database: ${username}`); // Debug log

  const query = "SELECT * FROM users WHERE username = ? AND role NOT IN ('Admin', 'admin')";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("❌ Database error in verifyStaffCredentials:", err);
      return callback(err, null);
    }

    console.log("✅ Database query result (staff login):", results);
    callback(null, results);
  });
};

// Function to verify admin credentials
const verifyAdminCredentials = (username, callback) => {
  console.log(`🔍 Checking admin user in database: ${username}`); // Debug log

  const query = "SELECT * FROM users WHERE username = ? AND role IN ('Admin', 'admin')";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("❌ Database error in verifyAdminCredentials:", err);
      return callback(err, null);
    }

    console.log("✅ Database query result (admin login):", results);
    callback(null, results);
  });
};

module.exports = {
  verifyStaffCredentials,
  verifyAdminCredentials,
};
