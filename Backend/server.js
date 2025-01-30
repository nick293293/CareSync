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
----------------------------------------------------------------
//  API to match patients by ID
app.get("/api/patient/:id", (req, res) => {
  const patient_id = req.params.id;

  getPatientById(patient_id, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      res.json({ success: true, patients: results[0] });
    } else {
      res.status(404).json({ success: false, message: "Patient not found" });
    }
  });
});

// --------------------------------------
//  API to Generate a PDF Patient Report
app.get("/api/patient/:id/report", (req, res) => {
  const patientId = req.params.id;

  getPatientById(patient_id, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const patient = results[0];

    // Create a new PDF document
    const doc = new PDFDocument();
    const filename = `patients_${patients.patient_id}_report.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text("Patient Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Patient ID: ${patient.patient_id}`);
    doc.text(`Name: ${patient.name}`);
    doc.text(`Date of Birth: ${patient.dob}`);
    doc.text(`Address: ${patient.address}`);
    doc.text(`Phone Number: ${patient.phone_number}`);
    doc.text(`Email: ${patient.email}`);

    doc.end();
  });
});

// Start the server
const PORT = 5000; // Replace with your actual port number if different
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
