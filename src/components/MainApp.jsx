import { useRef, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import Audio from "./Tutor/Audio";
import MathEquations from "./Tutor/MathEquations";
import GraphingCalculatorComponent from "./Tutor/GraphingCalculator";
import Transcript from "./Tutor/Transcript";
import { SharedContext } from "../contexts/SharedContext";
import { API_ENDPOINTS } from "../config/api";

const MainApp = () => {
  const { user, logout } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const gcEquationInputRef = useRef(null);
  const gcRef = useRef(null);
  const {
    updateSession,
    updateSessionState,
    topic,
    level,
    stage,
    error,
    setError,
  } = useContext(SharedContext);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.SESSIONS.GET(sessionId)
      );
      // Initialize session with default values for missing fields
      const sessionData = {
        ...response.data,
        transcript: response.data.transcript || [
          { tutor: "Hi, how can I help you today?" },
        ],
        inputTranscript: response.data.inputTranscript || [
          { tutor: "Hi, how can I help you today?" },
        ],
        equations: response.data.equations || [],
        graphingEquations: response.data.graphingEquations || [],
        stage: response.data.stage || "Setup",
        topic: response.data.topic || "",
      };
      const validUpdates = [
        "transcript",
        "inputTranscript",
        "equations",
        "graphingEquations",
        "stage",
        "topic",
        "level",
        "notes",
        "validInput",
      ];
      for (const key of Object.keys(sessionData)) {
        if (validUpdates.includes(key)) {
          updateSessionState(key, sessionData[key]);
        }
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch session");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sessions-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sessions-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <div className="error-message">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sessions-container">
      <div className="main-app-content">
        <div className="main-app-header">
          <div className="header-left">
            <h1>Welcome, {user?.name}!</h1>
            <button onClick={() => navigate("/")} className="back-button">
              ← Back to Sessions
            </button>
          </div>
          <div className="header-right">
            <div className="session-info">
              <span className="session-badge">
                {topic} ({level})
              </span>
              <span className="session-stage">Stage: {stage}</span>
            </div>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        <div className="tutor-components">
          <div className="audio-section">
            <Audio error={error} setError={setError} />
          </div>

          <div className="math-row">
            <div className="component-section math-section">
              <h3>Math Equations</h3>
              <MathEquations />
            </div>

            <div className="component-section calculator-section">
              <h3>Graphing Calculator</h3>
              <GraphingCalculatorComponent
                ref={gcRef}
                equationInputRef={gcEquationInputRef}
              />
            </div>
          </div>

          <div className="component-section transcript-section">
            <h3>Conversation Transcript</h3>
            <Transcript />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
