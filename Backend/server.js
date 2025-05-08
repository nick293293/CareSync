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
//  API: Fetch Today's Appointments
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
      u.username AS doctor_name, 
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
//  Create New Appointment
// =============================
app.post("/api/appointments", (req, res) => {
  const { patient_id, doctor_id, date, time } = req.body;

  if (!patient_id || !doctor_id || !date || !time) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  function isWeekday(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }

  function isWithinWorkingHours(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 480 && totalMinutes <= 1020;
  }

  if (!isWeekday(date)) {
    return res.status(400).json({ success: false, message: "Appointments must be scheduled Monday to Friday." });
  }

  if (!isWithinWorkingHours(time)) {
    return res.status(400).json({ success: false, message: "Appointments must be between 8:00 AM and 5:00 PM." });
  }

  const checkQuery = `
    SELECT appointment_id FROM appointments 
    WHERE doctor_id = ? 
      AND date = ? 
      AND (
        TIME_TO_SEC(time) BETWEEN TIME_TO_SEC(?) - 1800 AND TIME_TO_SEC(?) + 1800
      )
  `;

  db.query(checkQuery, [doctor_id, date, time, time], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "An unexpected error occurred while making an appointment." });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Doctor already has another appointment around this time." });
    }

    const insertQuery = `
      INSERT INTO appointments (patient_id, doctor_id, date, time, status)
      VALUES (?, ?, ?, ?, 'Scheduled')
    `;

    db.query(insertQuery, [patient_id, doctor_id, date, time], (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ success: false, message: "An unexpected error occurred while making an appointment." });
      }

      return res.json({ success: true, message: "Appointment added successfully.", appointment_id: result.insertId });
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
  console.log("PUT /api/appointments/:id route was called");
  const appointmentId = req.params.id;
  const { doctor_id, date, time } = req.body;

  if (!doctor_id || !date || !time) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  function isWeekday(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }

  function isWithinWorkingHours(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 480 && totalMinutes <= 1020;
  }

  if (!isWeekday(date)) {
    return res.status(400).json({ success: false, message: "Appointments must be scheduled Monday to Friday." });
  }

  if (!isWithinWorkingHours(time)) {
    return res.status(400).json({ success: false, message: "Appointments must be between 8:00 AM and 5:00 PM." });
  }

  const checkQuery = `
    SELECT appointment_id FROM appointments 
    WHERE doctor_id = ? 
      AND date = ? 
      AND appointment_id != ? 
      AND (
        TIME_TO_SEC(time) BETWEEN TIME_TO_SEC(?) - 1800 AND TIME_TO_SEC(?) + 1800
      )
  `;

  db.query(checkQuery, [doctor_id, date, appointmentId, time, time], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Failed to update appointment." });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Doctor already has another appointment around this time." });
    }

    const updateQuery = `
      UPDATE appointments 
      SET doctor_id = ?, date = ?, time = ? 
      WHERE appointment_id = ?
    `;

    db.query(updateQuery, [doctor_id, date, time, appointmentId], (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ success: false, message: "Failed to update appointment." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Appointment not found." });
      }

      res.json({ success: true, message: "Appointment updated successfully." });
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

app.get("/api/getPatient/:id", (req, res) => {
  const patientId = req.params.id;
  const query = "Select * from patients where patient_id = ?";

  db.query(query, [patientId], (err, results) => {
    if(err) {
      console.error("Database error: ", err);
      return res.status(500).json({success: false, message: "Database error"});
    }
    if(results.length === 0) {
      return res.status(404).json({success: false, message: "Patient not found"});
    }
    res.json({success: true, data: results[0] })
  })
})
// =============================
//  Forgot Password API
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
//  Reset Password API
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
//  Add User API
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

//  Get All User Data API
// =============================

app.get('/api/users', (req, res) => {
  db.query('SELECT user_id, username, email, role FROM users', (err, results) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).json({ message: 'Error fetching users' });
    }

    res.json(results);
  });
});

// -----------------------------------------------------------------------------------

// =============================
// Delete User API
// =============================

app.delete('/api/delete-user/:id', (req, res) => {
  const userId = req.params.id;

  db.query('SELECT role FROM users WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      console.error("Error checking role:", err);
      return res.status(500).json({ message: 'Error checking user' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (result[0].role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin account' });
    }

    db.query('DELETE FROM users WHERE user_id = ?', [userId], (err) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: 'Error deleting user' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  });
});

// -----------------------------------------------------------------------------------

// =============================
//  Get Single User API
// =============================
app.get("/api/getUser/:id", (req, res) => {
  const userId = req.params.id;

  const query = "SELECT user_id, username, email, phone, role FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching user:", err);
      return res.status(500).json({ message: "Error fetching user" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, data: results[0] });
  });
});

// -----------------------------------------------------------------------------------

// =============================
//  Update User API
// =============================
app.put("/api/update-user/:id", (req, res) => {
  const userId = req.params.id;
  const { username, email, phone, role } = req.body;

  const query = "UPDATE users SET username = ?, email = ?, phone = ?, role = ? WHERE user_id = ?";
  db.query(query, [username, email, phone, role, userId], (err) => {
    if (err) {
      console.error("❌ Error updating user:", err);
      return res.status(500).json({ message: "Error updating user" });
    }

    res.json({ success: true, message: "User updated successfully!" });
  });
});

// =============================
//  Patient Lookup API (Secure SQL)
// =============================
app.get("/api/patients", (req, res) => {
  const query = req.query.query || "";

  let sql, values;

  if (!query.trim()) {
    sql = "SELECT * FROM patients"; // fetch all
    values = [];
  } else {
    sql = `
      SELECT * FROM patients 
      WHERE 
        LOWER(name) LIKE ? OR 
        CAST(patient_id AS CHAR) LIKE ?
    `;
    const value = `${query.toLowerCase()}%`;
    values = [value, value];
  }

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Search error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, data: results });
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

    if (records.length === 0) {
      doc.fontSize(16).text("No medical records found for this patient.");
      doc.end();
      return;
    }
  
    doc.fontSize(20).text(`Medical Report for Patient ID: ${patientId}`, { underline: true });
    doc.moveDown();

    records.forEach((record, index) => {
      doc.fontSize(14).text(`Record #${index + 1}`);
      doc.text(`Doctor ID: ${record.doctor_id}`);
      doc.text(`Diagnosis: ${record.diagnosis}`);
      doc.text(`Treatment: ${record.treatment}`);
      doc.moveDown();
    
      doc.text("Medications:");
      doc.text("• Albuterol (2 puffs every 4 hours)");
      doc.text("• Lisinopril (10mg daily)");
      doc.text("• Metformin (500mg twice daily)");
      doc.text("• Simvastatin (20mg at bedtime)");
      doc.text("• Omeprazole (40mg before breakfast)");
      doc.text("• Ibuprofen (400mg as needed)");
      doc.moveDown();
    
      doc.text("Vitals:");
      doc.text("• Blood Pressure: 130/85 mmHg");
      doc.text("• Heart Rate: 78 bpm");
      doc.text("• Temperature: 98.7°F");
      doc.text("• Oxygen Saturation: 97%");
      doc.text("• Respiratory Rate: 18 breaths/min");
      doc.text("• Weight: 180 lbs");
      doc.text("• Height: 5'11\"");
      doc.moveDown();
    
      doc.text("Lab Results:");
      for (let i = 1; i <= 10; i++) {
        doc.text(`• Lab Panel ${i}: All results within expected range.`);
      }
      doc.moveDown();
    
      doc.text("Lifestyle Notes:");
      doc.text("Patient advised to maintain a low-sodium, low-carb diet. Engage in 30 minutes of aerobic activity daily. Limit alcohol intake. Avoid tobacco. Maintain a sleep schedule. Practice mindfulness or stress reduction exercises.");
      doc.moveDown();
    
      doc.text("Doctor Notes:");
      doc.text("Patient presents with signs of improving hypertension. Recommend continued monitoring. No signs of infection or abnormal pathology noted during physical examination. Advised on vaccine updates and medication adherence.");
      doc.moveDown();
    
      doc.text("Additional Observations:");
      for (let i = 0; i < 10; i++) {
        doc.text(`• Observation ${i + 1}: No adverse symptoms reported.`);
      }
      doc.moveDown();
    
      doc.text("Follow-up:");
      doc.text("Patient scheduled for follow-up in 2 weeks. Routine labs to be performed 2 days prior to visit. Monitor symptoms and contact clinic if conditions worsen.");
      doc.addPage(); // Force new page for each record
    });
    
    

    doc.end();
  });
});

const PORT = 5000; // Backend port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


