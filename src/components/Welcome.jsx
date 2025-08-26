import React from "react";
import { Link } from "react-router-dom";
import "./Welcome.css";

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to AI Math Tutor</h1>
        <p className="welcome-subtitle">
          Your personalized math learning companion for grades 6-12, powered by
          artificial intelligence
        </p>

        <div className="welcome-features">
          <div className="feature">
            <h3>🎯 Personalized Learning</h3>
            <p>
              Our AI tutor is like a real tutor - it assesses your knowledge
              about math topics and creates a personalized roadmap to help you
              master concepts. Perfect for when you're confused and wish you had
              a real person to tutor you.
            </p>
          </div>
          <div className="feature">
            <h3>✏️ Interactive Math Sessions</h3>
            <p>
              Your AI tutor can write down equations, graph functions, and have
              conversations just like a real math tutor. Get step-by-step
              explanations and visual representations to make math concepts
              crystal clear.
            </p>
          </div>
          <div className="feature">
            <h3>📚 Grades 6-12 Math</h3>
            <p>
              From pre-algebra to calculus, we cover all the math topics you'll
              encounter in middle school and high school. Whether you're
              struggling with fractions or diving into trigonometry, we've got
              you covered.
            </p>
          </div>
        </div>

        <div className="welcome-actions">
          <Link to="/login" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
