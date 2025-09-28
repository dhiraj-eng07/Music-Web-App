const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

// Create playlist
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user.id,
      isPublic: isPublic !== false
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user playlists
exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ 
      owner: req.user.id,
      type: 'custom'
    }).populate('tracks');
    
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get playlist by ID
exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'name')
      .populate('tracks');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if playlist is public or user owns it
    if (!playlist.isPublic && playlist.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add track to playlist
exports.addTrackToPlaylist = async (req, res) => {
  try {
    const { trackId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Prevent duplicates
    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      await playlist.save();
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove track from playlist
exports.removeTrackFromPlaylist = async (req, res) => {
  try {
    const { trackId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    playlist.tracks = playlist.tracks.filter(track => track.toString() !== trackId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};