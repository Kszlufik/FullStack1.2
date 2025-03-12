import { v4 } from "uuid";
import { markerMemStore } from "./marker-mem-store.js";


let pois = [];

export const poiMemStore = {
  
  async getAllPOIs() {
    return pois;
  },

  
  async addPOI(poi) {
    poi._id = v4();
    pois.push(poi);
    return poi;
  },

  
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

  
  async getUserPOIs(userid) {
    return pois.filter((poi) => poi.userid === userid);
  },

  
  async deletePlaylistById(id) {
    await db.read();
    const index = db.data.playlists.findIndex((playlist) => playlist._id === id);
    if (index !== -1) db.data.playlists.splice(index, 1);
    await db.write();
  },

  
  async deleteAllPOIs() {
    pois = [];
  },
};
