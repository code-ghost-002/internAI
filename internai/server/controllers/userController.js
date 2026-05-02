const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  const allowed = ['name', 'bio', 'location', 'linkedIn', 'github', 'skills', 'education', 'company', 'companyDescription', 'companyWebsite', 'companySize'];
  const updates = {};
  allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  try {
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/stats
// @access  Private
const getStats = async (req, res) => {
  const Application = require('../models/Application');
  const Job = require('../models/Job');
  try {
    if (req.user.role === 'student') {
      const [total, interview, offer, rejected] = await Promise.all([
        Application.countDocuments({ student: req.user._id }),
        Application.countDocuments({ student: req.user._id, status: 'interview' }),
        Application.countDocuments({ student: req.user._id, status: 'offer' }),
        Application.countDocuments({ student: req.user._id, status: 'rejected' }),
      ]);
      res.json({ total, interview, offer, rejected, aiScore: req.user.aiScore });
    } else {
      const myJobs = await Job.find({ recruiter: req.user._id }).select('_id');
      const jobIds = myJobs.map(j => j._id);
      const [activeJobs, totalApplicants, interviews, offers] = await Promise.all([
        Job.countDocuments({ recruiter: req.user._id, status: 'active' }),
        Application.countDocuments({ recruiter: req.user._id }),
        Application.countDocuments({ recruiter: req.user._id, status: 'interview' }),
        Application.countDocuments({ recruiter: req.user._id, status: 'offer' }),
      ]);
      res.json({ activeJobs, totalApplicants, interviews, offers });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getStats };
