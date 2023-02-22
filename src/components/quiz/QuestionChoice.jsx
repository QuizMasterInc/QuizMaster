import React from "react";
import { useState } from "react";

function QuestionChoice (props){
    const [isSelected, setSelected] = useState(false)
    return(
        <button className={`p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md hover:bg-gray-600 ${isSelected ? "bg-gray-600" : "bg-gray-800"}`}
        onClick={() => setSelected(!isSelected)}>{props.choiceText}</button>
    )
}

export default QuestionChoice;