import { db } from "../models/db.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      // Get the logged in user and their POIs
      const loggedInUser = request.auth.credentials;
      const userPOIs = await db.poiStore.getUserPOIs(loggedInUser._id);
      return h.view("dashboard-view", {
        title: "Dashboard",
        user: loggedInUser,
        pois: userPOIs,
      });
    },
  },

  addPOI: {
    handler: async function (request, h) {
      // Create new POI from form data
      const loggedInUser = request.auth.credentials;
      const newPOI = {
        userId: loggedInUser._id,
        title: request.payload.title,
        description: request.payload.description,
        latitude: request.payload.latitude,
        longitude: request.payload.longitude,
        category: request.payload.category,
        isPrivate: request.payload.isPrivate === "on", // checkbox handling
        images: [], // empty arrays for future stuff
        markers: [],
        reviews: [],
      };
      // Save to DB and refresh dashboard
      await db.poiStore.addPOI(newPOI);
      return h.redirect("/dashboard");
    },
  },

  deletePOI: {
    handler: async function (request, h) {
      // Simple delete by ID
      const poiId = request.params.id;
      await db.poiStore.deletePOI(poiId);
      return h.redirect("/dashboard");
    },
  },

  searchPOIs: {
    handler: async function (request, h) {
      try {
        const query = request.query.query;
        const loggedInUser = request.auth.credentials;

        // Handle empty search
        if (!query) {
          const pois = await db.poiStore.getUserPOIs(loggedInUser._id);
          return h.view("dashboard-view", {
            title: "Dashboard",
            user: loggedInUser,
            pois,
            searchError: "Please enter a search term",
          });
        }

        // Search with visibility filtering
        const filteredPOIs = await db.poiStore.searchPOIs(query, loggedInUser._id);

        // Show results
        return h.view("dashboard-view", {
          title: "Search Results",
          user: loggedInUser,
          pois: filteredPOIs,
          searchQuery: query,
        });
      } catch (error) {
        // Error handling
        console.error("Search error:", error);
        const loggedInUser = request.auth.credentials;
        const pois = await db.poiStore.getUserPOIs(loggedInUser._id);
        return h.view("dashboard-view", {
          title: "Dashboard",
          user: loggedInUser,
          pois,
          searchError: "An error occurred while searching. Please try again.",
        });
      }
    },
  },
};