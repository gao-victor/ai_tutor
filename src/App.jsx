import "./App2.css";
import { useState, useRef, createContext } from "react";
import Audio from "./Audio";
import { SharedProvider } from "./SharedContext";
import Transcript from "./Transcript";
import MathEquations from "./MathEquations";


import {
  Expression,
  GraphingCalculator,
  useHelperExpression,
} from "desmos-react";
import GraphingCalculatorComponent from "./GraphingCalculator";

export default function App() {
  const gcEquationInputRef = useRef(null);
  const gcRef = useRef(null);
  const [equations, setEquations] = useState([]);
  const [equationCount, setEquationCount] = useState(0);

  function addEquation(equation) {
    setEquations([...equations, equation]);
    setEquationCount(equationCount + 1);
  }

  return (
    <div className="appContainer">
      <SharedProvider>
        <Audio></Audio>
        <MathEquations></MathEquations>
        <GraphingCalculatorComponent></GraphingCalculatorComponent>
        <Transcript></Transcript>
      </SharedProvider>
    </div>
  );
}
