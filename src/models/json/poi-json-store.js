import { v4 } from "uuid";
import { db } from "./store-utils.js"; 

export const poiJsonStore = {
  // Get all POIs
  async getAllPOIs() {
    await db.read();
    return db.data.pois || []; 
  },

  // Add a new POI
  async addPOI(poi) {
    await db.read();
    poi._id = v4(); 
    poi.images = []; 
    poi.markers = []; 
    db.data.pois.push(poi); 
    await db.write();
    return poi;
  },

  // Get a POI by ID
  async getPOIById(id) {
    await db.read();
    return db.data.pois.find((poi) => poi._id === id) || null; 
  },

  // Add an image to a POI
  async addImageToPOI(id, imageUrl) {
    await db.read();
    const poi = db.data.pois.find((p) => p._id === id); 
    if (poi) {
      poi.images.push(imageUrl); 
      await db.write();
    }
  },

  // Update a POI
  async updatePOI(id, updatedPOI) {
    await db.read();
    const poi = db.data.pois.find((p) => p._id === id); // Find POI
    if (poi) {
      // Update POI properties
      poi.title = updatedPOI.title;
      poi.category = updatedPOI.category;
      poi.description = updatedPOI.description;
      poi.latitude = updatedPOI.latitude;
      poi.longitude = updatedPOI.longitude;
      poi.images = updatedPOI.images || []; 
      poi.markers = updatedPOI.markers || []; 
      await db.write();
    }
  },

  // Get POI by user ID
  async getUserPOIs(userId) {
    await db.read();
    return db.data.pois.filter((poi) => poi.userId === userId) || []; 
  },

  // Delete a POI by i
  async deletePOI(id) {
    await db.read();
    const index = db.data.pois.findIndex((poi) => poi._id === id); 
    if (index !== -1) {
      db.data.pois.splice(index, 1); 
      await db.write();
    }
  },

  // Delete all POIs
  async deleteAllPOIs() {
    db.data.pois = []; 
    await db.write();
  },

  // Search POIs by query 
  async searchPOIs(query) {
    await db.read();
    const searchQuery = query.toLowerCase(); 
    return db.data.pois.filter((poi) => {
      // Check if title escription or category matches the query
      const titleMatch = poi.title && typeof poi.title === 'string' && poi.title.toLowerCase().includes(searchQuery);
      const descriptionMatch = poi.description && typeof poi.description === 'string' && poi.description.toLowerCase().includes(searchQuery);
      const categoryMatch = poi.category && typeof poi.category === 'string' && poi.category.toLowerCase().includes(searchQuery);
      return titleMatch || descriptionMatch || categoryMatch;
    });
  },
};