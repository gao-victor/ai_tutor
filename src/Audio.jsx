import React, { useState, useRef, useContext } from "react";
import Groq from "groq-sdk";
import OpenAI from "openai/index.mjs";
import { SharedContext } from "./SharedContext";
export default function Audio() {
  const levelOfUnderstandingMap = {
    Level1:
      "The student has not demonstrated any understanding of the topic at hand.",
    Level2:
      "The student has demonstrated an intutuitive understanding of the topic, but does not seeem to understand the mathemtaical notation.",
    Level3:
      "The student has a demonstrated a well rounded understanding of the topic, both intuitively and mathematically. However the student has not demonstrated comfortability with variations and corollaries of it that they'd use to solve problems they'd encounter in class or on homeworks.",
    Level4:
      "The student has demonstrated a welll rounded understanding of the topic and practical, relevant corollaries or variations. However the student has not demonstrated comfortability with applying the topic to solve homework or exam problems - possibly because they're unfamiliar with techniques, tricks, and strategies related to the topic.",
    Level5:
      "The student has a demonstrated very solid understanding of the topic - both of the topic itself and practical applications of the topic.",
  };

  const levelOfUnderstandingGuideMap = {
    Level1:
      "You should explain the topic and answer their questions in a way that is intuitive and easy to understand. You should not be using much, if any, mathematical notation. The goal is for the student to understand what the topic they're asking about is and what it does.",
    Level2:
      "You should explain the topic and answer their questions mathematicall. The goal is for the student to understand the mathematical notation of the topic they're asking about and be able to apply it to their intutive understanding.",
    Level3:
      "You should explain the topic and answer their questions while trying to introduce to them relevant and practical corollaries or variations of the topic. Since the student has demonstrated an understanding of the topic at face value, the goal here is for the student to be comfortable with variations of it that they might see or use when solving problems.",
    Level4:
      "You should explain the topic and answer their questions while trying to introduce to them techniques and tricks for solving problems related to the topic. Since the student has demonstrated a well rounded understanding of the topic and its corollaries/variations, the goal here is simply for them to get better at solving homework or exam problems by expanding their knowledge of the topic and related techniques and tricks.",
    Level5:
      "No further guidance is necessarily needed at this level. Of course if the student wishes to keep practicing problems with you, or has questions abou the toipc, you should continue to guide and help them. However you can definitely recommend to the student to move on to a different topic at this point if they seem like they'd want to. Otherwise, there is no specific manner in which you should answer their questions or help them as they've already demonstrated a very well rounded understanding. Continue to solidfy their understanding by closing any gaps of knowledge related to this topic they may have.",
  };

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
    topic,
    setTopic,
    validInput,
    setValidInput,
  } = useContext(SharedContext);
  const { stage, setStage } = useContext(SharedContext);
  const [level, setLevel] = useState("");

  function setAudio(audioBlob = null, audioURL = null) {
    setAudioBlob(audioBlob);
    setAudioURL(audioURL);
  }

  function intLevel(stringLevel) {
    try {
      return parseInt(stringLevel.slice(5), 10);
    } catch (err) {
      console.error(err);
    }
  }

  function recordSwitch(state) {
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

  async function startRecording() {
    setRecording(true);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        audioPlayerRef.current.playbackRate = 1.2;
      }
    } catch (err) {
      console.error(err);
      return "";
    }
  }

  async function summarizeTranscript(transcript, includePreviousSummary=true) {
    let messages = [];
    if (includePreviousSummary) {
    }
    else{
      messages.push({role: "system", content: `You are a helpful middle school and high school math tutor's assistant. The following text is the transcript of the tutor teaching the student about ${topic}. Your job is to create a summary of their converation for the tutor to use as a helpful reference. This summary should be concise, but include all key details about the conversation and the student's progress in learning ${topic}. Return the summary as a json object with the following schema: {conversationNotes: String}`});
    }
    messages.push({role: "user", content: JSON.stringify(transcript)});
    try{
      const response = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
        response_format: { type: "json_object" },
      });
      return JSON.parse(response.choices[0].message.content)["conversationNotes"];
    }
    catch(err){
      console.error(err);
    }
  }

  async function extractInfo(
    inputText,
    info,
    infoJSONName = info,
    infoJSONType = "String",
    additionalSystemPrompt = ""
  ) {
    if (!inputText) {
      console.log("Input text null");
      return;
    }
    try {
      let messages = [
        {
          role: "system",
          content: `You are a helpful assistant. The following text is a student talking to their math tutor${
            topic ? " about " + topic : ""
          }. Analyze the student's response and extract the student's ${info}. ${additionalSystemPrompt}Return the student's ${info} and your explanation for why you think this is thier ${info} as a json object with the following schema: {${infoJSONName}: ${infoJSONType}, explanation: String}. If it's unclear what the student's ${info} is from their most recent response, or if their response is completely unrelated to the conversation, set ${infoJSONName} to "invalidInput".`,
        },
        { role: "user", content: inputText },
      ];
      console.log("messages: " + JSON.stringify(messages));
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
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

  async function extractStudentLevel(
    recentInput,
    includePreviousLevel = true,
    includeTranscript = true
  ) {
    try {
      let inputText = recentInput;
      if (includeTranscript) {
        let newTranscript = [...transcript];
        newTranscript[newTranscript.length - 1] = {
          ...newTranscript[newTranscript.length - 1],
          student: recentInput,
        };
        inputText = JSON.stringify(newTranscript);
      }
      let additionalSystemPrompt = includePreviousLevel
        ? `Here is a framework for assessing a student's level of understanding of the topic: ${JSON.stringify(
            levelOfUnderstandingMap
          )}. Previously you had said the student was at level ${level}. Use this framework to determine the student's current level of understanding.`
        : `Here is a framework for assessing a student's level of understanding of the topic: ${JSON.stringify(
            levelOfUnderstandingMap
          )}. Use this framework to determine the student's level of understanding and return the level they are at. `;
      const response = await extractInfo(
        inputText,
        "level of understanding",
        "levelOfUnderstanding",
        "String",
        additionalSystemPrompt
      );
      return response["levelOfUnderstanding"];
    } catch (err) {
      console.error(err);
    }
  }

  async function setup() {
    if (!transcript[0].student) {
      const transcribedText = await transcribeAudio();
      const response = await extractInfo(
        transcribedText,
        "requested topic",
        "requestedTopic"
      );
      if (response["requestedTopic"] == "invalidInput") {
        console.log("Invalid input, need to try again");
        await transcribeText("Sorry can you repeat that?");
        setValidInput(false);
        return;
      }
      const topic = response["requestedTopic"];
      let newTranscript = [...transcript];
      newTranscript[0].student = transcribedText;
      await transcribeText("What do you know about " + topic + "?");
      setTopic(topic);
      setTranscript([
        ...newTranscript,
        { tutor: "What do you know about " + topic + "?" },
      ]);
    } else if (!transcript[1].student) {
      const transcribedText = await transcribeAudio();
      const levelOfUnderstanding = await extractStudentLevel(
        transcribedText,
        false,
        false
      );
      if (levelOfUnderstanding == "invalidInput") {
        console.log("Invalid input, need to try again");
        await transcribeText("Sorry can you repeat that?");
        setValidInput(false);
        return;
      }
      transcript[1].tutor = "What do you know about " + topic + "?";
      const response = await askTutor(
        transcribedText,
        [...transcript],
        levelOfUnderstanding
      );
      await transcribeText(response);
      let newTranscript = [...transcript];
      newTranscript[1].student = transcribedText;
      newTranscript.push({
        tutor: response,
      });
      setTranscript(newTranscript);
      setLevel(levelOfUnderstanding);
      setStage("Learn");
    } else {
      console.error("Set up failed, should not have reached this point");
    }
  }
  async function askTutor(studentInput, inputTranscript, newLevel) {
    if (!studentInput) {
      console.log("Need student input to ask tutor");
      return;
    }
    try {
      let messages = [
        {
          role: "system",
          content: `You are a middle school and high school math tutor. You are teaching your student about ${topic}.`,
        },
      ];
      inputTranscript.forEach((transcriptObj) => {
        if (transcriptObj["tutor"]) {
          messages.push({
            role: "assistant",
            content: transcriptObj["tutor"],
          });
        }
        if (transcriptObj["student"]) {
          messages.push({
            role: "user",
            content: transcriptObj["student"],
          });
        }
      });
      messages.push({
        role: "system",
        content: `Here is your assistant's assesment of the student's understanding of ${topic}: "${levelOfUnderstandingMap[newLevel]} ${levelOfUnderstandingGuideMap[newLevel]}". Use this new information as a guide to respond to your student.`,
      });
      messages.push({
        role: "user",
        content: studentInput,
      });
      console.log("messages: " + JSON.stringify(messages));
      const response = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
      });
      console.log("tutor said: " + response.choices[0].message.content);
      return response.choices[0].message.content;
    } catch (err) {
      console.error(err);
    }
  }

  async function learn() {
    if (intLevel(level) <= 4) {
      if (transcript.length >= 3){
        const summary = await summarizeTranscript(transcript, false);
        console.log("summary: " + summary);
      }
      const transcribedText = await transcribeAudio();
      const currLevel = await extractStudentLevel(transcribedText);
      if (currLevel == "invalidInput") {
        console.log("Invalid input, need to try again");
        await transcribeText("Sorry can you repeat that?");
        setValidInput(false);
        return;
      }
      const diffLevel = currLevel != level;
      const response = await askTutor(
        transcribedText,
        [...transcript],
        diffLevel ? currLevel : undefined
      );
      await transcribeText(response);
      let newTranscript = [...transcript];
      newTranscript[newTranscript.length - 1].student = transcribedText;
      newTranscript.push({ tutor: response });
      setTranscript(newTranscript);
      if (diffLevel) {
        setLevel(currLevel);
      }
      if (intLevel(currLevel) == 5) {
        setStage("Practice");
      }
    } else {
      console.error(
        "Shouldn't be here; level is past 4 but still at the learning stage "
      );
    }
  }

  async function main() {
    setValidInput(true);
    console.log(
      "stage: " + stage,
      "topic: " + topic,
      "transcript: " +
        transcript.map(
          (transcript) =>
            "{tutor: " +
            transcript.tutor +
            ", student: " +
            transcript.student +
            "}"
        ) +
        " level: " +
        level
    );
    recordSwitch("off");
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
    recordSwitch("on");
  }

  return (
    <div>
      <button
        ref={recordAudioRef}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioBlob && (
        <button onClick={main} ref={sendAudioRef}>
          Send to API
        </button>
      )}
      <audio ref={audioPlayerRef} hidden={!audioURL} />
    </div>
  );
}
