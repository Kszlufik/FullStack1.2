import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Boom from "@hapi/boom";
import { db } from "../models/db.js";

export const poiController = {
  viewPOI: {
    handler: async function (request, h) {
      const poi = await db.poiStore.getPOIById(request.params.id);
      if (!poi) {
        return Boom.notFound("POI not found");
      }
      return h.view("poi-view", { poi });
    },
  },

  // Function responsible for adding a marker to the existing POI
  addMarker: {
    handler: async function (request, h) {
      try {
        const poi = await db.poiStore.getPOIById(request.params.id);
        if (!poi) {
          return Boom.notFound("POI not found");
        }

        // Ensure the markers array exists
        poi.markers = poi.markers || [];

        // Extract form data
        const { title, description, latitude, longitude, image } = request.payload;

        // Handle file upload (if an image is provided)
        let imageUrl = null;
        if (image && image.hapi) {
          const filename = `${uuidv4()}-${image.hapi.filename}`;
          const uploadPath = path.join("public/uploads", filename);

          // Ensure the uploads directory exists
          if (!fs.existsSync("public/uploads")) {
            fs.mkdirSync("public/uploads", { recursive: true });
          }

          // Save file
          const fileStream = fs.createWriteStream(uploadPath);
          await new Promise((resolve, reject) => {
            image.pipe(fileStream);
            image.on("end", resolve);
            image.on("error", reject);
          });

          imageUrl = `/uploads/${filename}`;
        }

        const newMarker = {
          id: uuidv4(),
          title: title,
          description: description,
          latitude: Number(latitude),
          longitude: Number(longitude),
          image: imageUrl, // Save image path if uploaded
        };

        // Add the new marker to the POI
        poi.markers.push(newMarker);

        // Update the POI in the database
        await db.poiStore.updatePOI(poi._id, poi);

        // Redirect back to the POI details page
        return h.redirect(`/poi/${poi._id}`);
      } catch (error) {
        console.error("Error adding marker:", error);
        return Boom.badImplementation("An error occurred while adding the marker.");
      }
    },
  },

  deleteMarker: {
    handler: async function (request, h) {
      const poi = await db.poiStore.getPOIById(request.params.id);
      if (!poi) {
        return Boom.notFound("POI not found");
      }
      poi.markers = poi.markers.filter(marker => marker.id !== request.params.markerid);
      await db.poiStore.updatePOI(poi._id, poi);
      return h.redirect(`/poi/${poi._id}`);
    },
  },

  // The handler receives the POI by ID using .getPOIById function
  uploadImage: {
    handler: async function (request, h) {
      try {
        const poi = await db.poiStore.getPOIById(request.params.id);
        if (!poi) {
          return Boom.notFound("POI not found");
        }

        // The uploaded file is accessed by requesting the image
        const file = request.payload.image;
        if (!file || !file.hapi) {
          return Boom.badRequest("No file uploaded");
        }

        // We specify allowed file types
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.hapi.headers["content-type"])) {
          return Boom.unsupportedMediaType("Invalid file type. Only JPG, PNG, and GIF are allowed.");
        }

        // Generate unique filename
        const filename = `${uuidv4()}-${file.hapi.filename}`;
        const uploadPath = path.join("public/uploads", filename); // Specify the file path for the uploads

        // If the file directory for file uploads does not exist, create it
        if (!fs.existsSync("public/uploads")) {
          fs.mkdirSync("public/uploads", { recursive: true });
        }

        // Save file
        const fileStream = fs.createWriteStream(uploadPath);
        await new Promise((resolve, reject) => {
          file.pipe(fileStream);
          file.on("end", resolve);
          file.on("error", reject);
        });

        // Save image link in POI
        poi.images = poi.images || [];
        poi.images.push(`/uploads/${filename}`);

        // Update the POI with the new image
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
      maxBytes: 10 * 1024 * 1024, // Limit file size to 10MB
    },
  },
};