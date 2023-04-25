/**
 * This is the question component.
 * This will host the question and the QuestionChoice component. 
 */
import React, { useEffect } from "react";
import { useState } from "react";
import QuestionChoice from "./QuestionChoice";

function Question ({number, questionText, choices, answer, isCompleted, callback}){
    const [activeIndex, setActiveIndex] = useState(null)
    const [correct, setCorrect] = useState(false)

    /**
     * This useEffect() is called when the quiz is finished. it is used for grading purposes
     * If the question is answered correctly or not. 
     */
    useEffect(() => {
        function isCorrect(){
            if((answer === choices[activeIndex]) && (isCompleted)){
                setCorrect(true)
                return true
            }
            else{
                setCorrect(false)
                return false
            }
        }
        callback(isCorrect())
    }, [isCompleted])
    return (
    <>
    <div className="flex flex-col w-7/12 pb-4 mb-4 bg-gray-900 rounded-lg shadow-lg -md:pl-2 -md:pr-2 -md:pb-2 -md:w-10/12">
        <div className="flex flex-row pt-4 pb-4 pl-2 pr-6 text-3xl text-gray-300 align-middle space-x-3 -md:text-sm -md:space-x-2">
            <p className="ml-2">{number + 1}.</p> 
            <p className="mr-2">{questionText}</p>
        </div>
        {choices.map((choice, index) => (
            <QuestionChoice 
            key={index}
            choiceText={choice} 
            isSelected={activeIndex === index} 
            onSelect={() => setActiveIndex(index)} 
            isCorrect={((activeIndex === index) && (isCompleted) && (answer === choices[activeIndex]))}
            isIncorrect={((activeIndex === index) && (isCompleted) && !(answer === choices[activeIndex]))}
            isDisabled={(isCompleted)}/>
        ))} 
    </div>
    </>
    )
}

export default Question