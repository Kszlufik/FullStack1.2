// Import UUID library to generate unique IDs
import { v4 } from "uuid";

// Initialize an empty array to store users in memory
let users = [];

// Create an object to manage user data in memory
export const userMemStore = {
  async getAllUsers() {
    return users;
  },

  // Add a new user to memory
  async addUser(user) {
    user._id = v4(); 
    users.push(user); 
    return user; 
  },

  // Find a user by their ID
  async getUserById(id) {
    let u = users.find((user) => user._id === id); 
    if (u === undefined) u = null; 
    return u;
  },

  // Find a user by email address
  async getUserByEmail(email) {
    let u = users.find((user) => user.email === email); 
    if (u === undefined) u = null; 
    return u;
  },

  // Remove a user by ID
  async deleteUserById(id) {
    const index = users.findIndex((user) => user._id === id); // Find position
    if (index !== -1) users.splice(index, 1); 
  },

  // Clear all users 
  async deleteAll() {
    users = [];
  },
};