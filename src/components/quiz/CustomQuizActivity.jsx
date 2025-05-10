import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { useAuth } from "../../contexts/AuthContext";
import Question from "./Question";
import DoneModal from "./DoneModal";
import HelpModal from "./HelpModal";
import Timer from "./Timer";
import ProgressBar from "./ProgressBar";
import BackToTop from "./BackToTopButton";
import BackGroundMusic from "../sounds/BackGroundMusic";

function CustomQuizActivity() {
  const [questions, setQuestions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [helpModalActive, setHelpModalActive] = useState(false);
  const [doneModalActive, setDoneModalActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amountCorrect, setAmountCorrect] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const { quizID } = useParams();

  const grabCorrect = useCallback((correct) => {
    if (correct) setAmountCorrect((prev) => prev + 1);
  }, []);

  const handleAnswerQuestion = (isSelected) => {
    setAnsweredCount((prev) => prev + (isSelected ? 1 : -1));
  };
  
  const handleSubmit = () => {
    setCompleted(true);
    setDoneModalActive(true);
    setTimerFinished(true);
  };

  useEffect(() => {
    async function fetchCustomQuiz() {
      try {
        const res = await fetch(`https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${quizID}`);
        const data = await res.json();
        const quiz = data.data;

        const selected = Object.values(quiz.questions).map((q) => {
          const type = q.type || "Multiple";
          const formatted = {
            questionText: q.question,
            choices: [],
            correctAnswer: q.correct_answer,
            type: type === "DragAndDrop" ? "drag"
                : type === "FillInTheBlank" ? "fill"
                : type === "MultipleAnswer" ? "multiple"
                : "single",
          };

          if (type !== "FillInTheBlank") {
            formatted.choices = [q.option_1, q.option_2, q.option_3, q.option_4].filter(Boolean);
          }

          return formatted;
        });

        setQuestions(selected);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch custom quiz:", error);
      }
    }

    fetchCustomQuiz();
  }, [quizID]);

  return (
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg inline-block pointer-events-auto">
          <ProgressBar answeredCount={answeredCount} totalQuestions={questions.length} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="fixed top-12 right-4 text-lg bg-gray-900 text-white p-2 rounded">
          <Timer
            timeLimit={300}
            onStopTimer={() => setTimerFinished(true)}
            onTimeUp={handleSubmit}
            timerFinished={timerFinished}
            showTimer={true}
            showPauseButton={true}
          />
        </div>

        {!loading && (
          <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg">
            Custom Quiz
          </h1>
        )}

        <button
          onClick={() => setHelpModalActive(true)}
          className="mb-8 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600"
        >
          Help
        </button>

        {helpModalActive && (
          <HelpModal
            isActive={setHelpModalActive}
            active={helpModalActive}
            amount={questions.length}
            duration={5}
          />
        )}

        {questions.map((q, index) => (
          <Question
            key={index}
            question={q}
            onAnswer={grabCorrect}
            onAnswerChange={handleAnswerQuestion}
            isCompleted={completed}
          />
        ))}

        {!loading && (
          <button
            onClick={handleSubmit}
            className="mt-8 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-500"
            disabled={completed}
          >
            Submit!
          </button>
        )}
      </div>

      <ScaleLoader loading={loading} color="#111827" height={100} width={25} />
      {doneModalActive && (
        <DoneModal
          isActive={setDoneModalActive}
          amountCorrect={amountCorrect}
          totalAmount={questions.length}
          active={doneModalActive}
          quizId={quizID}
          isCustomQuiz={true}
        />
      )}

      <BackToTop />
      {!completed && <BackGroundMusic />}
    </>
  );
}

export default CustomQuizActivity;