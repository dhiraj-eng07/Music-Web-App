const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  coverArt: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  genre: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  plays: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Track', trackSchema);