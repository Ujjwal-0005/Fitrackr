import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/token.js";
import { validationResult } from "express-validator";
import { generateOTP } from "../utils/otp.js";
import {
  storeOTP,
  verifyOTP,
  deleteOTP,
  checkCooldown,
  setCooldown,
  incrementAttempts,
  checkMaxAttempts,
  resetAttempts,
  checkHourlyLimit,
  incrementHourlyCount,
} from "../services/otpService.js";
import {
  sendSignupOTP as sendSignupOTPEmail,
  sendForgotPasswordOTP as sendForgotPasswordOTPEmail,
  sendWelcomeEmail,
} from "../services/emailService.js";

/**
 * Cookie configuration
 */
const getCookieOptions = (maxAge) => {
  const isDev = process.env.NODE_ENV !== 'production';
  return {
    httpOnly: true,
    secure: isDev ? false : true, // false in dev (http), true in prod (https)
    sameSite: isDev ? 'lax' : 'strict', // 'lax' in dev, 'strict' in prod
    maxAge,
    path: '/'
  };
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Set authentication cookies
 */
const setAuthCookies = (res, userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);

  res.cookie('accessToken', accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));
  res.cookie('refreshToken', refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE));

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    // Set HttpOnly cookies
    setAuthCookies(res, user._id, user.role);

    // Also return token for backward compatibility
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Set HttpOnly cookies
    setAuthCookies(res, user._id, user.role);

    // Include profile completion status in response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isProfileComplete: user.isProfileComplete,
      avatar: user.avatar,
      onboarding: user.onboarding,
    };

    // Also return token for backward compatibility
    const token = generateToken(user._id, user.role);

    res.json({ user: userResponse, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password || "");
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update password" });
  }
};

/**
 * Refresh access token using refresh token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id, decoded.role);

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

/**
 * Logout - clear authentication cookies
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

// ==================== OTP-BASED AUTHENTICATION ====================

/**
 * Send OTP for signup email verification
 * POST /api/v1/auth/signup/send-otp
 */
export const sendSignupOTP = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check hourly limit
    const hourlyLimitExceeded = await checkHourlyLimit(email);
    if (hourlyLimitExceeded) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later.",
      });
    }

    // Check cooldown
    const cooldown = await checkCooldown(email);
    if (cooldown > 0) {
      return res.status(429).json({
        message: `Please wait ${cooldown} seconds before requesting another OTP`,
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp, "signup");
    await setCooldown(email);
    await incrementHourlyCount(email);

    // Send email
    await sendSignupOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error sending signup OTP:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

/**
 * Verify OTP and complete signup
 * POST /api/v1/auth/signup/verify-otp
 */
export const verifySignupOTP = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, password, name, avatarUrl } = req.body;

    // Check max attempts
    const maxAttemptsExceeded = await checkMaxAttempts(email);
    if (maxAttemptsExceeded) {
      return res.status(429).json({
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    const isValid = await verifyOTP(email, otp, "signup");
    if (!isValid) {
      await incrementAttempts(email);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if user already exists (double-check)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await deleteOTP(email, "signup");
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user with verified email
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      password: hashedPassword,
      isEmailVerified: true,
    };

    // Add avatar if provided
    if (avatarUrl) {
      userData.avatarUrl = avatarUrl;
      if (!userData.avatar) userData.avatar = {};
      userData.avatar.url = avatarUrl;
    }

    const user = await User.create(userData);

    // Clean up OTP and attempts
    await deleteOTP(email, "signup");
    await resetAttempts(email);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error("Failed to send welcome email:", err);
      // Don't fail registration if email fails
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    // Set HttpOnly cookies
    setAuthCookies(res, user._id, user.role);

    res.status(201).json({
      message: "Account created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isProfileComplete: user.isProfileComplete,
      },
      token,
    });
  } catch (error) {
    console.error("Error verifying signup OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP. Please try again." });
  }
};

/**
 * Send OTP for forgot password
 * POST /api/v1/auth/forgot-password/send-otp
 */
export const sendForgotPasswordOTP = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists (but don't reveal in response for security)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check hourly limit
    const hourlyLimitExceeded = await checkHourlyLimit(email);
    if (hourlyLimitExceeded) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later.",
      });
    }

    // Check cooldown
    const cooldown = await checkCooldown(email);
    if (cooldown > 0) {
      return res.status(429).json({
        message: `Please wait ${cooldown} seconds before requesting another OTP`,
      });
    }

    // Only send OTP if user exists, but always return success message
    if (user) {
      const otp = generateOTP();
      await storeOTP(email, otp, "forgot");
      await setCooldown(email);
      await incrementHourlyCount(email);
      await sendForgotPasswordOTPEmail(email, otp);
    } else {
      // Still set cooldown to prevent email enumeration
      await setCooldown(email);
      await incrementHourlyCount(email);
    }

    // Generic response (don't reveal if email exists)
    res.status(200).json({
      message: "If your email is registered, you will receive an OTP shortly.",
    });
  } catch (error) {
    console.error("Error sending forgot password OTP:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

/**
 * Reset password with OTP
 * POST /api/v1/auth/forgot-password/reset
 */
export const resetPasswordWithOTP = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;

    // Check max attempts
    const maxAttemptsExceeded = await checkMaxAttempts(email);
    if (maxAttemptsExceeded) {
      return res.status(429).json({
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    const isValid = await verifyOTP(email, otp, "forgot");
    if (!isValid) {
      await incrementAttempts(email);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await deleteOTP(email, "forgot");
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clean up OTP and attempts
    await deleteOTP(email, "forgot");
    await resetAttempts(email);

    res.status(200).json({
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};
