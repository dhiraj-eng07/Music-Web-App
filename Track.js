const express = require('express');
const { 
  uploadTrack, 
  getTracks, 
  getTrack, 
  likeTrack, 
  getArtistTracks 
} = require('../controllers/trackController');
const { uploadTrack: uploadMiddleware } = require('../middleware/upload');
const auth = require('../middleware/auth');

const router = express.Router();

// Upload track with error handling
router.post('/upload', auth, (req, res, next) => {
  uploadMiddleware.single('track')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({ message: err.message });
    }
    // Everything went fine
    next();
  });
}, uploadTrack);

router.get('/', getTracks);
router.get('/:id', getTrack);
router.post('/:id/like', auth, likeTrack);
router.get('/artist/:artistId', getArtistTracks);

module.exports = router;
