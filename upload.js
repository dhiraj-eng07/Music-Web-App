const multer = require('multer');
const path = require('path');

// Storage configuration for tracks
const trackStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tracks/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'track-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for cover art
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/covers/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check if file is audio or image
  if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio and image files are allowed!'), false);
  }
};

// Multer configuration for tracks
const uploadTrack = multer({
  storage: trackStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1 // Only one file
  }
});

// Multer configuration for cover art
const uploadCover = multer({
  storage: coverStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file
  }
});

module.exports = { uploadTrack, uploadCover };
