import React, { useState, useRef, useContext } from "react";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { SharedContext } from "./SharedContext";

export default function LLM(inputText) {
  const studentLevelsMap = {
    Level0:
      "The student does not understand the concept at hand and moreover the student does not understand the immediately preceding topics; you should aim to establish a clear foundation of the topic at hand for the student, but, more importantly, you should aim to resolve any issues with the student’s knowledge of prior relevant topics.",
    Level1:
      "The student does not understand the topic at hand, though does seem to clearly understand well the immediately necessary prior topics. The student likely saw the concept taught in class but was unable to understand it. As such you should answer their questions and explain the topic on a high level - talking about the topic less mathematically rigorously and more of what the topic is and does, its significance, and what it “means”; the next big milestone is getting the student familiar enough with the topic so that they should be able to at least explain the topic on a high level.",
    Level2:
      "The student has an intuitive understanding of the topic, for example they able to explain to someone its significance and how it works on a high level, but they don’t understand it in a rigorously mathematical sense; your goal is to help tie together their high level understanding of the topic to the mathematical notation; the next big milestone is them being able to explain the topic to a fellow student, giving both a wholistic high level explanation and a mathematically rigorous explanation.",
    Level3:
      "The student has a very solid understanding of the topic, both intuitively and mathematically, but they lack the practical applicability required in their class - meaning while they understand the topic, they are unable to effectively apply it, or variations of the topic, in practice or exam problems. You should mainly answer their questions from an application-perspective, helping them solve practice problems and teaching how to now apply the topic, or variations of the topic. The next big milestone involves the student performing well on practice problems - demonstrating a solid understanding of the topic and a good ability to apply it and variations of it to solve practice problems.",
    Level4:
      "The student has a well rounded understanding of the topic and is able to effectively apply it to problems. No further guidance is needed on this topic.",
  };

  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  const openai = new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true,
  });
  let stage,
    setStage = useState("setup");

}
