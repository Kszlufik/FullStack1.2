import { discussionJsonStore } from "../models/json/discussion-json-store.js";

export const discussionController = {
  index: {
    handler: async function (request, h) {
      // Get all discussions and show them
      const discussions = await discussionJsonStore.getAllDiscussions();
      return h.view("discussions-view", { title: "Discussions", discussions });
    },
  },

  addMessage: {
    handler: async function (request, h) {
      // Add new message to discussion
      const user = request.auth.credentials;
      const { content } = request.payload;
      await discussionJsonStore.addMessage({
        userId: user._id,
        userName: user.firstName, // using first name for display
        content,
      });
      return h.redirect("/discussions");
    },
  },

  addReply: {
    handler: async function (request, h) {
      // Handle replies to existing messages
      const user = request.auth.credentials;
      const parentId = request.params.id; // gets which message we're replying to
      const replyContent = request.payload.replyContent;

      // Store the reply
      await discussionJsonStore.addReply(parentId, {
        userId: user._id,
        userName: user.firstName,
        content: replyContent,
      });

      return h.redirect("/discussions"); // Refresh the page
    }
  }
};