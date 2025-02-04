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

// Function to look up a patient by ID or name
const lookupPatient = (searchTerm, callback) => {
    const query = "SELECT patient_id, name, dob, address, phone_number, email FROM patients WHERE patient_id = ? OR name LIKE ?";
    db.query(query, [searchTerm, `%${searchTerm}%`], callback);
};

// Function to generate a report of all patients
const generatePatientReport = (callback) => {
    const query = "SELECT patient_id, name, dob, address, phone_number, email FROM patients";
    db.query(query, [], callback);
};

module.exports = {
  verifyStaffCredentials,
  verifyAdminCredentials,
  lookupPatient,
  generatePatientReport
};
