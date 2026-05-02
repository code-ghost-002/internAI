const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    company: { type: String, required: true, trim: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
    requirements: { type: String, maxlength: 3000 },
    location: { type: String, required: true },
    type: { type: String, enum: ['Engineering', 'AI/ML', 'Design', 'Data', 'Marketing', 'Finance', 'Operations', 'Other'], default: 'Other' },
    workMode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'Remote' },
    stipend: { type: String },
    stipendAmount: { type: Number },
    duration: { type: String },
    openings: { type: Number, default: 1 },
    tags: [{ type: String, trim: true }],
    listingKind: { type: String, enum: ['internship', 'job'], default: 'internship' },
    status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
    applicationDeadline: Date,
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', tags: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
