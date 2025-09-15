const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// CREATE a new store (only for logged-in user)
router.post("/", verifyToken, (req, res) => {
  const { name, address } = req.body;
  const ownerId = req.user.id; // comes from verifyToken

  const query = "INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)";
  db.query(query, [name, address, ownerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: "Server error" });
    }

    res.json({ msg: "Store created successfully", storeId: result.insertId });
  });
});


module.exports = router;
