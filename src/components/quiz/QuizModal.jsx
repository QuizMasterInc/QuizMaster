import React from "react";
import SquareX from "../icons/SquareX";

const QuizModal = ({}) => (
    <div className="grid grid-cols-1 grid-rows-3 absolute inset-x-0 z-10">
        <div>Test <SquareX className={"h-10 w-10"}/></div>
        <div>Test</div>
        <div>Test</div>
    </div>
)

export default QuizModal