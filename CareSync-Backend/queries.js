const db = require("./db"); // Import your database connection

// Function to verify staff credentials
const verifyStaffCredentials = (username, callback) => {
  const query = "SELECT * FROM users WHERE username = ? AND role NOT IN ('Admin', 'admin')";
  db.query(query, [username], callback); // Fetch user by username for staff login
};

// Function to verify admin credentials
const verifyAdminCredentials = (username, callback) => {
  const query = "SELECT * FROM users WHERE username = ? AND role IN ('Admin', 'admin')";
  db.query(query, [username], callback); // Fetch user by username for admin login
};

module.exports = {
  verifyStaffCredentials,
  verifyAdminCredentials,
};
