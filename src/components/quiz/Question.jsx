import React from "react";
import QuestionChoice from "./QuestionChoice";

const Question = ({questionText}) => (
    <div className="flex flex-col w-7/12 pb-4 mb-4 bg-gray-900 rounded-lg shadow-lg">
        <p className="flex pt-4 pb-4 pl-6 text-xl text-gray-300">{questionText}</p>
        <QuestionChoice choiceText={"Choice test"}/>
        <QuestionChoice choiceText={"Choice test"}/>
        <QuestionChoice choiceText={"Choice test"}/>
        <QuestionChoice choiceText={"Choice test"}/>
    </div>
)

export default Question