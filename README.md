# AI Tutor

An interactive math tutoring web app powered by AI. Students can have voice conversations with an AI tutor, get step-by-step explanations, view rendered equations, and visualize functions on an interactive graph. Visit the live deployment at https://ai-tutor-897418855592.us-central1.run.app

## Features

- **Voice conversations** — speak to the tutor via microphone; responses are read back using text-to-speech
- **AI-powered tutoring** — LLaMA 4 (via Groq) guides students through math problems
- **Equation rendering** — KaTeX renders LaTeX math inline in responses
- **Interactive graphing** — Desmos calculator embedded for visualizing functions
- **Session management** — create, resume, and review past tutoring sessions
- **User authentication** — JWT-based login/register with bcrypt password hashing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router|
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI / LLM | Groq API (llama 4) |
| Transcription | Groq Whisper |
| Text-to-Speech | OpenAI TTS |
| Math rendering | KaTeX, Desmos |
| Deployment | Docker, GCP Cloud Run |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- API keys for Groq and OpenAI

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
PORT=5001  # optional, defaults to 5001
```

### Running Locally

**Frontend (dev server):**
```bash
npm install
npm run dev
```

**Backend:**
```bash
cd server
npm install
npm run dev
```

The frontend dev server proxies API requests to `localhost:5001`.

### Running with Docker

```bash
docker build -t ai-tutor .
docker run -p 5001:5001 --env-file server/.env ai-tutor
```

The multi-stage Dockerfile builds the React app and serves it as static files from the Express server.

## Project Structure

```
├── src/                    # React frontend
│   ├── components/
│   │   ├── Auth/           # Login and register pages
│   │   ├── Tutor/          # Main tutoring interface
│   │   └── Sessions/       # Session list and history
│   ├── contexts/           # AuthContext, SharedContext
│   └── config/             # API base URL config
├── server/                 # Express backend
│   └── src/
│       ├── routes/         # auth, sessions, ai endpoints
│       ├── models/         # Mongoose schemas
│       └── middleware/     # JWT auth middleware
├── Dockerfile
└── vite.config.js
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/sessions` | List user sessions |
| POST | `/api/sessions` | Create new session |
| POST | `/api/ai/general` | Send message to AI tutor |
| POST | `/api/ai/transcribeAudio` | Transcribe audio |
| POST | `/api/ai/transcribeText` | Generate speech from text |
