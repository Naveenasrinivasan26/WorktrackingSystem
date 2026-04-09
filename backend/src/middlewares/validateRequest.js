const { validationResult } = require("express-validator");

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.details = errors.array();
    throw err;
  }
  next();
};

module.exports = validateRequest;
