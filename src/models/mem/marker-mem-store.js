import { v4 } from "uuid"; // Import UUID for unique IDs

let markers = []; // Array to store markers

export const markerMemStore = {
  // Get all markers
  async getAllMarkers() {
    return markers;
  },

  // Add a new marker
  async addMarker(poiId, marker) {
    marker._id = v4(); 
    marker.poiId = poiId; 
    markers.push(marker); 
    return marker;
  },

  // Get markers by POI ID
  async getMarkersByPOIId(poiId) {
    return markers.filter((marker) => marker.poiId === poiId) || null;
  },

  // Get a marker by its ID
  async getMarkerById(id) {
    return markers.find((marker) => marker._id === id) || null;
  },

  // Delete a marker by its ID
  async deleteMarker(id) {
    const index = markers.findIndex((marker) => marker._id === id);
    if (index !== -1) markers.splice(index, 1); 
  },

  // Delete all markers
  async deleteAllMarkers() {
    markers = []; 
  },
};
