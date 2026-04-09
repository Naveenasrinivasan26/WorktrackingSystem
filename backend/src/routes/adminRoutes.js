const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
  getReports,
  filterReports,
  getEnquiries,
  updateEnquiryStatus,
  updateReportApproval,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/dashboard/stats", getDashboardStats);
router.get("/reports", getReports);
router.get("/reports/filter", filterReports);
router.put("/reports/:id/approval", updateReportApproval);

router.get("/enquiries", getEnquiries);
router.put("/enquiries/:id/status", updateEnquiryStatus);

module.exports = router;
