import React from "react";

function QuestionChoice ({choiceText, isSelected, onSelect, isCorrect, isIncorrect, isDisabled}){

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
        else{
            return "bg-gray-800 hover:bg-gray-600"   
        }
    }

    return(
        <button className={`p-2 mb-3 ml-2 mr-2 text-gray-300 rounded-md shadow-md -md:text-sm ${changeColor()}`}
        onClick={onSelect} disabled={isDisabled}>{choiceText}</button>
    )
}

export default QuestionChoice;