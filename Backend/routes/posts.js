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
    // Check if authorization header is present
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    // Split the authorization header and get the token
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split(' ')[1];

    // Check if token is present
    if (!token) {
        return res.status(401).json({ message: 'Token is missing in the authorization header' });
    }


    const { description } = req.body;

    const decodedToken = parseJWT(req.headers.authorization.split(' ')[1]);
    console.log('Decoded Token:', decodedToken);
    const username = `${decodedToken.firstName}${decodedToken.lastName}`;
    console.log('Decoded username:', username);
    const user = await User.findOne({ username });

    const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    const media = req.file.filename;

    // Create a new post

    const newPost = new Post({ username: decodedToken.username, description, mediaType, media });

    // Save the post to the database
    await newPost.save();

    user.posts.push(newPost);
    await user.save();

    res.status(201).json({ message: 'Post uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;