const express = require('express');
const { applyToJob, getMyApplications, getRecruiterApplications, updateStatus, withdrawApplication } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/:jobId', protect, authorize('student'), applyToJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterApplications);
router.put('/:id/status', protect, authorize('recruiter'), updateStatus);
router.delete('/:id', protect, authorize('student'), withdrawApplication);

module.exports = router;
