import Joi from "joi"; // Import Joi for validation

// Schema for user details
export const UserSpec = {
  firstName: Joi.string().required(), 
  lastName: Joi.string().required(), 
  email: Joi.string().email().required(), 
  password: Joi.string().required(), 
};

// Schema for user login credentials
export const UserCredentialsSpec = {
  email: Joi.string().email().required(), 
  password: Joi.string().required(), 
};

// Schema for Point of Interest (POI) details
export const POISpec = {
  title: Joi.string().required(), 
  description: Joi.string().required(), 
  latitude: Joi.number().required(), 
  longitude: Joi.number().required(), 
};

// Schema for Marker details
export const MarkerSpec = {
  title: Joi.string().required(), 
  description: Joi.string().required(), 
  latitude: Joi.number().required(), 
  longitude: Joi.number().required(), 
};