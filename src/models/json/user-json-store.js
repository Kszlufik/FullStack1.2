import { v4 } from "uuid"; 
import { db } from "./store-utils.js"; 
import bcrypt from "bcrypt"; 

const saltRounds = 10; 

// This object handles all user data operations
export const userJsonStore = {
  // Get all users from the database
  async getAllUsers() {
    await db.read();
    return db.data.users || []; 
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

    //initialize users array if empty
    if (!db.data.users) db.data.users = [];
    db.data.users.push(userToAdd);
    
    try {
      await db.write(); // save to file
      return userToAdd;
    } catch (err) {
      throw new Error("Failed to save user");
    }
  },

  //hash a password securely
  async generateHash(plainText) {
    try {
      const salt = await bcrypt.genSalt(saltRounds); // generate salt
      return await bcrypt.hash(plainText, salt); // hash with salt
    } catch (err) {
      throw new Error("Password hashing failed");
    }
  },

  //find user by ID
  async getUserById(id) {
    await db.read();
    return db.data.users?.find(u => u._id === id) || null; // return null if not found
  },

  // find user by email
  async getUserByEmail(email) {
    await db.read();
    const cleanEmail = email.trim().toLowerCase(); // clean email first
    return db.data.users?.find(u => u.email === cleanEmail) || null;
  },

  // check if password is correct for a user
  async validatePassword(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null; // no user found
    
    //compare entered password with stored hash
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

  // Delete all users
  async deleteAll() {
    db.data.users = []; 
    await db.write(); 
  },

async promoteToAdmin(userId) {
  await db.read();
  const user = db.data.users.find(u => u._id === userId);
  // Only promote if user exists and isn't already admin
  if (user && user.role !== "admin") {
    user.role = "admin";
    await db.write();
    return true;
  }
  // Failed (user doesn't exist or is already admin)
  return false;
},

// adding to favourite method
async addFavorite(userId, poiId) {
  await db.read();
  const user = db.data.users.find(u => u._id === userId);
  if (user) {
    user.favorites = user.favorites || [];
    if (!user.favorites.includes(poiId)) {
      user.favorites.push(poiId);
      await db.write();
    }
  }
},
// removing fav method 
async removeFavorite(userId, poiId) {
  await db.read();
  const user = db.data.users.find(u => u._id === userId);
  if (user?.favorites) {
    user.favorites = user.favorites.filter(id => id !== poiId);
    await db.write();
  }
},
// retrive a favourite poi
async getFavorites(userId) {
  await db.read();
  const user = db.data.users.find(u => u._id === userId);
  return user?.favorites || [];
}

};