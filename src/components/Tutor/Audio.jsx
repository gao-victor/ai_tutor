import React, { useState, useRef, useContext, useEffect } from "react";
import Groq from "groq-sdk";
import OpenAI from "openai/index.mjs";
import { SharedContext } from "../../contexts/SharedContext";
import "../../App.css";
export default function Audio() {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  const openai = new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true,
  });
  const [audioURL, setAudioURL] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const recordAudioRef = useRef(null);
  const sendAudioRef = useRef(null);
  const {
    transcript,
    setTranscript,
    inputTranscript,
    setInputTranscript,
    topic,
    setTopic,
    validInput,
    setValidInput,
    formatTranscriptString,
  } = useContext(SharedContext);
  const { stage, setStage } = useContext(SharedContext); //Stage of the conversation between the tutor and the student, i.e. Setup, Learn, or Practice
  const [level, setLevel] = useState(""); //Student's current level of understanding of the topic
  const [notes, setNotes] = useState(""); //Summary of the conversation between the tutor and the student
  const mediaStreamRef = useRef(null);

  //Level of Understanding framework used to assess student's level of understanding of the topic in extractStudentLevel API call
  const levelOfUnderstandingMap = {
    Level1: `The student has not demonstrated any understanding of the ${
      topic ? topic : "topic"
    } at hand.`,
    Level2: `The student has demonstrated a solid intutuitive understanding of the ${
      topic ? topic : "topic"
    }, but has not demonstrated a solid understanding and comfortability of the mathematical notation, i.e. they may be able to explain to someone what the ${
      topic ? topic : "topic"
    } is, what it does, or what it "means", but they're unable to explain the mathematical notation or how it mathematically works.`,
    Level3: `The student has demonstrated a strong understanding of the ${
      topic ? topic : "topic"
    } - demonstrating a solid inutitive understanding and a solid understanding and comfortability with the mathematical notation. However the student has not yet demonstrated a strong enough understanding to where they can recognzie and understand corrolaries, logcial extensions, or variations of ${
      topic ? topic : "topic"
    } - meaning they're only able to recognzie that the ${
      topic ? topic : "topic"
    } can be applied to a problem or scenario if it's presented at face value.`,
    Level4: `The student has demonstrated a strong, well rounded understanding of the ${
      topic ? topic : "topic"
    } - so much so that they're able to apply their knowledge to alternative and unfamiliar scenarios. This level is only relevant if there are techniques, tricks, or tips surrounding ${
      topic ? topic : "topic"
    } to solve exam problems they'd encounter that they have not demonstrated knowledge of yet.`,
    Level5: `The student has a demonstrated a mastery of understanding of the ${
      topic ? topic : "topic"
    }. They are able to teach others about ${
      topic ? topic : "topic"
    } and are comfortably able to solve difficult, unfamiliar problems related to ${
      topic ? topic : "topic"
    }.`,
  };

  //Level of Understanding guide used to guide the tutor's response to the student in askTutor API call
  const levelOfUnderstandingGuideMap = {
    Level1: `You should explain the ${
      topic ? topic : "topic"
    } and answer their questions in a way that is intuitive and easy to understand. You should not be using much, if any, mathematical notation. The goal here is for them to develop a solid understanding of broadly what the topic is or what it does.`,
    Level2: `You should explain the ${
      topic ? topic : "topic"
    } and answer their questions mathematically. The goal is for the student to understand and be comfortable with the mathematical notation of the topic they're asking about.`,
    Level3: `You should explain the ${
      topic ? topic : "topic"
    } and answer their questions while trying to introduce to them relevant and practical corollaries or variations of the ${
      topic ? topic : "topic"
    }. Since the student has demonstrated an understanding of the ${
      topic ? topic : "topic"
    } at face value, the goal here is for the student to be comfortable with variations of it that they might see or use to further expand and deepen their understanding of the ${
      topic ? topic : "topic"
    } outside of the original notation presented.`,
    Level4: `You should explain the ${
      topic ? topic : "topic"
    } and answer their questions while trying to introduce to them techniques and tricks for solving problems related to the ${
      topic ? topic : "topic"
    }. Since the student has demonstrated a solid and well rounded understanding of the ${
      topic ? topic : "topic"
    } and its variations, the goal here is to strengthen their ability to solve homework or exam problems.`,
    Level5: `No further guidance is necessarily needed at this level. If the student wishes to continue doing practice problems with you, or has specific questions, you should continue to guide and help them. However you can definitely recommend to the student to move on to a different topic at this point if they seem like they'd want to. Otherwise, there is no specific manner in which you should answer their questions or help them as they've already demonstrated a very well rounded understanding. Continue to solidfy their understanding by closing any gaps of knowledge related to the ${
      topic ? topic : "topic"
    } they may have.`,
  };

  //Sets the audio blob and url to be used for the audio player and recording
  function setAudio(audioBlob = null, audioURL = null) {
    setAudioBlob(audioBlob);
    setAudioURL(audioURL);
  }

  //Converts the level of understanding string to an integer
  function intLevel(stringLevel) {
    try {
      return parseInt(stringLevel.slice(5), 10);
    } catch (err) {
      console.error(err);
    }
  }

  //Disables the record and send audio buttons when recording is in progress
  function recordSwitchDisable(state) {
    switch (state) {
      case "off":
        recordAudioRef.current.setAttribute("disabled", true);
        sendAudioRef.current.setAttribute("disabled", true);
        break;
      case "on":
        sendAudioRef.current.removeAttribute("disabled");
        recordAudioRef.current.removeAttribute("disabled");
        break;
    }
  }

  //Starts the recording process
  async function startRecording() {
    setRecording(true);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    mediaRecorderRef.current = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      setRecording(false);
      const blob = new Blob(audioChunks, { type: "audio/wav" });
      const blobURL = URL.createObjectURL(blob);
      setAudio(blob, blobURL);
    };

    mediaRecorderRef.current.start();
  }

  function stopRecording() {
    mediaRecorderRef.current.stop();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }

  async function transcribeAudio() {
    if (!audioBlob) {
      console.log("record audio first");
      return;
    }
    try {
      console.log("transcribing audio now...");
      const audioFile = new File([audioBlob], "audio.wav", {
        type: "audio/wav",
      });
      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3",
        response_format: "json",
        language: "en",
      });
      console.log("transcribed audio: " + transcription.text);
      return transcription.text;
    } catch (err) {
      console.error(err);
      return "";
    }
  }

  async function transcribeText(inputText) {
    if (!inputText) {
      console.log("No input text specified");
      return;
    }
    try {
      console.log("transcribing text to audio now...");
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: inputText,
      });
      const audioResponse = await response.blob();
      const audioResponseURL = URL.createObjectURL(audioResponse);
      setAudio(audioResponse, audioResponseURL);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioResponseURL;
        audioPlayerRef.current.play().catch((error) => {
          console.error("Auto-play failed:", error);
        });
        audioPlayerRef.current.playbackRate = 1.1;
      }
    } catch (err) {
      console.error(err);
      return "";
    }
  }

  //API call to LLM to extract general information from the student's response
  async function extractInfo(
    inputText,
    info,
    infoJSONName = info,
    infoJSONType = "String",
    additionalSystemPrompt = "",
    canChangeTopic = false
  ) {
    if (!inputText) {
      console.log("Input text null");
      return;
    }
    try {
      let messages = [
        {
          role: "system",
          content: `You are a helpful math tutor's assistant. The following text is a student talking to their math tutor${
            topic ? " about " + topic : ""
          }. Analyze the student's response and extract the student's ${info}. ${additionalSystemPrompt}Return the student's ${info} and your explanation for why you think this is thier ${info} as a json object with the following schema: {${infoJSONName}: ${infoJSONType}, explanation: String}. If it's unclear what the student's ${info} is from their response, or if their response is completely unrelated to the conversation, set ${infoJSONName} to "invalidInput". ${
            canChangeTopic
              ? `If the student's response indicates that they'd like to change the topic of discussion, set ${infoJSONName} to "changeTopic" and "explanation" to the topic they're asking about; in this case if they're trying to change the topic, the "explanation" field should only be the topic they're asking about.`
              : ""
          }`,
        },
        { role: "user", content: inputText },
      ];
      console.log("messages: " + JSON.stringify(messages));
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });
      console.log(
        "Extracted " + info + ": " + completion.choices[0].message.content
      );
      return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.error(err);
    }
  }

  //API call to LLM to extract the student's level of understanding of the topic; built on top of extractInfo function
  async function extractStudentLevel(
    recentInput,
    includePreviousLevel = true,
    includeTranscript = true,
    canChangeTopic = false
  ) {
    try {
      let inputText = recentInput;
      if (includeTranscript) {
        let newTranscript = [...inputTranscript];
        newTranscript[newTranscript.length - 1] = {
          ...newTranscript[newTranscript.length - 1],
          student: recentInput,
        };
        inputText = formatTranscriptString(newTranscript);
      }
      let additionalSystemPrompt = includePreviousLevel
        ? `Here is a framework for assessing a student's level of understanding of the topic: ${JSON.stringify(
            levelOfUnderstandingMap
          )}. Previously you had said the student was at ${level}. Use this framework to determine the student's current level of understanding and return the level they are at. `
        : `Here is a framework for assessing a student's level of understanding of the topic: ${JSON.stringify(
            levelOfUnderstandingMap
          )}. Use this framework to determine the student's level of understanding and return the level they are at. `;
      const response = await extractInfo(
        inputText,
        "level of understanding",
        "levelOfUnderstanding",
        "String",
        additionalSystemPrompt,
        canChangeTopic
      );
      return [response["levelOfUnderstanding"], response["explanation"]];
    } catch (err) {
      console.error(err);
    }
  }

  //API call to LLM to summarize conversation between tutor and student
  async function summarizeTranscript(
    transcript,
    includePreviousSummary = true
  ) {
    let messages = [];
    //If there is a previous summary, new summary will be built on top of it
    if (includePreviousSummary) {
      messages.push({
        role: "system",
        content: `You are a helpful middle school and high school math tutor's assistant. Your job is to create a summary of their converation for the tutor to use as a helpful reference. This summary should include all key details about the conversation, ideas about ${topic} covered, ideas or concepts related to ${topic} student struggled with, ideas or concepts related to ${topic} the student somewhat grasped, ideas or concepts related to ${topic} the student demonstrated mastery over, and the student's general progression in learning ${topic}. Here was your summary thus far of the conversation between the tutor and the assistant: \n"${notes}"\nHere is the most recent conversation between the tutor and the student: "\n${formatTranscriptString(
          [transcript[0]]
        )}"\nCreate a new summary of their conversation thus using your previous summary and their most recent conversation. Return the summary as a json object with the following schema: {conversationNotes: String}.`,
      });
    } else {
      //If there is no previous summary, new summary will be created from scratch based on the entire transcript
      messages.push({
        role: "system",
        content: `You are a helpful middle school and high school math tutor's assistant. The following text is the transcript of the tutor teaching the student about ${topic}. Your job is to create a summary of their converation for the tutor to use as a helpful reference. This summary should include all key details about the conversation, ideas about ${topic} covered, ideas or concepts related to ${topic} student struggled with, ideas or concepts related to ${topic} the student somewhat grasped, ideas or concepts related to ${topic} the student demonstrated mastery over, and the student's general progression in learning ${topic}. Return the summary as a json object with the following schema: {conversationNotes: String}.`,
      });
      messages.push({
        role: "user",
        content: formatTranscriptString([transcript[0]]),
      });
    }
    console.log(messages[0].content, messages[1]?.content);
    try {
      const response = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });
      return JSON.parse(response.choices[0].message.content)[
        "conversationNotes"
      ];
    } catch (err) {
      console.error(err);
    }
  }

  //Initial setup process to establish topic of disucssion and user's base starting level of understanding; occurs for first two audio inputs from student
  async function setup() {
    //First User Input
    if (!transcript[0].student) {
      const transcribedText = await transcribeAudio();
      const requestedTopicResponse = await extractInfo(
        transcribedText,
        "requested topic",
        "requestedTopic"
      );
      if (requestedTopicResponse["requestedTopic"] == "invalidInput") {
        console.log("Invalid input, need to try again");
        await transcribeText("Sorry can you repeat that?");
        setValidInput(false);
        return;
      }
      const topic = requestedTopicResponse["requestedTopic"];
      await transcribeText("What do you know about " + topic + "?");
      let newTranscript = [
        { tutor: "Hi, how can I help you today", student: transcribedText },
        { tutor: "What do you know about " + topic + "?" },
      ];
      setTopic(topic);
      setTranscript(newTranscript);
      setInputTranscript(newTranscript);
      //Second User Input
    } else if (!inputTranscript[1].student) {
      const transcribedText = await transcribeAudio();
      const [levelOfUnderstanding, levelOfUnderstandingExplanation] =
        await extractStudentLevel(transcribedText, false, true, true);
      if (levelOfUnderstanding == "invalidInput") {
        console.log("Invalid input, need to try again");
        await transcribeText("Sorry can you repeat that?");
        setValidInput(false);
        return;
      } else if (levelOfUnderstanding == "changeTopic") {
        let newTopicTranscript = [];
        newTopicTranscript.push({
          tutor: "Hi, how can I help you today",
          student: transcribedText,
        });
        newTopicTranscript.push({
          tutor: `Sorry about that, let's change the topic to ${levelOfUnderstandingExplanation}. What do you know about ${levelOfUnderstandingExplanation}?`,
        });
        await transcribeText(
          `Sorry about that, let's change the topic to ${levelOfUnderstandingExplanation}. What do you know about ${levelOfUnderstandingExplanation}?`
        );
        setTranscript(newTopicTranscript);
        setInputTranscript(newTopicTranscript);
        setTopic(levelOfUnderstandingExplanation);
        return;
      }
      let newTranscript = transcript.map((transcriptObj) => {
        return { tutor: transcriptObj.tutor, student: transcriptObj.student };
      });
      newTranscript[1].student = transcribedText;
      const tutorResponse = await askTutor(
        newTranscript,
        levelOfUnderstanding,
        levelOfUnderstandingExplanation
      );
      await transcribeText(tutorResponse);
      newTranscript.push({
        tutor: tutorResponse,
      });
      setTranscript(newTranscript);
      setInputTranscript(newTranscript);
      setLevel(levelOfUnderstanding);
      setStage("Learn");
    } else {
      console.error("Set up failed, should not have reached this point");
    }
  }
  //API call to LLM to generate tutor's response. Takes in student's most recent input, inputTranscript which is the most recent 5 conversations between the tutor and the student, newLevel which is the student's current level of udnerstanding, levelExplanation, and Summary of early conversation
  async function askTutor(
    inputTranscript,
    newLevel,
    levelExplanation = "",
    includeSummary = ""
  ) {
    try {
      let messages = [
        {
          role: "system",
          content: `You are a middle school and high school math tutor. You are teaching your student about ${topic}.`,
        },
      ];
      if (includeSummary) {
        messages.push({
          role: "system",
          content: `Here is a summarization of the beginning of your conversation with your student: "${includeSummary}".`,
        });
      }
      inputTranscript.forEach((transcriptObj, index) => {
        if (transcriptObj["tutor"]) {
          messages.push({
            role: "assistant",
            content: transcriptObj["tutor"],
          });
        }
        if (transcriptObj["student"]) {
          if (index != inputTranscript.length - 1) {
            messages.push({
              role: "user",
              content: transcriptObj["student"],
            });
          }
        }
      });
      messages.push({
        role: "system",
        content: `Here is your assistant's assesment of the student's understanding of ${topic}: "${
          levelExplanation + " " + levelOfUnderstandingGuideMap[newLevel]
        }". Use this information as a guide to respond to your student.`,
      });
      messages.push({
        role: "user",
        content: inputTranscript[inputTranscript.length - 1]["student"],
      });
      console.log("messages: " + JSON.stringify(messages));
      const response = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
      });
      console.log("tutor said: " + response.choices[0].message.content);
      return response.choices[0].message.content;
    } catch (err) {
      console.error(err);
    }
  }

  //Main learning process
  async function learn() {
    if (intLevel(level) <= 4) {
      const transcribedText = await transcribeAudio();
      const [currLevel, currLevelExplanation] = await extractStudentLevel(
        transcribedText
      );
      if (currLevel == "invalidInput") {
        console.log("Invalid input, need to try again");
        await transcribeText("Sorry can you repeat that?");
        setValidInput(false);
        return;
      }
      let summary = "";
      let newTranscript = transcript.map((transcriptObj) => {
        return { tutor: transcriptObj.tutor, student: transcriptObj.student };
      });
      let newInputTranscript = inputTranscript.map((transcriptObj) => {
        return { tutor: transcriptObj.tutor, student: transcriptObj.student };
      });
      newTranscript[newTranscript.length - 1].student = transcribedText;
      newInputTranscript[newInputTranscript.length - 1].student =
        transcribedText;
      //only summarize conversation after 5 inputs from student
      if (inputTranscript.length >= 5) {
        summary = await summarizeTranscript(newInputTranscript, notes != "");
        newInputTranscript.shift();
        console.log("summary: " + summary);
      }
      const diffLevel = currLevel != level;
      const response = await askTutor(
        newInputTranscript,
        currLevel,
        currLevelExplanation,
        summary
      );
      await transcribeText(response);
      newTranscript.push({ tutor: response });
      newInputTranscript.push({ tutor: response });
      //inputTranscript is only used for API calls, so only kept to 5 most recent inputs
      if (newInputTranscript.length >= 5) {
        setNotes(summary);
      }
      setTranscript(newTranscript);
      setInputTranscript(newInputTranscript);
      if (diffLevel) {
        if (intLevel(currLevel) == 5) {
          setStage("Practice");
        }
        setLevel(currLevel);
      }
    } else {
      console.error(
        "Shouldn't be here; level is past 4 but still at the learning stage "
      );
    }
  }

  //API call to LLM to generate tutor's practice questions
  async function askTutorPracticeMode(
    inputTranscript,
    newLevel,
    levelExplanation = "",
    includeSummary = ""
  ) {
    try {
      let messages = [
        {
          role: "system",
          content: `You are a middle school and high school math tutor. You are teaching your student about ${topic}.`,
        },
      ];
      if (includeSummary) {
        messages.push({
          role: "system",
          content: `Here is a summarization of the beginning of your conversation with your student: "${includeSummary}".`,
        });
      }
      inputTranscript.forEach((transcriptObj, index) => {
        if (transcriptObj["tutor"]) {
          messages.push({
            role: "assistant",
            content: transcriptObj["tutor"],
          });
        }
        if (transcriptObj["student"]) {
          if (index != inputTranscript.length - 1) {
            messages.push({
              role: "user",
              content: transcriptObj["student"],
            });
          }
        }
      });
      messages.push({
        role: "system",
        content: `Here is your assistant's assesment of the student's understanding of ${topic}: "${
          levelExplanation + " " + levelOfUnderstandingGuideMap[newLevel]
        }". Use this information as a guide to respond to your student.`,
      });
      messages.push({
        role: "user",
        content: inputTranscript[inputTranscript.length - 1]["student"],
      });
      console.log("messages: " + JSON.stringify(messages));
      const response = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
      });
      console.log("tutor said: " + response.choices[0].message.content);
      return response.choices[0].message.content;
    } catch (err) {
      console.error(err);
    }
  }

  async function practice() {
    //ask tutor in practice mode - generate questions, answer and check questions, give feedback, repeast
    if (intLevel(level) == 5) {
      const transcribedText = await transcribeAudio();
      const [currLevel, currLevelExplanation] = await extractStudentLevel(
        transcribedText
      );
      if (currLevel == "invalidInput") {
        console.log("Invalid input, need to try again");
        await transcribeText("Sorry can you repeat that?");
        setValidInput(false);
        return;
      }
      let summary = "";
      let newTranscript = transcript.map((transcriptObj) => {
        return { tutor: transcriptObj.tutor, student: transcriptObj.student };
      });
      let newInputTranscript = inputTranscript.map((transcriptObj) => {
        return { tutor: transcriptObj.tutor, student: transcriptObj.student };
      });
      newTranscript[newTranscript.length - 1].student = transcribedText;
      newInputTranscript[newInputTranscript.length - 1].student =
        transcribedText;
      //only summarize conversation after 5 inputs from student
      if (inputTranscript.length >= 5) {
        summary = await summarizeTranscript(newInputTranscript, notes != "");
        newInputTranscript.shift();
        console.log("summary: " + summary);
      }
      const diffLevel = currLevel != level;
      const response = await askTutorPracticeMode();
      await transcribeText(response);
      newTranscript.push({ tutor: response });
      newInputTranscript.push({ tutor: response });
      //inputTranscript is only used for API calls, so only kept to 5 most recent inputs
      if (newInputTranscript.length >= 5) {
        setNotes(summary);
      }
      setTranscript(newTranscript);
      setInputTranscript(newInputTranscript);
      if (intLevel(currLevel) < 5) {
        setStage("Learn");
        setLevel(currLevel);
      }
    } else {
      console.error(
        "Shouldn't be here; level is not 5 but still at the practice stage"
      );
    }
    //Still check student's level of understanding in case in turns out to be lower than expected
  }

  async function main() {
    console.log(inputTranscript);
    setValidInput(true);
    if (recording) {
      stopRecording();
    }
    recordSwitchDisable("off");
    switch (stage) {
      case "Setup":
        await setup();
        break;
      case "Learn":
        await learn();
        break;
      case "Practice":
        await practice();
        break;
    }
    recordSwitchDisable("on");
  }

  return (
    <>
      <div className="topBar">
        <button
          ref={recordAudioRef}
          onClick={recording ? stopRecording : startRecording}
          className={`recordAudioButton ${recording ? "recording" : ""}`}
        >
          {recording ? "Stop" : "Start"}
        </button>
        {audioBlob && (
          <button onClick={main} ref={sendAudioRef} className="sendAudioButton">
            Tutor Me!
          </button>
        )}
        <audio ref={audioPlayerRef} hidden={!audioURL} />
      </div>
    </>
  );
}
