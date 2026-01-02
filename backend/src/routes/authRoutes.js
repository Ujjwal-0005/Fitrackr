import express from "express";
import {
    register,
    login,
    getMe,
    changePassword,
    sendSignupOTP,
    verifySignupOTP,
    sendForgotPasswordOTP,
    resetPasswordWithOTP,
    refreshToken,
    logout,
} from "../controllers/authController.js";
import { cookieAuth, protect } from "../middleware/authmiddleware.js";
import { upload } from "../middleware/upload.js";
import {
    validateSignupOTPRequest,
    validateSignupOTPVerification,
    validateForgotPasswordRequest,
    validatePasswordReset,
} from "../middleware/otpValidation.js";
import { authLimiter, otpLimiter, passwordResetLimiter } from "../middleware/security.js";

const router = express.Router();

// ==================== TOKEN MANAGEMENT ====================
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// ==================== USER VERIFICATION ====================
// Apply lighter rate limiting to /me endpoint since it's called frequently
router.get("/me", cookieAuth, getMe);

// ==================== OTP-BASED AUTHENTICATION ====================
// Signup with OTP
router.post("/signup/send-otp", otpLimiter, validateSignupOTPRequest, sendSignupOTP);
router.post("/signup/verify-otp", validateSignupOTPVerification, verifySignupOTP);

// Forgot Password with OTP
router.post("/forgot-password/send-otp", passwordResetLimiter, validateForgotPasswordRequest, sendForgotPasswordOTP);
router.post("/forgot-password/reset", validatePasswordReset, resetPasswordWithOTP);

// ==================== LEGACY AUTHENTICATION ====================
// Deprecated: Use OTP-based signup instead
router.post("/register", authLimiter, upload.single("profilePhoto"), register);
router.post("/login", authLimiter, login);
router.put("/change-password", cookieAuth, changePassword);

export default router;
