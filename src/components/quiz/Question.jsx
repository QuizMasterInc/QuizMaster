import React from "react";
import { useState } from "react";
import QuestionChoice from "./QuestionChoice";

function Question ({number, questionText, choices, answer}){
    const [activeIndex, setActiveIndex] = useState(null)
    return (
    <>
    <div className="flex flex-col w-7/12 pb-4 mb-4 bg-gray-900 rounded-lg shadow-lg">
        <p className="flex pt-4 pb-4 pl-6 text-3xl text-gray-300 align-middle space-x-6">{number + 1}. {questionText}</p>
        {choices.map((choice, index) => (
            <QuestionChoice key={index} choiceText={choice} isSelected={activeIndex === index} onSelect={() => setActiveIndex(index)}/>
        ))} 
    </div>
    </>
    )
}

export default Question