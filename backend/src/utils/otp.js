import crypto from 'crypto';

/**
 * Generate a 6-digit numeric OTP using cryptographically secure random number generation
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
    // Generate a random number between 100000 and 999999
    const otp = crypto.randomInt(100000, 1000000);
    return otp.toString();
};

/**
 * Hash OTP using SHA-256 for secure storage
 * @param {string} otp - Plain text OTP
 * @returns {string} Hashed OTP
 */
export const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP by comparing hashed values
 * @param {string} plainOTP - OTP provided by user
 * @param {string} hashedOTP - Stored hashed OTP
 * @returns {boolean} True if OTP matches
 */
export const verifyOTP = (plainOTP, hashedOTP) => {
    const hashedInput = hashOTP(plainOTP);
    return hashedInput === hashedOTP;
};
