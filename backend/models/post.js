const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      required: false, // Allow saving even if LinkedIn doesn't return an ID
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
