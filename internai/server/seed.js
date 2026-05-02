const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing data...');
  await Promise.all([User.deleteMany(), Job.deleteMany(), Application.deleteMany()]);

  // Create recruiter accounts
  const recruiters = await User.create([
    { name: 'Sarah Chen', email: 'sarah@google.com', password: 'password123', role: 'recruiter', company: 'Google', companySize: '500+', bio: 'Technical recruiter at Google with 5+ years experience.' },
    { name: 'Marcus Webb', email: 'marcus@openai.com', password: 'password123', role: 'recruiter', company: 'OpenAI', companySize: '201-500', bio: 'Talent acquisition at OpenAI.' },
    { name: 'Priya Nair', email: 'priya@stripe.com', password: 'password123', role: 'recruiter', company: 'Stripe', companySize: '500+', bio: 'University recruiter at Stripe.' },
  ]);

  // Create student accounts
  const students = await User.create([
    {
      name: 'Alex Rivera', email: 'alex@student.com', password: 'password123', role: 'student',
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Python'],
      education: { institution: 'MIT', degree: 'B.S.', field: 'Computer Science', graduationYear: 2025 },
      aiScore: 87, bio: 'Passionate full-stack developer looking for exciting internships.',
      resumeText: 'Alex Rivera - Full Stack Developer\nSkills: React, TypeScript, Node.js, MongoDB, Python\nEducation: MIT Computer Science 2025\nProjects: Built a MERN stack e-commerce platform, ML-powered recommendation engine.',
    },
    {
      name: 'Puja Sharma', email: 'puja@student.com', password: 'password123', role: 'student',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'SQL', 'R'],
      education: { institution: 'Stanford', degree: 'B.S.', field: 'Data Science', graduationYear: 2025 },
      aiScore: 91, bio: 'ML enthusiast with research experience in NLP.',
    },
  ]);

  // Create jobs
  const jobs = await Job.create([
    { title: 'Frontend Engineer Intern', listingKind: 'internship', company: 'Google', recruiter: recruiters[0]._id, description: 'Join Google\'s frontend team to build user-facing features for products used by billions. You will work with React, TypeScript, and modern web technologies. Collaborate with designers and backend engineers to ship impactful features.', requirements: '- Experience with React or Vue\n- Strong JavaScript/TypeScript skills\n- Understanding of CSS and responsive design\n- Familiarity with Git', location: 'Mountain View, CA', type: 'Engineering', workMode: 'Hybrid', stipend: '$8,500/mo', stipendAmount: 8500, duration: '3 months', openings: 3, tags: ['React', 'TypeScript', 'CSS', 'JavaScript'], applicationDeadline: new Date('2026-06-01') },
    { title: 'ML Research Intern', listingKind: 'internship', company: 'OpenAI', recruiter: recruiters[1]._id, description: 'Work alongside world-class researchers on cutting-edge language models. You will run experiments, analyze results, and contribute to papers. Ideal for students passionate about AI safety and capabilities research.', requirements: '- Strong Python skills\n- Experience with PyTorch or TensorFlow\n- Familiarity with LLMs and transformers\n- Research experience preferred', location: 'San Francisco, CA', type: 'AI/ML', workMode: 'On-site', stipend: '$9,000/mo', stipendAmount: 9000, duration: '3 months', openings: 2, tags: ['Python', 'PyTorch', 'LLMs', 'Research'], applicationDeadline: new Date('2026-05-15') },
    { title: 'Backend Engineer Intern', listingKind: 'internship', company: 'Stripe', recruiter: recruiters[2]._id, description: 'Build reliable, scalable payment infrastructure used by millions of businesses. You\'ll work on API design, database optimization, and distributed systems. Stripe engineers own their code end-to-end.', requirements: '- Experience with Node.js or Go\n- Understanding of REST APIs\n- Knowledge of SQL or MongoDB\n- Systems thinking', location: 'Remote', type: 'Engineering', workMode: 'Remote', stipend: '$7,500/mo', stipendAmount: 7500, duration: '3 months', openings: 4, tags: ['Node.js', 'MongoDB', 'APIs', 'PostgreSQL'], applicationDeadline: new Date('2026-06-15') },
    { title: 'Data Science Intern', listingKind: 'internship', company: 'Google', recruiter: recruiters[0]._id, description: 'Use data to drive product decisions across Google\'s advertising products. You\'ll work with large datasets, build dashboards, and present insights to leadership.', requirements: '- Python and SQL proficiency\n- Experience with data visualization\n- Statistics background\n- Excellent communication skills', location: 'New York, NY', type: 'Data', workMode: 'Hybrid', stipend: '$8,000/mo', stipendAmount: 8000, duration: '3 months', openings: 2, tags: ['Python', 'SQL', 'Tableau', 'BigQuery'], applicationDeadline: new Date('2026-05-30') },
    { title: 'AI/ML Engineer Intern', listingKind: 'internship', company: 'Stripe', recruiter: recruiters[2]._id, description: 'Apply machine learning to fraud detection, risk scoring, and financial forecasting. Work on real-world ML systems that process millions of transactions daily.', requirements: '- Python and ML fundamentals\n- Experience with scikit-learn or PyTorch\n- Understanding of feature engineering\n- Interest in fintech', location: 'Remote', type: 'AI/ML', workMode: 'Remote', stipend: '$8,200/mo', stipendAmount: 8200, duration: '3 months', openings: 2, tags: ['Python', 'ML', 'Fraud Detection', 'PyTorch'] },
    { title: 'Product Designer', listingKind: 'job', company: 'OpenAI', recruiter: recruiters[1]._id, description: 'Design intuitive interfaces for AI products used by millions. Work closely with research and engineering to make powerful AI accessible. You\'ll own features end-to-end from ideation to launch.', requirements: '- Proficiency in Figma\n- Portfolio showing UX/UI work\n- Understanding of design systems\n- Interest in AI products', location: 'San Francisco, CA', type: 'Design', workMode: 'On-site', stipend: '$140,000/yr', stipendAmount: 140000, openings: 2, tags: ['Figma', 'UX', 'Prototyping', 'Design Systems'] },
    { title: 'Senior Frontend Engineer', listingKind: 'job', company: 'Google', recruiter: recruiters[0]._id, description: 'Join Google\'s core web platform team to build next-generation user experiences at massive scale. You will architect and ship features used by billions of people worldwide.', requirements: '- 3+ years with React or Angular\n- Deep TypeScript expertise\n- Experience with performance optimization\n- Strong system design skills', location: 'Mountain View, CA', type: 'Engineering', workMode: 'Hybrid', stipend: '$180,000/yr', stipendAmount: 180000, openings: 4, tags: ['React', 'TypeScript', 'GraphQL', 'Performance'] },
    { title: 'Staff ML Engineer', listingKind: 'job', company: 'Stripe', recruiter: recruiters[2]._id, description: 'Lead machine learning efforts across Stripe\'s fraud detection and risk platform. You\'ll define technical strategy, mentor engineers, and ship models that protect millions of businesses every day.', requirements: '- 5+ years in ML engineering\n- Production ML systems experience\n- Strong Python and distributed systems\n- Leadership experience', location: 'Remote', type: 'AI/ML', workMode: 'Remote', stipend: '$210,000/yr', stipendAmount: 210000, openings: 1, tags: ['Python', 'PyTorch', 'Distributed Systems', 'Leadership'] },
    { title: 'Data Engineer', listingKind: 'job', company: 'Google', recruiter: recruiters[0]._id, description: 'Build and maintain the data pipelines that power Google\'s advertising analytics products. You will design scalable ETL systems, optimize data models, and enable business-critical dashboards.', requirements: '- Strong SQL and Python\n- Experience with BigQuery or Spark\n- Understanding of data modelling\n- Excellent communication skills', location: 'New York, NY', type: 'Data', workMode: 'Hybrid', stipend: '$155,000/yr', stipendAmount: 155000, openings: 3, tags: ['SQL', 'BigQuery', 'Python', 'dbt'] },
    { title: 'Backend Engineer', listingKind: 'job', company: 'OpenAI', recruiter: recruiters[1]._id, description: 'Build the infrastructure that powers ChatGPT and the OpenAI API. You will work on high-throughput services, model serving pipelines, and the developer platform used by millions.', requirements: '- Strong Go or Python skills\n- Experience with distributed systems\n- Familiarity with Kubernetes and cloud infra\n- Focus on reliability and performance', location: 'San Francisco, CA', type: 'Engineering', workMode: 'On-site', stipend: '$200,000/yr', stipendAmount: 200000, openings: 5, tags: ['Go', 'Python', 'Kubernetes', 'Distributed Systems'] },
  ]);

  // Create sample applications
  await Application.create([
    { job: jobs[0]._id, student: students[0]._id, recruiter: recruiters[0]._id, status: 'interview', aiMatchScore: 92, coverLetter: 'I am very excited to apply for this role...', statusHistory: [{ status: 'applied' }, { status: 'interview', note: 'Strong profile' }] },
    { job: jobs[1]._id, student: students[0]._id, recruiter: recruiters[1]._id, status: 'applied', aiMatchScore: 78, statusHistory: [{ status: 'applied' }] },
    { job: jobs[1]._id, student: students[1]._id, recruiter: recruiters[1]._id, status: 'offer', aiMatchScore: 96, statusHistory: [{ status: 'applied' }, { status: 'interview' }, { status: 'offer' }] },
  ]);

  await Job.findByIdAndUpdate(jobs[0]._id, { applicantCount: 1 });
  await Job.findByIdAndUpdate(jobs[1]._id, { applicantCount: 2 });

  console.log('✅ Seed complete!');
  console.log('\n📧 Demo accounts:');
  console.log('  Student:   alex@student.com   / password123');
  console.log('  Student:   puja@student.com   / password123');
  console.log('  Recruiter: sarah@google.com   / password123');
  console.log('  Recruiter: marcus@openai.com  / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
