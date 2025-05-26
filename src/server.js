import Vision from "@hapi/vision";
import Inert from "@hapi/inert";
import Hapi from "@hapi/hapi";
import Cookie from "@hapi/cookie";
import Jwt from "hapi-auth-jwt2";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { webRoutes } from "./web-routes.js";
import { apiRoutes } from "./routes/api-routes.js";
import { db } from "./models/db.js";
import { accountsController } from "./controllers/accounts-controller.js";
import dotenv from "dotenv";
import Joi from "joi";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

async function init() {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  // Register plugins
  await server.register([Vision, Inert, Cookie, Jwt]);
  server.validator(Joi);

  // Register Handlebars helpers
  Handlebars.registerHelper("times", function (n, block) {
    let result = "";
    for (let i = 0; i < n; ++i) {
      result += block.fn(i);
    }
    return result;
  });

  Handlebars.registerHelper("subtract", (a, b) => a - b);
  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("gt", (a, b) => a > b);

  // Configure view engine
  server.views({
    engines: { hbs: Handlebars },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  // JWT Strategy (for API routes)
  server.auth.strategy("jwt", "jwt", {
    key: process.env.JWT_SECRET || "default-secret-min-32-chars-123456789012",
    validate: async (decoded) => {
      const user = await db.userStore.getUserById(decoded.id);
      if (!user) return { isValid: false };
      return { 
        isValid: true, 
        credentials: {
          id: user._id,
          email: user.email,
          scope: user.role || "user"
        }
      };
    },
    verifyOptions: { algorithms: ["HS256"] }
  });

  // session strategyfor web routes - cookies
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: "playtime",
      password: process.env.COOKIE_PASSWORD || "32-char-cookie-password-required-here-123",
      isSecure: process.env.NODE_ENV === "production",
      ttl: 24 * 60 * 60 * 1000, 
      path: "/",
      encoding: "iron" // Added for better cookie encoding
    },
    redirectTo: "/login",
    validate: accountsController.validate
  });

  // Set default auth strategy
  server.auth.default("session");

  // Static files
  server.route({
    method: "GET",
    path: "/public/{param*}",
    handler: {
      directory: {
        path: path.join(__dirname, "public"),
        listing: false,
      },
    },
  });

  // Debug routes
  server.route({
    method: "GET",
    path: "/verify-hash/{email}",
    handler: async (request) => {
      const user = await db.userStore.getUserByEmail(request.params.email);
      if (!user) return { error: "User not found" };
      
      return {
        storedHash: user.password,
        length: user.password.length,
        validStructure: user.password.startsWith("$2b$"),
        matchesTest: await bcrypt.compare("123", user.password) // Test with common password
      };
    }
  });

  server.route({
    method: "POST",
    path: "/debug-compare",
    handler: async (request) => {
      const { email, password } = request.payload;
      const user = await db.userStore.getUserByEmail(email);
      
      if (!user) return { error: "User not found" };
      
      return {
        input: password,
        storedHash: user.password,
        lengthMatch: password.length === password.length,
        charCodes: [...password].map(c => c.charCodeAt(0)),
        comparison: await bcrypt.compare(password, user.password),
        hardcodedMatch: await bcrypt.compare("123", user.password)
      };
    }
  });

  // Clear cookies route
  server.route({
    method: "GET",
    path: "/clear-cookies",
    handler: (request, h) => {
      request.cookieAuth.clear();
      return h.redirect("/");
    }
  });

  // Initialize database
  db.init("json");

  // Register all routes
  server.route(webRoutes);
  server.route(apiRoutes);

  // Start server
  await server.start();
  console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

init();