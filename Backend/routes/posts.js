const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/post');

// Set up multer storage for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage: storage });

// Route to upload a post
router.post('/upload', upload.single('media'), async (req, res) => {
  try {
    const { username, description } = req.body;
    const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    const mediaPath = req.file.filename;

    const newPost = new Post({ username, description, mediaType, mediaPath });
    await newPost.save();

    res.status(201).json({ message: 'Post uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;