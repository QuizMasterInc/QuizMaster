/**
 * This is the question component.
 * This will host the question and the QuestionChoice component. 
 */
import React, { useEffect } from "react";
import { useState } from "react";
import QuestionChoice from "./QuestionChoice";


function Question ({number, questionText, choices, answer, isCompleted, callback, onFlag, onAnswer}){
    const [activeIndex, setActiveIndex] = useState(null)
    const [correct, setCorrect] = useState(false)
    const [flagged, setFlagged] = useState(false)
    const [isAnswered, setIsAnswered] = useState(false); // used track if the question is answered for progress Bar

    //handles the flagging features for when a user 
    const handleFlagButton = () => {
        setFlagged(!flagged)
        onFlag(!flagged)
    }

    const handleSelect = (index) => {
        // Check if the user clicked the already-selected answer
        if (activeIndex === index) {
            setActiveIndex(null); // Deselect the answer
            setIsAnswered(false); // Mark question as unanswered
            onAnswer(false); // Update the answered count in the parent
        } else {
            setActiveIndex(index); // Select a new answer
            if (!isCompleted && !isAnswered) {
                setIsAnswered(true);
                onAnswer(true); // Increment the answered count in the parent
            }
        }
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
            onSelect={() => {handleSelect(index);} }
            isCorrect={((activeIndex === index) && (isCompleted) && (answer === choices[activeIndex]))}
            isIncorrect={((activeIndex === index) && (isCompleted) && !(answer === choices[activeIndex]))}
            isDisabled={(isCompleted)}/>
        ))
        
        
        
        } 
    </div>
    </>
    )
}

export default Question