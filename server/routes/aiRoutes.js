const express = require('express');
const router = express.Router();
const { startSession, evaluateSession } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { startSchema, evaluateSchema } = require('../validators/schemas');

router.post('/start', protect, validate(startSchema), startSession);
router.post('/evaluate', protect, validate(evaluateSchema), evaluateSession);

module.exports = router;