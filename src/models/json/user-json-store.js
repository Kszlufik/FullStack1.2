import { v4 } from "uuid"; 
import { db } from "./store-utils.js"; 
import bcrypt from "bcrypt"; 

const saltRounds = 10; 

// This object handles all user data operations
export const userJsonStore = {
  // Get all users from the database
  async getAllUsers() {
    await db.read();
    return db.data.users || []; // return empty array if no users
  },

  // Add a new user
  async addUser(user) {
    await db.read();
    
    // Create new user object with cleaned-up data
    const userToAdd = {
      _id: v4(), // random ID
      firstName: user.firstName.trim(), // clean up whitespace due to an issue encountered
      lastName: user.lastName.trim(),
      email: user.email.trim().toLowerCase(), 
      password: await this.generateHash(user.password.trim()) // hash the password
    };

    // Initialize users array if empty
    if (!db.data.users) db.data.users = [];
    db.data.users.push(userToAdd);
    
    try {
      await db.write(); // save to file
      return userToAdd;
    } catch (err) {
      throw new Error("Failed to save user");
    }
  },

  // Hash a password securely
  async generateHash(plainText) {
    try {
      const salt = await bcrypt.genSalt(saltRounds); // generate salt
      return await bcrypt.hash(plainText, salt); // hash with salt
    } catch (err) {
      throw new Error("Password hashing failed");
    }
  },

  // Find user by ID
  async getUserById(id) {
    await db.read();
    return db.data.users?.find(u => u._id === id) || null; // return null if not found
  },

  // Find user by email
  async getUserByEmail(email) {
    await db.read();
    const cleanEmail = email.trim().toLowerCase(); // clean email first
    return db.data.users?.find(u => u.email === cleanEmail) || null;
  },

  // Check if password is correct for a user
  async validatePassword(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null; // no user found
    
    // Compare entered password with stored hash
    const match = await bcrypt.compare(password.trim(), user.password);
    return match ? user : null; // return user if password matches
  },

  // Delete a user by ID
  async deleteUserById(id) {
    await db.read();
    const index = db.data.users?.findIndex(u => u._id === id) ?? -1;
    if (index !== -1) {
      db.data.users.splice(index, 1); // remove from array
      await db.write(); // save changes
    }
  },

  // Delete all users (reset)
  async deleteAll() {
    db.data.users = []; 
    await db.write(); 
  }
};