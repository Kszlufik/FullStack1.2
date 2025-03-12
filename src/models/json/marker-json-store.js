import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const markerJsonStore = {
  async getAllMarkers() {
    await db.read();
    return db.data.markers;
  },

  async addMarker(poiId, marker) {
    await db.read();
    marker._id = v4();
    marker.poiId = poiId;
    db.data.markers.push(marker);
    await db.write();
    return marker;
  },

  async getMarkersByPOIId(poiId) {
    await db.read();
    const foundMarkers = db.data.markers.filter((marker) => marker.poiId === poiId);
    return foundMarkers.length > 0 ? foundMarkers : null;
  },

  async getMarkerById(id) {
    await db.read();
    return db.data.markers.find((marker) => marker._id === id) || null;
  },

  async deleteMarker(id) {
    await db.read();
    const index = db.data.markers.findIndex((marker) => marker._id === id);
    if (index !== -1) {
      db.data.markers.splice(index, 1);
      await db.write();
    }
  },

  async deleteAllMarkers() {
    db.data.markers = [];
    await db.write();
  },

  async updateMarker(marker, updatedMarker) {
    marker.title = updatedMarker.title;
    marker.description = updatedMarker.description;
    marker.latitude = updatedMarker.latitude;
    marker.longitude = updatedMarker.longitude;
    await db.write();
  },
};
