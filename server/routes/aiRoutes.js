const express = require('express');
const router = express.Router();
const { startSession, evaluateSession } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startSession);
router.post('/evaluate', protect, evaluateSession);

module.exports = router;