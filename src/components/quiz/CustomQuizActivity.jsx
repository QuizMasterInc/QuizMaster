/**
 * This is the quiz activity. It is how users take quizzes.
 */

import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { useAuth } from "../../contexts/AuthContext";
import Question from "./Question";
import DoneModal from "./DoneModal";
import HelpModal from './HelpModal';
import Timer from './Timer';
import { useParams } from 'react-router-dom'

import { useCategory } from '../../contexts/CategoryContext';

function QuizActivity({}){
  /**
   * These are the state variables.
   */
  //const { category } = useLocation().state; //this gets sent here when a user clicks the button for the category. 
  const [quiz, updateQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [completed, setCompleted] = useState(false)
  const [helpModalActive, setHelpModalActive] =  useState(false)
  const [doneModalActive, setDoneModalActive] =  useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingColor, setLoadingColor] = useState("#111827")
  const [amountCorrect, setAmountCorrect] = useState(0)
  const [amount, setAmount] = useState(0)
  const { currentUser } = useAuth()
  const [timerFinished, setTimerFinished] = useState(false);


  const { quizID } = useParams()
  console.log('quizID: ', quizID)
  /**
   * Callback function to send state of children question components back up to this parent component
   */
  const grabCorrect = useCallback((correct) =>{
    if(correct){
      setAmountCorrect((amountCorrect) => amountCorrect + 1)
    }
  }, [amountCorrect])

  /**
   * Randomizes questions
   * @param {*} array qustions array
   * @returns randomized array
   */
  function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
  /**
   * This useEffect() will pull questions from the database for each quiz category.
   * This is pulling from the database using a Google FIrebase Function. Defined in the "functions" folder
   * 
   * will take subcategory data 
   */
  useEffect(() => {
    async function fetchCustomQuiz(uid) {
      const data = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuiz?quizid=' + uid)
        .then((res) => res.json())
        .then((data) => {
          return data;
        })
        .catch((err) => {
            console.log(err);
        });
        const quiz = data.data
        console.log('Final Data: ', data)
        console.log('Quiz Questions: ', quiz.questions)
        //Shuffles question order then questions choices
        let selected = shuffle(Object.values(quiz.questions))
        selected = selected.map((data) => {
          const question = {
            questionText: data.question,
            choices: shuffle([data.option_1, data.option_2, data.option_3, data.option_4]),
            answer: data.correct_answer,
          }
          console.log('Question: ', question)
          return question //Replace each element of an array with new question object
        })
      console.log('Final Selected: ', selected)
      setQuestions(selected);
      setAmount(selected.length)
      updateQuiz(quiz)
      setLoading(false);
      return quiz;
    }
    fetchCustomQuiz(quizID);
  }, [quizID]);

  /**
   * This useEffect() will prompt the user before they leave if they want to
   */
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  /**
   * This useEffect() is called when the timer is finished. it will end the quiz
   */
  useEffect(() => {
    if (timerFinished && !completed) {
      setDoneModalActive(true);
      setCompleted(true);
    }
  }, [timerFinished, completed]);
  
  /**
   * This sets completed to true and done modal active to true
   */
  const handleTimeUp = useCallback(() => {
    setCompleted(true);
    setDoneModalActive(true);
  }, []);

  /**
   * Sets timer finished to true 
   */
  const handleStopTimer = () => {
    setTimerFinished(true);
  };
  
  /**
   * This is the actual view element. Here we are creating the actual 
   * style of the component. We are creating a list of questions by mapping
   * through the questions array. The ScaleLoader gets mounted in the questions are still
   * loading into from the database
   */
  return (
  <>
  <div className="flex flex-col items-center justify-center -md:ml-16">
   {!loading && <div>
    <div style={{  position: 'fixed',  top: '50px', right: '20px', padding: '0.5rem',fontSize: '1.5rem',backgroundColor: '#111827',
      color: '#f9fafb',borderRadius: '0 0 0.5rem 0.5rem',boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'}}>
      <Timer
          timeLimit={300}
          onStopTimer={handleStopTimer}
          onTimeUp={handleTimeUp}
          timerFinished={timerFinished}
          timeLeft={loading ? null : 5}
          loading = {loading}
        />    
    </div> 
    <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg -md:text-md -md:p-4">Welcome to the {quiz.title} Quiz</h1>
    </div>}
    <button className="flex flex-row text-xl h-10 mb-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg -md:text-sm -md:p-8"
      onClick={() => setHelpModalActive(true)}>
      Help
    </button>
    {helpModalActive && <HelpModal isActive={setHelpModalActive} active={helpModalActive}/>}
    {questions.slice(0, amount).map((question, index) => (
      <Question key={index} number={index} questionText={question.questionText} choices={question.choices} answer={question.answer} 
        isCompleted={completed} callback={grabCorrect}/>
      ))} 
    {!loading && 
    <button className="flex flex-row text-xl h-10 mt-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg -md:text-sm -md:p-10"
      onClick={() => {
      setCompleted(true);
      setDoneModalActive(true);
      setTimerFinished(true); 
      }}
      disabled={completed} >
      Submit!
    </button>}
  </div>
  <ScaleLoader className="block items-center justify-center gray-900 mt-8 -md:ml-16" loading={loading} color={loadingColor} width={25} height={100}/>
  {doneModalActive && <DoneModal isActive={setDoneModalActive} amountCorrect={amountCorrect} totalAmount={amount} active={doneModalActive} />}
  </>
  )
}
export default QuizActivity;