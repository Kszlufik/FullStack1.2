// Import required modules
import jwt from "hapi-auth-jwt2"; 
import { db } from "../models/db.js"; 
import { verifyToken } from "../utils/jwt-utils.js"; 

// Define API routes for the application
export const apiRoutes = [
  {
    method: "GET", // HTTP method for this route
    path: "/api/profile", 
    config: {
      auth: "jwt", // Requires JWT authentication to access
      handler: async function (request, h) { // The route handler function
        // Get user ID from the validated JWT token
        const userId = request.auth.credentials.id;
        
        // Fetch user from database using the ID
        const user = await db.userStore.getUserById(userId);

        // If user not found, return 404 error
        if (!user) {
          return h.response({ error: "User not found" }).code(404);
        }

        // Return success response with user data
        return {
          status: "success",
          message: "JWT authenticated user",
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        };
      },
    },
  },
];