import { db } from "../models/db.js"; // Import database utility

export const dashboardController = {
  // Render the dashboard
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials; // Get logged-in user
      const pois = await db.poiStore.getUserPOIs(loggedInUser._id); // Get pois for the user

      const viewData = {
        title: "Dashboard",
        user: loggedInUser,
        pois: pois || [], // Pass POIs or empty array
      };

      return h.view("dashboard-view", viewData); // Render dashboard view
    },
  },

  // Add a new POI
  addPOI: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials; // Get logged-in user
      const newPOI = {
        userId: loggedInUser._id, // Associate POI with user
        title: request.payload.title,
        category: request.payload.category,
        description: request.payload.description,
        latitude: Number(request.payload.latitude), 
        longitude: Number(request.payload.longitude), 
      };

      await db.poiStore.addPOI(newPOI); // Add POI to database
      return h.redirect("/dashboard"); // Redirect to dashboard
    },
  },

  // Delete a POI
  deletePOI: {
    handler: async function (request, h) {
      await db.poiStore.deletePOI(request.params.id); // Delete POI by ID
      return h.redirect("/dashboard"); // Redirect to dashboard
    },
  },

  // Search POIs
  searchPOIs: {
    handler: async function (request, h) {
      try {
        const query = request.query.query; // Get search query
        if (!query) {
          // If no query, show error
          const loggedInUser = request.auth.credentials;
          const pois = await db.poiStore.getUserPOIs(loggedInUser._id);

          const viewData = {
            title: "Dashboard",
            user: loggedInUser,
            pois: pois || [],
            searchError: "Please enter a search term", // Error message
          };

          return h.view("dashboard-view", viewData); // Render dashboard with error
        }

        // Perform search
        const filteredPOIs = await db.poiStore.searchPOIs(query); // Search POIs
        const loggedInUser = request.auth.credentials;

        const viewData = {
          title: "Search Results",
          user: loggedInUser,
          pois: filteredPOIs, 
          searchQuery: query, 
        };

        return h.view("dashboard-view", viewData); // Render dashboard with results
      } catch (error) {
        console.error("Search error:", error);

        // Handle search error
        const loggedInUser = request.auth.credentials;
        const pois = await db.poiStore.getUserPOIs(loggedInUser._id);

        const viewData = {
          title: "Dashboard",
          user: loggedInUser,
          pois: pois || [],
          searchError: "An error occurred while searching. Please try again.", 
        };

        return h.view("dashboard-view", viewData); 
      }
    },
  },
};