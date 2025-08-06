import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import MainApp from "./components/MainApp";
import SessionList from "./components/Sessions/SessionList";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <SessionList />
                </PrivateRoute>
              }
            />
            <Route
              path="/session/:sessionId"
              element={
                <PrivateRoute>
                  <MainApp />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
