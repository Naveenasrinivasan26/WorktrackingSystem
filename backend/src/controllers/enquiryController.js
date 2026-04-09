const Enquiry = require("../models/Enquiry");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const submitEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body);
  return sendResponse(res, 201, true, "Enquiry submitted", enquiry, null);
});

const getEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findOne({ workEmail: req.params.email.toLowerCase() }).sort({ submittedAt: -1 });
  if (!enquiry) {
    const err = new Error("No enquiry found for this email");
    err.statusCode = 404;
    throw err;
  }
  return sendResponse(res, 200, true, "Enquiry status fetched", enquiry, null);
});

module.exports = { submitEnquiry, getEnquiryStatus };
