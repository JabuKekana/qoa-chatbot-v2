import React, { useRef, useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as qna from "@tensorflow-models/qna";
import * as use from "@tensorflow-models/universal-sentence-encoder";
import { Blocks } from "react-loader-spinner";
import { Fragment } from "react";

function App() {
  const passageRef = useRef(null);
  const questionRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [model, setModel] = useState(null);
  const [informationTankVisible, setInformationTankVisible] = useState(true);
  const [sentenceEncoderModel, setSentenceEncoderModel] = useState(null);

  const loadModel = async () => {
    const loadedModel = await qna.load();
    setModel(loadedModel);
    console.log("Model loaded.");
  };

  const submitQuestion = async () => {
    if (model !== null) {
      console.log("Question submitted.");
      const passage = passageRef.current.value;
      const question = questionRef.current.value;

      // Check if the question is empty
      if (question.trim() === "") {
        const noQuestionAnswer = {
          text: "Please enter a question.",
        };
        const updatedChatHistory = [
          ...chatHistory,
          { question: "", answer: noQuestionAnswer.text },
        ];
        setChatHistory(updatedChatHistory);
        return;
      }

      // Encode the user question using Universal Sentence Encoder
      const questionEncoding = await sentenceEncoderModel.embed([question]);
      const questionVector = questionEncoding.arraySync()[0];

      const answers = await model.findAnswers(question, passage);

      let highestScoreAnswer;
      if (answers.length === 0) {
        highestScoreAnswer = {
          text: "I'm sorry, I don't have an answer to that question.",
        };
      } else {
        highestScoreAnswer = answers.reduce((prev, current) =>
          current.score > prev.score ? current : prev
        );
      }

      const updatedChatHistory = [
        ...chatHistory,
        { question, answer: highestScoreAnswer.text },
      ];
      setChatHistory(updatedChatHistory);
      questionRef.current.value = ""; 
      console.log(updatedChatHistory);
    }
  };

  useEffect(() => {
    // Load both Q&A model and Universal Sentence Encoder
    const loadModels = async () => {
      const qnaModel = await qna.load();
      setModel(qnaModel);
      console.log("Q&A Model loaded.");

      const sentenceEncoderModel = await use.load(); 
      setSentenceEncoderModel(sentenceEncoderModel);
      console.log("Universal Sentence Encoder loaded.");
    };

    loadModels();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {model == null ? (
          <div>
            <div>ChatBot v2 Loading...</div>
            <Blocks type="Puff" color="#00BFFF" height={100} width={100} />
          </div>
        ) : (
          <React.Fragment>
            {informationTankVisible && (
              <div className="information-tank">
                {/* Information Tank */}
                <textarea
                  ref={passageRef}
                  rows="30"
                  cols="100"
                  placeholder="Insert"
                ></textarea>
                <button
                  onClick={() => {
                    passageRef.current.style.display = "none";
                    document.querySelector(
                      ".information-tank button"
                    ).style.display = "none";
                  }}
                >
                  Submit
                </button>
              </div>
            )}
            <div>
              <img
                src={require("./pn44481.png")}
                alt="Image"
                className="centered-image"
              />
            </div>
            Ask a Question
            <div>
              <input
                ref={questionRef}
                size="80"
                placeholder="Enter your question"
              />
              <button onClick={submitQuestion}>Ask</button>
            </div>
            <br />
            {chatHistory.map((chat, idx) => (
              <div key={idx} className="message-container">
                <span className="User">User: {chat.question}</span>
                <br />
                <span className="ChatBot animated">
                  <br></br>Chatbot: {chat.answer}
                </span>
              </div>
            ))}
          </React.Fragment>
        )}
      </header>
    </div>
  );
}

export default App;
