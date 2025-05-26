// Import stuff we need
import { v4 as uuid } from "uuid";
import { db } from "./store-utils.js";

// Main store for discussion data
export const discussionJsonStore = {
  // Get all discussions
  async getAllDiscussions() {
    await db.read();
    return db.data.discussions || [];
  },

  // Add new discussion post
  async addMessage(message) {
    await db.read();
    message._id = uuid();
    message.replies = [];
    message.timestamp = new Date().toISOString();
    db.data.discussions = db.data.discussions || [];
    db.data.discussions.push(message);
    await db.write();
    return message;
  },

  // Add reply to post or another reply
  async addReply(parentId, reply) {
    await db.read();

    // Find the parent post/reply
    const discussion = db.data.discussions.find(d =>
      d._id === parentId || this.findReplyById(d.replies, parentId)
    );

    if (!discussion) return;

    reply._id = uuid();
    reply.timestamp = new Date().toISOString();

    // Add to main discussion
    if (discussion._id === parentId) {
      discussion.replies.push(reply);
    } 
    // Add to nested reply
    else {
      const parentReply = this.findReplyById(discussion.replies, parentId);
      parentReply.replies = parentReply.replies || [];
      parentReply.replies.push(reply);
    }

    await db.write();
  },

  // Helper to find reply in nested structure
  findReplyById(replies, id) {
    for (const reply of replies) {
      if (reply._id === id) return reply;
      if (reply.replies?.length) {
        const found = this.findReplyById(reply.replies, id);
        if (found) return found;
      }
    }
    return null;
  }
};