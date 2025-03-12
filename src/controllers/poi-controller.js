import { db } from "../models/db.js";
import { MarkerSpec } from "../models/joi-schemas.js";

export const poiController = {
  index: {
    handler: async function (request, h) {
      const poi = await db.poiStore.getPOIById(request.params.id);
      
      if (!poi) {
        return h.view("error", { message: "POI not found" }).code(404);
      }
      
      const markers = await db.markerStore.getMarkersByPOIId(poi._id);
      
      const viewData = {
        title: "POI Details",
        poi: poi,
        markers: markers || [], // Ensure markers is an array even if empty
      };

      return h.view("poi-view", viewData);
    },
  },

  addMarker: {
    validate: {
      payload: MarkerSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h
          .view("poi-view", {
            title: "Add Marker Error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const poi = await db.poiStore.getPOIById(request.params.id);
      
      if (!poi) {
        return h.view("error", { message: "POI not found" }).code(404);
      }

      const newMarker = {
        title: request.payload.title,
        description: request.payload.description,
        latitude: Number(request.payload.latitude),
        longitude: Number(request.payload.longitude),
      };

      await db.markerStore.addMarker(poi._id, newMarker);
      return h.redirect(`/poi/${poi._id}`);
    },
  },

  deleteMarker: {
    handler: async function (request, h) {
      const poi = await db.poiStore.getPOIById(request.params.id);

      if (!poi) {
        return h.view("error", { message: "POI not found" }).code(404);
      }

      await db.markerStore.deleteMarker(request.params.markerid);
      return h.redirect(`/poi/${poi._id}`);
    },
  },
};
