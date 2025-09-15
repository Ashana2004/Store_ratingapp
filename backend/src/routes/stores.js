// add to backend/src/routes/stores.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth"); // your existing middleware

// helper middleware: allow store owner (who owns the store) or admin
function checkOwnerOrAdmin(req, res, next) {
  const userId = Number(req.user.id);
  const role = req.user.role;
  const storeId = Number(req.params.storeId);

  if (role === "admin") return next();

  // fetch owner_id for the store
  db.query("SELECT owner_id FROM stores WHERE id = ?", [storeId], (err, results) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    if (!results || results.length === 0) return res.status(404).json({ msg: "Store not found" });

    const ownerId = results[0].owner_id == null ? null : Number(results[0].owner_id);
    if (!ownerId) {
      return res.status(403).json({ msg: "This store has no owner assigned" });
    }
    if (ownerId !== userId) return res.status(403).json({ msg: "Not authorized for this store" });

    next();
  });
}

// GET /api/stores/owner/:storeId/ratings
// returns avg rating and list of users+ratings for the store
router.get("/owner/:storeId/ratings", verifyToken, checkOwnerOrAdmin, (req, res) => {
  const storeId = Number(req.params.storeId);

  const ratingsSql = `
    SELECT r.user_id AS userId, u.username, u.email, r.rating, r.feedback, r.created_at
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE r.store_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(ratingsSql, [storeId], (err, ratings) => {
    if (err) return res.status(500).json({ msg: "DB error", err });

    const avgSql = `SELECT ROUND(AVG(rating),2) AS avgRating, COUNT(*) AS ratingCount FROM ratings WHERE store_id = ?`;
    db.query(avgSql, [storeId], (err2, avgRes) => {
      if (err2) return res.status(500).json({ msg: "DB error", err: err2 });

      const avgRating = avgRes && avgRes[0] && avgRes[0].avgRating !== null ? Number(avgRes[0].avgRating) : 0;
      const ratingCount = avgRes && avgRes[0] ? Number(avgRes[0].ratingCount) : 0;

      res.json({
        storeId,
        avgRating,
        ratingCount,
        ratings
      });
    });
  });
});
// POST /api/stores/:storeId/rate
// normal users can submit or update their rating
router.post("/:storeId/rate", verifyToken, (req, res) => {
  const userId = req.user.id;
  const storeId = Number(req.params.storeId);
  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: "Rating must be between 1 and 5" });
  }

  // check if user already rated
  db.query(
    "SELECT * FROM ratings WHERE store_id = ? AND user_id = ?",
    [storeId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ msg: "DB error", err });

      if (results.length > 0) {
        // update existing rating
        db.query(
          "UPDATE ratings SET rating = ?, feedback = ? WHERE store_id = ? AND user_id = ?",
          [rating, feedback, storeId, userId],
          (err2) => {
            if (err2) return res.status(500).json({ msg: "DB error", err: err2 });
            res.json({ msg: "Rating updated successfully" });
          }
        );
      } else {
        // insert new rating
        db.query(
          "INSERT INTO ratings (store_id, user_id, rating, feedback) VALUES (?, ?, ?, ?)",
          [storeId, userId, rating, feedback],
          (err3) => {
            if (err3) return res.status(500).json({ msg: "DB error", err: err3 });
            res.json({ msg: "Rating submitted successfully" });
          }
        );
      }
    }
  );
});
// GET /api/stores
// returns all stores with avg rating
router.get("/", verifyToken, (req, res) => {
  const sql = `
    SELECT s.id, s.name, s.address, 
       IFNULL(ROUND(AVG(r.rating),1), 0) AS avg_rating
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id;

  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    res.json(results);
  });
});

// GET /api/stores/owner/my-stores
// returns stores owned by current user (owner) with avg rating
router.get("/owner/my-stores", verifyToken, (req, res) => {
  const role = req.user.role;
  const userId = Number(req.user.id);
  if (role !== "owner" && role !== "admin") {
    return res.status(403).json({ msg: "Only store owners or admins can view owner stores" });
  }

  const sql = `
    SELECT s.id, s.name, s.address,
           IFNULL(ROUND(AVG(r.rating),1), 0) AS avg_rating,
           COUNT(r.id) AS rating_count
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE s.owner_id = ?
    GROUP BY s.id
    ORDER BY s.name ASC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    res.json(results);
  });
});

module.exports = router;
