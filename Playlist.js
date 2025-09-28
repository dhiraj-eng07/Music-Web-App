const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  coverArt: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['saved', 'liked', 'custom', 'artist'],
    default: 'custom'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Playlist', playlistSchema);