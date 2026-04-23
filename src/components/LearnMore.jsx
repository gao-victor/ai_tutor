import React from "react";
import { Link } from "react-router-dom";

const LearnMore = () => {
  return (
    <div className="learn-more-container">
      <div className="learn-more-content">
        <h1 className="learn-more-title">How AI Math Tutor Works</h1>

        {/* Brief synopsis section */}
        <div className="app-synopsis">
          <h2>Personalized, Interactive Learning!</h2>
          <p>
            Utilizing advanced genearative AI, AI Math tutor aims to provide a
            personalized, interactive learning experience just like a real
            tutor! AI Math Tutor assesses in real time your current
            understanding of a topic to tailor its roadmap of teaching. By
            tracking your progress, AI Math Tutor can adjust its teaching style
            to help you understand and master concepts - whether you're
            struggling with the mathematical notation, the intuition, or solving
            problems. With its ability to write down and graph equations, AI
            Math Tutor feels just like a real tutor!
          </p>
        </div>

        {/* Process flow sections with images */}
        <div className="process-flow">
          <div className="process-step">
            <div className="step-image">
              <div className="placeholder-image">
                <img
                  src={"/getting-started.png"}
                  alt="Introduction"
                />
              </div>
            </div>
            <div className="step-image">
              <div className="placeholder-image">
                <img
                  src={"/transcript-intro.png"}
                  alt="Introduction"
                />
              </div>
            </div>
            <div className="step-content">
              <h3>Getting Started</h3>
              <p>
                When you start a new session, AI Math Tutor will first ask you
                about what you want to learn and what you already know to get an
                understanding of your knowledge.
              </p>
            </div>
          </div>

          <div className="process-step">
            <div className="step-image">
              <div className="placeholder-image">
                <img
                  src={"/graphs-and-equations.png"}
                  alt="Beginning"
                />
              </div>
            </div>
            <div className="step-content">
              <h3>Tutoring Session</h3>
              <p>
                After establishing what you want to learn and what you already
                know, your tutoring session will begin and the "level of
                understanding" and "topic" fields will be filled. AI Math Tutor
                will then begin to tutor you on the topic you want to learn and
                dynamically adjust its teaching style based on your level of
                understanding and responses.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action section */}
        <div className="learn-more-actions">
          <Link to="/login" className="btn btn-primary">
            Start Learning Now!
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Create Your Account
          </Link>
          <Link to="/welcome" className="btn btn-outline">
            ← Back to Welcome
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;
