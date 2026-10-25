const express = require('express');
const router = express.Router();
const { startSession, evaluateSession, createFollowUp, evaluateFollowUp } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { startSchema, evaluateSchema, followUpSchema } = require('../validators/schemas');

router.post('/start', protect, validate(startSchema), startSession);
router.post('/evaluate', protect, validate(evaluateSchema), evaluateSession);
router.post('/followup', protect, validate(followUpSchema), createFollowUp);
router.post('/followup/evaluate', protect, validate(evaluateSchema), evaluateFollowUp);

module.exports = router;