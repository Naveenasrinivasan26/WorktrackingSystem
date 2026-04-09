const mongoose = require("mongoose");

const workEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  date: { type: Date, required: true },
  project: { type: String, required: true, trim: true },
  tasks: { type: String, required: true, trim: true },
  hoursSpent: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "In Progress",
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  rejectionReason: { type: String, default: "" },
  canEdit: { type: Boolean, default: false },
  description: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: false, updatedAt: "updatedAt" } });

workEntrySchema.index({ user: 1 });
workEntrySchema.index({ date: 1 });
workEntrySchema.index({ status: 1 });

module.exports = mongoose.model("WorkEntry", workEntrySchema);
