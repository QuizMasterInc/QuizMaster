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
import ProgressBar from './ProgressBar'

import { useCategory } from '../../contexts/CategoryContext';

function QuizActivity({}){
  /**
   * These are the state variables.
   */
  //const { category } = useLocation().state; //this gets sent here when a user clicks the button for the category. 
  const {category, subcategories, difficulty, amount} = useCategory()
  const [questions, setQuestions] = useState([])
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [completed, setCompleted] = useState(false)
  const [helpModalActive, setHelpModalActive] =  useState(false)
  const [doneModalActive, setDoneModalActive] =  useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingColor, setLoadingColor] = useState("#111827")
  const [amountCorrect, setAmountCorrect] = useState(0)
  const [numberOfQuestions, setNumberOfQuestions] = useState(0)
  const { currentUser } = useAuth()
  const [timerFinished, setTimerFinished] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

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
    async function fetchQuiz(category) {
      const data = await fetch("https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabSub?category=" + category.toLowerCase())
      //const data = await fetch("https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabQuiz?quiz=" + category.toLowerCase())
        .then((res) => res.json())
        .then((data) => {
          return data;
        })
        .catch((err) => {
            console.log(err);
        });
        console.log('Final Cat: ', category)
        console.log('Final SubCat: ', subcategories)
        console.log('Final Data: ', data)
        console.log('Final Difficulty: ', difficulty)
        console.log('Final Amount: ', amount)
        let selected = []
        let allPossQuestions = []
        subcategories.forEach((subcategory) => {
          allPossQuestions.push(...data[subcategory])
        })
        if (difficulty > 0) {// Less than 1 means user did not choose difficulty
          selected = allPossQuestions.filter((question) => {
            return question.difficulty == difficulty;
          })

          /**
           * Adds questions of similar difficulty if there aren't enough questions of
           * selected difficulty. 
           * 
           * Slices array after to guarantee all the questions of user-specified  
           * difficulty are in the quiz and minimizes number of questions that are of 
           * different difficulties.
           */
          let attempts = 1
          let neededQuestions = amount - selected.length
          let extraQuestions = []

          while (extraQuestions.length < neededQuestions && attempts < 5) {
            let tempQuestions = allPossQuestions.filter((question) => {
              return question.difficulty == difficulty + attempts || question.difficulty == question.difficulty - attempts;
            })

            extraQuestions.push(...tempQuestions)
            attempts++
          }
          selected.push(...shuffle(extraQuestions).slice(0, neededQuestions))


        // if no difficulty is chosen
        } else {
          selected = allPossQuestions
        }

        console.log('Final Chosen: ', selected)
        //Shuffles question order then questions choices
        selected = shuffle(selected).slice(0, amount)
        let shuffledQuestions = [];
        selected.forEach((data) => {
          const question = {
            questionText: data.question,
            choices: shuffle([data.a, data.b, data.c, data.d]),
            answer: data.correct,
          }
          shuffledQuestions.push(question)
          console.log(data.difficulty)
        })
        
        /*
          for (let key in data) {
            const list = data[key];
            const question = {
                  questionText: key,
                  choices: shuffle(list.slice(0, -1)),// _Need to rework. Answer should be its own key/value pair, not part of choice's collection.
                  answer: list.slice(-1).toString(),//   /
            };
            shuffledQuestions.push(question);
          }
          */
      setQuestions(shuffle(shuffledQuestions));
      setNumberOfQuestions(10);
      setLoading(false);
      return data;
    }
    fetchQuiz(category);
  }, [category]);

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

  // Use grabResults cloud function to get the previous average score and attempts so they can be updated
  const [result, setResult] = useState(0)
  const [prevAvgScore, setAvgScore] = useState(0)
  const [prevAttempts, setAttempts] = useState(1)

   /**
   * This is useEffect() is used to grab the results for each quiz
   * Here we are using a Firebase function 
  */
   useEffect(() => {
    async function fetchResults(uid) {
      const data = {
        uid: uid,
        category: category.toLowerCase()
      }
  
      try {
        //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabResults
        //https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabResults
        const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabResults', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        if (response.ok) {
          const resultData = await response.json();
          console.log(resultData)
          setResult(resultData.score);
          setAvgScore(resultData.avgScore);
          setAttempts(resultData.attempts);
        } else {
          // Handle the case when the response is not ok (e.g., error handling)
          console.error('Fetch error:', response.statusText);
        }
      } catch (error) {
        // Handle any fetch-related errors here
        console.error('Fetch error:', error);
      }
  
    }
  
    fetchResults(currentUser.uid);
  }, []);

  // Make sure the attempt counter and prevAvgScore consts are set
  if (completed) {
    if (prevAvgScore == null) {
      setAvgScore(amountCorrect / amount)
    }
    if (prevAttempts == null){
      setAttempts(1)
    }
  }

  const createQuizScoreObject = () => {
      const quizScoreObject = {
        uid: currentUser.uid,
        category: category.toLowerCase(),
        score: (amountCorrect / amount),
        attempts: prevAttempts === 0 ? 1 : prevAttempts,
        avgScore: prevAvgScore === 0 ? amountCorrect / amount : prevAvgScore,
      }
    console.log(quizScoreObject);
    return quizScoreObject
  }

  /**
   * Once the timer is finished, or the user finishes the quiz
   * this useEffect() gets called to send scores to the database also using a Google Firebase Function
   */
  useEffect(() => {
    const obj = createQuizScoreObject()
    async function sendResult() {
      if(completed){
        //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/saveResults
        //https://us-central1-quizmaster-c66a2.cloudfunctions.net/saveResults
        await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/saveResults', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(obj)
          })
          .then(res => res.json())
          .then(data => {
            console.log("Response Data", data)
          })
      }
    }
    sendResult()
  }, [amountCorrect])

  // Useeffect to determine when an answer choice is not null to determine the amount of answered questions
    const example = ({ activeIndex, numberOfQuestions }) => {
      const [answeredCount, setAnsweredCount] = useState(0);
  
    useEffect(() => {
      if (activeIndex !== null && answeredCount < numberOfQuestions) {
        setAnsweredCount(answeredCount + 1);
      }
    }, [activeIndex, numberOfQuestions]); 
    }
  
  /**
   * This is the actual view element. Here we are creating the actual 
   * style of the component. We are creating a list of questions by mapping
   * through the questions array. The ScaleLoader gets mounted in the questions are still
   * loading into from the database
   */
  return (
  <>
  {/*This is the div for the progress bar at the top of the screen*/}
  <div style={{ position: "fixed", top: "50px", left: "50%", transform: "translateX(-50%)", zIndex: 1000, pointerEvents: "none",}}>
        {/* Box around the text content */}
        <div style={{ background: "#e5e7eb", padding: "10px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            display: "inline-block", pointerEvents: "auto", }}>
          {/* Render the progress bar text */}
          <ProgressBar
            currentQuestion={answeredCount}
            totalQuestions={numberOfQuestions}
          />
        </div>
      </div>

    <div className="flex flex-col items-center justify-center -md:ml-16">
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
    <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg -md:text-md -md:p-4">Welcome to the {category} Quiz</h1>
    <button className="flex flex-row text-xl h-10 mb-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg -md:text-sm -md:p-8"
      onClick={() => setHelpModalActive(true)}>
      Help
    </button>
    {helpModalActive && <HelpModal isActive={setHelpModalActive} active={helpModalActive}/>}
    {questions.slice(0, amount).map((question, index) => (
      <Question key={index} number={index} questionText={question.questionText} choices={question.choices} answer={question.answer} 
        isCompleted={completed} callback={grabCorrect} /*onNextQuestion={goToNextQuestion*//>
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