const Anthropic = require('@anthropic-ai/sdk');
const User = require('../models/User');
const Job = require('../models/Job');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// @desc    Analyze resume with AI
// @route   POST /api/ai/analyze-resume
// @access  Private (Student)
const analyzeResume = async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({ error: 'Please provide a resume with at least 50 characters' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are an expert technical recruiter. Analyze this resume and return ONLY valid JSON (no markdown, no explanation):
{
  "score": <0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "topRoles": ["role1", "role2", "role3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "summary": "2-sentence professional summary"
}

Resume:
${resumeText.substring(0, 3000)}`,
      }],
    });

    const text = message.content[0].text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(clean);

    // Persist to DB
    await User.findByIdAndUpdate(req.user._id, {
      resumeText,
      aiScore: analysis.score,
      aiAnalysis: { ...analysis, analyzedAt: new Date() },
    });

    res.json(analysis);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned invalid format, please try again' });
    }
    res.status(500).json({ error: err.message });
  }
};

// @desc    AI job match score for a specific job
// @route   POST /api/ai/match/:jobId
// @access  Private (Student)
const matchJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const user = await User.findById(req.user._id);
    if (!user.resumeText) return res.status(400).json({ error: 'Please add your resume first' });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Rate how well this candidate matches the job. Return ONLY JSON:
{"score": <0-100>, "reason": "1-sentence explanation", "missingSkills": ["skill1", "skill2"]}

JOB: ${job.title} at ${job.company}
Requirements: ${job.description.substring(0, 500)}
Tags: ${job.tags.join(', ')}

CANDIDATE RESUME:
${user.resumeText.substring(0, 1000)}`,
      }],
    });

    const text = message.content[0].text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    AI cover letter generator
// @route   POST /api/ai/cover-letter
// @access  Private (Student)
const generateCoverLetter = async (req, res) => {
  const { jobId } = req.body;
  try {
    const job = await Job.findById(jobId);
    const user = await User.findById(req.user._id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Write a concise, professional cover letter (3 paragraphs) for this internship application. Sound enthusiastic but not sycophantic.

Candidate: ${user.name}
Skills: ${user.skills?.join(', ') || 'See resume'}
Resume summary: ${user.resumeText?.substring(0, 500) || 'Not provided'}

Job: ${job.title} at ${job.company}
Description: ${job.description.substring(0, 600)}

Return ONLY the cover letter text, no subject line.`,
      }],
    });

    res.json({ coverLetter: message.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { analyzeResume, matchJob, generateCoverLetter };
