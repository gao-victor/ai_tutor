import { useRef, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import Audio from "./Tutor/Audio";
import MathEquations from "./Tutor/MathEquations";
import GraphingCalculatorComponent from "./Tutor/GraphingCalculator";
import Transcript from "./Tutor/Transcript";
import { SharedContext } from "../contexts/SharedContext";

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
        `http://localhost:5001/api/sessions/${sessionId}`
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

  if (loading) return <div>Loading session...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="appContainer">
      <div className="header">
        <div className="header-left">
          <h2>Welcome, {user?.name}</h2>
          <button onClick={() => navigate("/")} className="back-button">
            Back to Sessions
          </button>
        </div>
        <div className="header-right">
          <span className="session-info">
            {topic} ({level})
          </span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      <Audio error={error} setError={setError} />
      <MathEquations />
      <GraphingCalculatorComponent
        ref={gcRef}
        equationInputRef={gcEquationInputRef}
      />
      <Transcript />
    </div>
  );
};

export default MainApp;
