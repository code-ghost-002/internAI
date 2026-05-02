InternAI — AI-Powered Internship & Recruitment Platform
A full-stack MERN application that connects students with internship opportunities using AI-powered resume analysis, candidate matching, and cover letter generation.

Tech Stack AI Auth License

Features
For Students
Browse & Apply — Search and filter internships by type, work mode, and keywords
AI Resume Analyzer — Paste resume text and get an AI-generated score (0–100), strengths, improvement tips, and matched roles
AI Cover Letter Generator — One-click cover letter tailored to the specific job and your profile
Application Tracker — Kanban board and list view to track all your applications
Profile Management — Skills, education, links, and bio used for AI matching
For Recruiters
Post Jobs — Full job creation with type, location, stipend, tags, and deadline
AI Candidate Matching — Applicants auto-ranked by AI match score against the job
Applicant Pipeline — Expand each applicant, read cover letters, update status (applied → interview → offer)
Dashboard Stats — Live counts for active jobs, total applicants, interviews, and offers
Platform
JWT Authentication — Secure role-based access (student vs recruiter), token stored in localStorage
Role-Based Routing — Separate dashboards, protected routes, automatic redirect
MongoDB Persistence — All users, jobs, and applications stored with Mongoose schemas
Rate Limiting — Express rate limiter on all API routes
Security Headers — Helmet.js middleware
Tech Stack
Layer	Technology
Frontend	React 18, React Router v6, Axios
Backend	Node.js, Express 4
Database	MongoDB, Mongoose
Auth	JWT (jsonwebtoken), bcryptjs
AI	Anthropic Claude API (@anthropic-ai/sdk)
Security	Helmet, express-rate-limit, CORS
Styling	CSS Modules, Google Fonts
Project Structure
internai/
├── server/
│   ├── index.js              # Express app entry point
│   ├── seed.js               # Database seeder with demo data
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User schema (student + recruiter)
│   │   ├── Job.js            # Job posting schema
│   │   └── Application.js    # Application schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── userController.js
│   │   └── aiController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   ├── users.js
│   │   └── ai.js
│   └── middleware/
│       └── auth.js           # JWT protect + authorize middleware
└── client/
    └── src/
        ├── App.js            # Router + protected routes
        ├── context/
        │   └── AuthContext.js
        ├── services/
        │   └── api.js        # Axios instance + interceptors
        ├── components/common/
        │   ├── AppLayout.js  # Sidebar + outlet
        │   └── UI.js         # Reusable components
        └── pages/
            ├── auth/         # Login, Register
            ├── student/      # Dashboard, Jobs, Applications, AI Resume, Profile
            └── recruiter/    # Dashboard, Post Job, My Jobs, Applicants, Profile
Getting Started
Prerequisites
Node.js v18+
MongoDB (local or MongoDB Atlas)
Anthropic API key (get one here)
1. Clone the repo
git clone https://github.com/YOUR_USERNAME/internai.git
cd internai
2. Set up environment variables
Server — copy and fill in server/.env.example:

cp server/.env.example server/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/internai
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:3000
NODE_ENV=development
Client — copy client/.env.example:

cp client/.env.example client/.env
3. Install dependencies
npm run install-all
4. Seed the database (optional but recommended)
cd server && node seed.js
This creates demo accounts:

Role	Email	Password
Student	alex@student.com	password123
Student	puja@student.com	password123
Recruiter	sarah@google.com	password123
Recruiter	marcus@openai.com	password123
5. Run the app
# From root — runs both server and client
npm run dev
Frontend: http://localhost:3000
Backend API: http://localhost:5000/api
API Endpoints
Auth
Method	Route	Access	Description
POST	/api/auth/register	Public	Register user
POST	/api/auth/login	Public	Login, get JWT
GET	/api/auth/me	Private	Current user
Jobs
Method	Route	Access	Description
GET	/api/jobs	Public	List + filter jobs
GET	/api/jobs/:id	Public	Single job
POST	/api/jobs	Recruiter	Create job
PUT	/api/jobs/:id	Recruiter (owner)	Update job
DELETE	/api/jobs/:id	Recruiter (owner)	Delete job
GET	/api/jobs/my-jobs	Recruiter	Own jobs
Applications
Method	Route	Access	Description
POST	/api/applications/:jobId	Student	Apply to job
GET	/api/applications/my	Student	My applications
GET	/api/applications/recruiter	Recruiter	Incoming applicants
PUT	/api/applications/:id/status	Recruiter	Update status
DELETE	/api/applications/:id	Student	Withdraw
AI
Method	Route	Access	Description
POST	/api/ai/analyze-resume	Student	AI resume scoring
POST	/api/ai/match/:jobId	Student	AI job match score
POST	/api/ai/cover-letter	Student	AI cover letter generator
Deployment
Backend (Railway / Render)
Set all environment variables from server/.env.example
Set MONGO_URI to your Atlas connection string
Set CLIENT_URL to your frontend URL
Deploy server/ directory, start command: node index.js
Frontend (Vercel / Netlify)
Set REACT_APP_API_URL to your backend URL + /api
Deploy client/ directory, build command: npm run build
License
MIT — feel free to use this for your portfolio or as a starter for your own project.
