import { v4 } from "uuid"; // Import UUID for unique IDs
import { db } from "./store-utils.js"; // Import database utility

export const userJsonStore = {
  // Get all users
  async getAllUsers() {
    await db.read();
    return db.data.users;
  },

  // Add a new user
  async addUser(user) {
    await db.read();
    user._id = v4(); 
    db.data.users.push(user); 
    await db.write();
    return user;
  },

  // Get a user by ID
  async getUserById(id) {
    await db.read();
    if (!id) return null; 
    return db.data.users.find((user) => user._id === id) || null; 
  },

  // Get a user by email
  async getUserByEmail(email) {
    await db.read();
    return db.data.users.find((user) => user.email === email) || null; 
  },

  // Delete a user by ID
  async deleteUserById(id) {
    await db.read();
    const index = db.data.users.findIndex((user) => user._id === id); 
    if (index !== -1) db.data.users.splice(index, 1); 
    await db.write();
  },

  // Delete all users
  async deleteAll() {
    db.data.users = []; 
    await db.write();
  },
};