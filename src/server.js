import Vision from "@hapi/vision"; //view support
import Inert from "@hapi/inert"; //file handling
import Hapi from "@hapi/hapi"; //hapi server core
import Cookie from "@hapi/cookie"; //Cookie auth
import Jwt from "hapi-auth-jwt2"; //jWT auth
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars"; //template engine
import { webRoutes } from "./web-routes.js";
import { apiRoutes } from "./routes/api-routes.js";
import { db } from "./models/db.js";
import { accountsController } from "./controllers/accounts-controller.js";
import dotenv from "dotenv"; //load .env vars
import Joi from "joi"; //validation

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//load environment variables
const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

async function init() {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  //register plugins
  await server.register([Vision, Inert, Cookie, Jwt]);
  server.validator(Joi);

  //register handlebars helpers
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
  Handlebars.registerHelper("or", (a, b) => a || b);

  //configure handlebars view engine
  server.views({
    engines: { hbs: Handlebars },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  //jWT authentication for API
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

  //session strategy for web routes
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: "playtime",
      password: process.env.COOKIE_PASSWORD || "32-char-cookie-password-required-here-123",
      isSecure: process.env.NODE_ENV === "production",
      ttl: 24 * 60 * 60 * 1000,
      path: "/",
      encoding: "iron"
    },
    redirectTo: "/login",
    validate: accountsController.validate
  });

  //set default auth strategy
  server.auth.default("session");

  //serve static files from /public
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

  //clear session cookie route
  server.route({
    method: "GET",
    path: "/clear-cookies",
    handler: (request, h) => {
      request.cookieAuth.clear();
      return h.redirect("/");
    }
  });

  //initialize data store
  db.init("json");

  //register app routes
  server.route(webRoutes);
  server.route(apiRoutes);

  //start server
  await server.start();
  console.log("Server running on %s", server.info.uri);
}

//global error handler
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

init(); // Launch server
