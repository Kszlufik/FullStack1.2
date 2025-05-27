import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { poiJsonStore } from '../models/json/poi-json-store.js';
import { userJsonStore } from '../models/json/user-json-store.js';


export const poiController = {
  //view a specific POI favourites included 
viewPOI: {
  auth: { strategy: "session" },
  handler: async function(request, h) {
    const poi = await poiJsonStore.getPOIById(request.params.id);
    const userId = request.auth.credentials._id;
    const user = await userJsonStore.getUserById(userId);
    const isFavorite = user.favorites?.includes(poi._id);
    
    return h.view("poi-view", {
      title: poi.name,
      poi: poi,
      isFavorite: isFavorite
    });
  }
},
  //dd a marker to a POI
  addMarker: {
    handler: async function (request, h) {
      try {
        const poi = await db.poiStore.getPOIById(request.params.id);
        if (!poi) return Boom.notFound("POI not found");

        poi.markers = poi.markers || [];

        const { title, description, latitude, longitude, image } = request.payload;

        let imageUrl = null;

        //handle image upload
        if (image && image.hapi) {
          const filename = `${uuidv4()}-${image.hapi.filename}`;
          const uploadPath = path.join("public/uploads", filename);
          if (!fs.existsSync("public/uploads")) fs.mkdirSync("public/uploads", { recursive: true });

          const fileStream = fs.createWriteStream(uploadPath);
          await new Promise((resolve, reject) => {
            image.pipe(fileStream);
            image.on("end", resolve);
            image.on("error", reject);
          });

          imageUrl = `/uploads/${filename}`;
        }

        //create and add marker
        const newMarker = {
          id: uuidv4(),
          title,
          description,
          latitude: Number(latitude),
          longitude: Number(longitude),
          image: imageUrl,
        };

        poi.markers.push(newMarker);
        await db.poiStore.updatePOI(poi._id, poi);

        return h.redirect(`/poi/${poi._id}`);
      } catch (error) {
        console.error("Error adding marker:", error);
        return Boom.badImplementation("An error occurred while adding the marker.");
      }
    },
  },

  //delete a marker from a POI
  deleteMarker: {
    handler: async function (request, h) {
      const poi = await db.poiStore.getPOIById(request.params.id);
      if (!poi) return Boom.notFound("POI not found");

      poi.markers = poi.markers.filter(marker => marker.id !== request.params.markerid);
      await db.poiStore.updatePOI(poi._id, poi);
      return h.redirect(`/poi/${poi._id}`);
    },
  },

  //upload image to a POI
  uploadImage: {
    handler: async function (request, h) {
      try {
        const poi = await db.poiStore.getPOIById(request.params.id);
        if (!poi) return Boom.notFound("POI not found");

        const file = request.payload.image;
        if (!file || !file.hapi) return Boom.badRequest("No file uploaded");

        // Check image type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.hapi.headers["content-type"])) {
          return Boom.unsupportedMediaType("Invalid file type. Only JPG, PNG, and GIF are allowed.");
        }

        // Save image
        const filename = `${uuidv4()}-${file.hapi.filename}`;
        const uploadPath = path.join("public/uploads", filename);
        if (!fs.existsSync("public/uploads")) fs.mkdirSync("public/uploads", { recursive: true });

        const fileStream = fs.createWriteStream(uploadPath);
        await new Promise((resolve, reject) => {
          file.pipe(fileStream);
          file.on("end", resolve);
          file.on("error", reject);
        });

        // Add image to POI
        poi.images = poi.images || [];
        poi.images.push(`/uploads/${filename}`);
        await db.poiStore.updatePOI(poi._id, poi);

        return h.redirect(`/poi/${poi._id}`);
      } catch (error) {
        console.error("Image upload error:", error);
        return Boom.badImplementation("An error occurred while uploading the image.");
      }
    },
    payload: {
      output: "stream",
      parse: true,
      multipart: true,
      maxBytes: 10 * 1024 * 1024,
    },
  },

  //add a new POI
  addPOI: {
    handler: async function (request, h) {
      try {
        console.log("Form payload:", request.payload);
        const { title, category, description, latitude, longitude, isPrivate } = request.payload;

        const newPOI = {
          title,
          category,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          isPrivate: isPrivate === "on",
          markers: [],
          images: [],
          reviews: [],
        };

        const addedPOI = await db.poiStore.addPOI(newPOI);
        return h.redirect(`/poi/${addedPOI._id}`);
      } catch (error) {
        console.error("Error adding POI:", error);
        return Boom.badImplementation("An error occurred while adding the POI.");
      }
    },
  },

  //add a review to a POI
  addReview: {
    handler: async function (request, h) {
      try {
        const poiId = request.params.id;
        const user = request.auth.credentials;
        const poi = await db.poiStore.getPOIById(poiId);
        if (!poi) return Boom.notFound("POI not found");

        const review = {
          _id: uuidv4(),
          userId: user._id,
          username: `${user.firstName} ${user.lastName}`,
          rating: Number(request.payload.rating),
          comment: request.payload.comment,
          createdAt: new Date().toISOString(),
        };

        poi.reviews = poi.reviews || [];
        poi.reviews.push(review);
        await db.poiStore.updatePOI(poiId, poi);

        return h.redirect(`/poi/${poiId}`);
      } catch (error) {
        console.error("Error adding review:", error);
        return Boom.badImplementation("An error occurred while adding the review.");
      }
    },
  },

  // Show edit form for a review
  showEditReview: {
    handler: async function (request, h) {
      const { id, reviewid } = request.params;
      const poi = await db.poiStore.getPOIById(id);
      const review = poi?.reviews?.find(r => r._id === reviewid);

      //only allow user to edit their own review
      if (!review || review.userId !== request.auth.credentials.id) {
        return h.redirect(`/poi/${id}`);
      }

      return h.view("edit-review-view", {
        title: "Edit Review",
        poi,
        review
      });
    }
  },

  //update a review
  updateReview: {
    handler: async function (request, h) {
      const poiId = request.params.id;
      const reviewId = request.params.reviewid;
      const userId = request.auth.credentials.id;

      const poi = await db.poiStore.getPOIById(poiId);
      if (!poi) return Boom.notFound("POI not found");

      const review = poi.reviews.find(r => r._id === reviewId);
      if (!review) return Boom.notFound("Review not found");

      if (review.userId !== userId) return Boom.forbidden("You are not allowed to edit this review");

      //pdate review data
      review.rating = Number(request.payload.rating);
      review.comment = request.payload.comment;
      await db.poiStore.updatePOI(poiId, poi);

      return h.redirect(`/poi/${poiId}`);
    }
  },

  //delete a review
  deleteReview: {
    handler: async function (request, h) {
      const poiId = request.params.id;
      const reviewId = request.params.reviewid;
      const poi = await db.poiStore.getPOIById(poiId);
      if (!poi) return Boom.notFound("POI not found");

      //only delete if review belongs to the current user
      const index = poi.reviews.findIndex(r => r._id === reviewId);
      if (index !== -1 && poi.reviews[index].userId === request.auth.credentials.id) {
        poi.reviews.splice(index, 1);
        await db.poiStore.updatePOI(poiId, poi);
      }

      return h.redirect(`/poi/${poiId}`);
    }
  }
};
