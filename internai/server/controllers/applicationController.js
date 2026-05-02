const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Private (Student)
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ error: 'This job is no longer accepting applications' });

    const existing = await Application.findOne({ job: req.params.jobId, student: req.user._id });
    if (existing) return res.status(400).json({ error: 'You have already applied to this job' });

    const application = await Application.create({
      job: req.params.jobId,
      student: req.user._id,
      recruiter: job.recruiter,
      coverLetter: req.body.coverLetter,
      resumeSnapshot: req.user.resumeText,
      aiMatchScore: req.user.aiScore || 0,
      statusHistory: [{ status: 'applied', note: 'Application submitted' }],
    });

    await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicantCount: 1 } });

    res.status(201).json(await application.populate([
      { path: 'job', select: 'title company location stipend' },
    ]));
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Already applied to this job' });
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get student's applications
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job', 'title company location stipend type tags')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get applicants for recruiter's jobs
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter)
const getRecruiterApplications = async (req, res) => {
  try {
    const { jobId, status } = req.query;
    const query = { recruiter: req.user._id };
    if (jobId) query.job = jobId;
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('student', 'name email skills aiScore education location')
      .populate('job', 'title company')
      .sort({ aiMatchScore: -1, createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter)
const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.status = status;
    application.statusHistory.push({ status, note: note || '' });
    if (status === 'interview' && req.body.interviewDate) {
      application.interviewDate = req.body.interviewDate;
    }
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Student)
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await application.deleteOne();
    await Job.findByIdAndUpdate(application.job, { $inc: { applicantCount: -1 } });
    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { applyToJob, getMyApplications, getRecruiterApplications, updateStatus, withdrawApplication };
