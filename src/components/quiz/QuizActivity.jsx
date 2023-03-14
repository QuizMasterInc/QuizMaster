import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
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

    return (
    <>
    <div className="flex flex-col items-center justify-center -md:ml-16">
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
        <button className="flex flex-row text-xl h-10 mt-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg -md:text-sm -md:p-10"
            onClick={() => {setCompleted(true); setDoneModalActive(true)}} disabled={completed}>
            Submit!
        </button>
    </div>
    <ScaleLoader className="block items-center justify-center gray-900 mt-8 -md:ml-16" loading={loading} color={loadingColor} width={25} height={100}/>
    {doneModalActive && <DoneModal isActive={setDoneModalActive} amountCorrect={amountCorrect} totalAmount={numberOfQuestions} active={doneModalActive}/>}
    </>
    )
}

export default QuizActivity;
