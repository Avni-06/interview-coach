# AI Mock Interview Coach

> Practice interviews with AI-powered feedback. Pick a role, answer questions, and get scored instantly.

[![CI](https://github.com/Avni-06/interview-coach/actions/workflows/ci.yml/badge.svg)](https://github.com/Avni-06/interview-coach/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-00ff88?style=for-the-badge&logo=vercel&logoColor=black)](https://interview-coach-sable.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-View%20Code-181717?style=for-the-badge&logo=github)](https://github.com/Avni-06/interview-coach)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

---

## Features

- 6 role types — Frontend, Backend, Full Stack, Data Science, DevOps, Product Manager
- AI-generated questions — unique questions every session using Groq (gpt-oss-120b)
- Instant AI feedback — score out of 10, what was good, what was missing, and a model answer
- Results dashboard — overall score with per-question breakdown
- JWT authentication — secure register and login
- Dark neon UI — glassmorphism design with 3D tilt cards

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| AI | Groq API (gpt-oss-120b, configurable via GROQ_MODEL) |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Getting Started

### Prerequisites
- Node.js 22.12+
- MongoDB Atlas account (free tier)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

**1. Clone the repo**
```bash
git clone https://github.com/Avni-06/interview-coach.git
cd interview-coach
```

**2. Set up the server**
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

**3. Set up the client**
```bash
cd ../client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:8000/api
```

**4. Run the app**

In one terminal:
```bash
cd server && npm run dev
```

In another terminal:
```bash
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
interview-coach/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # ProtectedRoute
│   │   ├── pages/           # Login, Register, Dashboard, Interview, Results
│   │   └── store/           # Zustand auth store
│   └── package.json
├── server/                  # Express backend
│   ├── config/              # DB + Groq config
│   ├── controllers/         # AI controller
│   ├── middleware/          # Auth middleware
│   ├── models/              # User, Session schemas
│   ├── routes/              # Auth, Session, AI routes
│   └── index.js
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/sessions` | Get all sessions | Yes |
| POST | `/api/sessions` | Create new session | Yes |
| GET | `/api/sessions/:id` | Get single session | Yes |
| POST | `/api/ai/start` | Generate AI questions | Yes |
| POST | `/api/ai/evaluate` | Evaluate answer with AI | Yes |

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [interview-coach-sable.vercel.app](https://interview-coach-sable.vercel.app) |
| Backend | Render | Auto-deployed from `server/` folder |
| Database | MongoDB Atlas | Free tier (512MB) |

---

## How the AI Works

1. When a session starts, the app sends the selected role to the Groq API
2. The LLM generates 5 role-specific interview questions as a JSON array
3. When the user submits an answer, it is sent to Groq alongside the original question
4. The AI returns a structured JSON object with a score, strengths, weaknesses, and a model answer
5. All questions, answers, feedback and scores are persisted to MongoDB

---

## License

MIT — feel free to use this project as inspiration for your own portfolio.

---

<div align="center">
  Built by <a href="https://github.com/Avni-06">Avni</a>
</div>
