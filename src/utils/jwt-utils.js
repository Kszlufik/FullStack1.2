// Import JWT library for token handling
import jwt from "jsonwebtoken";

// Secret key for signing tokens - uses environment variable or default for development
const JWT_SECRET = process.env.JWT_SECRET || "your_dev_secret";
// Token expires after 2 hours
const JWT_EXPIRES_IN = "2h";

// Function to create a new JWT token for a user
export function generateToken(user) {
  return jwt.sign(
    // Payload containing user info (id and email)
    { id: user._id, email: user.email },
    // Secret key to sign the token
    JWT_SECRET,
    // Token expiration time
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Function to check if a token is valid
export function verifyToken(token) {
  try {
    // Try to verify the token using secret
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // If verification fails return null
    return null;
  }
}