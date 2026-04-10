const crypto = require("crypto");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { generateToken } = require("../utils/token");
const { sendEmail } = require("../services/emailService");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  position: user.position,
  phone: user.phone,
  location: user.location,
  joinDate: user.joinDate,
  isActive: user.isActive,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, position, phone, location } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("User already exists with this email");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({ name, email, password, role, position, phone, location });
  return sendResponse(res, 201, true, "User registered successfully", sanitizeUser(user), null);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("Your account is inactive");
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken(user);

  // ✅ FIX: set cookie for Vercel + Render
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return sendResponse(
    res,
    200,
    true,
    "Login successful",
    { user: sanitizeUser(user), token },
    null
  );
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token");
  sendResponse(res, 200, true, "Logout successful", null, null);
});

const me = asyncHandler(async (req, res) =>
  sendResponse(res, 200, true, "Current profile fetched", sanitizeUser(req.user), null)
);

const updateProfile = asyncHandler(async (req, res) => {
  const { name, position, phone, location, password, currentPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = name;
  if (position !== undefined) user.position = position;
  if (phone !== undefined) user.phone = phone;
  if (location !== undefined) user.location = location;

  if (password) {
    if (user.role === "admin") {
      if (!currentPassword || !(await user.comparePassword(currentPassword))) {
        const err = new Error("Current password is required and must be valid");
        err.statusCode = 400;
        throw err;
      }
    }
    user.password = password;
  }

  await user.save();
  return sendResponse(res, 200, true, "Profile updated successfully", sanitizeUser(user), null);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await PasswordReset.create({ user: user._id, token, expiresAt });
    const resetUrl = `${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "WorkTrack Password Reset",
      html: `<p>Click to reset your password (valid for 30 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }

  return sendResponse(
    res,
    200,
    true,
    "If the email exists, a reset link has been sent.",
    null,
    null
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetRecord = await PasswordReset.findOne({
    token,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    const err = new Error("Invalid or expired reset token");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(resetRecord.user);
  if (!user) {
    const err = new Error("User not found for this token");
    err.statusCode = 404;
    throw err;
  }

  user.password = password;
  await user.save();

  resetRecord.isUsed = true;
  await resetRecord.save();

  return sendResponse(res, 200, true, "Password reset successful", null, null);
});

module.exports = {
  register,
  login,
  logout,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
};