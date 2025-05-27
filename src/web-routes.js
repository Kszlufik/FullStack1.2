import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { poiController } from "./controllers/poi-controller.js";
import { exploreController } from "./controllers/explore-controller.js";
import { discussionController } from "./controllers/discussion-controller.js";
import { adminController } from "./controllers/admin-controller.js";
import { favoritesController } from "./controllers/favorites-controller.js";

export const webRoutes = [
  // Public auth routes
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },

  // Dashboard routes (session-based access)
  { method: "GET", path: "/dashboard", config: dashboardController.index },

  {
    method: "POST",
    path: "/dashboard/addpoi",
    config: {
      handler: dashboardController.addPOI.handler,
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024,
      },
    },
  },

  { method: "GET", path: "/dashboard/deletepoi/{id}", config: dashboardController.deletePOI },
  { method: "GET", path: "/search", config: dashboardController.searchPOIs },

  // POI detail & marker routes
  { method: "GET", path: "/poi/{id}", config: poiController.viewPOI },
  { method: "GET", path: "/poi/{id}/deletemarker/{markerid}", config: poiController.deleteMarker },

  // post route for images upload
  {
    method: "POST",
    path: "/poi/{id}/upload-image",
    config: {
      handler: poiController.uploadImage.handler,
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024,
      },
    },
  },
//post route for adding marker by poi ID
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

  { method: "GET", path: "/explore", config: exploreController.index },
  { method: "GET", path: "/about", config: { handler: (request, h) => h.view("about-view") } },

  {
    method: "GET",
    path: "/uploads/{param*}",
    handler: {
      directory: {
        path: "./public/uploads",
        listing: false,
      },
    },
  },
// post route for promoting a simple user to admin by admin
  {
  method: "POST",
  path: "/admin/users/{id}/promote",
  config: adminController.promoteUser
},
//route for the favourites feature/toggle
{
  method: "POST",
  path: "/poi/{id}/favorite",
  config: favoritesController.toggleFavorite
},

//route for the favourites feature/list
{
  method: "GET",
  path: "/favorites",
  config: favoritesController.listFavorites
},

  // Review routes
  { method: "POST", path: "/poi/{id}/review", config: poiController.addReview },
  { method: "GET", path: "/poi/{id}/review/{reviewid}/edit", config: poiController.showEditReview },
  { method: "POST", path: "/poi/{id}/review/{reviewid}/edit", config: poiController.updateReview },
  { method: "POST", path: "/poi/{id}/review/{reviewid}/delete", config: poiController.deleteReview },

  // Discussion forum
  { method: "GET", path: "/discussions", config: discussionController.index },
  { method: "POST", path: "/discussions/add", config: discussionController.addMessage },
  { method: "POST", path: "/discussions/{id}/reply", config: discussionController.addReply },

  // Admin panel
  { method: "GET", path: "/admin/users", config: adminController.usersPage },
  { method: "POST", path: "/admin/users/{id}/delete", config: adminController.deleteUser },

  

];
