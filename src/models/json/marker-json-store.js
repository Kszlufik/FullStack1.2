import { v4 } from "uuid"; // Import UUID for unique IDs
import { db } from "./store-utils.js"; // Import database utility

export const markerJsonStore = {
  // Get all markers
  async getAllMarkers() {
    await db.read();
    return db.data.markers; 
  },

  // Add a new marker
  async addMarker(poiId, marker) {
    await db.read();
    marker._id = v4(); 
    marker.poiId = poiId; 
    db.data.markers.push(marker); 
    await db.write();
    return marker;
  },

  // Get markers by POI ID
  async getPOIById(id) {
  await db.read();
  const poi = db.data.pois.find((poi) => poi._id === id) || null;
  if (poi) {
    const markers = await markerJsonStore.getMarkersByPOIId(id);
    poi.markers = (markers || []).filter((m) => m != null);
  }
  return poi;
},

async getMarkersByPOIId(poiId) {
  await db.read();
  return (db.data.markers || []).filter((marker) => marker.poiId === poiId);
},

  // Get a marker by ID
  async getMarkerById(id) {
    await db.read();
    return db.data.markers.find((marker) => marker._id === id) || null;
  },

  // Delete a marker by ID
  async deleteMarker(id) {
    await db.read();
    const index = db.data.markers.findIndex((marker) => marker._id === id); 
    if (index !== -1) {
      db.data.markers.splice(index, 1); 
      await db.write();
    }
  },

  // Delete all markers
  async deleteAllMarkers() {
    db.data.markers = []; 
    await db.write();
  },

  // Update a marker
  async updateMarker(marker, updatedMarker) {
    marker.title = updatedMarker.title; 
    marker.description = updatedMarker.description; 
    marker.latitude = updatedMarker.latitude; 
    marker.longitude = updatedMarker.longitude; 
    await db.write();
  },
};