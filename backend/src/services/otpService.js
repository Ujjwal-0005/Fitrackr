import { getRedisClient, checkRedisConnection } from '../config/redis.js';
import { hashOTP, verifyOTP as verifyOTPUtil } from '../utils/otp.js';

const getRedis = () => getRedisClient();

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_SECONDS || '300'); // 5 minutes
const RESEND_COOLDOWN = parseInt(process.env.OTP_RESEND_COOLDOWN || '60'); // 60 seconds
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5');
const HOURLY_LIMIT = parseInt(process.env.OTP_HOURLY_LIMIT || '3');

/**
 * Check if Redis is available
 */
const ensureRedisConnection = () => {
    try {
        checkRedisConnection();
    } catch (error) {
        throw new Error('OTP service unavailable: Redis is not connected. Please start Redis server.');
    }
};

/**
 * Store OTP in Redis with expiry
 * @param {string} email - User email
 * @param {string} otp - Plain text OTP
 * @param {string} type - 'signup' or 'forgot'
 */
export const storeOTP = async (email, otp, type) => {
    ensureRedisConnection();
    const key = `${type}_otp:${email.toLowerCase()}`;
    const hashedOTP = hashOTP(otp);

    await getRedis().setEx(key, OTP_EXPIRY, hashedOTP);
};

/**
 * Verify OTP from Redis
 * @param {string} email - User email
 * @param {string} otp - Plain text OTP provided by user
 * @param {string} type - 'signup' or 'forgot'
 * @returns {Promise<boolean>} True if OTP is valid
 */
export const verifyOTP = async (email, otp, type) => {
    const key = `${type}_otp:${email.toLowerCase()}`;
    const storedHashedOTP = await getRedis().get(key);

    if (!storedHashedOTP) {
        return false; // OTP expired or doesn't exist
    }

    return verifyOTPUtil(otp, storedHashedOTP);
};

/**
 * Delete OTP from Redis
 * @param {string} email - User email
 * @param {string} type - 'signup' or 'forgot'
 */
export const deleteOTP = async (email, type) => {
    const key = `${type}_otp:${email.toLowerCase()}`;
    await getRedis().del(key);
};

/**
 * Check if user is in cooldown period
 * @param {string} email - User email
 * @returns {Promise<number>} Remaining cooldown seconds (0 if no cooldown)
 */
export const checkCooldown = async (email) => {
    const key = `otp_cooldown:${email.toLowerCase()}`;
    const ttl = await getRedis().ttl(key);
    return ttl > 0 ? ttl : 0;
};

/**
 * Set cooldown for OTP resend
 * @param {string} email - User email
 */
export const setCooldown = async (email) => {
    const key = `otp_cooldown:${email.toLowerCase()}`;
    await getRedis().setEx(key, RESEND_COOLDOWN, '1');
};

/**
 * Increment failed OTP verification attempts
 * @param {string} email - User email
 * @returns {Promise<number>} Current attempt count
 */
export const incrementAttempts = async (email) => {
    const key = `otp_attempts:${email.toLowerCase()}`;
    const attempts = await getRedis().incr(key);

    // Set expiry on first attempt
    if (attempts === 1) {
        await getRedis().expire(key, OTP_EXPIRY);
    }

    return attempts;
};

/**
 * Check if user has exceeded max attempts
 * @param {string} email - User email
 * @returns {Promise<boolean>} True if max attempts exceeded
 */
export const checkMaxAttempts = async (email) => {
    const key = `otp_attempts:${email.toLowerCase()}`;
    const attempts = await getRedis().get(key);
    return attempts && parseInt(attempts) >= MAX_ATTEMPTS;
};

/**
 * Reset attempt counter
 * @param {string} email - User email
 */
export const resetAttempts = async (email) => {
    const key = `otp_attempts:${email.toLowerCase()}`;
    await getRedis().del(key);
};

/**
 * Check hourly OTP request limit
 * @param {string} email - User email
 * @returns {Promise<boolean>} True if limit exceeded
 */
export const checkHourlyLimit = async (email) => {
    const key = `otp_hourly:${email.toLowerCase()}`;
    const count = await getRedis().get(key);
    return count && parseInt(count) >= HOURLY_LIMIT;
};

/**
 * Increment hourly OTP request counter
 * @param {string} email - User email
 */
export const incrementHourlyCount = async (email) => {
    const key = `otp_hourly:${email.toLowerCase()}`;
    const count = await getRedis().incr(key);

    // Set 1 hour expiry on first request
    if (count === 1) {
        await getRedis().expire(key, 3600); // 1 hour
    }
};
