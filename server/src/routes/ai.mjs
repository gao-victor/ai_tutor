import express from 'express';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import multer from 'multer';

const router = express.Router();
let groq;
let openai;

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

// POST /api/ai/transcribeText
// Converts text to speech using OpenAI TTS
router.post('/transcribeText', async (req, res) => {
  try {
    if (!openai) { 
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    const { inputText } = req.body;

    if (!inputText) {
      return res.status(400).json({ 
        error: 'Input text is required' 
      });
    }

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: inputText,
    });

    // Convert the response to base64 for JSON transmission
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);
    const audioBase64 = audioBuffer.toString('base64');

    res.json({
      success: true,
      audio_data: audioBase64,
      audio_format: 'mp3'
    });

  } catch (error) {
    console.error('Error in transcribeText:', error);
    res.status(500).json({ 
      error: 'Error with API; please try again later',
      details: error.message 
    });
  }
});

// POST /api/ai/transcribeAudio
// Converts audio to text using Groq Whisper
router.post('/transcribeAudio', upload.single('audio'), async (req, res) => {
  try {
    if (!groq) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Audio file is required' 
      });
    }

    // Create a File object from the uploaded buffer
    // Handle various audio formats that browsers might send
    const mimeType = req.file.mimetype || 'audio/wav';
    const fileName = req.file.originalname || 'audio.wav';
    
    const audioFile = new File([req.file.buffer], fileName, {
      type: mimeType,
    });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      response_format: "json",
      language: "en",
    });

    res.json({
      success: true,
      text: transcription.text
    });

  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    res.status(500).json({ 
      error: 'Error with API; please try again later',
      details: error.message 
    });
  }
});

// POST /api/ai/LLM
// General LLM endpoint using Groq chat completions
router.post('/general', async (req, res) => {
  try {
    if (!groq) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    const { messages, returnJSON} = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required' 
      });
    }
    const input = {messages: messages, model: "llama-3.3-70b-versatile"};
    if (returnJSON) {
      input.response_format = {type: "json_object"};
    }
    const response = await groq.chat.completions.create(input);
    if(returnJSON) {
      return res.json({
        response: JSON.parse(response.choices[0].message.content)
      });
    }
    return res.json({
      response: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in LLM endpoint:', error);
    res.status(500).json({ 
      error: 'Error with API; please try again later',
      details: error.message 
    });
  }
});

export default router;
