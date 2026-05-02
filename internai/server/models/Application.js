const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: { type: String, maxlength: 3000 },
    resumeSnapshot: String,
    aiMatchScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    recruiterNotes: { type: String, maxlength: 2000 },
    interviewDate: Date,
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
