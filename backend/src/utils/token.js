import jwt from "jsonwebtoken";

/**
 * Generate short-lived access token (15 minutes)
 * Used for API authentication
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Generate long-lived refresh token (7 days)
 * Used to obtain new access tokens
 */
export const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Legacy token generation (for backward compatibility during migration)
 * @deprecated Use generateAccessToken and generateRefreshToken instead
 */
export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
