import { useContext, useEffect, useRef } from "react";
import { SharedContext } from "../../contexts/SharedContext";
import "../../App.css"

export default function Transcript() {
  const { transcript, stage, validInput, setValidInput } = useContext(SharedContext);
  const transcriptRef = useRef(null)
  useEffect(() => {
    if (transcriptRef.current){
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript])

  return (
      <div className="transcriptSection" ref={transcriptRef}>
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
  );
}
