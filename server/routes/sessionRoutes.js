const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect } = require('../middleware/authMiddleware');

// POST /api/sessions — create new session
router.post('/', protect, async (req, res) => {
  try {
    const { role } = req.body;

    const session = await Session.create({
      user: req.user._id,
      role,
      questions: [],
      answers: [],
      feedback: [],
      scores: [],
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/sessions — get all sessions for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/sessions/:id — get single session
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/sessions/:id/answer — submit an answer
router.post('/:id/answer', protect, async (req, res) => {
  try {
    const { answer } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.answers.push(answer);
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;