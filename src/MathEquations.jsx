import { React, useContext, useEffect } from "react";
import { BlockMath } from "react-katex";
import { SharedContext } from "./SharedContext";
import Groq from "groq-sdk";
import "katex/dist/katex.min.css"; // Import KaTeX CSS for styling
import "./App2.css"

function MathEquations() {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  const { inputTranscript, setInputTranscript, equations, setEquations, stage, setStage, topic, setTopic } =
    useContext(SharedContext);

  async function getMathEquations() {
    if (!inputTranscript.length || stage == "Setup") {
      console.log("no transcript to retrieve math equations from");
      return;
    }
    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful AI math tutor." },
          {
            role: "user",
            content: `Here is the transcript of a math tutor speaking to their student: "${JSON.stringify(
              inputTranscript[inputTranscript.length-1]
            )}". Please review this and return all math equations that you think are relevant to what the math tutor is saying (you should only return math equations); note that the equations should be directly supplemental to the key topic the student is asking about. Keep in mind these equations should be supplemental to what the tutor is saying so you do not necessarily need to return any equations if you don't believe it would help clarify what the tutor is saying here. Your response should be a json object like the following: {equations: [equation1, equation2,...]} where each equation is a string representing a math equation written in latex syntax. One note on syntax is that latex expresions that use the backslash character should have two backslashes in your response; so for example for the latex expression \\frac{numerator}{denominator}, you should return \\\\frac{numerator}{denominator}`,
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
