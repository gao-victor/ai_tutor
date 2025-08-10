# AI Tutor Migration Guide: Client-Side to Server-Side LLM Processing

## Overview

This migration moves all LLM (Large Language Model) API calls from the client-side browser to the server-side, improving security, performance, and maintainability.

## Key Changes

### 1. Server-Side Changes

#### New Files Created:
- `server/src/services/llmService.mjs` - Contains all LLM logic previously in client
- `server/env.example` - Environment variables template

#### Updated Files:
- `server/src/models/Session.mjs` - Enhanced with new fields for conversation state
- `server/src/routes/sessions.mjs` - Added new `/process-input` endpoint
- `server/package.json` - Added Groq and OpenAI SDK dependencies

#### New API Endpoint:
```
POST /api/sessions/:id/process-input
```
This single endpoint handles all user input processing:
- Audio transcription
- Topic extraction (setup phase)
- Level assessment (setup phase)
- Tutor response generation
- Session state updates

### 2. Client-Side Changes

#### Updated Files:
- `src/components/Tutor/Audio.jsx` - Simplified to only handle UI and server communication

#### Removed from Client:
- All direct LLM API calls (Groq, OpenAI)
- Complex conversation logic
- Level assessment logic
- Topic extraction logic

## Environment Setup

1. Copy `server/env.example` to `server/.env`
2. Add your API keys:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Installation

1. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

## Architecture Benefits

### Security
- API keys are now server-side only
- No sensitive data exposed to client

### Performance
- Single API call instead of multiple
- Reduced client-side processing
- Better error handling and retry logic

### Maintainability
- Centralized conversation logic
- Easier to update LLM prompts and logic
- Better state management

### Scalability
- Server can handle multiple concurrent sessions
- Easier to add features like conversation history
- Better resource management

## Session Flow

The server now manages the complete tutoring session flow:

1. **Setup Phase**:
   - First input: Extract topic from user request
   - Second input: Assess current level of understanding
   - Transition to Learn/Practice stage

2. **Learn/Practice Phases**:
   - Process user input
   - Assess level changes
   - Generate appropriate tutor responses
   - Handle stage transitions

## Data Flow

1. Client records audio
2. Client sends audio to `/api/sessions/:id/process-input`
3. Server:
   - Transcribes audio
   - Determines session state (setup/learn/practice)
   - Processes input accordingly
   - Generates tutor response
   - Converts response to audio
   - Updates session state
4. Server returns response + audio + session updates
5. Client plays audio and updates UI

## Testing

To test the migration:

1. Start both client and server
2. Create a new session
3. Record audio input
4. Verify the complete flow works end-to-end
5. Check that session state is properly maintained

## Troubleshooting

### Common Issues:
1. **API Key Errors**: Ensure `.env` file is properly configured
2. **Audio Processing**: Check that audio format is compatible
3. **Session State**: Verify session model updates are working
4. **CORS Issues**: Ensure server CORS is properly configured

### Debug Steps:
1. Check server logs for errors
2. Verify API endpoint is accessible
3. Test with simple text input first
4. Check browser network tab for request/response details 