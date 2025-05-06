const bcrypt = require("bcrypt");
const db = require("./db"); // Ensure this points to your database connection

const hashExistingPasswords = async () => {
  try {
    // Fetch all users with their current passwords
    const fetchQuery = "SELECT user_id, password FROM users";
    db.query(fetchQuery, async (err, users) => {
      if (err) {
        console.error("Error fetching users:", err);
        db.end(); // Close connection in case of error
        return;
      }

      // Process each user one by one
      for (const user of users) {
        const { user_id, password } = user;

        try {
          // Check if the password is already hashed
          if (password.startsWith("$2b$") || password.startsWith("$2a$")) {
            console.log(`Password for user ID ${user_id} is already hashed. Skipping...`);
            continue; // Skip rehashing
          }

          // Hash the current password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Update the password in the database
          const updateQuery = "UPDATE users SET password = ? WHERE user_id = ?";
          await new Promise((resolve, reject) => {
            db.query(updateQuery, [hashedPassword, user_id], (err) => {
              if (err) {
                console.error(`Error updating password for user ID ${user_id}:`, err);
                reject(err);
              } else {
                console.log(`Password updated successfully for user ID ${user_id}`);
                resolve();
              }
            });
          });
        } catch (error) {
          console.error(`Error hashing or updating password for user ID ${user_id}:`, error);
        }
      }

      console.log("All passwords updated successfully!");
      db.end(); // Close connection after all operations are done
    });
  } catch (error) {
    console.error("Error hashing passwords:", error);
    db.end(); // Close connection in case of error
  }
};

// Run the script
hashExistingPasswords();
