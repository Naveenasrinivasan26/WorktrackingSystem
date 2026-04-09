const WorkEntry = require("../models/WorkEntry");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const getEntries = asyncHandler(async (req, res) => {
  const entries = await WorkEntry.find({ user: req.user._id }).sort({ submittedAt: -1 });
  return sendResponse(res, 200, true, "Work entries fetched", entries, null);
});

const createEntry = asyncHandler(async (req, res) => {
  const entry = await WorkEntry.create({
    ...req.body,
    user: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    canEdit: false,
    approvalStatus: "pending",
  });

  return sendResponse(res, 201, true, "Work entry created", entry, null);
});

const getEntry = asyncHandler(async (req, res) => {
  const entry = await WorkEntry.findById(req.params.id);
  if (!entry) {
    const err = new Error("Work entry not found");
    err.statusCode = 404;
    throw err;
  }

  if (entry.user.toString() !== req.user._id.toString()) {
    const err = new Error("Forbidden: entry does not belong to you");
    err.statusCode = 403;
    throw err;
  }

  return sendResponse(res, 200, true, "Work entry fetched", entry, null);
});

const updateEntry = asyncHandler(async (req, res) => {
  const entry = await WorkEntry.findById(req.params.id);
  if (!entry) {
    const err = new Error("Work entry not found");
    err.statusCode = 404;
    throw err;
  }

  if (entry.user.toString() !== req.user._id.toString()) {
    const err = new Error("Forbidden: entry does not belong to you");
    err.statusCode = 403;
    throw err;
  }

  if (entry.approvalStatus === "accepted") {
    const err = new Error("Accepted reports cannot be edited");
    err.statusCode = 400;
    throw err;
  }

  if (entry.approvalStatus === "rejected" && !entry.canEdit) {
    const err = new Error("This rejected report is locked from editing");
    err.statusCode = 400;
    throw err;
  }

  Object.assign(entry, req.body, {
    canEdit: false,
    approvalStatus: "pending",
    rejectionReason: "",
  });
  await entry.save();

  return sendResponse(res, 200, true, "Work entry updated and resubmitted", entry, null);
});

const deleteEntry = asyncHandler(async (req, res) => {
  const entry = await WorkEntry.findById(req.params.id);
  if (!entry) {
    const err = new Error("Work entry not found");
    err.statusCode = 404;
    throw err;
  }

  if (entry.user.toString() !== req.user._id.toString()) {
    const err = new Error("Forbidden: entry does not belong to you");
    err.statusCode = 403;
    throw err;
  }

  await entry.deleteOne();
  return sendResponse(res, 200, true, "Work entry deleted", null, null);
});

module.exports = {
  getEntries,
  createEntry,
  getEntry,
  updateEntry,
  deleteEntry,
};
