/**
 * This is the question choice component. 
 * This holds the text for each question choice
 */
import React from "react";

function QuestionChoice ({choiceText, isAnswer, isSelected, onSelect, isCorrect, isIncorrect, isDisabled}){

    /**
     * This should remove the question choice from the visible document depending on if 
     * the choiceText was equal to nothing.
     * @returns Tailwind text to be put in the className
     */
    function changeVisibility()
    {
        // removes "blank" answers
        if (choiceText.trim() == "")
        {
            return( " hidden"
            )
        }
    }

    /**
     * This changes the background color of each question choice depending on if 
     * the quiz was completed
     * @returns Tailwind text to be put in the className
     */
    function changeColor(){
        if (isSelected){
            if(isCorrect){
                return "bg-green-800 hover:bg-green-800"
            }
            if(isIncorrect){
                return "bg-red-800 hover:bg-red-800"
            }
            else{
                return "bg-gray-600 hover:bg-gray-600"
            }
        }
        else if (isAnswer){
            return "bg-green-800 hover:bg-green-800"   
        }
        else {
            return "bg-gray-800 hover:bg-gray-600"
        }
    }

    return(
        <>
        
        <button className={`p-2 mb-3 ml-2 mr-2 text-gray-300 rounded-md shadow-md -md:text-sm ${changeColor()} ${changeVisibility()}`}
                onClick={onSelect} disabled={isDisabled}>{choiceText}</button>
        
        </>
    )
}

export default QuestionChoice;