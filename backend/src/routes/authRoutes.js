const express = require("express");
const {
  register,
  login,
  logout,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  registerValidator,
  loginValidator,
  profileUpdateValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", protect, authorize("admin"), registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.put("/update-profile", protect, profileUpdateValidator, validateRequest, updateProfile);
router.post("/forgot-password", forgotPasswordValidator, validateRequest, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidator, validateRequest, resetPassword);

module.exports = router;
