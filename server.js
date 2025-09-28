const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true
}));

// Additional CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Database connection with better error handling
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/music-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.log('❌ MongoDB connection error:', error.message);
        console.log('💡 Using in-memory storage for demo purposes...');
    }
};

// Initialize database connection
connectDB();

// Temporary in-memory storage for demo
let users = [];
let tracks = [];
let playlists = [];
let nextId = 1;

// Temporary authentication routes
app.post('/api/auth/register', (req, res) => {
    try {
        const { name, email, password, userType } = req.body;
        
        console.log('📝 Registration attempt:', { name, email, userType });
        
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
            createdAt: new Date(),
            followers: [],
            following: []
        };
        
        users.push(user);
        
        // Generate simple token (in real app, use JWT)
        const token = `token_${Date.now()}`;
        
        console.log('✅ User registered successfully:', user.email);
        
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
        console.error('❌ Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt:', email);
        
        // Find user (in real app, check password hash)
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Generate simple token
        const token = `token_${Date.now()}`;
        
        console.log('✅ User logged in successfully:', user.email);
        
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
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mock tracks data
app.get('/api/tracks', (req, res) => {
    // Return some sample tracks
    const sampleTracks = [
        {
            _id: '1',
            name: 'Blinding Lights',
            artist: { _id: 'artist1', name: 'The Weeknd' },
            fileUrl: '/sample/track1.mp3',
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
            fileUrl: '/sample/track2.mp3',
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🎵 Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API Test: http://localhost:${PORT}/api/test`);
    console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Using Demo Mode 🎭'}`);
});