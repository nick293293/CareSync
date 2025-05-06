const express = require("express");
const cors = require("cors"); // Import CORS
const bcrypt = require("bcrypt");
const { verifyStaffCredentials, verifyAdminCredentials } = require("./queries"); // Import queries
const app = express();

// Use CORS middleware
app.use(cors()); // Allow all origins (you can restrict this if needed)

// Middleware to parse JSON requests
app.use(express.json());

// Login API for Staff
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Validate that username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  // Query the database to check for user
  verifyStaffCredentials(username, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (results.length > 0) {
      const user = results[0];

      // Compare hashed password with the provided password
      bcrypt.compare(password, user.password, (error, isMatch) => {
        if (error) {
          console.error("Error comparing passwords:", error);
          return res.status(500).json({
            success: false,
            message: "Error validating credentials",
          });
        }

        if (isMatch) {
          res.json({
            success: true,
            message: "Login successful",
          });
        } else {
          res.status(401).json({
            success: false,
            message: "Invalid username or password",
          });
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }
  });
});


//-----------------------------------------------------------------------------------------------------
// Login API for Admin
app.post("/api/loginAdmin", (req, res) => {
  const { username, password } = req.body;

  // Validate that username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  // Query the database to check for user
  verifyAdminCredentials(username, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (results.length > 0) {
      const user = results[0];

      // Compare hashed password with the provided password
      bcrypt.compare(password, user.password, (error, isMatch) => {
        if (error) {
          console.error("Error comparing passwords:", error);
          return res.status(500).json({
            success: false,
            message: "Error validating credentials",
          });
        }

        if (isMatch) {
          res.json({
            success: true,
            message: "Login successful",
          });
        } else {
          res.status(401).json({
            success: false,
            message: "Invalid username or password",
          });
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }
  });
});

// Start the server
const PORT = 5000; // Replace with your actual port number if different
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
