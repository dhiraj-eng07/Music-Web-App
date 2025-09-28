const express = require('express');
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist
} = require('../controllers/playlistController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createPlaylist);
router.get('/my-playlists', auth, getUserPlaylists);
router.get('/:id', auth, getPlaylist);
router.post('/:id/tracks', auth, addTrackToPlaylist);
router.delete('/:id/tracks', auth, removeTrackFromPlaylist);
router.delete('/:id', auth, deletePlaylist);

module.exports = router;