import { v4 } from "uuid";
import { markerMemStore } from "./marker-mem-store.js";

let pois = [];

export const poiMemStore = {
  // Get all POIs
  async getAllPOIs() {
    return pois;
  },

  // Add a new POI
  async addPOI(poi) {
    poi._id = v4();
    poi.images = [];
    poi.markers = [];
    poi.reviews = [];
    poi.isPrivate = !!poi.isPrivate; // Ensure boolean
    pois.push(poi);
    return poi;
  },

  // Get POI by ID
  async getPOIById(id) {
    const poi = pois.find((poi) => poi._id === id);
    if (poi) {
      poi.markers = await markerMemStore.getMarkersByPOIId(poi._id);
      return poi;
    }
    return null;
  },

  // Get POIs by user ID
  async getUserPOIs(userId) {
    return pois.filter((poi) => poi.userId === userId);
  },

  // Search POIs with visibility control
  async searchPOIs(query, userId) {
    const searchTerm = query.toLowerCase();
    return pois.filter((poi) => {
      const titleMatch = poi.title?.toLowerCase().includes(searchTerm);
      const descriptionMatch = poi.description?.toLowerCase().includes(searchTerm);
      const categoryMatch = poi.category?.toLowerCase().includes(searchTerm);
      const matchesSearch = titleMatch || descriptionMatch || categoryMatch;
      const isVisible = !poi.isPrivate || poi.userId === userId;
      return matchesSearch && isVisible;
    });
  },

  // Delete POI by ID
  async deletePOIById(id) {
    const index = pois.findIndex((poi) => poi._id === id);
    if (index !== -1) pois.splice(index, 1);
  },

  // Delete all POIs
  async deleteAllPOIs() {
    pois = [];
  },

  // Get public POIs
  async getPublicPOIs() {
    return pois.filter((poi) => poi.isPrivate === false);
  },

  // Add review to POI
  async addReviewToPOI(poiId, review) {
    const poi = pois.find((p) => p._id === poiId);
    if (poi) {
      review._id = v4();
      review.timestamp = new Date().toISOString();
      poi.reviews = poi.reviews || [];
      poi.reviews.push(review);
    }
  },

  // Update POI
  async updatePOI(id, updatedPOI) {
    const poi = pois.find((p) => p._id === id);
    if (poi) {
      poi.title = updatedPOI.title;
      poi.category = updatedPOI.category;
      poi.description = updatedPOI.description;
      poi.latitude = updatedPOI.latitude;
      poi.longitude = updatedPOI.longitude;
      poi.images = updatedPOI.images || [];
      poi.markers = updatedPOI.markers || [];
      poi.reviews = updatedPOI.reviews || poi.reviews || [];
    }
  },
};