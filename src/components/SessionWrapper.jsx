import { useParams } from "react-router-dom";
import { SharedProvider } from "../contexts/SharedContext";
import MainApp from "./MainApp";

const SessionWrapper = () => {
  const { sessionId } = useParams();
  
  return (
    <SharedProvider sessionId={sessionId}>
      <MainApp />
    </SharedProvider>
  );
};

export default SessionWrapper;
