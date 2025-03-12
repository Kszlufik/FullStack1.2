import { userJsonStore } from "./json/user-json-store.js";
import { poiJsonStore } from "./json/poi-json-store.js";
import { markerJsonStore } from "./json/marker-json-store.js";

export const db = {
  userStore: null,
  poiStore: null,
  markerStore: null,

  init(storeType) {
    if (storeType === "json") {
      this.userStore = userJsonStore;
      this.poiStore = poiJsonStore;
      this.markerStore = markerJsonStore;
    } else {
      console.error(" ERROR: Invalid store type. Please use 'json'.");
      process.exit(1); 
    }
  },
};
