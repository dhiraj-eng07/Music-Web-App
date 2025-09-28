const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS configuration for Vercel
app.use(cors({
    origin: ['https://music-web-app-puce.vercel.app', 'http://localhost:3000'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend in production
app.use(express.static(path.join(__dirname, '../frontend')));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working on Vercel!',
        timestamp: new Date().toISOString()
    });
});

// Database connection for Vercel
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/music-app';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.log('❌ MongoDB connection error:', error.message);
        console.log('💡 Using in-memory storage for demo purposes...');
    }
};

connectDB();

// Temporary in-memory storage for demo
let users = [];
let tracks = [];
let nextId = 1;

// Authentication routes
app.post('/api/auth/register', (req, res) => {
    try {
        const { name, email, password, userType } = req.body;
        
        // Validation
        if (!name || !email || !password || !userType) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if user exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create user
        const user = {
            _id: `user_${nextId++}`,
            name,
            email,
            userType,
            createdAt: new Date()
        };
        
        users.push(user);
        
        // Generate simple token
        const token = `token_${Date.now()}`;
        
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Generate simple token
        const token = `token_${Date.now()}`;
        
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mock tracks data
app.get('/api/tracks', (req, res) => {
    const sampleTracks = [
        {
            _id: '1',
            name: 'Blinding Lights',
            artist: { _id: 'artist1', name: 'The Weeknd' },
            fileUrl: '#',
            coverArt: '',
            genre: 'pop',
            likes: [],
            plays: 0,
            duration: 200
        },
        {
            _id: '2',
            name: 'Save Your Tears',
            artist: { _id: 'artist1', name: 'The Weeknd' },
            fileUrl: '#',
            coverArt: '',
            genre: 'pop',
            likes: [],
            plays: 0,
            duration: 215
        }
    ];
    
    res.json(sampleTracks);
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Export for Vercel
module.exports = app;
