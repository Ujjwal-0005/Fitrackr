// CRITICAL: Load .env BEFORE anything else
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

console.log('📂 Loading .env from:', envPath);
console.log('📂 File exists:', fs.existsSync(envPath));

// Force load with explicit path
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
  process.exit(1);
}

console.log('✅ Environment loaded');
console.log('📊 Variables loaded:', Object.keys(result.parsed || {}).length);
console.log('📋 All variables:', Object.keys(result.parsed || {}));
console.log('🔑 Edamam credentials:', {
  hasAppId: !!process.env.EDAMAM_MEAL_PLANNER_APP_ID,
  hasAppKey: !!process.env.EDAMAM_MEAL_PLANNER_APP_KEY,
  appId: process.env.EDAMAM_MEAL_PLANNER_APP_ID,
  appKeyLength: process.env.EDAMAM_MEAL_PLANNER_APP_KEY?.length
});

// NOW import everything else
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import progressLogsRoutes from "./routes/progressLogsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import personalRecordRoutes from "./routes/personalRecordRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import smartGoalRoutes from "./routes/smartGoalRoutes.js";
import workoutPlansRoutes from "./routes/workoutPlansRoutes.js";
import customSessionRoutes from "./routes/customSessionRoutes.js";
import mealPlannerRoutes from "./routes/mealPlannerRoutes.js";
import { initializeRedis } from "./config/redis.js";
import { configureHelmet, apiLimiter } from "./middleware/security.js";

connectDB();

// Initialize Redis after env is loaded
initializeRedis().catch(err => {
  console.error('❌ Failed to initialize Redis:', err.message);
  console.warn('⚠️  Server will continue but OTP features will not work');
});

const app = express();

// Security middleware
app.use(configureHelmet());

// CRITICAL: Parse JSON and cookies BEFORE logging
// Set reasonable payload limits for different endpoints
app.use(express.json({ limit: '1mb' })); // 1MB is plenty for form data + files
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());

// 📝 REQUEST LOGGER - Log every incoming request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.url}`);
  console.log('   Headers:', JSON.stringify({
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'Bearer ***' : 'none',
    'origin': req.headers['origin']
  }));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`📤 [${timestamp}] Response ${res.statusCode}:`,
      typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200));
    originalSend.call(this, data);
  };

  next();
});

// CORS Configuration - Allow Dev Tunnels and localhost
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all origins (including Dev Tunnels)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ CORS: Allowing origin:', origin);
      return callback(null, true);
    }

    // In production, only allow specific origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Enable cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  exposedHeaders: ["X-CSRF-Token"],
};

app.use(cors(corsOptions));

// Skip auth middleware for OPTIONS requests (preflight bypass)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Apply rate limiting to all routes except auth (auth has its own limiters)
app.use("/api/", (req, res, next) => {
  // Skip auth endpoints from general API limiter
  if (req.path.startsWith('/auth/')) {
    return next();
  }
  return apiLimiter(req, res, next);
});

// 🔥 ERROR HANDLER - Catch all errors
app.use((err, req, res, next) => {
  console.error('\n❌ ERROR CAUGHT:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  res.status(err.status || 500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// API Routes
app.get("/", (req, res) => res.send("FitTrackr API running ✅"));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/stats", statsRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/progress", progressLogsRoutes);
app.use("/api/v1/prs", personalRecordRoutes);
// templateRoutes removed
app.use("/api/v1/achievements", achievementRoutes);
app.use("/api/v1/nutrition", nutritionRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/smart-goals", smartGoalRoutes);
app.use("/api/v1/workout-plans", workoutPlansRoutes);
app.use("/api/v1/custom-sessions", customSessionRoutes);
app.use("/api/v1/meal-planner", mealPlannerRoutes);
// app.use("/api/v1/smart-sessions", smartSessionRoutes); // Commented out - SmartSession model doesn't exist
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await redisClient.quit();
    console.log('Redis connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await redisClient.quit();
    console.log('Redis connection closed');
    process.exit(0);
  });
});
