const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateId } = require('../middleware/validate');
const { createSessionSchema, sessionAnswerSchema } = require('../validators/schemas');
const { sanitizeContext } = require('../utils/text');
const { buildStats } = require('../utils/stats');

// POST /api/sessions — create new session
router.post('/', protect, validate(createSessionSchema), async (req, res) => {
  try {
    const { role, interviewType, difficulty, contextKind, contextText } = req.body;
    const context = contextText ? sanitizeContext(contextText) : '';

    const session = await Session.create({
      user: req.user._id,
      role,
      interviewType,
      difficulty,
      ...(context && { contextKind: contextKind || 'jd', contextText: context }),
      questions: [],
      answers: [],
      feedback: [],
      scores: [],
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/sessions?page=1&limit=50 — paginated list (total count in X-Total-Count header)
router.get('/', protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const filter = { user: req.user._id };

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .select('-contextText -answers -feedback -evaluations') // list view does not need the heavy fields
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Session.countDocuments(filter),
    ]);

    res.set('X-Total-Count', String(total));
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/sessions/stats — numbers for the Progress page (must stay above /:id)
router.get('/stats', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .select('role scores evaluations createdAt')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json(buildStats(sessions));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/sessions/:id — get single session
router.get('/:id', protect, validateId(), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/sessions/:id/answer — submit an answer
router.post('/:id/answer', protect, validateId(), validate(sessionAnswerSchema), async (req, res) => {
  try {
    const { answer } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.answers.push(answer);
    await session.save();

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/sessions/:id — users can only delete their own sessions
router.delete('/:id', protect, validateId(), async (req, res) => {
  try {
    const result = await Session.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!result.deletedCount) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;