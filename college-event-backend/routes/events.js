// routes/events.js

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const mongoose = require('mongoose');

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({}, 'name').sort({ name: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/add_event
// @desc    Add a new event
// @access  Public
router.post('/add_event', async (req, res) => {
  const { name } = req.body;

  // Validate input
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ msg: 'Event name is required and must be a non-empty string.' });
  }

  const sanitizedEventName = name.trim();

  try {
    // Check if event already exists
    let event = await Event.findOne({ name: sanitizedEventName });
    if (event) {
      return res.status(400).json({ msg: 'Event already exists.' });
    }

    // Create new event
    event = new Event({ name: sanitizedEventName });
    await event.save();

    res.json({ msg: 'Event created successfully.', event: { name: sanitizedEventName } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
