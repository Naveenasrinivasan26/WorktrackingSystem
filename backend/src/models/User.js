const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  position: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });

userSchema.pre("save", async function preSave() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
