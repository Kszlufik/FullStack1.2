import { userJsonStore } from "../models/json/user-json-store.js";
import { poiJsonStore } from "../models/json/poi-json-store.js";

export const favoritesController = {
  toggleFavorite: {
    auth: { strategy: "session" }, //requires logged-in user
    handler: async function(request, h) {
      //get current user and poi id from request
      const userId = request.auth.credentials._id;
      const poiId = request.params.id;
      
      //ceck if poi is already a favorite
      const user = await userJsonStore.getUserById(userId);
      const isFavorite = user.favorites?.includes(poiId);
      
      //toggle favorite status
      if (isFavorite) {
        await userJsonStore.removeFavorite(userId, poiId); // Remove if exists
      } else {
        await userJsonStore.addFavorite(userId, poiId); // Add if new
      }
      
      //refresh poi page
      return h.redirect(`/poi/${poiId}`);
    }
  },

  listFavorites: {
    auth: { strategy: "session" }, 
    handler: async function(request, h) {
      //get user's favorite POI IDs
      const userId = request.auth.credentials._id;
      const favoriteIds = await userJsonStore.getFavorites(userId);
      
      //get back full details
      const favorites = await Promise.all(
        favoriteIds.map(id => poiJsonStore.getPOIById(id))
      );
      
      // render fav page
      return h.view("favorites-view", {
        title: "My Favorites",
        pois: favorites.filter(poi => poi) 
      });
    }
  }
};