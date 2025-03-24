import React, { useCallback, useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { ScaleLoader } from "react-spinners";
import { useAuth } from "../../contexts/AuthContext";
import Question from "./Question";
import DoneModal from "./DoneModal";
import HelpModal from './HelpModal';
import Timer from './Timer';
import ProgressBar from './ProgressBar';
import BackToTop from './BackToTopButton';
import BackGroundMusic from "../sounds/BackGroundMusic.jsx";

function QuizActivity() {
  const [quiz, updateQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [helpModalActive, setHelpModalActive] = useState(false);
  const [doneModalActive, setDoneModalActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amountCorrect, setAmountCorrect] = useState(0);
  const [amount, setAmount] = useState(0);
  const { currentUser } = useAuth();
  const [timerFinished, setTimerFinished] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [flaggedQuestion, setFlaggedQuestion] = useState(0);

  const { quizID } = useParams();

  const grabCorrect = useCallback((correct) => {
    if (correct) setAmountCorrect(prev => prev + 1);
  }, []);

  const handleFlagButton = (flagged) => {
    setFlaggedQuestion(prev => flagged ? prev + 1 : prev - 1);
  };

  const handleAnswerQuestion = (isSelected) => {
    setAnsweredCount(prev => prev + (isSelected ? 1 : -1));
  };

  function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  useEffect(() => {
    async function fetchCustomQuiz(uid) {
      try {
        const response = await fetch(`https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=${uid}`);
        const data = await response.json();
        const quiz = data.data;

        const selected = shuffle(Object.values(quiz.questions)).map((q) => {
          const type = q.type || "Multiple";

          let formatted = {
            questionText: q.question,
            choices: [],
            answer: q.correct_answer,
            type: type === "DragAndDrop" ? "drag" : (type === "FillInTheBlank" ? "fill" : type.toLowerCase())
          };

          if (type === "FillInTheBlank") {
            formatted.choices = [];
          } else if (type === "DragAndDrop") {
            formatted.choices = shuffle([q.option_1, q.option_2, q.option_3, q.option_4]);
          } else {
            formatted.choices = shuffle([q.option_1, q.option_2, q.option_3, q.option_4]);
          }

          return formatted;
        });

        setQuestions(selected);
        setAmount(selected.length);
        updateQuiz(quiz);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    }

    fetchCustomQuiz(quizID);
  }, [quizID]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (timerFinished && !completed) {
      setDoneModalActive(true);
      setCompleted(true);
    }
  }, [timerFinished, completed]);

  const handleTimeUp = useCallback(() => {
    setCompleted(true);
    setDoneModalActive(true);
  }, []);

  const handleStopTimer = () => setTimerFinished(true);

  const handleSubmit = () => {
    if (flaggedQuestion > 0) {
      const confirmed = window.confirm(`You have flagged ${flaggedQuestion} questions. Submit anyway?`);
      if (!confirmed) return;
    }
    setCompleted(true);
    setDoneModalActive(true);
    setTimerFinished(true);
  };

  return (
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg inline-block pointer-events-auto">
          <ProgressBar answeredCount={answeredCount} totalQuestions={amount} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center -md:ml-16">
        {!loading && (
          <div>
            <div className="fixed top-[50px] right-[20px] z-40 bg-gray-900 text-white p-2 rounded-lg shadow">
              <Timer
                timeLimit={300}
                onStopTimer={handleStopTimer}
                onTimeUp={handleTimeUp}
                timerFinished={timerFinished}
                timeLeft={5}
                showTimer={true}
                loading={loading}
                showPauseButton={true}
              />
            </div>

            <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg">
              Welcome to the {quiz?.title} Quiz
            </h1>
          </div>
        )}

        <button
          className="text-xl h-10 mb-8 text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg"
          onClick={() => setHelpModalActive(true)}
        >
          Help
        </button>

        {helpModalActive && (
          <HelpModal
            isActive={setHelpModalActive}
            active={helpModalActive}
            amount={amount}
            duration={5}
          />
        )}

        {questions.slice(0, amount).map((q, index) => (
          <Question
            key={index}
            number={index}
            question={q}
            onAnswer={grabCorrect}
            onFlag={handleFlagButton}
            onAnswerChange={handleAnswerQuestion}
          />
        ))}

        {!loading && (
          <button
            onClick={handleSubmit}
            disabled={completed}
            className="text-xl h-10 mt-8 text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg"
          >
            Submit!
          </button>
        )}
      </div>

      <ScaleLoader loading={loading} color="#111827" width={25} height={100} />
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