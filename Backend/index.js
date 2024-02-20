const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the MongoDB connection setup
const User = require('./models/User'); // Import the User model
const cors = require('cors');
const app = express();
const multer = require('multer');
const path = require('path');
const Post = require('./models/posts')

app.use(cors());


const port = 3000;

// In-memory storage for simplicity
const users = [];

app.use(bodyParser.json());


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

// Signup endpoint
app.post('/signup',upload.single('profilePicture'), async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
          return res.status(400).json({ message: 'User with this email already exists.' });
      }
      let profilePicture, profile;

      if (req.file && req.file.mimetype && req.file.mimetype.startsWith('image')) {
        profilePicture = req.file.filename;
      } else {
        // Handle the case where no file is uploaded or the uploaded file is not an image
        profilePicture = null;
        profile = null;
      }
      
      const newUser = new User({ firstName, lastName, email, password, profilePicture, profile });

    // Save the user to the database
    await newUser.save();

      res.status(201).json({ message: 'Signup successful.', user: newUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user in the database
      const user = await User.findOne({ email });
  
      // Check if the user exists and the password matches
      if (user && user.password === password) {
        res.json({ message: 'Login successful.', user });
      } else {
        res.status(401).json({ message: 'Invalid email or password.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

  // Route to upload a post
  app.post('/upload', upload.single('media'), async (req, res) => {
    try {
      const { username, description } = req.body;
      const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
      const media = req.file.filename;
  
      // Create a new post
      const newPost = new Post({ username, description, mediaType, media });
  
      // Save the post to the database
      await newPost.save();
  
      res.status(201).json({ message: 'Post uploaded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  // Fetch posts endpoint
app.get('/posts', async (req, res) => {
  try {
    // Fetch media, description, and timestamp fields from all posts in the database
    const posts = await Post.find({}, { _id: 0, __v: 0, username: 0 }).sort({ timestamp: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
