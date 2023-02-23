import React from "react";
import { useState } from "react";
import Question from "./Question";
import QuizModal from './QuizModal';

function QuizActivity({}){
    const [category] = useState("TestCategory")
    const [questionText] = useState([
        "Test",
        "Test22"
    ])

    const [choices] = useState([
        ["Test1", "Test2", "Test3", "Test4"],
        ["Test11", "Test22", "Test33", "Test44"],
    ])

    const [answers] = useState([
        "beeshk",
        "test"
    ])
    
    return (
    <>
    <div className="flex flex-col items-center justify-center">
        <h1 className="p-10 mb-8 text-4xl text-gray-300 bg-gray-900 rounded-lg shadow-lg">Welcome to the {category} Quiz</h1>
        <button className="flex flex-row text-xl h-10 mb-8 items-center justify-center text-gray-300 bg-gray-800 w-1/6 hover:bg-gray-600 rounded-lg shadow-lg">
            Help
        </button>
        <QuizModal />
        {questionText.map((text, index) => (
            <Question questionText={text} choices={choices[index]} answer={answers[index]}/>
        ))} 
    </div>
    </>
    )
}

export default QuizActivity;