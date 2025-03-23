
// We import all the modules

import Vision from "@hapi/vision";
import Inert from "@hapi/inert"; 
import Hapi from "@hapi/hapi";
import Cookie from "@hapi/cookie";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { webRoutes } from "./web-routes.js";
import { db } from "./models/db.js";
import { accountsController } from "./controllers/accounts-controller.js";
import dotenv from "dotenv";
import Joi from "joi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  // Register plugins we use inert to serve static files
  await server.register(Vision);
  await server.register(Inert); 
  await server.register(Cookie);
  server.validator(Joi);

  // Handlebars confogured as view engine 
  server.views({
    engines: {
      hbs: Handlebars,
    },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  // Configure authentication strategy
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: "playtime",
      password: process.env.COOKIE_PASSWORD || "secretpasswordnotrevealedtoanyone", 
      isSecure: false, 
    },
    redirectTo: "/",
    validate: accountsController.validate,
  });

  // Set default authentication strategy
  server.auth.default("session");

  // Initialize the database
  db.init("json");

  // Serve static files from the "public" folder
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

  // Register routes
  server.route(webRoutes);

  // Start the server
  await server.start();
  console.log("Server running on %s", server.info.uri);
}

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

// Load environment variables
const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

// Initialize the server
init();