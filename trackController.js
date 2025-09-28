const Track = require('../models/Track');
const Playlist = require('../models/Playlist');

// Upload track
exports.uploadTrack = async (req, res) => {
  try {
    const { name, genre, releaseDate } = req.body;
    
    const track = await Track.create({
      name,
      artist: req.user.id,
      fileUrl: req.file.path,
      coverArt: req.body.coverArt || '',
      genre,
      releaseDate: releaseDate || Date.now()
    });

    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tracks
exports.getTracks = async (req, res) => {
  try {
    const tracks = await Track.find()
      .populate('artist', 'name')
      .sort({ createdAt: -1 });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get track by ID
exports.getTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id).populate('artist', 'name avatar');
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Increment play count
    track.plays += 1;
    await track.save();

    res.json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike track
exports.likeTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const hasLiked = track.likes.includes(req.user.id);
    
    if (hasLiked) {
      track.likes = track.likes.filter(like => like.toString() !== req.user.id);
    } else {
      track.likes.push(req.user.id);
    }

    await track.save();
    res.json({ liked: !hasLiked, likes: track.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get artist tracks
exports.getArtistTracks = async (req, res) => {
  try {
    const tracks = await Track.find({ artist: req.params.artistId })
      .populate('artist', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};