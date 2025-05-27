import { userJsonStore } from "../models/json/user-json-store.js";
import Boom from "@hapi/boom";

export const adminController = {
  usersPage: {
    auth: { strategy: "session", scope: "admin" }, // Admin access only
    handler: async (request, h) => {
      const users = await userJsonStore.getAllUsers();
      return h.view("admin-users-view", {
        title: "User Administration",
        users: users.map(user => ({
          ...user,
          isCurrentUser: user._id === request.auth.credentials._id, // Highlight current user
          isAdmin: user.role === "admin" // Check admin status
        })),
        currentUser: request.auth.credentials
      });
    }
  },

  deleteUser: {
    auth: { strategy: "session", scope: "admin" }, // Admin access only
    handler: async (request, h) => {
      // Prevent self-deletion
      if (request.params.id === request.auth.credentials._id) {
        throw Boom.forbidden("You cannot delete your own account");
      }
      await userJsonStore.deleteUserById(request.params.id);
      return h.redirect("/admin/users");
    }
  },
//promote user to admin 
promoteUser: {
  auth: { strategy: "session", scope: "admin" }, //veryfi identity make sure its admin 
  handler: async (request, h) => {
    const targetUserId = request.params.id;
    const success = await userJsonStore.promoteToAdmin(targetUserId);
    if (!success) {
      throw Boom.badRequest("User not found or already admin");
    }
    return h.redirect("/admin/users");
  }
}
};