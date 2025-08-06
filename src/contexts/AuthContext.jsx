import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  );

  // Set up axios defaults and interceptors
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Check authentication status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5001/api/auth/me");
        setUser(response.data);
      } catch (error) {
        console.log("Token invalid, attempting refresh...");
        // Try to refresh the token
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(
              "http://localhost:5001/api/auth/refresh",
              {
                refreshToken,
              }
            );

            const { token: newToken, user: userData } = refreshResponse.data;

            localStorage.setItem("token", newToken);
            setToken(newToken);
            setUser(userData);
          } catch (refreshError) {
            console.log("Refresh failed, clearing auth state");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            setToken(null);
            setRefreshToken(null);
            setUser(null);
          }
        } else {
          console.log("No refresh token, clearing auth state");
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, refreshToken]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email,
          password,
        }
      );

      const {
        token: newToken,
        refreshToken: newRefreshToken,
        user: userData,
      } = response.data;

      // Store tokens and update state immediately
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Set axios headers immediately
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      // Update state
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      const {
        token: newToken,
        refreshToken: newRefreshToken,
        user: userData,
      } = response.data;

      // Store tokens and update state immediately
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Set axios headers immediately
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      // Update state
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to invalidate refresh token
      if (token) {
        await axios.post("http://localhost:5001/api/auth/logout");
      }
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      // Clear local storage and state regardless of backend response
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
