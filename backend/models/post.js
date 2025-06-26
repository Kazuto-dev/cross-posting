const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    postId: { type: String, default: null },        // urn:li:share:...
    activityUrn: { type: String, default: null },   // urn:li:activity:...
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
