import React from "react";
import { useState } from "react";
import QuestionChoice from "./QuestionChoice";

function Question ({number, questionText, choices, answer, quizComplete}){
    const [activeIndex, setActiveIndex] = useState(null)

    function grade(){
        return (answer === choices[activeIndex]);
    }
    
    return (
    <>
    <div className="flex flex-col w-7/12 pb-4 mb-4 bg-gray-900 rounded-lg shadow-lg">
        <div className="flex flex-row pt-4 pb-4 pl-6 pr-6 text-3xl text-gray-300 align-middle space-x-3">
            <p>{number + 1}.</p> 
            <p>{questionText}</p>
        </div>
        {choices.map((choice, index) => (
            <QuestionChoice 
            key={index}
            choiceText={choice} 
            isSelected={activeIndex === index} 
            onSelect={() => setActiveIndex(index)} 
            isCorrect={((activeIndex === index) && (quizComplete) && (answer === choices[activeIndex]))}
            isIncorrect={((activeIndex === index) && (quizComplete) && !(answer === choices[activeIndex]))}/>
        ))} 
    </div>
    <p>{choices[activeIndex]}</p>
    <p>{answer}</p>
    </>
    )
}

export default Question