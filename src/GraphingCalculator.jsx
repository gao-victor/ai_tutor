import { useEffect, useRef, useContext, useState } from "react";
import { SharedContext } from "./SharedContext";
import "./App2.css";
import Groq from "groq-sdk";
import {
  Expression,
  GraphingCalculator,
  useHelperExpression,
} from "desmos-react";

export default function GraphingCalculatorComponent() {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  const { inputTranscript, setInputTranscript, stage, setStage, topic, setTopic } =
    useContext(SharedContext);
  const [currentGraphingEquation, setCurrentGraphingEquation] = useState(0);
  const [playEquations, setPlayEquations] = useState(false);
  const [graphingEquations, setGraphingEquations] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!graphingEquations.length || !playEquations) {
        return;
      }
      setCurrentGraphingEquation(
        (currentGraphingEquation + 1) % graphingEquations.length
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [graphingEquations, currentGraphingEquation, playEquations]);

  useEffect(() => {
    getGraphingEquations();
  }, [inputTranscript]);

  function nextEquation() {
    if (!graphingEquations.length) {
      return;
    }
    setCurrentGraphingEquation(
      (currentGraphingEquation + 1) % graphingEquations.length
    );
  }

  async function getGraphingEquations() {
    if (!inputTranscript.length || stage == "Setup") {
      console.log("no transcript to retrieve graphing equations from");
      return;
    }
    try {
      const requireEquationsResponse = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful AI math tutor." },
          {
            role: "user",
            content: `Here is the transcript of a math tutor speaking to their student: ${JSON.stringify(
              inputTranscript[inputTranscript.length - 1]
            )}. Please review this and decide whether or not any 2d graphing calculations could help supplement the tutor's response. For example if the tutor is talking about derivatives, a graph of the corresponding fucntion(s) may be useful. However if the tutor is talking about pythagorean's theorem, graphical equations may not be relevant. Return your answer as a json with the field {equations: boolean}.`,
          },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });
      const haveEquations = JSON.parse(
        requireEquationsResponse.choices[0].message.content
      ).equations;
      let newEquations = [];
      if (haveEquations) {
        const response = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a helpful AI math tutor." },
            {
              role: "user",
              content: `Here is the transcript of a math tutor speaking to their student: ${JSON.stringify(
                inputTranscript[inputTranscript.length - 1]
              )}. Please review this and, if applicable, return all math equations that you find would be useful for the student to understand what the tutor is saying. These equations are meant to be put into a graphing calculator, so you should return equations that use x and y variables since they will be graphed in the standard x, y coordinate plane. Note that you do not have to return any equations if they are not relevant/applicable to what the tutor is saying. Your response should be a json object like the following: {equations: [equation1, equation2,...]} where each equation is a string representing a math equation written in latex syntax. One note on syntax is that latex expresions that use the backslash character should have two backslashes in your response; so for example for the latex expression \\frac{numerator}{denominator}, you should return \\\\frac{numerator}{denominator}.`,
            },
          ],
          model: "llama3-8b-8192",
          response_format: { type: "json_object" },
        });
        const responseJSON = JSON.parse(response.choices[0].message.content);
        newEquations = responseJSON.equations;
        console.log(newEquations);
      } else {
        console.log("no new graphing equatons are relevant");
      }
      setGraphingEquations(newEquations);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <GraphingCalculator
        attributes={{ className: "calculator" }}
        fontSize={18}
        keypad
        projectorMode
      >
        {graphingEquations && (
          <Expression
            id="equation1"
            latex={graphingEquations[currentGraphingEquation] || " "}
          ></Expression>
        )}
      </GraphingCalculator>
      <button
        className="graphControlButton"
        onClick={() => {
          nextEquation();
        }}
      >
        Next Equation
      </button>
      <button
        className="graphControlButton"
        onClick={() => {
          setPlayEquations(!playEquations);
        }}
      >
        {playEquations ? "Stop Playing" : "Play Equations"}
      </button>
    </>
  );
}
