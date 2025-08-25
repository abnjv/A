const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profileBackgroundUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1507525428034-b723a996f3d1?auto=format&fit=crop&w=1170&q=80',
  }
});

module.exports = mongoose.model('User', UserSchema);
