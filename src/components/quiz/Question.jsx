/**
 * This is the question component.
 * This will host the question and the QuestionChoice component. 
 */
import React, { useEffect } from "react";
import { useState } from "react";
import QuestionChoice from "./QuestionChoice";
let answeredCount = 0;
export {answeredCount};

function Question ({number, questionText, choices, answer, isCompleted, callback, onFlag}){
    const [activeIndex, setActiveIndex] = useState(null)
    const [correct, setCorrect] = useState(false)
    const [flagged, setFlagged] = useState(false)

    const handleFlagButton = () => {
        setFlagged(!flagged)
        onFlag(!flagged)
    }

    //constant to determine when an answer choice is not null to determine the amount of answered questions
    const incrementAnsweredCount = () => {
        const newSelectedIndices = selectedIndices.map((selected, index) =>
            index === activeIndex ? true : selected
        );
        if (!selectedIndices[activeIndex]) { 
            answeredCount++;
        }
        setSelectedIndices(newSelectedIndices);
    };

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
            <button
                className={`ml-auto text-gray-300 bg-gray-600 hover:bg-gray-700 rounded-full h-8 w-8 flex items-center justify-center focus:outline-none`}
                onClick={handleFlagButton}
            >
                {flagged ? "\u{1F6A9}" : "\u{2690}"}
            </button>
        </div>
        {choices.map((choice, index) => (
            <QuestionChoice 
            key={index}
            choiceText={choice} 
            isAnswer = {((answer === choices[index]) && (isCompleted))}
            isSelected={activeIndex === index} 
            onSelect={() => {setActiveIndex(index); incrementAnsweredCount();} }
            isCorrect={
                selectedIndices[index] && isCompleted && answer === choices[index]
            }
            isIncorrect={
                selectedIndices[index] &&
                isCompleted &&
                answer !== choices[index]
            }
            isDisabled={(isCompleted)}/>
        ))
        
        
        
        } 
    </div>
    </>
    )
}

export default Question