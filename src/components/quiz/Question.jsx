import React from "react";
import { useState } from "react";
import QuestionChoice from "./QuestionChoice";

function Question ({questionText}){
    const [activeIndex, setActiveIndex] = useState(null)
    return (
    <div className="flex flex-col w-7/12 pb-4 mb-4 bg-gray-900 rounded-lg shadow-lg">
        <p className="flex pt-4 pb-4 pl-6 text-xl text-gray-300">{questionText}</p>
        <QuestionChoice choiceText={"Choice test"} isSelected={activeIndex === 0} onSelect={() => setActiveIndex(0)}/>
        <QuestionChoice choiceText={"Choice test"} isSelected={activeIndex === 1} onSelect={() => setActiveIndex(1)}/>
        <QuestionChoice choiceText={"Choice test"} isSelected={activeIndex === 2} onSelect={() => setActiveIndex(2)}/>
        <QuestionChoice choiceText={"Choice test"} isSelected={activeIndex === 3} onSelect={() => setActiveIndex(3)}/>
    </div>
    )
}

export default Question