const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    const err = new Error("Unauthorized: token missing");
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      const err = new Error("Unauthorized: user not available");
      err.statusCode = 401;
      throw err;
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new Error("Unauthorized: invalid or expired token");
    err.statusCode = 401;
    throw err;
  }
});

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const err = new Error("Forbidden: insufficient permissions");
    err.statusCode = 403;
    throw err;
  }

  next();
};

module.exports = { protect, authorize };
