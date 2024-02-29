const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the MongoDB connection setup
const User = require('./models/User'); // Import the User model
const cors = require('cors');
const app = express();
const multer = require('multer');
const path = require('path');
const Post = require('./models/posts')
const rawBody = require('raw-body');

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
  const { firstName, lastName, email, password, userType, qualifications } = req.body;

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
      
      const newUser = new User({ firstName, lastName, email, password, profilePicture, profile, userType, qualifications });

    // Save the user to the database
    await newUser.save();

      res.status(201).json({ message: 'Signup successful.', user: newUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// Login endpoint
const jwt = require('jsonwebtoken');

app.post('/login', async (req, res) => {
  const { email: userEmail, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ email: userEmail });

    // Check if the user exists and the password matches
    if (user && user.password === password) {
      // Do not populate in the login route, especially for sensitive information
      // Instead, only send necessary information and avoid exposing sensitive fields
      const { firstName, lastName, email, profilePicture } = user;

      // Create a JWT token
      const token = jwt.sign(
        { email, firstName, lastName, profilePicture }, // Payload
        'DW4AZjneTkkeHpN3kKq6TaKXlLyWGq19FHSO6Rm6f8BQNQZKZRyEBYUSvQz3SuS', // Secret key (should be stored in a secure way, not hard-coded)
        { expiresIn: '1h' } // Token expiration time
      );

      res.json({ message: 'Login successful.', user: { firstName, lastName, email, profilePicture }, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});


app.post('/login', async (req, res) => {
  const { email: userEmail, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ email: userEmail });

    // Check if the user exists and the password matches
    if (user && user.password === password) {
      // Do not populate in the login route, especially for sensitive information
      // Instead, only send necessary information and avoid exposing sensitive fields
      const { firstName, lastName, email, profilePicture } = user;

      // Create a JWT token
      const token = jwt.sign(
        { email, firstName, lastName, profilePicture }, // Payload
        'DW4AZjneTkkeHpN3kKq6TaKXlLyWGq19FHSO6Rm6f8BQNQZKZRyEBYUSvQz3SuS', // Secret key (should be stored in a secure way, not hard-coded)
        { expiresIn: '1h' } // Token expiration time
      );

      res.json({ message: 'Login successful.', user: { firstName, lastName, email, profilePicture }, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});


  // Route to upload a post

  function parseJWT (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}


  app.post('/upload', upload.single('media'), async (req, res) => {

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
      const username = `${decodedToken.firstName} ${decodedToken.lastName}`;
      console.log('Decoded username:', username);
      const user = await User.findOne({ username });
      const profilePicture = `${decodedToken.profilePicture}`;

      const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
      const media = req.file.filename;
  
      // Create a new post

      const newPost = new Post({ profilePicture, username, description, mediaType, media, likes: 0 });
      
  
      // Save the post to the database
      await newPost.save();

    //  user.posts.push(newPost);
   //   await user.save();
  
      res.status(201).json({ message: 'Post uploaded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  app.post('/like/:_id', async (req, res) => {
    try {
        const postId = req.params._id;
        console.log('Received like request for post with ID:', postId);

        // Find the post by ID
        const post = await Post.findById(postId);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment the like count
        post.likes++;

        // Save the updated post
        await post.save();

        res.json({ likes: post.likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




/*


  // Route to upload a post
  app.post('/upload', upload.single('media'), async (req, res) => {
    try {
      const { username, description } = req.body;
      const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
      const media = req.file.filename;
  
      // Create a new post
      const user = await User.findOne({ username });

      const newPost = new Post({ username, description, mediaType, media });
  
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



*/



  
  // Fetch posts endpoint
  app.get('/posts', async (req, res) => {
    try {
      // Fetch posts with user information
      const posts = await Post.find({}, { _id: 0, __v: 0 }).sort({ timestamp: -1 }).populate('username', '-_id firstName lastName profilePicture');
  
      // Map the posts to include user profile pictures
      const postsWithProfilePictures = posts.map(post => {
        const { likes, profilePicture, username, description, mediaType, media, timestamp } = post;
        const userProfilePicture = username.profilePicture;
  
        return {
          likes,
          profilePicture,
          username,
          description,
          mediaType,
          media,
          timestamp,
        };
      });
  
      res.json(postsWithProfilePictures);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



// Function to verify JWT token

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, 'DW4AZjneTkkeHpN3kKq6TaKXlLyWGq19FHSO6Rm6f8BQNQZKZRyEBYUSvQz3SuS', (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

// Authentication middleware
async function authenticateMiddleware(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = await verifyToken(token);
    req.user = decoded; // Attach user information to the request object
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

  app.get('/getProfilePicture', authenticateMiddleware, async (req, res) => {
    console.log(req.params);
    const userEmail = req.user.email; // Assuming you store user information in the request object after authentication
    
    try {
      const user = await User.findOne({ email: userEmail });
      
      if (user) {
        res.json({
          profilePicture: user.profilePicture,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      } else {
        res.json({
          profilePicture: null,
          firstName: 'Default',
          lastName: 'User',
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  app.get('/doctors', async (req, res) => {
    try {
      // Fetch users with userType "Doctor"
      const doctors = await User.find({ userType: 'doctor' }, 'firstName lastName profilePicture qualifications email');
  
      res.status(200).json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.', error: error.message });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
