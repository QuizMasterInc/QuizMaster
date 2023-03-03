import React from "react";

function QuestionChoice ({choiceText, isSelected, onSelect, isCorrect, isIncorrect}){
    function grade(){
        if(isCorrect){
            return "bg-green-800 hover:bg-green-800"
        }
        else if(isIncorrect){
            return "bg-red-800 hover:bg-red-800"
        }
        else{
            return "bg-gray-800"
        }
    }

    return(
        <button className={`p-2 mb-3 ml-2 mr-2 text-gray-300 rounded-md shadow-md hover:bg-gray-600 ${isSelected ? "bg-gray-600" : "bg-gray-800"}
        ${grade()}`}
        onClick={onSelect}>{choiceText}</button>
    )
}

export default QuestionChoice;