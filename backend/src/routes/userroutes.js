const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");

// test route
router.get("/test", (req, res) => {
  res.send("User routes are working!");
});

// protected route
router.get("/protected", verifyToken, (req, res) => {
  res.json({ msg: "Access granted", user: req.user });
});

// login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter email and password" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    if (result.length === 0) return res.status(400).json({ msg: "User not found" });

    const user = result[0];

    // Role is determined by database, not login request

    try {
      // For testing: accept both plain text and hashed passwords
      const isMatch = password === user.password || await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        msg: `Login successful as ${user.role}`,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (e) {
      return res.status(500).json({ msg: "Server error", e });
    }
  });
});

// protected route for fetching own ratings
router.get("/myratings", verifyToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM ratings WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    res.json(results);
  });
});
// register route
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ msg: "Please enter all fields including role" });
  }

  if (!["normal", "owner", "admin"].includes(role)) {
    return res.status(400).json({ msg: "Invalid role" });
  }

  try {
    // check if user already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error", err });

      if (result.length > 0) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // insert into DB
      db.query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, role],
        (err, result) => {
          if (err) return res.status(500).json({ msg: "DB error", err });

          return res.status(201).json({ msg: "User registered successfully" });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error });
  }
});

// change password (protected)
router.put("/change-password", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: "currentPassword and newPassword are required" });
  }

  try {
    db.query("SELECT id, password FROM users WHERE id = ?", [userId], async (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error", err });
      if (!result || result.length === 0) return res.status(404).json({ msg: "User not found" });

      const user = result[0];
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect" });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);

      db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId], (updErr) => {
        if (updErr) return res.status(500).json({ msg: "DB error", err: updErr });
        return res.json({ msg: "Password updated successfully" });
      });
    });
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error });
  }
});

module.exports = router;
