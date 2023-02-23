import React from "react";
import SquareX from "../icons/SquareX";

const QuizModal = ({}) => (
    <>
    <div className="grid grid-cols-1 grid-rows-3 absolute inset-x-0 z-10">
        <div>Test</div>
        <div>Test</div>
        <div>Test</div>
    </div>
    <SquareX className={"h-10 w-10 fill-gray-300"}/>
    </>
)

export default QuizModal