const express = require('express');
const { analyzeResume, matchJob, generateCoverLetter } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/analyze-resume', protect, authorize('student'), analyzeResume);
router.post('/match/:jobId', protect, authorize('student'), matchJob);
router.post('/cover-letter', protect, authorize('student'), generateCoverLetter);

module.exports = router;
