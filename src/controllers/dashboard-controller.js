import { db } from "../models/db.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const pois = await db.poiStore.getUserPOIs(loggedInUser._id);  

      const viewData = {
        title: "Dashboard",
        user: loggedInUser,
        pois: pois || [],
      };

      return h.view("dashboard-view", viewData);
    },
  },

  addPOI: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const newPOI = {
        userId: loggedInUser._id,
        title: request.payload.title,
        description: request.payload.description,
        latitude: Number(request.payload.latitude),
        longitude: Number(request.payload.longitude),
      };

      await db.poiStore.addPOI(newPOI);
      return h.redirect("/dashboard");
    },
  },

  deletePOI: {
    handler: async function (request, h) {
      await db.poiStore.deletePOI(request.params.id);
      return h.redirect("/dashboard");
    },
  },
};
