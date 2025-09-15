const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// middleware to allow only admins
function onlyAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }
  next();
}

// Example test route
router.get("/test", verifyToken, onlyAdmin, (req, res) => {
  res.json({ msg: "Admin routes working!" });
});

// GET /api/admin/dashboard-summary
router.get("/dashboard-summary", verifyToken, (req, res) => {
  // Only admin can access
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  // Query to get total users
  const totalUsersQuery = "SELECT COUNT(*) AS totalUsers FROM users";
  // Query to get total stores
  const totalStoresQuery = "SELECT COUNT(*) AS totalStores FROM stores";
  // Query to get total ratings
  const totalRatingsQuery = "SELECT COUNT(*) AS totalRatings FROM ratings";

  db.query(totalUsersQuery, (err1, usersResult) => {
    if (err1) return res.status(500).json({ msg: "DB error", err: err1 });

    db.query(totalStoresQuery, (err2, storesResult) => {
      if (err2) return res.status(500).json({ msg: "DB error", err: err2 });

      db.query(totalRatingsQuery, (err3, ratingsResult) => {
        if (err3) return res.status(500).json({ msg: "DB error", err: err3 });

        res.json({
          msg: "Admin dashboard data",
          data: {
            totalUsers: usersResult[0].totalUsers,
            totalStores: storesResult[0].totalStores,
            totalRatings: ratingsResult[0].totalRatings,
          },
        });
      });
    });
  });
});
// GET /api/admin/users
// GET /api/admin/users  (filterable, paginated, admin-only)
router.get("/users", verifyToken, (req, res) => {
  // only admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  // query params
  const username = req.query.username; // filter by username (partial)
  const email = req.query.email;       // filter by email (partial)
  const address = req.query.address;   // filter by address (partial)
  let sortBy = req.query.sortBy || "created_at";
  let order = (req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200); // 1..200
  const offset = (page - 1) * limit;

  // whitelist sortable columns to avoid SQL injection
  const allowedSort = ["username", "email", "address", "created_at"];
  if (!allowedSort.includes(sortBy)) sortBy = "created_at";


  // Build SELECT SQL (only normal users)
  let sql = `
    SELECT u.id, u.username, u.email, u.address, u.role, u.created_at,
           IFNULL(ROUND(AVG(r.rating),1), 0) AS avg_rating
    FROM users u
    LEFT JOIN ratings r ON u.id = r.user_id
    WHERE u.role = 'normal'
  `;
  const params = [];

  if (username) {
    sql += " AND u.username LIKE ?";
    params.push(`%${username}%`);
  }
  if (email) {
    sql += " AND u.email LIKE ?";
    params.push(`%${email}%`);
  }
  if (address) {
    sql += " AND u.address LIKE ?";
    params.push(`%${address}%`);
  }

  sql += ` GROUP BY u.id, u.username, u.email, u.address, u.role, u.created_at ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("DB error /admin/users (select):", err);
      return res.status(500).json({ msg: "DB error", err });
    }

    // Count total for pagination
    let countSql = "SELECT COUNT(*) AS total FROM users WHERE role = 'normal'";
    const countParams = [];
    if (username) {
      countSql += " AND username LIKE ?";
      countParams.push(`%${username}%`);
    }
    if (email) {
      countSql += " AND email LIKE ?";
      countParams.push(`%${email}%`);
    }
    if (address) {
      countSql += " AND address LIKE ?";
      countParams.push(`%${address}%`);
    }

    db.query(countSql, countParams, (err2, countRes) => {
      if (err2) {
        console.error("DB error /admin/users (count):", err2);
        return res.status(500).json({ msg: "DB error", err: err2 });
      }

      const total = (countRes && countRes[0] && countRes[0].total) || 0;
      res.json({
        msg: "List of normal users",
        page,
        limit,
        total,
        users: results
      });
    });
  });
});
// GET /api/admin/admin-users (filterable, paginated, admin-only)
router.get("/admin-users", verifyToken, (req, res) => {
  // only admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  const username = req.query.username;
  const email = req.query.email;
  const address = req.query.address;
  let sortBy = req.query.sortBy || "created_at";
  let order = (req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
  const offset = (page - 1) * limit;

  const allowedSort = ["username", "email", "address", "created_at"];
  if (!allowedSort.includes(sortBy)) sortBy = "created_at";


  let sql = `
    SELECT u.id, u.username, u.email, u.address, u.role, u.created_at,
           IFNULL(ROUND(AVG(r.rating),1), 0) AS avg_rating
    FROM users u
    LEFT JOIN ratings r ON u.id = r.user_id
    WHERE u.role IN ('admin', 'owner')
  `;
  const params = [];

  if (username) {
    sql += " AND u.username LIKE ?";
    params.push(`%${username}%`);
  }
  if (email) {
    sql += " AND u.email LIKE ?";
    params.push(`%${email}%`);
  }
  if (address) {
    sql += " AND u.address LIKE ?";
    params.push(`%${address}%`);
  }

  sql += ` GROUP BY u.id, u.username, u.email, u.address, u.role, u.created_at ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("DB error /admin/admin-users (select):", err);
      return res.status(500).json({ msg: "DB error", err });
    }

    // Count total
    let countSql = "SELECT COUNT(*) AS total FROM users WHERE role IN ('admin', 'owner')";
    const countParams = [];
    if (username) {
      countSql += " AND username LIKE ?";
      countParams.push(`%${username}%`);
    }
    if (email) {
      countSql += " AND email LIKE ?";
      countParams.push(`%${email}%`);
    }
    if (address) {
      countSql += " AND address LIKE ?";
      countParams.push(`%${address}%`);
    }

    db.query(countSql, countParams, (err2, countRes) => {
      if (err2) {
        console.error("DB error /admin/admin-users (count):", err2);
        return res.status(500).json({ msg: "DB error", err: err2 });
      }

      const total = (countRes && countRes[0] && countRes[0].total) || 0;
      res.json({
        msg: "List of admin users",
        page,
        limit,
        total,
        adminUsers: results
      });
    });
  });
});

// GET /api/admin/stores
// GET /api/admin/stores  (filterable, paginated, admin-only)
router.get("/stores", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  // Query params
  const name = req.query.name;         // filter by store name (partial)
  const address = req.query.address;   // filter by address (partial)
  const owner = req.query.owner;       // filter by owner username (partial)
  let sortBy = req.query.sortBy || "created_at";
  let order = (req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200); 
  const offset = (page - 1) * limit;

  // Whitelist sortable columns to avoid SQL injection
  const allowedSort = ["name", "address", "created_at"];
  if (!allowedSort.includes(sortBy)) sortBy = "created_at";

  // Base SQL with join to users
  let sql = `
    SELECT s.id, s.name, s.address, s.created_at,
           u.username AS ownerName, u.email AS ownerEmail,
           IFNULL(ROUND(AVG(r.rating),1), 0) AS avg_rating
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
    GROUP BY s.id, s.name, s.address, s.created_at, u.username, u.email
  `;
  const params = [];

  if (name) {
    sql += " AND s.name LIKE ?";
    params.push(`%${name}%`);
  }
  if (address) {
    sql += " AND s.address LIKE ?";
    params.push(`%${address}%`);
  }
  if (owner) {
    sql += " AND u.username LIKE ?";
    params.push(`%${owner}%`);
  }

  sql += ` ORDER BY s.${sortBy} ${order} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("DB error /admin/stores (select):", err);
      return res.status(500).json({ msg: "DB error", err });
    }

  // Count query for pagination
  let countSql = `
    SELECT COUNT(DISTINCT s.id) AS total
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `;
    const countParams = [];
    if (name) {
      countSql += " AND s.name LIKE ?";
      countParams.push(`%${name}%`);
    }
    if (address) {
      countSql += " AND s.address LIKE ?";
      countParams.push(`%${address}%`);
    }
    if (owner) {
      countSql += " AND u.username LIKE ?";
      countParams.push(`%${owner}%`);
    }

    db.query(countSql, countParams, (err2, countRes) => {
      if (err2) {
        console.error("DB error /admin/stores (count):", err2);
        return res.status(500).json({ msg: "DB error", err: err2 });
      }

      const total = (countRes && countRes[0] && countRes[0].total) || 0;

      res.json({
        msg: "List of all stores",
        page,
        limit,
        total,
        stores: results
      });
    });
  });
});

// GET /api/admin/ratings
router.get("/ratings", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  const sql = `
    SELECT r.id, r.rating, r.feedback, r.created_at,
           u.username AS userName, u.email AS userEmail,
           s.name AS storeName
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    JOIN stores s ON r.store_id = s.id
    ORDER BY r.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    res.json({
      msg: "List of all ratings",
      ratings: results
    });
  });
});
// POST /api/admin/add-user
router.post("/add-user", verifyToken, (req, res) => {
  // admin only
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  const { username, email, address, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ msg: "username, email and password are required" });
  }

  // username length (spec)
  if (username.length < 20 || username.length > 60) {
    return res.status(400).json({ msg: "Username must be between 20 and 60 characters" });
  }

  // address length
  if (address && address.length > 400) {
    return res.status(400).json({ msg: "Address must be at most 400 characters" });
  }

  // password rules: 8-16 chars, at least one uppercase and one special char
  const pwdRegex = /^(?=.{8,16}$)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/;
  if (!pwdRegex.test(password)) {
    return res.status(400).json({ msg: "Password must be 8-16 chars with at least one uppercase letter and one special character" });
  }

  // email basic check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  // Check duplicate email
  db.query("SELECT id FROM users WHERE email = ?", [email], (err, existing) => {
    if (err) {
      console.error("DB error checking existing user:", err);
      return res.status(500).json({ msg: "DB error", err });
    }
    if (existing.length > 0) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    // Hash password and insert
    const bcrypt = require("bcryptjs");
    bcrypt.genSalt(10, (saltErr, salt) => {
      if (saltErr) {
        console.error("bcrypt salt error:", saltErr);
        return res.status(500).json({ msg: "Server error", err: saltErr });
      }
      bcrypt.hash(password, salt, (hashErr, hashed) => {
        if (hashErr) {
          console.error("bcrypt hash error:", hashErr);
          return res.status(500).json({ msg: "Server error", err: hashErr });
        }

        const insertSql = "INSERT INTO users (username, email, password, address, role) VALUES (?, ?, ?, ?, 'normal')";
        db.query(insertSql, [username, email, hashed, address || null], (insErr, result) => {
          if (insErr) {
            console.error("DB error inserting user:", insErr);
            return res.status(500).json({ msg: "DB error", err: insErr });
          }
          return res.status(201).json({ msg: "User added successfully", userId: result.insertId });
        });
      });
    });
  });
});
// POST /api/admin/add-admin-user
router.post("/add-admin-user", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  const { username, email, address, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: "username, email and password are required" });
  }

  if (username.length < 20 || username.length > 60) {
    return res.status(400).json({ msg: "Username must be between 20 and 60 characters" });
  }

  if (address && address.length > 400) {
    return res.status(400).json({ msg: "Address must be at most 400 characters" });
  }

  const pwdRegex = /^(?=.{8,16}$)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/;
  if (!pwdRegex.test(password)) {
    return res.status(400).json({ msg: "Password must be 8-16 chars with at least one uppercase letter and one special character" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, existing) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    if (existing.length > 0) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const bcrypt = require("bcryptjs");
    bcrypt.genSalt(10, (saltErr, salt) => {
      if (saltErr) return res.status(500).json({ msg: "Server error", err: saltErr });
      bcrypt.hash(password, salt, (hashErr, hashed) => {
        if (hashErr) return res.status(500).json({ msg: "Server error", err: hashErr });

        const insertSql = "INSERT INTO users (username, email, password, address, role) VALUES (?, ?, ?, ?, 'admin')";
        db.query(insertSql, [username, email, hashed, address || null], (insErr, result) => {
          if (insErr) return res.status(500).json({ msg: "DB error", err: insErr });
          return res.status(201).json({ msg: "Admin user added successfully", userId: result.insertId });
        });
      });
    });
  });
});

// POST /api/adminroutes/add-store-owner
router.post("/add-store-owner", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  const { username, email, address, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: "username, email and password are required" });
  }

  if (username.length < 20 || username.length > 60) {
    return res.status(400).json({ msg: "Username must be between 20 and 60 characters" });
  }

  if (address && address.length > 400) {
    return res.status(400).json({ msg: "Address must be at most 400 characters" });
  }

  const pwdRegex = /^(?=.{8,16}$)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/;
  if (!pwdRegex.test(password)) {
    return res.status(400).json({ msg: "Password must be 8-16 chars with at least one uppercase letter and one special character" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, existing) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    if (existing.length > 0) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const bcrypt = require("bcryptjs");
    bcrypt.genSalt(10, (saltErr, salt) => {
      if (saltErr) return res.status(500).json({ msg: "Server error", err: saltErr });
      bcrypt.hash(password, salt, (hashErr, hashed) => {
        if (hashErr) return res.status(500).json({ msg: "Server error", err: hashErr });

        const insertSql = "INSERT INTO users (username, email, password, address, role) VALUES (?, ?, ?, ?, 'owner')";
        db.query(insertSql, [username, email, hashed, address || null], (insErr, result) => {
          if (insErr) return res.status(500).json({ msg: "DB error", err: insErr });
          return res.status(201).json({ msg: "Store owner created successfully", userId: result.insertId });
        });
      });
    });
  });
});

// POST /api/adminroutes/addStore
router.post('/addStore', verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  const { name, address, ownerId } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: 'Name and address are required' });
  }

  const sql = 'INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)';

  db.query(sql, [name, address, ownerId || null], (err, result) => {
    if (err) {
      console.error('Error creating store:', err);
      return res.status(500).json({ message: 'Error creating store', error: err.message });
    }

    res.status(201).json({ 
      message: 'Store created successfully', 
      store: { id: result.insertId, name, address, owner_id: ownerId || null }
    });
  });
});

// PUT /api/adminroutes/assign-store-owner
router.put('/assign-store-owner', verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied, admin only" });
  }

  const { storeId, ownerId } = req.body;

  if (!storeId || !ownerId) {
    return res.status(400).json({ msg: "Store ID and Owner ID are required" });
  }

  // Check if owner exists and has owner role
  db.query("SELECT id, role FROM users WHERE id = ? AND role = 'owner'", [ownerId], (err, owner) => {
    if (err) return res.status(500).json({ msg: "DB error", err });
    if (owner.length === 0) return res.status(400).json({ msg: "Owner not found or not a store owner" });

    // Update store owner
    db.query("UPDATE stores SET owner_id = ? WHERE id = ?", [ownerId, storeId], (err2, result) => {
      if (err2) return res.status(500).json({ msg: "DB error", err: err2 });
      if (result.affectedRows === 0) return res.status(404).json({ msg: "Store not found" });
      
      res.json({ msg: "Store owner assigned successfully" });
    });
  });
});


module.exports = router;
