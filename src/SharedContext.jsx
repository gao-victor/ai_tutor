import React, { createContext, useState } from "react";

export const SharedContext = createContext();

export function SharedProvider({ children }) {
  const [transcript, setTranscript] = useState([{tutor: "Hi, how can I help you today?"}]);
  const [inputTranscript, setInputTranscript] = useState([{tutor: "Hi, how can I help you today?"}]);
  const [equations, setEquations] = useState([]);
  const [validInput, setValidInput] = useState(true);
  const [stage, setStage] = useState("Setup");
  const [topic, setTopic] = useState("");
  return (
    <SharedContext.Provider
      value={{ transcript, setTranscript, inputTranscript, setInputTranscript, equations, setEquations, stage, setStage, topic, setTopic, validInput, setValidInput }}
    >
      {children}
    </SharedContext.Provider>
  );
}
