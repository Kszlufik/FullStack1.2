import { verifyToken } from "../utils/jwt-utils.js";

// Middleware to check if user is authenticated
export function requireAuth(request, response, next) {
  // Get the authorization header
  const authHeader = request.headers.authorization;
  
  // Check if header exists and is in correct format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ error: "No token provided" });
  }

  // Extract the token part (after "Bearer ")
  const token = authHeader.split(" ")[1];
  
  // Verify the token
  const decoded = verifyToken(token);
  if (!decoded) {
    return response.status(401).json({ error: "Invalid or expired token" });
  }

  // Attach user info to the request object
  request.user = decoded;
  
  // Move to next middleware/route handler
  next();
}