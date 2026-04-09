const express = require("express");
const { getEmployees, getEmployeeReports } = require("../controllers/employeeController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/", getEmployees);
router.get("/:id/reports", getEmployeeReports);

module.exports = router;
