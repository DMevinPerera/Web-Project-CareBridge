const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    profilePicture: { type: String, required: true },
    username: { type: String, required: true },
    description: { type: String, required: true },
    media: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    
  });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;