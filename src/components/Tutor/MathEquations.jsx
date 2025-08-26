import { React, useContext, useEffect } from "react";
import { BlockMath } from "react-katex";
import { SharedContext } from "../../contexts/SharedContext";
import Groq from "groq-sdk";
import "katex/dist/katex.min.css"; // Import KaTeX CSS for styling
import "../../App.css";

function MathEquations() {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  const {
    inputTranscript,
    equations,
    setEquations,
    stage,
    topic,
    formatTranscriptString,
    updateSession,
  } = useContext(SharedContext);

  async function getMathEquations() {
    if (!inputTranscript.length || stage == "Setup") {
      console.log("no transcript to retrieve math equations from");
      return;
    }
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a helpful math tutor's assistant. The tutor is teaching the student about the ${topic}. Your job is to help the tutor teach the student by providing the math equations that are relevant to what the tutor last said to be written out to enhance the student's learning. The following text is the most recent conversation between the tutor and the student. Review this and return all math equations, that are relevant to what the tutor last said, to be written out for the student; note that you should only return equations that are relevant to what the tutor last said and would help the student learn about ${topic}. You do not need to return any equations if you believe there aren’t any relevant to what the tutor last said to be written out for the student. Also remember to evaluate the context behind what the tutor is saying; for example if the tutor is giving the student a practice problem, do not write out relevant math equations that would give away the answer to the student. Your response should be a json object like the following: {equations: [equation1, equation2,...]} where each equation is a string representing a math equation written in latex syntax. Note that latex syntax often uses the backslash character, but since your equations are returned as strings and the backslash character is a special character, you need to include two backslashes. For example traditional latex syntax to write out a fraction is just \\frac{2}{3} but since your equations are returned as strings, you would return "\\\\frac{2}{3}".`,
          },
          {
            role: "user",
            content: `${formatTranscriptString(inputTranscript)}`,
          },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const responseJSON = JSON.parse(response.choices[0].message.content);
      const newEquations = responseJSON.equations;
      await updateSession({ equations: newEquations });
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
