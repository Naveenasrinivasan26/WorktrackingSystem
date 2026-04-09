const { stringify } = require("csv-stringify/sync");
const User = require("../models/User");
const WorkEntry = require("../models/WorkEntry");
const Enquiry = require("../models/Enquiry");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { sendEmail } = require("../services/emailService");

const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
  return sendResponse(res, 200, true, "Users fetched", users, null);
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, position, phone, location } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("User already exists with this email");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "user",
    position,
    phone,
    location,
  });

  await sendEmail({
    to: user.email,
    subject: "Your WorkTrack account credentials",
    html: `<p>Your account has been created.</p><p>Email: ${user.email}</p><p>Password: ${password}</p>`,
  });

  return sendResponse(res, 201, true, "Employee created", { ...user.toObject(), password: undefined }, null);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const { name, email, role, position, phone, location, isActive, password } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (position !== undefined) user.position = position;
  if (phone !== undefined) user.phone = phone;
  if (location !== undefined) user.location = location;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password;

  await user.save();
  return sendResponse(res, 200, true, "User updated", { ...user.toObject(), password: undefined }, null);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  await user.deleteOne();
  await WorkEntry.deleteMany({ user: req.params.id });
  return sendResponse(res, 200, true, "User deleted", null, null);
});

const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalEmployees, totalReports] = await Promise.all([
    User.countDocuments({ role: "user", isActive: true }),
    WorkEntry.countDocuments(),
  ]);

  const avgHoursAggregation = await WorkEntry.aggregate([
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          user: "$user",
        },
        dailyHours: { $sum: "$hoursSpent" },
      },
    },
    { $group: { _id: null, avgHoursPerDay: { $avg: "$dailyHours" } } },
  ]);

  const statusDistribution = await WorkEntry.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const hoursPerEmployee = await WorkEntry.aggregate([
    { $group: { _id: "$userName", totalHours: { $sum: "$hoursSpent" } } },
    { $sort: { totalHours: -1 } },
  ]);

  const recentReports = await WorkEntry.find().sort({ submittedAt: -1 }).limit(5);

  return sendResponse(res, 200, true, "Dashboard statistics fetched", {
    totalEmployees,
    totalReports,
    avgHoursPerDay: avgHoursAggregation[0]?.avgHoursPerDay || 0,
    statusDistribution,
    hoursPerEmployee,
    recentReports,
  });
});

const getReports = asyncHandler(async (_req, res) => {
  const reports = await WorkEntry.find().sort({ submittedAt: -1 });
  return sendResponse(res, 200, true, "Reports fetched", reports, null);
});

const filterReports = asyncHandler(async (req, res) => {
  const { from, to, status, userId, exportCsv } = req.query;
  const query = {};

  if (status) query.status = status;
  if (userId) query.user = userId;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const reports = await WorkEntry.find(query).sort({ submittedAt: -1 });

  if (String(exportCsv) === "true") {
    const csv = stringify(
      reports.map((r) => ({
        userName: r.userName,
        userEmail: r.userEmail,
        date: r.date.toISOString().split("T")[0],
        project: r.project,
        tasks: r.tasks,
        hoursSpent: r.hoursSpent,
        status: r.status,
      })),
      { header: true }
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=work-reports.csv");
    return res.status(200).send(csv);
  }

  return sendResponse(res, 200, true, "Filtered reports fetched", reports, null);
});

const getEnquiries = asyncHandler(async (_req, res) => {
  const enquiries = await Enquiry.find().sort({ submittedAt: -1 });
  return sendResponse(res, 200, true, "Enquiries fetched", enquiries, null);
});

const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) {
    const err = new Error("Enquiry not found");
    err.statusCode = 404;
    throw err;
  }
  enquiry.status = req.body.status;
  await enquiry.save();
  return sendResponse(res, 200, true, "Enquiry status updated", enquiry, null);
});

const updateReportApproval = asyncHandler(async (req, res) => {
  const { approvalStatus, rejectionReason } = req.body;
  const report = await WorkEntry.findById(req.params.id);
  if (!report) {
    const err = new Error("Report not found");
    err.statusCode = 404;
    throw err;
  }

  report.approvalStatus = approvalStatus;
  if (approvalStatus === "rejected") {
    report.canEdit = true;
    report.rejectionReason = rejectionReason || "Rejected by admin";
  } else {
    report.canEdit = false;
    report.rejectionReason = "";
  }

  await report.save();

  return sendResponse(res, 200, true, "Report approval updated", report, null);
});

module.exports = {
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
};
