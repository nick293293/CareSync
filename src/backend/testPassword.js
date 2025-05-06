const bcrypt = require("bcrypt");

// Replace this with the password you are testing
const enteredPassword = "edita"; //  Change this if testing a different password

// Replace this with the exact stored hash from MySQL
const storedHash = "$2b$10$GtS48o7SLnmmqTsu4n0rFOSMoswFfgErzMbS4I4rjsmJ7NoX3CAvG"; 

console.log("\n DEBUG INFO:");
console.log("Entered Password:", enteredPassword);
console.log("Stored Hash:", storedHash, "\n");

if (!storedHash || storedHash.length < 10) {
    console.error(" ERROR: Stored password hash is empty or incorrect!");
    process.exit(1);
}

bcrypt.compare(enteredPassword, storedHash, (err, result) => {
    if (err) {
        console.error("ERROR comparing passwords:", err);
    } else {
        console.log("Password comparison result:", result);
        if (result) {
            console.log("Password is correct!");
        } else {
            console.log("Password is incorrect!");
        }
    }
});
