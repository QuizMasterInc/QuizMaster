import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { useAuth } from "../../contexts/AuthContext";
import Question from "./Question";
import DoneModal from "./DoneModal";
import HelpModal from './HelpModal';

function QuizActivity({}){
    const { category } = useLocation().state;
    const [questions, setQuestions] = useState([])
    const [completed, setCompleted] = useState(false)
    const [helpModalActive, setHelpModalActive] =  useState(false)
    const [doneModalActive, setDoneModalActive] =  useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingColor, setLoadingColor] = useState("#111827")
    const [amountCorrect, setAmountCorrect] = useState(0)
    const [numberOfQuestions, setNumberOfQuestions] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(300);
    const { currentUser } = useAuth()

    const grabCorrect = useCallback((correct) =>{
        if(correct){
            setAmountCorrect((amountCorrect) => amountCorrect + 1)
        }
    }, [amountCorrect])

    useEffect(() => {
        async function fetchQuiz(category) {
            setLoading(true)
            const data = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabQuiz?quiz=' + category.toLowerCase())
            .then(res => res.json())
            .then(data => {
                return data
            }).catch(err => {
                console.log(err)
            })
            for(let key in data){
                const list = data[key]
                const question = {
                    questionText: key,
                    choices: list.slice(0, -1),
                    answer: list.slice(-1).toString()
                }
                setQuestions(questions => [...questions, question])
                setNumberOfQuestions((numberOfQuestions) => numberOfQuestions + 1)
            }
            setLoading(false)
            return data 
        }
        fetchQuiz(category)
    }, [])

    useEffect(() => {
        let timer = null;
        
        if (loading === false) {
          timer = setInterval(() => {
            setTimeRemaining((timeRemaining) => timeRemaining - 1);
          }, 1000);
        }

        if (timeRemaining === 0 ) {
            setCompleted(true);
          }

        if (completed){
            clearInterval(timer);
            setDoneModalActive(true)
        }
    
        return () => clearInterval(timer);
      }, [loading, timeRemaining, completed]); 

      useEffect(() => {
        const data = {
            uid: currentUser.uid,
            category: category.toLowerCase(),
            score: (amountCorrect / numberOfQuestions)
        }
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
                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data.result)
                })
            }
        }
        sendResult()
      }, [amountCorrect])
  
    return (
    <>
    <div className="flex flex-col items-center justify-center -md:ml-16">
    <div style={{  position: 'fixed',  top: '0', right: '0', padding: '0.5rem',fontSize: '1.5rem',backgroundColor: '#111827',color: '#f9fafb',borderRadius: '0 0 0.5rem 0.5rem',boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'}}>
        {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{Math.floor(timeRemaining % 60).toString().padStart(2, '0')}
    </div>
        <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg -md:text-md -md:p-4">Welcome to the {category} Quiz</h1>
        <button className="flex flex-row text-xl h-10 mb-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg -md:text-sm -md:p-8"
            onClick={() => setHelpModalActive(true)}>
            Help
        </button>
        {helpModalActive && <HelpModal isActive={setHelpModalActive} active={helpModalActive}/>}
        {questions.slice(0, numberOfQuestions).map((question, index) => (
            <Question key={index} number={index} questionText={question.questionText} choices={question.choices} answer={question.answer} 
            isCompleted={completed} callback={grabCorrect}/>
        ))} 
        {!loading && <button className="flex flex-row text-xl h-10 mt-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg -md:text-sm -md:p-10"
            onClick={() => {setCompleted(true); }} disabled={completed}>
            Submit!
        </button>}
    </div>
    <ScaleLoader className="block items-center justify-center gray-900 mt-8 -md:ml-16" loading={loading} color={loadingColor} width={25} height={100}/>
    {doneModalActive && <DoneModal isActive={setDoneModalActive} amountCorrect={amountCorrect} totalAmount={numberOfQuestions} active={doneModalActive}/>}
    </>
    )
}
export default QuizActivity;