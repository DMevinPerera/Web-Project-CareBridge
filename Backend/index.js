const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the MongoDB connection setup
const User = require('./models/User'); // Import the User model
const cors = require('cors');
const app = express();

app.use(cors());


const port = 3000;

// In-memory storage for simplicity
const users = [];

app.use(bodyParser.json());

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }
  
      // Create a new user
      const newUser = new User({ email, password });
  
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
