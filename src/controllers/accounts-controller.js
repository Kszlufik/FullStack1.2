import { db } from "../models/db.js";
import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas.js";
import { generateToken } from "../utils/jwt-utils.js";
import bcrypt from "bcrypt";

export const accountsController = {
  // show homepage
  index: {
    auth: false,
    handler: function (request, h) {
      return h.view("main", { title: "welcome to poi tracker" });
    },
  },

  // render signup form
  showSignup: {
    auth: false,
    handler: function (request, h) {
      return h.view("signup-view", { title: "sign up for poi tracker" });
    },
  },

  // handle user signup
  signup: {
    auth: false,
    validate: {
      payload: UserSpec, 
      options: { abortEarly: false }, 
      failAction: function (request, h, error) {
        return h
          .view("signup-view", {
            title: "sign up error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const user = {
        ...request.payload,
        email: request.payload.email.trim(),
        password: request.payload.password.trim()
      };

      try {
        const addedUser = await db.userStore.addUser(user);
        return h.redirect("/");
      } catch (err) {
        console.error("registration failed:", err);
        return h.view("signup-view", {
          title: "signup error",
          errors: [{ message: "registration failed. please try again." }]
        }).takeover().code(500);
      }
    },
  },

  // render login form
  showLogin: {
    auth: false,
    handler: function (request, h) {
      return h.view("login-view", { title: "login to poi tracker" });
    },
  },

  // handle login attempt
  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h
          .view("login-view", {
            title: "login error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const { email, password } = {
        email: request.payload.email.trim(),
        password: request.payload.password.trim()
      };

      try {
        const user = await db.userStore.getUserByEmail(email);
        if (!user) {
          return h.view("login-view", {
            title: "login error",
            errors: [{ message: "invalid email or password" }],
          }).takeover().code(401);
        }

        // compare entered password with stored hash
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return h.view("login-view", {
            title: "login error",
            errors: [{ message: "invalid email or password" }],
          }).takeover().code(401);
        }

        // store session using hapi's cookieauth
        request.cookieAuth.set({ id: user._id });
        return h.redirect("/dashboard");

      } catch (err) {
        console.error("login error:", err);
        return h.view("login-view", {
          title: "login error",
          errors: [{ message: "authentication failed. please try again." }]
        }).takeover().code(500);
      }
    },
  },

  // handle logout by clearing cookie session
  logout: {
    handler: function (request, h) {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },

  // session validation for each request with auth
  async validate(request, session) {
    try {
      const user = await db.userStore.getUserById(session.id);
      if (!user) {
        return { isValid: false };
      }
      return {
        isValid: true,
        credentials: {
          ...user,
          scope: user.role || 'user' // set default role if missing due to previous users not having a role
        }
      };
    } catch (err) {
      console.error("session validation error:", err);
      return { isValid: false };
    }
  },
};
