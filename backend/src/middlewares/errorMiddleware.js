const { sendResponse } = require("../utils/apiResponse");

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const error =
    process.env.NODE_ENV === "production"
      ? null
      : {
          stack: err.stack,
          details: err.details || null,
        };

  return sendResponse(res, statusCode, false, message, null, error);
};

module.exports = { notFound, errorHandler };
