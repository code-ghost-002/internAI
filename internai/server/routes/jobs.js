const express = require('express');
const { body } = require('express-validator');
const { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getJobs);
router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('recruiter'), [
  body('title').notEmpty().withMessage('Title required'),
  body('description').notEmpty().withMessage('Description required'),
  body('location').notEmpty().withMessage('Location required'),
], createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
