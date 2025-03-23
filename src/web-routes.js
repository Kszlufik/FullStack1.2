import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { poiController } from "./controllers/poi-controller.js";


// User authentication routes
export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },

  // Dashboard routes
  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "POST", path: "/dashboard/addpoi", config: dashboardController.addPOI },
  { method: "GET", path: "/dashboard/deletepoi/{id}", config: dashboardController.deletePOI },
  { method: "GET", path: "/search", config: dashboardController.searchPOIs },

  // point of Interest routes
  { method: "GET", path: "/poi/{id}", config: poiController.viewPOI }, 
  { method: "GET", path: "/poi/{id}/deletemarker/{markerid}", config: poiController.deleteMarker },

  // image upload route
  { 
    method: "POST", 
    path: "/poi/{id}/upload-image", 
    config: {
      handler: poiController.uploadImage.handler, 
      payload: { 
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024 
      }
    }
  },

  // about view path
{ method: "GET", path: "/about", config: { handler: (request, h) => h.view("about-view") } },

  // Serving uploaded images as static files from the uploads folder.
  { 
    method: "GET", 
    path: "/uploads/{param*}", 
    handler: {
      directory: {
        path: "./public/uploads", 
        listing: false 
      }
    }
  },

  // Corrected route for adding a marker
  {
    method: "POST", 
    path: "/poi/{id}/addmarker", 
    config: {
      handler: poiController.addMarker.handler,
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024, 
      },
    },
  },
];