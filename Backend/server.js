const express = require("express");
const cors = require("cors"); 
const bcrypt = require("bcrypt");
const db = require("./db"); // MySQL Database Connection
const { verifyStaffCredentials, verifyAdminCredentials } = require("./queries");

const app = express();
app.use(cors()); // Enable CORS for frontend connection
app.use(express.json()); // Parse JSON requests

// =============================
// 🔹 Staff Login API
// =============================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  verifyStaffCredentials(username, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      const user = results[0];

      bcrypt.compare(password, user.password, (error, isMatch) => {
        console.log("🔍 Password comparison result:", isMatch);

        if (error) {
          console.error("❌ Error comparing passwords:", error);
          return res.status(500).json({ success: false, message: "Error validating credentials" });
        }

        if (isMatch) {
          console.log("✅ Login successful!");
          res.json({ success: true, message: "Login successful" });
        } else {
          console.log("❌ Invalid password");
          res.status(401).json({ success: false, message: "Invalid username or password" });
        }
      });
    } else {
      console.log("❌ User not found");
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  });
}); // 

// =============================
// 🔹 Admin Login API
// =============================
app.post("/api/loginAdmin", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  verifyAdminCredentials(username, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      const user = results[0];

      bcrypt.compare(password, user.password, (error, isMatch) => {
        if (error) {
          console.error("Error comparing passwords:", error);
          return res.status(500).json({ success: false, message: "Error validating credentials" });
        }

        if (isMatch) {
          res.json({ success: true, message: "Login successful" });
        } else {
          res.status(401).json({ success: false, message: "Invalid username or password" });
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  });
});

// =============================
// 🔹 API: Fetch Today's Appointments
// =============================
app.get("/api/todays-appointments", (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  const query = "SELECT * FROM appointments WHERE date = ?";
  db.query(query, [today], (err, results) => {
    if (err) {
      console.error("Error fetching appointments:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, data: results });
  });
});

// =============================
// 🔹 Patient Lookup API (Secure SQL)
// =============================
app.get("/api/patients", (req, res) => {
  const query = req.query.query || "";

  if (!query.trim()) {
    return res.status(400).json({ success: false, message: "Search query required" });
  }

  const sql = "SELECT * FROM patients WHERE LOWER(name) LIKE LOWER(?) OR patient_id = ?";
  db.query(sql, [`%${query}%`, isNaN(query) ? 0 : parseInt(query)], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: results.length > 0, data: results });
  });
});
// Add patients
app.post("/api/patients", (req, res) => {
  const { name, dob, address, phone_number, email } = req.body;

  if (!name || !dob) {
    return res.status(400).json({ success: false, message: "Name and DOB are required" });
  }

  const sql = "INSERT INTO patients (name, dob, address, phone_number, email) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, dob, address, phone_number, email], (err, result) => {
    if (err) {
      console.error("❌ Error adding patient:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, message: "Patient added successfully", data: { id: result.insertId, name, dob, address, phone_number, email } });
  });
});

//Remove Patients
app.delete("/api/patients/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM patients WHERE patient_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(" Error deleting patient:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, message: "Patient removed successfully" });
  });
});



app.get("/api/patients/:id/medical-reports", (req, res) => {
  const patientId = req.params.id;

  const sql = "SELECT * FROM medical_reports WHERE patient_id = ?";
  db.query(sql, [patientId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching medical reports:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: results.length > 0, data: results });
  });
});


// =============================
// 🔹 Authorize Doctor Middleware
// =============================
/*const authorizeDoctor = (req, res, next) => {
  const username = req.headers["x-username"];

  if (!username) {
    return res.status(400).json({ success: false, message: "Username is required in headers" });
  }

  const sql = "SELECT role FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0 || results[0].role !== "Doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized: Only doctors can modify medical reports" });
    }

    next(); // ✅ Ensure this is the last line in the function
  });
}; */

/*// =============================
// 🔹 Get Medical Reports
// =============================
app.get("/api/patients/:id/medical-reports", (req, res) => {
  const patientId = req.params.id;

  const sql = "SELECT report_id, title, details, report_date FROM medical_reports WHERE patient_id = ?";
  db.query(sql, [patientId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    res.json({ success: results.length > 0, data: results });
  });
});

// =============================
// 🔹 Add Medical Report (Only Doctors)
// =============================
app.post("/api/patients/:id/medical-reports", authorizeDoctor, (req, res) => {
  const { id } = req.params;
  const { title, details, report_date } = req.body;

  if (!title || !details || !report_date || isNaN(Date.parse(report_date))) {
    return res.status(400).json({ success: false, message: "Invalid or missing medical report details" });
  }

  const sql = "INSERT INTO medical_reports (patient_id, title, details, report_date) VALUES (?, ?, ?, ?)";
  db.query(sql, [id, title, details, report_date], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    res.json({ success: true, message: "Medical report added successfully" });
  });
});
*/
// =============================
// 🔹 Start Server
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
