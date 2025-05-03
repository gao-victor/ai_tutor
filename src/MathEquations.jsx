import { React, useContext, useEffect } from "react";
import { BlockMath } from "react-katex";
import { SharedContext } from "./SharedContext";
import Groq from "groq-sdk";
import "katex/dist/katex.min.css"; // Import KaTeX CSS for styling
import "./App2.css"

function MathEquations() {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  const { inputTranscript, setInputTranscript, equations, setEquations, stage, setStage, topic, setTopic, formatTranscriptString } =
    useContext(SharedContext);

  async function getMathEquations() {
    if (!inputTranscript.length || stage == "Setup") {
      console.log("no transcript to retrieve math equations from");
      return;
    }
    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful math tutor's assistant. Your job is to help the tutor by providing them with the math equations that are relevant to what the tutor is saying."},
          {
            role: "user",
            content: `${formatTranscriptString(
              [inputTranscript[inputTranscript.length-1]]
            )}`,
          },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const responseJSON = JSON.parse(response.choices[0].message.content);
      const newEquations = responseJSON.equations;
      console.log(newEquations)
      setEquations(newEquations);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    getMathEquations();
  }, [inputTranscript]);

  return (
    <>
      {inputTranscript && (
        <div className="equationsSection">
          {equations.map((equation, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <BlockMath>{equation}</BlockMath>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default MathEquations;
