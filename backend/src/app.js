const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const workRoutes = require("./routes/workRoutes");
const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server calls and tools that send no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
  })
);

app.get("/api/health", (_, res) => {
  res.json({ success: true, message: "API is healthy", data: null, error: null });
});

app.use("/api/auth", authRoutes);
app.use("/api/work", workRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/enquiry", enquiryRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
