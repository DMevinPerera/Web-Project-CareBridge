const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    media: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;