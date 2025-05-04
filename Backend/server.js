const express = require("express");
const cors = require("cors"); 
const bcrypt = require("bcrypt");
const { verifyStaffCredentials, verifyAdminCredentials } = require("./queries");
const db = require("./db"); // MySQL Database Connection
const app = express();
app.use(cors()); // Enable CORS for frontend connection
app.use(express.json()); // Parse JSON requests
const nodemailer = require("nodemailer");
require("dotenv").config(); 
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS ? "Loaded" : "Missing");

const resetTokens = new Map(); // Temp storage for reset token


app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
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
}); // 

// =============================
// 🔹 Admin Login API
// =============================
app.post("/api/loginAdmin", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
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


/////////////////////////////
app.get("/api/appointments", (req, res) => {
  const query = `
    SELECT 
      a.appointment_id, 
      p.name AS patient_name, 
      p.dob, 
      p.phone_number, 
      p.email, 
      u.username AS doctor_name,  -- ✅ Fix: Changed from 'u.name' to 'u.username'
      a.date, 
      a.time, 
      a.status
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    JOIN users u ON a.doctor_id = u.user_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Query Error:", err.sqlMessage);
      return res.status(500).json({ success: false, message: err.sqlMessage });
    }
    res.json({ success: true, data: results });
  });
});
/////////////////////////

// =============================
// 🔹 Create New Appointment
// =============================
app.post("/api/appointments", (req, res) => {
  const { patient_id, doctor_id, date, time } = req.body;

  if (!patient_id || !doctor_id || !date || !time) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Check if the doctor already has an appointment at the given date and time
  const checkQuery = `
    SELECT appointment_id FROM appointments 
    WHERE doctor_id = ? AND date = ? AND time = ?
  `;

  db.query(checkQuery, [doctor_id, date, time], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Doctor is already booked at this time" });
    }

    // Insert new appointment
    const insertQuery = `
      INSERT INTO appointments (patient_id, doctor_id, date, time, status)
      VALUES (?, ?, ?, ?, 'Scheduled')
    `;

    db.query(insertQuery, [patient_id, doctor_id, date, time], (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      return res.json({ success: true, message: "Appointment added successfully", appointment_id: result.insertId });
    });
  });
});


/////////////////////////////////////

// DELETE API Endpoint
app.delete("/api/appointments/:id", (req, res) => {
  const appointmentId = req.params.id;

  const query = "DELETE FROM appointments WHERE appointment_id = ?";
  db.query(query, [appointmentId], (err, result) => {
    if (err) {
      console.error("Error deleting appointment:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, message: "Appointment deleted successfully" });
  });
});


//Edit appointment

app.put("/api/appointments/:id", (req, res) => {
  console.log("PUT /api/appointments/:id route was called");  // Debugging log
  console.log("Params:", req.params);
  console.log("Body:", req.body);

  const appointmentId = req.params.id;
  const { doctor_id, date, time } = req.body;

  if (!doctor_id || !date || !time) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  
  // Check if doctor is already booked
  const checkQuery = `
    SELECT appointment_id FROM appointments 
    WHERE doctor_id = ? AND date = ? AND time = ? AND appointment_id != ?
  `;

  db.query(checkQuery, [doctor_id, date, time, appointmentId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Doctor is already booked at this time" });
    }

    // Update the appointment
    const updateQuery = `
      UPDATE appointments 
      SET doctor_id = ?, date = ?, time = ? 
      WHERE appointment_id = ?
    `;

    db.query(updateQuery, [doctor_id, date, time, appointmentId], (err, result) => {
      if (err) {
        console.error("Error updating appointment:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }

      res.json({ success: true, message: "Appointment updated successfully" });
    });
  });
});

app.get("/api/doctors", (req, res) => {
  const query = "SELECT user_id, username FROM users WHERE role = 'doctor'";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching doctors:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, data: results });
  });
});




/////////////////
// -----------------------------------------------------------------------------------
// Email functionality
app.post("/api/send-email", async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Nodemailer Transporter Setup
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Use 465 for SSL or 587 for TLS
    secure: true, // Use `true` for 465, `false` for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  

  const mailOptions = {
    from: email, // Sender's email
    to: process.env.RECEIVER_EMAIL, // Your email
    subject: `New Help Request from ${firstName} ${lastName}`,
    text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});


// -----------------------------------------------------------------------------------

// =============================
// 🔹 Forgot Password API
// =============================

const crypto = require("crypto");

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  // Check if email exists
  const query = "SELECT user_id FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    const userId = results[0].user_id;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute expiration

    // Store token in database
    const insertQuery = `
    INSERT INTO password_resets (email, token, expires_at) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE token = ?, expires_at = ?`;

db.query(insertQuery, [email, token, expiresAt, token, expiresAt], async (err) => {
  if (err) {
    console.error("Error storing reset token:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }


      // Send password reset email
      const resetLink = `http://localhost:5173/reset-password/${token}`;
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        text: `Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 15 minutes.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Password reset link sent to your email." });
      } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ success: false, message: "Failed to send email" });
      }
    });
  });
});

// -----------------------------------------------------------------------------------


// =============================
// 🔹 Reset Password API
// =============================

app.post("/api/reset-password", async (req, res) => {
  try {
      console.log("Received reset request:", req.body);

      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
          return res.status(400).json({ success: false, message: "Token and new password are required" });
      }

      // Check if token exists in the database
      const query = "SELECT email FROM password_resets WHERE token = ?";
      db.query(query, [token], async (err, results) => {
          if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ success: false, message: "Database error" });
          }

          if (results.length === 0) {
              return res.status(400).json({ success: false, message: "Invalid or expired token" });
          }

          const email = results[0].email;

          // Hash new password before updating the users table
          const bcrypt = require("bcrypt");
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          // Update password in users table
          const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
          db.query(updateQuery, [hashedPassword, email], async (err) => {
              if (err) {
                  console.error("Error updating password:", err);
                  return res.status(500).json({ success: false, message: "Database update error" });
              }

              // Delete token
              db.query("DELETE FROM password_resets WHERE token = ?", [token]);

              return res.json({ success: true, message: "Password has been reset successfully." });
          });
      });
  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ success: false, message: "An error occurred. Try again later." });
  }
});


// -----------------------------------------------------------------------------------

// =============================
// 🔹 Add User API
// =============================

app.post("/api/add-user", async (req, res) => {
  const { username, password, role, phone, email } = req.body;

  if (!username || !password || !role || !phone || !email) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into MySQL database
    const query = "INSERT INTO users (username, password, role, phone, email) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [username, hashedPassword, role, phone, email], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }

      res.json({ success: true, message: "User added successfully!", userId: result.insertId });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// -----------------------------------------------------------------------------------
// =============================
// 🔹 Patient Lookup API (Secure SQL)
// =============================
app.get("/api/patients", (req, res) => {
    const query = req.query.query || "";
  
    if (!query.trim()) {
      return res.status(400).json({ success: false, message: "Search query required" });
    }
  
    const sql = `
      SELECT * FROM patients 
      WHERE 
        LOWER(name) LIKE ? OR 
        CAST(patient_id AS CHAR) LIKE ?
    `;
  
    const value = `${query.toLowerCase()}%`; //  Match only from the start
  
    db.query(sql, [value, value], (err, results) => {
      if (err) {
        console.error("Search error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
  
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

  // 1. Delete medical records
  const deleteMedicalRecords = "DELETE FROM medicalrecords WHERE patient_id = ?";
  db.query(deleteMedicalRecords, [id], (err) => {
    if (err) {
      console.error("Error deleting medical records:", err);
      return res.status(500).json({ error: "Failed to delete medical records" });
    }

    // 2. Delete billing records
    const deleteBilling = "DELETE FROM billing WHERE patient_id = ?";
    db.query(deleteBilling, [id], (err) => {
      if (err) {
        console.error("Error deleting billing records:", err);
        return res.status(500).json({ error: "Failed to delete billing records" });
      }

      // 3. Delete appointments
      const deleteAppointments = "DELETE FROM appointments WHERE patient_id = ?";
      db.query(deleteAppointments, [id], (err) => {
        if (err) {
          console.error("Error deleting appointments:", err);
          return res.status(500).json({ error: "Failed to delete appointments" });
        }

        // 4. Finally, delete patient
        const deletePatient = "DELETE FROM patients WHERE patient_id = ?";
        db.query(deletePatient, [id], (err) => {
          if (err) {
            console.error("Error deleting patient:", err);
            return res.status(500).json({ error: "Failed to delete patient" });
          }

          res.json({ message: "Patient and all related records deleted successfully" });
        });
      });
    });
  });
});



app.get("/api/patients/:id/medical-reports", (req, res) => {
  const patientId = req.params.id;

  const sql = "SELECT * FROM medical_reports WHERE patient_id = ?";
  db.query(sql, [patientId], (err, results) => {
    if (err) {
      console.error("Error fetching medical reports:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: results.length > 0, data: results });
  });
});
const PDFDocument = require("pdfkit");

app.get("/api/reports/:patientId/pdf", (req, res) => {
  const { patientId } = req.params;

  const sql = "SELECT * FROM medicalrecords WHERE patient_id = ?";
  db.query(sql, [patientId], (err, records) => {
    if (err) {
      console.error("Error fetching records:", err);
      return res.status(500).send("Error generating report");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    doc.pipe(res);

    doc.fontSize(20).text(`Medical Report for Patient ID: ${patientId}`, { underline: true });
    doc.moveDown();

    records.forEach((record, index) => {
      doc.fontSize(14).text(`Record #${index + 1}`);
      doc.text(`Doctor ID: ${record.doctor_id}`);
      doc.text(`Diagnosis: ${record.diagnosis}`);
      doc.text(`Treatment: ${record.treatment}`);
      doc.moveDown();
    });

    doc.end();
  });
});


const PORT = 5000; // Backend port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

