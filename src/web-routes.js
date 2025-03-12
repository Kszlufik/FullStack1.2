import { aboutController } from "./controllers/about-controller.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { poiController } from "./controllers/poi-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },

  { method: "GET", path: "/about", config: aboutController.index },

  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "POST", path: "/dashboard/addpoi", config: dashboardController.addPOI },
  { method: "GET", path: "/dashboard/deletepoi/{id}", config: dashboardController.deletePOI },

  { method: "GET", path: "/poi/{id}", config: poiController.index },  // ✅ Ensure only ONE handler exists!
  { method: "POST", path: "/poi/{id}/addmarker", config: poiController.addMarker },
  { method: "GET", path: "/poi/{id}/deletemarker/{markerid}", config: poiController.deleteMarker }
];
