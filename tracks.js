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

router.post('/upload', auth, uploadMiddleware.single('track'), uploadTrack);
router.get('/', getTracks);
router.get('/:id', getTrack);
router.post('/:id/like', auth, likeTrack);
router.get('/artist/:artistId', getArtistTracks);

module.exports = router;