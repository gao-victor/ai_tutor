import React, { useContext } from "react";
import { SharedContext } from "./SharedContext";

export default function Transcript() {
  const { transcript, stage, validInput, setValidInput } = useContext(SharedContext);
  return (
    <>
      <div className="transcriptSection">
        {!validInput && <p className="transcriptText" style={{color: "red"}}>Invalid input, please try again</p>}
        <ul>
          {transcript &&
            transcript.map((transcript) => (
              <>
              <p className="transcriptText">{transcript.tutor}</p>
                <li className="transcriptText">{transcript.student}</li>
              </>
            ))}
        </ul>
      </div>
    </>
  );
}
