import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const poiJsonStore = {
  async getAllPOIs() {
    await db.read();
    return db.data.pois || [];
  },

  async addPOI(poi) {
    await db.read();
    poi._id = v4(); // Generate unique ID for the POI
    db.data.pois.push(poi);
    await db.write();
    return poi;
  },

  async getPOIById(id) {
    await db.read();
    return db.data.pois.find((poi) => poi._id === id) || null;
  },

  async getUserPOIs(userId) {  
    await db.read();
    return db.data.pois.filter((poi) => poi.userId === userId) || [];
  },

  async deletePOI(id) {
    await db.read();
    const index = db.data.pois.findIndex((poi) => poi._id === id);
    if (index !== -1) {
      db.data.pois.splice(index, 1);
      await db.write();
    }
  },

  async deleteAllPOIs() {
    db.data.pois = [];
    await db.write();
  },

  async updatePOI(id, updatedPOI) {
    await db.read();
    const poi = db.data.pois.find((p) => p._id === id);
    if (poi) {
      poi.title = updatedPOI.title;
      poi.description = updatedPOI.description;
      poi.latitude = updatedPOI.latitude;
      poi.longitude = updatedPOI.longitude;
      await db.write();
    }
  },
};
