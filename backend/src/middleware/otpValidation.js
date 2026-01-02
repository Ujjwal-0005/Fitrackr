import { body } from 'express-validator';

// Email validation
export const validateEmail = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .toLowerCase(),
];

// Password validation
export const validatePassword = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// OTP validation
export const validateOTP = [
    body('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be exactly 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
];

// Signup OTP request validation
export const validateSignupOTPRequest = [
    ...validateEmail,
];

// Signup OTP verification validation
export const validateSignupOTPVerification = [
    ...validateEmail,
    ...validateOTP,
    ...validatePassword,
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
];

// Forgot password OTP request validation
export const validateForgotPasswordRequest = [
    ...validateEmail,
];

// Password reset validation
export const validatePasswordReset = [
    ...validateEmail,
    ...validateOTP,
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];
