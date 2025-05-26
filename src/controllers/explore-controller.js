import { db } from "../models/db.js";

export const exploreController = {
  index: {
    handler: async function (request, h) {
      const publicPOIs = await db.poiStore.getPublicPOIs();  // Only public POIs
      const viewData = {
        title: "Explore Public POIs",
        pois: publicPOIs,
      };
      return h.view("explore-view", viewData);
    },
  },
};
