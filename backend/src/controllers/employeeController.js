const User = require("../models/User");
const WorkEntry = require("../models/WorkEntry");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const getEmployees = asyncHandler(async (_req, res) => {
  const employees = await User.find({ role: "user" }).select("-password");
  return sendResponse(res, 200, true, "Employees fetched", employees, null);
});

const getEmployeeReports = asyncHandler(async (req, res) => {
  const reports = await WorkEntry.find({ user: req.params.id }).sort({ submittedAt: -1 });
  return sendResponse(res, 200, true, "Employee reports fetched", reports, null);
});

module.exports = { getEmployees, getEmployeeReports };
