const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Define User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
});

// Create User Model
const User = mongoose.model('User', userSchema);

// Set up the view engine and middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Render the sign-up page
app.get('/', (req, res) => {
    res.render('index');
});

// Handle sign-up form submission
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Create a new user instance and save it to the database
        const newUser = new User({ email, password });
        await newUser.save();

        // Redirect to the thank-you page after successful registration
        res.redirect('/thankyou');
    } catch (error) {
        // Log and send an error response if there's an issue during registration
        console.error('Error registering new user:', error);

        if (error.code === 11000) {
            // Handle duplicate email error
            res.status(400).send("Email is already registered.");
        } else {
            res.status(500).send("Error registering new user.");
        }
    }
});

// Render the login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const foundUser = await User.findOne({ email });

        if (foundUser) {
            // Check if the password matches
            if (foundUser.password === password) {
                res.redirect('/home');
            } else {
                // Handle incorrect password
                res.redirect('/login');
            }
        } else {
            // Handle user not found
            res.redirect('/login');
        }
    } catch (err) {
        // Log and handle errors during login
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Render the thank-you page
app.get('/thankyou', (req, res) => {
    res.render('thankyou');
});

// Render the home page
app.get('/home', (req, res) => {
    res.render('home');
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
