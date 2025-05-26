import { db } from "../models/db.js";
import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas.js";
import { generateToken } from "../utils/jwt-utils.js";
import bcrypt from "bcrypt";

export const accountsController = {
  index: {
    auth: false,
    handler: function (request, h) {
      // Just showing the main page
      return h.view("main", { title: "Welcome to POI Tracker" });
    },
  },

  showSignup: {
    auth: false,
    handler: function (request, h) {
      // Render the signup form
      return h.view("signup-view", { title: "Sign up for POI Tracker" });
    },
  },

  signup: {
    auth: false,
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        // Handle validation errors
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
      // Clean up the user data
      const user = {
        ...request.payload,
        email: request.payload.email.trim(),
        password: request.payload.password.trim()
      };

      // Some debug logging for registration
      console.log("Registration details:", {
        email: user.email,
        passwordLength: user.password.length,
        charCodes: [...user.password].map(c => c.charCodeAt(0))
      });

      try {
        // Add the new user to DB
        const addedUser = await db.userStore.addUser(user);
        console.log("User registered successfully:", {
          email: addedUser.email,
          hashPrefix: addedUser.password.substring(0, 10) + "..."
        });
        return h.redirect("/");
      } catch (err) {
        // something went wrong
        console.error("Registration failed:", err);
        return h.view("signup-view", {
          title: "Signup Error",
          errors: [{ message: "Registration failed. Please try again." }]
        }).takeover().code(500);
      }
    },
  },

  showLogin: {
    auth: false,
    handler: function (request, h) {
      // Show the login page
      return h.view("login-view", { title: "Login to POI Tracker" });
    },
  },

  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        // Handle login validation errors
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
      // get and clean credentials
      const { email, password } = {
        email: request.payload.email.trim(),
        password: request.payload.password.trim()
      };

      console.log("Login attempt:", { email, passwordLength: password.length });

      try {
        // Check if user exists
        const user = await db.userStore.getUserByEmail(email);
        if (!user) {
          console.log("User not found");
          return h.view("login-view", {
            title: "Login Error",
            errors: [{ message: "Invalid email or password" }],
          }).takeover().code(401);
        }

        console.log("Retrieved user:", {
          email: user.email,
          hashPrefix: user.password.substring(0, 10) + "..."
        });

        // Check password match
        const match = await bcrypt.compare(password, user.password);
        console.log("Password comparison result:", match);

        if (!match) {
          // Extra debug if password doesn't match
          const testHash = await bcrypt.hash(password, 10);
          console.log("Emergency debug:", {
            inputHash: testHash,
            storedHash: user.password,
            exactMatch: testHash === user.password
          });

          return h.view("login-view", {
            title: "Login Error",
            errors: [{ message: "Invalid email or password" }],
          }).takeover().code(401);
        }

        // login successful - set auth cookie
        request.cookieAuth.set({ id: user._id });
        return h.redirect("/dashboard");

      } catch (err) {
        // handle login errors
        console.error("Login error:", err);
        return h.view("login-view", {
          title: "Login Error",
          errors: [{ message: "Authentication failed. Please try again." }]
        }).takeover().code(500);
      }
    },
  },

  logout: {
    handler: function (request, h) {
      // Clear auth cookie and redirect
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },

  async validate(request, session) {
    // Validate user session
    try {
      const user = await db.userStore.getUserById(session.id);
      if (!user) {
        console.log("Invalid session for ID:", session.id);
        return { isValid: false };
      }
      return { isValid: true, credentials: user };
    } catch (err) {
      console.error("Session validation error:", err);
      return { isValid: false };
    }
  },
};