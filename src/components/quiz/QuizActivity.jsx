import React, { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Question from "./Question";
import QuizModal from './QuizModal';

function QuizActivity({}){
    const { category } = useLocation().state;
    const [questionText, setQuestionText] = useState([])

    const [choices, setChoices] = useState([])

    const [answers, setAnswers] = useState([])
    
    const [modalActive, setModalActive] =  useState(false)

    useEffect(() => {
        async function fetchQuiz(category) {
            const data = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabQuiz?quiz=' + category.toLowerCase())
            .then(res => res.json())
            .then(data => {
                return data
            }).catch(err => {
                console.log(err)
            })
            setQuestionText(Object.keys(data))
            setChoices(Object.values(data))
            setAnswers(Object.values(data)[4])
            console.log(Object.keys(data))
            return data 
        }
        const data = fetchQuiz(category)
    }, [])

    return (
    <div className="flex flex-col items-center justify-center">
        <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg">Welcome to the {category} Quiz</h1>
        <button className="flex flex-row text-xl h-10 mb-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg"
            onClick={() => setModalActive(true)}>
            Help
        </button>
        {modalActive && <QuizModal isActive={setModalActive}/>}
        {questionText.map((text, index) => (
            <Question key={index} number={index} questionText={text} choices={choices[index]} answer={answers[index]}/>
        ))} 
        <button className="flex flex-row text-xl h-10 mt-8 items-center justify-center text-gray-300 bg-gray-900 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg">
            Submit!
        </button>
    </div>
    )
}

export default QuizActivity;