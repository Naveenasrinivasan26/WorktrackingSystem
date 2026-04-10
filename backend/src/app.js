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

// ✅ FIXED CORS (Render + Vercel)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://worktracking-system.vercel.app",
    ],
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

// Root route
app.get("/", (_, res) => {
  res.send("Worktracking API running");
});

// Health check
app.get("/api/health", (_, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    data: null,
    error: null,
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/work", workRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/enquiry", enquiryRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;