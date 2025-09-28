const express = require('express');
const {
  getUserProfile,
  followUser,
  getLikedTracks,
  updateProfile
} = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile/:id', getUserProfile);
router.post('/follow/:id', auth, followUser);
router.get('/liked-tracks', auth, getLikedTracks);
router.put('/profile', auth, updateProfile);

module.exports = router;