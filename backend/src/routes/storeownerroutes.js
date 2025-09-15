const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth"); // to verify owner

// GET all ratings for logged-in owner's store
router.get("/ratings", verifyToken, (req, res) => {
  const ownerId = req.user.id; // comes from JWT token

  // First, get the store id for this owner
  db.query(
    "SELECT id, name FROM stores WHERE owner_id = ?",
    [ownerId],
    (err, storeResult) => {
      if (err) return res.status(500).json({ msg: "DB error", err });
      if (storeResult.length === 0)
        return res.status(404).json({ msg: "No store found for this owner" });

      const storeId = storeResult[0].id;

      // Then, get all ratings for this store
      const ratingsQuery = `
        SELECT u.username, u.email, r.rating, r.feedback
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = ?
      `;

      db.query(ratingsQuery, [storeId], (err, ratingsResult) => {
        if (err) return res.status(500).json({ msg: "DB error", err });

        // Optionally, calculate average rating
        const avgRatingQuery = "SELECT AVG(rating) AS avgRating FROM ratings WHERE store_id = ?";
        db.query(avgRatingQuery, [storeId], (err, avgResult) => {
          if (err) return res.status(500).json({ msg: "DB error", err });

          res.json({
            msg: "Store owner dashboard data",
            store: storeResult[0],
            ratings: ratingsResult,
            avgRating: avgResult[0].avgRating,
          });
        });
      });
    }
  );
});
// GET /api/store-owner/ratings
router.get("/ratings", verifyToken, (req, res) => {
  const ownerId = req.user.id;

  // Get the store owned by this owner
  db.query(
    "SELECT id, name FROM stores WHERE owner_id = ?",
    [ownerId],
    (err, stores) => {
      if (err) return res.status(500).json({ msg: "DB error", err });
      if (stores.length === 0)
        return res.status(404).json({ msg: "No store found for this owner" });

      const storeId = stores[0].id;

      // Get all ratings for this store
      db.query(
        "SELECT u.username, r.rating, r.feedback FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = ?",
        [storeId],
        (err, ratings) => {
          if (err) return res.status(500).json({ msg: "DB error", err });
          res.json({ store: stores[0], ratings });
        }
      );
    }
  );
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

module.exports = router;
