const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['student', 'recruiter'], required: true },

    // Student fields
    skills: [{ type: String, trim: true }],
    education: {
      institution: String,
      degree: String,
      field: String,
      graduationYear: Number,
    },
    resumeText: { type: String, maxlength: 10000 },
    aiScore: { type: Number, default: 0 },
    aiAnalysis: {
      strengths: [String],
      improvements: [String],
      topRoles: [String],
      keywords: [String],
      summary: String,
      analyzedAt: Date,
    },

    // Recruiter fields
    company: { type: String, trim: true },
    companyDescription: String,
    companyWebsite: String,
    companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },

    // Shared
    bio: { type: String, maxlength: 1000 },
    location: String,
    linkedIn: String,
    github: String,
    avatar: String,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
