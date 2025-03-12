import { v4 } from "uuid";

let markers = [];

export const markerMemStore = {
  async getAllMarkers() {
    return markers;
  },

  async addMarker(poiId, marker) {
    marker._id = v4();
    marker.poiId = poiId;
    markers.push(marker);
    return marker;
  },

  async getMarkersByPOIId(poiId) {
    const foundMarkers = markers.filter((marker) => marker.poiId === poiId);
    return foundMarkers.length > 0 ? foundMarkers : null;
  },

  async getMarkerById(id) {
    return markers.find((marker) => marker._id === id) || null;
  },

  async deleteMarker(id) {
    const index = markers.findIndex((marker) => marker._id === id);
    if (index !== -1) {
      markers.splice(index, 1);
    }
  },

  async deleteAllMarkers() {
    markers = [];
  },
};
