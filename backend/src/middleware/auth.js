const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // Accept token from either 'Authorization' or 'x-access-token' header
  let token = req.headers["authorization"] || req.headers["x-access-token"];
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  // Remove 'Bearer ' if it exists
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id and role available in req.user
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
}

module.exports = verifyToken;
