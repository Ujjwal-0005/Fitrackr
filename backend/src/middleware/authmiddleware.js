import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * Cookie-based authentication middleware
 * Extracts and verifies access token from HttpOnly cookie
 */
export const cookieAuth = async (req, res, next) => {
  try {
    // Try to get token from cookie first (new method)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header for backward compatibility
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify it's an access token (not refresh token)
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({ message: "Invalid token type" });
    }

    // Fetch user and attach to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Cookie auth error:", err);

    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }

    res.status(401).json({ message: "Token invalid or expired" });
  }
};

/**
 * Legacy protect middleware (for backward compatibility)
 * @deprecated Use cookieAuth instead
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('🔍 protect middleware called:', {
      hasAuthHeader: !!authHeader,
      authHeader: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
      path: req.path
    });

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ No valid authorization header');
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log('🔑 Token extracted:', token ? token.substring(0, 20) + '...' : 'none');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { userId: decoded.id });

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      console.log('❌ User not found for id:', decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    console.log('✅ User authenticated:', {
      userId: req.user._id,
      role: req.user.role,
      email: req.user.email
    });

    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

/**
 * Admin-only middleware
 * Must be used after cookieAuth or protect
 */
export const adminOnly = (req, res, next) => {
  console.log('🔐 adminOnly middleware called:', {
    hasUser: !!req.user,
    userRole: req.user?.role,
    userId: req.user?._id,
    email: req.user?.email
  });

  if (req.user && req.user.role === "admin") {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied - user role:', req.user?.role);
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};


