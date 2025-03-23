import { db } from "../models/db.js"; // import database utility
import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas.js"; // import Joi schemas for validation

export const accountsController = {
  // render the main page
  index: {
    auth: false, 
    handler: function (request, h) {
      return h.view("main", { title: "Welcome to POI Tracker" }); 
    },
  },

  // Render the signup page
  showSignup: {
    auth: false, 
    handler: function (request, h) {
      return h.view("signup-view", { title: "Sign up for POI Tracker" }); 
    },
  },

  // Handle user signup
  signup: {
    auth: false, 
    validate: {
      payload: UserSpec, // validate payload using UserSpec schema
      options: { abortEarly: false }, 
      failAction: function (request, h, error) {
        // render signup view with errors if validation fails
        return h
          .view("signup-view", {
            title: "Sign up error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const user = request.payload; 
      await db.userStore.addUser(user); 
      return h.redirect("/"); 
    },
  },

  // Render the login page
  showLogin: {
    auth: false, 
    handler: function (request, h) {
      return h.view("login-view", { title: "Login to POI Tracker" }); 
    },
  },

  // Handle user login
  login: {
    auth: false, 
    validate: {
      payload: UserCredentialsSpec, 
      options: { abortEarly: false }, 
      failAction: function (request, h, error) {
        // Render login view with errors if validation fails
        return h
          .view("login-view", {
            title: "Login Error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const { email, password } = request.payload; // Get email and password from payload
      const user = await db.userStore.getUserByEmail(email); 

      // Check if user exists and password matches
      if (!user || user.password !== password) {
        return h
          .view("login-view", {
            title: "Login Error",
            errors: [{ message: "Invalid email or password" }],
          })
          .takeover()
          .code(400);
      }

      // Set authentication cookie and redirect to dashboard
      request.cookieAuth.set({ id: user._id });
      return h.redirect("/dashboard");
    },
  },

  // Handle user logout
  logout: {
    handler: function (request, h) {
      request.cookieAuth.clear(); // Clear authentication cookie
      return h.redirect("/"); // Redirect to home page
    },
  },

  // Validate user session
  async validate(request, session) {
    const user = await db.userStore.getUserById(session.id); 
    if (!user) {
      return { isValid: false }; // Invalidate session if user not found
    }
    return { isValid: true, credentials: user }; // Validate session and return user credentials
  },
};