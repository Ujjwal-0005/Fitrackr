import { createClient } from "redis";

// This file is imported AFTER dotenv.config() in server.js
// Environment variables are already loaded at this point

let redisClient = null;

export const initializeRedis = async () => {
    console.log('🔍 Redis Config Debug:');
    console.log('  REDIS_HOST:', process.env.REDIS_HOST);
    console.log('  REDIS_PORT:', process.env.REDIS_PORT);
    console.log('  REDIS_USERNAME:', process.env.REDIS_USERNAME);
    console.log('  REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***' : 'undefined');

    if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASSWORD) {
        console.error('❌ Missing Redis credentials in .env file!');
        console.error('   Required: REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD');
        throw new Error('Redis credentials not configured');
    }

    redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
    });

    redisClient.on("connect", () => {
        console.log("✅ Redis connected");
    });

    redisClient.on("error", (err) => {
        console.error("❌ Redis Client Error:", err.message);
    });

    await redisClient.connect();

    // Test Redis connection
    try {
        await redisClient.set("redis_test", "working", { EX: 30 });
        const testValue = await redisClient.get("redis_test");
        console.log("✅ Redis test:", testValue);
    } catch (err) {
        console.error("❌ Redis test failed:", err.message);
    }

    return redisClient;
};

export const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis not initialized. Call initializeRedis() first.');
    }
    return redisClient;
};

export const checkRedisConnection = () => {
    if (!redisClient || !redisClient.isOpen) {
        throw new Error('Redis is not connected. OTP features are unavailable.');
    }
};

export default { initializeRedis, getRedisClient, checkRedisConnection };
