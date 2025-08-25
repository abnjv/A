const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const User = require('../models/User');

// @route   GET api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('owner', 'username'); // Populate owner's username
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/rooms
// @desc    Create a room
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, topic } = req.body;

  try {
    // Check if room with the same name already exists
    let room = await Room.findOne({ name });
    if (room) {
      return res.status(400).json({ msg: 'Room with this name already exists' });
    }

    const newRoom = new Room({
      name,
      topic,
      owner: req.user.id,
    });

    room = await newRoom.save();
    // Populate owner info before sending back
    await room.populate('owner', 'username');
    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/rooms/:id
// @desc    Update a room
// @access  Private (only owner can update)
router.put('/:id', auth, async (req, res) => {
  const { name, topic, backgroundUrl } = req.body;

  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // Check if user is the owner
    if (room.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update fields
    if (name) room.name = name;
    if (topic) room.topic = topic;
    if (backgroundUrl) room.backgroundUrl = backgroundUrl;

    await room.save();
    await room.populate('owner', 'username');
    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
