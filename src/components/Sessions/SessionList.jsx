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

  if (loading) {
    return (
      <div className="sessions-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your math sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sessions-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p className="error-message">{error}</p>
          <button onClick={fetchSessions} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <div className="header-content">
          <h1>Your Math Sessions</h1>
          <p>Continue learning where you left off or start something new</p>
        </div>
        <button onClick={createNewSession} className="new-session-button">
          <span className="button-icon">+</span>
          New Session
        </button>
      </div>

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No sessions yet</h3>
            <p>
              Start your first math tutoring session and begin your learning
              journey!
            </p>
            <button
              onClick={createNewSession}
              className="start-learning-button"
            >
              Start Learning
            </button>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session._id} className="session-card">
              <div className="session-info">
                <div className="session-header">
                  <h3>{session.topic || "Math Session"}</h3>
                  <div className="session-badge">
                    {session.level || "Beginner"}
                  </div>
                </div>
                <div className="session-details">
                  <div className="detail-item">
                    <span className="detail-label">Stage:</span>
                    <span className="detail-value">
                      {session.stage || "Getting Started"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last updated:</span>
                    <span className="detail-value">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="session-actions">
                <button
                  onClick={() => navigate(`/session/${session._id}`)}
                  className="continue-button"
                >
                  <span className="button-icon">▶️</span>
                  Continue
                </button>
                <button
                  onClick={() => deleteSession(session._id)}
                  className="delete-button"
                >
                  <span className="button-icon">🗑️</span>
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
