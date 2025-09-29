// API Configuration
// This file centralizes all API endpoint configuration
//
// For GCP Deployment:
// 1. Set VITE_API_BASE_URL to your GCP service URL (e.g., https://your-service.run.app)
// 2. Your server uses process.env.PORT || 5001 and listens on 0.0.0.0
// 3. GCP will assign a port dynamically and expose it on your service URL
//
// Example environment variable for production:
// VITE_API_BASE_URL=https://ai-tutor-123456-uc.a.run.app

const getApiBaseUrl = () => {
  // In production (GCP), use the environment variable
  // In development, use localhost with the correct port
  if (import.meta.env.PROD) {
    // Production: Must provide VITE_API_BASE_URL for GCP deployment
    // GCP will assign a port dynamically, so we need the full URL
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
      return envUrl;
    }
    // If no environment variable is set, warn and fallback to relative path
    console.warn('VITE_API_BASE_URL not set in production. Using relative paths.');
    return '';
  } else {
    // Development: Use localhost with port 5001 (server fallback port)
    return 'http://localhost:5001';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    ME: `${API_BASE_URL}/api/auth/me`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  },
  
  // Session endpoints
  SESSIONS: {
    LIST: `${API_BASE_URL}/api/sessions`,
    CREATE: `${API_BASE_URL}/api/sessions`,
    DELETE: (sessionId) => `${API_BASE_URL}/api/sessions/${sessionId}`,
    GET: (sessionId) => `${API_BASE_URL}/api/sessions/${sessionId}`,
  },
  
  // AI endpoints
  AI: {
    GENERAL: `${API_BASE_URL}/api/ai/general`,
    TRANSCRIBE_AUDIO: `${API_BASE_URL}/api/ai/transcribeAudio`,
    TRANSCRIBE_TEXT: `${API_BASE_URL}/api/ai/transcribeText`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_ENDPOINTS;
