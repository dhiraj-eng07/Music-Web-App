const User = require('../models/User');
const Track = require('../models/Track');
const Playlist = require('../models/Playlist');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's tracks if artist
    let tracks = [];
    if (user.userType === 'artist') {
      tracks = await Track.find({ artist: user._id });
    }

    // Get user's public playlists
    const playlists = await Playlist.find({ 
      owner: user._id, 
      isPublic: true 
    });

    res.json({
      user,
      tracks,
      playlists
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);

    // Check if already following
    const isFollowing = currentUser.following.includes(userToFollow._id);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ 
      following: !isFollowing,
      followers: userToFollow.followers.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's liked tracks
exports.getLikedTracks = async (req, res) => {
  try {
    const tracks = await Track.find({ likes: req.user.id })
      .populate('artist', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};