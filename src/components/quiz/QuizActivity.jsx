import React from "react";
import { useState } from "react";
import Question from "./Question";
function QuizActivity({}){
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
    <div className="flex flex-col items-center justify-center">
        {questionText.map((text, index) => (
            <Question questionText={text} choices={choices[index]} answer={answers[index]}/>
        ))} 
    </div>
    )
}

export default QuizActivity;