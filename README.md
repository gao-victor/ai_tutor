# AI Math Tutor

A React-based AI math tutoring application with user authentication and session management.

## Project Structure

```
ai_tutor/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Sessions/
│   │   │   └── SessionList.jsx
│   │   ├── Tutor/
│   │   │   ├── Audio.jsx
│   │   │   ├── GraphingCalculator.jsx
│   │   │   ├── MathEquations.jsx
│   │   │   └── Transcript.jsx
│   │   └── MainApp.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── SharedContext.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.mjs
│   │   │   └── Session.mjs
│   │   ├── routes/
│   │   │   ├── auth.mjs
│   │   │   └── sessions.mjs
│   │   ├── middleware/
│   │   │   └── auth.mjs
│   │   └── index.mjs
│   ├── package.json
│   └── .env
└── package.json
```

## Features

- User authentication (login/register)
- Session management for tutoring conversations
- AI-powered math tutoring with voice interaction
- Graphing calculator integration
- Real-time transcript display
- Session persistence and history

## Setup

### Frontend

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with:

   ```
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## Usage

1. Register a new account or login
2. View your existing sessions or create a new one
3. Start a tutoring session with voice interaction
4. Use the graphing calculator and math equation tools
5. View the conversation transcript in real-time

## Technologies Used

- **Frontend**: React, Vite, React Router, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **AI**: Groq, OpenAI
- **UI**: CSS3, Desmos Graphing Calculator
