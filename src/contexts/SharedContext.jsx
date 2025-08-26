import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const SharedContext = createContext();

export function SharedProvider({ children, sessionId }) {
  const [transcript, setTranscript] = useState([
    { tutor: "Hi, how can I help you today?" },
  ]);
  const [inputTranscript, setInputTranscript] = useState([
    { tutor: "Hi, how can I help you today?" },
  ]);
  const [equations, setEquations] = useState([]);
  const [graphingEquations, setGraphingEquations] = useState([]);
  const [validInput, setValidInput] = useState(true);
  const [stage, setStage] = useState("Setup");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const updateSessionState = (field, value) => {
    switch (field) {
      case "transcript":
        if (JSON.stringify(transcript) !== JSON.stringify(value)) {
          setTranscript(value);
        }
        break;
      case "inputTranscript":
        if (JSON.stringify(inputTranscript) !== JSON.stringify(value)) {
          setInputTranscript(value);
        }
        break;
      case "equations":
        if (JSON.stringify(equations) !== JSON.stringify(value)) {
          setEquations(value);
        }
        break;
      case "graphingEquations":
        if (JSON.stringify(graphingEquations) !== JSON.stringify(value)) {
          setGraphingEquations(value);
        }
        break;
      case "validInput":
        if (validInput !== value) {
          setValidInput(value);
        }
        break;
      case "stage":
        if (stage !== value) {
          setStage(value);
        }
        break;
      case "topic":
        if (topic !== value) {
          setTopic(value);
        }
        break;
      case "level":
        if (level !== value) {
          setLevel(value);
        }
        break;
      case "notes":
        if (notes !== value) {
          setNotes(value);
        }
        break;
      default:
        console.warn(`Attempted to update unknown field: ${field}`);
    }
  };

  const updateSession = async (updates) => {
    try {
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
      const response = await axios.patch(
        `http://localhost:5001/api/sessions/${sessionId}`,
        updates
      );
      for (const key of Object.keys(response.data)) {
        if (validUpdates.includes(key)) {
          updateSessionState(key, response.data[key]);
        }
      }
    } catch (error) {
      console.error("Failed to update session:", error);
      throw new Error("Failed to update session");
    }
  };

  //Formats the conversation transcript for easier processing in the API calls
  function formatTranscriptString(rawTranscript = inputTranscript) {
    let formattedTranscript = "";
    rawTranscript.forEach((transcriptObj) => {
      formattedTranscript += `Tutor: "${transcriptObj.tutor}."\n`;
      formattedTranscript += `Student: "${transcriptObj.student}."\n`;
    });
    return formattedTranscript;
  }

  return (
    <SharedContext.Provider
      value={{
        transcript,
        inputTranscript,
        equations,
        stage,
        topic,
        graphingEquations,
        level,
        notes,
        formatTranscriptString,
        updateSession,
        updateSessionState,
        validInput,
        setValidInput,
        error,
        setError
      }}
    >
      {children}
    </SharedContext.Provider>
  );
}
