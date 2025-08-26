import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSessions();
    }
  }, [isAuthenticated, user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:5001/api/sessions");
      setSessions(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch sessions");
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await axios.post("http://localhost:5001/api/sessions");
      navigate(`/session/${response.data._id}`);
    } catch (err) {
      setError("Failed to create new session");
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`http://localhost:5001/api/sessions/${sessionId}`);
      setSessions(sessions.filter((session) => session._id !== sessionId));
    } catch (err) {
      setError("Failed to delete session");
    }
  };

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <h2>Your Sessions</h2>
        <button onClick={createNewSession} className="new-session-button">
          New Session
        </button>
      </div>
      <div className="sessions-list">
        {sessions.length === 0 ? (
          <p>No sessions yet. Start a new one!</p>
        ) : (
          sessions.map((session) => (
            <div key={session._id} className="session-card">
              <div className="session-info">
                <h3>{session.topic}</h3>
                <p>Level: {session.level}</p>
                <p>Stage: {session.stage}</p>
                <p>
                  Last updated:{" "}
                  {new Date(session.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="session-actions">
                <button
                  onClick={() => navigate(`/session/${session._id}`)}
                  className="continue-button"
                >
                  Continue
                </button>
                <button
                  onClick={() => deleteSession(session._id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;
