const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  workEmail: { type: String, required: true, lowercase: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  teamSize: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "contacted", "resolved"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Enquiry", enquirySchema);
