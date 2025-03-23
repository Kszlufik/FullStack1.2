import { v4 } from "uuid"; // Import UUID for unique IDs
import { markerMemStore } from "./marker-mem-store.js"; // Import marker store for related operations

let pois = []; 

export const poiMemStore = {
  // Get all POIs
  async getAllPOIs() {
    return pois;
  },

  // Add a new POI
  async addPOI(poi) {
    poi._id = v4();
    pois.push(poi); 
    return poi;
  },

  // Get a playlist by ID 
  async getPlaylistById(id) {
    await db.read();
    let list = db.data.playlists.find((playlist) => playlist._id === id);
    if (list) {
      list.tracks = await trackJsonStore.getTracksByPlaylistId(list._id);
    } else {
      list = null;
    }
    return list;
  },

  // Get POIs by user ID
  async getUserPOIs(userid) {
    return pois.filter((poi) => poi.userid === userid); 
  },

  // Delete a playlist by ID 
  async deletePlaylistById(id) {
    await db.read();
    const index = db.data.playlists.findIndex((playlist) => playlist._id === id);
    if (index !== -1) db.data.playlists.splice(index, 1);
    await db.write();
  },

  // Delete all POIs
  async deleteAllPOIs() {
    pois = []; 
  },
};