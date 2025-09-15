const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "Admin@123"; // choose your admin password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log("Hashed password:", hash);
}

generateHash();
