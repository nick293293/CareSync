const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "hospital-db.c7y0a4ywyv12.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "levonkaren$$$",
    database: "hospital_db",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to the database!");
    }
});

module.exports = db;
