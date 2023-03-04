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
    <div className="flex flex-col items-center justify-center">
        <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg">Welcome to the {category} Quiz</h1>
        <button className="flex flex-row text-xl h-10 mb-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg"
            onClick={() => setHelpModalActive(true)}>
            Help
        </button>
        {helpModalActive && <HelpModal isActive={setHelpModalActive}/>}
        {questions.slice(0,2).map((question, index) => (
            <Question key={index} number={index} questionText={question.questionText} choices={question.choices} answer={question.answer} 
            isCompleted={completed} callback={grabCorrect}/>
        ))} 
        <button className="flex flex-row text-xl h-10 mt-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg"
            onClick={() => setCompleted(true)} disabled={completed}>
            Submit!
        </button>
    </div>
    <ScaleLoader className="block items-center justify-center gray-900 mt-8" loading={loading} color={loadingColor} width={50} height={200}/>
    {completed && <DoneModal isActive={completed} amountCorrect={amountCorrect} totalAmount={numberOfQuestions}/>}
    </>
    )
}

export default QuizActivity;