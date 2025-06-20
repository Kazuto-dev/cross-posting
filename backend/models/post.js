const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: String,
  authorId: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
