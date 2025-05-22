import { useEffect, useRef, useContext, useState } from "react";
import { SharedContext } from "./SharedContext";
import "./App2.css";
import Groq from "groq-sdk";
import {
  Expression,
  GraphingCalculator,
  useHelperExpression,
  ScientificCalculator,
} from "desmos-react";

export default function GraphingCalculatorComponent() {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  const {
    inputTranscript,
    setInputTranscript,
    stage,
    setStage,
    topic,
    setTopic,
    formatTranscriptString,
  } = useContext(SharedContext);
  const [currentGraphingEquation, setCurrentGraphingEquation] = useState(0);
  const [playEquations, setPlayEquations] = useState(false);
  const [graphingEquations, setGraphingEquations] = useState([]);

  // Interval to loop through graphingEquations on UI by incrementing currentGraphingEquation if playEquations is true
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

  // Get new graphing equations from LLM API whenever inputTranscript is updated
  useEffect(() => {
    getGraphingEquations();
  }, [inputTranscript]);

  // Increment currentGraphingEquation to the next equation in graphingEquations
  function nextEquation() {
    if (!graphingEquations.length) {
      return;
    }
    setCurrentGraphingEquation(
      (currentGraphingEquation + 1) % graphingEquations.length
    );
  }

  // Get new graphing equations from LLM API whenever inputTranscript is updated
  async function getGraphingEquations() {
    if (!inputTranscript.length || stage == "Setup") {
      console.log("no transcript to retrieve graphing equations from");
      return;
    }
    try {
      let newGraphingEquations = [];
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a helpful math tutor's assistant. The tutor is teaching the student about the ${topic}. Your job is to help the tutor teach the student by providing 2D graphs that are relevant to what the tutor last said to enhance the student's learning. You will provide these graphs by providing the math equations to be graphed; note that since these equations will be graphed in a standard graphing calculator, you should only ever use ‘x’ and ‘y’ for variables. The following text is the most recent conversation between the tutor and the student. Review this and return all math equations, that are relevant to what the tutor last said, to be graphed out to enhance the student’s learning. Also when considering returning graphs, consider the context of what the tutor's saying; for example if the tutor is giving the student a practice problem, don't provide graphs that would give away the solution. Return your response as a json object with the following schema: {graphs: [graphingEquationsSet_1, graphingEquationsSet_2,…]} where graphingEquationsSet_i is the i_th set of graphing equations to be displayed at a given time. What I mean is is that since a graph can include multiple functions, the set of graphing equations is the set of functions to be graphed together on one screen to form a single graph to be displayed to the user. You can include multiple graphs. A last note on syntax: your math equations should use latex syntax, and since your equations are first returned as a string and the backslash is a special character, use two backslashes each time you use the backslash. Additionally, each set of graphing equations should always be an array, even if the array contains zero or one element, but you can supply as many sets of graphing equations as you deem appropriate.`,
          },
          {
            role: "user",
            content: formatTranscriptString(inputTranscript.slice(0, 3)),
          },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });
      const responseJSON = JSON.parse(response.choices[0].message.content);
      newGraphingEquations = responseJSON["graphs"];
      console.log(newGraphingEquations);
      setGraphingEquations(newGraphingEquations);
      setCurrentGraphingEquation(0); // Always reset to first set
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
        {graphingEquations && graphingEquations[currentGraphingEquation] && (
          <>
            <Expression
              id="equation1"
              latex={graphingEquations[currentGraphingEquation][0] || " "}
            ></Expression>
            <Expression
              id="equation2"
              latex={graphingEquations[currentGraphingEquation][1] || " "}
            ></Expression>
            <Expression
              id="equation3"
              latex={graphingEquations[currentGraphingEquation][2] || " "}
            ></Expression>
            <Expression
              id="equation4"
              latex={graphingEquations[currentGraphingEquation][3] || " "}
            ></Expression>
            <Expression
              id="equation5"
              latex={graphingEquations[currentGraphingEquation][4] || " "}
            ></Expression>
          </>
        )}
      </GraphingCalculator>
      <button className="graphControlButton" onClick={nextEquation}>
        Next Equation
      </button>
      <button
        className="graphControlButton"
        onClick={() => setPlayEquations(!playEquations)}
      >
        {playEquations ? "Stop Playing" : "Play Equations"}
      </button>
    </>
  );
}
