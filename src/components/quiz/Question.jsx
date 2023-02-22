import React from "react";
import { useState } from "react";
import QuestionChoice from "./QuestionChoice";

function Question ({questionText, choices, answer}){
    const [activeIndex, setActiveIndex] = useState(null)
    return (
    <>
    <div className="flex flex-col w-7/12 pb-4 mb-4 bg-gray-900 rounded-lg shadow-lg">
        <p className="flex pt-4 pb-4 pl-6 text-xl text-gray-300">{questionText}</p>
        {choices.map((choice, index) => (
            <QuestionChoice key={index} choiceText={choice} isSelected={activeIndex === index} onSelect={() => setActiveIndex(index)}/>
        ))} 
    </div>
    </>
    )
}

export default Question