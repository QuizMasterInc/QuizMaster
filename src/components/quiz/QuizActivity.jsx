import React, { useCallback, useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";
import { useAuth } from "../../contexts/AuthContext";
import Question from "./Question";
import DoneModal from "./DoneModal";
import HelpModal from "./HelpModal";
import Timer from "./Timer";
import ProgressBar from "./ProgressBar";
import BackToTop from "./BackToTopButton";
import BackGroundMusic from "../sounds/BackGroundMusic";
import { useCategory } from "../../contexts/CategoryContext";

function QuizActivity() {
  const { category, subcategories, difficulty, amount, duration, showTimer, showPauseButton } = useCategory();
  const [questions, setQuestions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [helpModalActive, setHelpModalActive] = useState(false);
  const [doneModalActive, setDoneModalActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amountCorrect, setAmountCorrect] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [flaggedQuestion, setFlaggedQuestion] = useState(0);
  const { currentUser } = useAuth();

  const grabCorrect = useCallback((correct) => {
    if (correct) setAmountCorrect((prev) => prev + 1);
  }, []);

  const handleFlagButton = (flagged) => {
    setFlaggedQuestion((prev) => (flagged ? prev + 1 : prev - 1));
  };

  const handleAnswerQuestion = (isSelected) => {
    setAnsweredCount((prevCount) => prevCount + (isSelected ? 1 : -1));
  };

  const handleSubmit = () => {
    if (flaggedQuestion > 0) {
      const confirmSubmit = window.confirm(`You have flagged ${flaggedQuestion} questions. Submit anyway?`);
      if (!confirmSubmit) return;
    }
    setCompleted(true);
    setDoneModalActive(true);
    setTimerFinished(true);
  };

  function shuffle(array) {
    let currentIndex = array.length, temp, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      temp = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temp;
    }
    return array;
  }

  useEffect(() => {
    async function fetchQuiz() {
      const res = await fetch(`https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabSub?category=${category.toLowerCase()}`);
      const data = await res.json();

      let allQuestions = [];
      subcategories.forEach((sub) => allQuestions.push(...data[sub]));

      let filtered = difficulty > 0
        ? allQuestions.filter((q) => q.difficulty == difficulty)
        : allQuestions;

      if (filtered.length < amount) {
        const extras = allQuestions.filter((q) =>
          Math.abs(q.difficulty - difficulty) === 1
        );
        filtered = [...filtered, ...shuffle(extras).slice(0, amount - filtered.length)];
      }

      const selected = shuffle(filtered).slice(0, amount).map((data) => {
        const type = data.type || "Multiple";
        const choices = ["Multiple", "MultipleAnswer", "DragAndDrop"].includes(type)
          ? shuffle([data.option_1, data.option_2, data.option_3, data.option_4])
          : [];

        return {
          text: data.question,
          choices,
          correctAnswer: data.correct_answer,
          type: type === "FillInTheBlank"
            ? "fill"
            : type === "MultipleAnswer"
            ? "multiple"
            : type === "DragAndDrop"
            ? "drag"
            : "single"
        };
      });

      setQuestions(selected);
      setLoading(false);
    }

    fetchQuiz();
  }, [category]);

  useEffect(() => {
    if (timerFinished && !completed) {
      setCompleted(true);
      setDoneModalActive(true);
    }
  }, [timerFinished, completed]);

  return (
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg inline-block pointer-events-auto">
          <ProgressBar answeredCount={answeredCount} totalQuestions={amount} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="fixed top-12 right-4 text-lg bg-gray-900 text-white p-2 rounded">
          <Timer
            timeLimit={duration * 60}
            onStopTimer={() => setTimerFinished(true)}
            onTimeUp={() => {
              setCompleted(true);
              setDoneModalActive(true);
            }}
            timerFinished={timerFinished}
            showTimer={showTimer}
            showPauseButton={showPauseButton}
          />
        </div>

        {!loading && (
          <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg">
            Welcome to the {category} Quiz
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
            amount={amount}
            duration={duration}
          />
        )}

        {questions.map((q, index) => (
          <Question
          key={index}
          question={q}
          isCompleted={completed}
          onAnswer={grabCorrect}
          onAnswerChange={handleAnswerQuestion}
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
          totalAmount={amount}
          active={doneModalActive}
        />
      )}

      <BackToTop />
      {!completed && <BackGroundMusic />}
    </>
  );
}

export default QuizActivity;