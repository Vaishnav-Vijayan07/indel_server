const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { formatDateTime, formatDuration } = require("./logFormat");

/**
 * Sign a short-lived access token (15 minutes).
 * Payload shape matches what the frontend and authMiddleware expect:
 *   { id, username, email, role }
 */
const generateAccessToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" },
  );

  const { exp } = jwt.decode(token);
  const now = new Date();
  const expiresAt = new Date(exp * 1000);

  console.log(
    `[AUTH] Issued access token for user ${user.id} at ${formatDateTime(now)} — valid for ${formatDuration(expiresAt - now)}, expires ${formatDateTime(expiresAt)}.`,
  );

  return token;
};

/**
 * Generate a cryptographically random, opaque refresh token.
 * 64 bytes → 128 hex chars. Not a JWT — no decodeable payload.
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * SHA-256 hex digest of a raw token string.
 * Used to store/look-up refresh tokens without persisting the raw value.
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = { generateAccessToken, generateRefreshToken, hashToken };
