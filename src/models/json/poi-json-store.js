import { v4 } from "uuid";
import { db } from "./store-utils.js";
import { markerJsonStore } from "./marker-json-store.js";

//This handles all the point of interest stuff
export const poiJsonStore = {
  async getAllPOIs() {
    await db.read();
    return db.data.pois || [];
  },

  //add new POI
  async addPOI(poi) {
    await db.read();
    poi._id = v4(); // Give it an ID
    poi.images = []; 
    poi.markers = [];
    poi.reviews = [];
    
    //make sure isPrivate is true/false
    poi.isPrivate = !!poi.isPrivate;

    db.data.pois.push(poi);
    await db.write();
    return poi;
  },

  //get POI by ID
  async getPOIById(id) {
    await db.read();
    const poi = db.data.pois.find((poi) => poi._id === id) || null;
    if (poi) {
      // Get markers for this POI
      const markers = await markerJsonStore.getMarkersByPOIId(id);
      poi.markers = markers.filter((m) => m != null); 
    }
    return poi;
  },

  // get POIs by user
  async getUserPOIs(userId) {
    await db.read();
    return db.data.pois.filter((poi) => poi.userId === userId) || [];
  },

  //search POIs
  async searchPOIs(query, userId) {
    await db.read();
    const searchTerm = query.toLowerCase();
    return db.data.pois.filter((poi) => {
      //check if matches search
      const titleMatch = poi.title?.toLowerCase().includes(searchTerm);
      const descriptionMatch = poi.description?.toLowerCase().includes(searchTerm);
      const categoryMatch = poi.category?.toLowerCase().includes(searchTerm);
      const matchesSearch = titleMatch || descriptionMatch || categoryMatch;
      
      //check visibility
      const isVisible = !poi.isPrivate || poi.userId === userId;
      
      return matchesSearch && isVisible;
    });
  },

  //delete POI
  async deletePOIById(id) {
    await db.read();
    const index = db.data.pois.findIndex((poi) => poi._id === id);
    if (index !== -1) {
      db.data.pois.splice(index, 1);
      await db.write();
    }
  },

  //delete all pOIs
  async deleteAllPOIs() {
    db.data.pois = [];
    await db.write();
  },

  //get public pOIs only
  async getPublicPOIs() {
    await db.read();
    return db.data.pois.filter((poi) => poi.isPrivate === false);
  },

  //add review to POI
  async addReviewToPOI(poiId, review) {
    await db.read();
    const poi = db.data.pois.find((p) => p._id === poiId);
    if (poi) {
      review._id = v4();
      review.timestamp = new Date().toISOString();
      poi.reviews = poi.reviews || [];
      poi.reviews.push(review);
      await db.write();
    }
  },

  //update POI info
  async updatePOI(id, updatedPOI) {
    await db.read();
    const poi = db.data.pois.find((p) => p._id === id);
    if (poi) {
      //update all the fields
      poi.title = updatedPOI.title;
      poi.category = updatedPOI.category;
      poi.description = updatedPOI.description;
      poi.latitude = updatedPOI.latitude;
      poi.longitude = updatedPOI.longitude;
      poi.images = updatedPOI.images || [];
      poi.markers = updatedPOI.markers || [];
      poi.reviews = updatedPOI.reviews || poi.reviews || [];
      await db.write();
    }
  },
};