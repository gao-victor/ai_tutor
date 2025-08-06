import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import Audio from "./Tutor/Audio";
import MathEquations from "./Tutor/MathEquations";
import GraphingCalculatorComponent from "./Tutor/GraphingCalculator";
import Transcript from "./Tutor/Transcript";
import { SharedProvider } from "../contexts/SharedContext";

const MainApp = () => {
  const { user, logout } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const gcEquationInputRef = useRef(null);
  const gcRef = useRef(null);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/sessions/${sessionId}`
      );
      setSession(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch session");
      setLoading(false);
    }
  };

  const updateSession = async (updates) => {
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/sessions/${sessionId}`,
        updates
      );
      setSession(response.data);
    } catch (err) {
      setError("Failed to update session");
    }
  };

  if (loading) return <div>Loading session...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!session) return <div>Session not found</div>;

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
            {session.topic} ({session.level})
          </span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      <SharedProvider>
        <Audio />
        <MathEquations />
        <GraphingCalculatorComponent
          ref={gcRef}
          equationInputRef={gcEquationInputRef}
        />
        <Transcript />
      </SharedProvider>
    </div>
  );
};

export default MainApp;
