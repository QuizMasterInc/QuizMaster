import React from "react";
import SquareX from "../icons/SquareX";

const QuizModal = ({isActive}) => (
    <div className={`flex fixed z-50 align-middle justify-center w-full p-4 overflow-x-hidden overflow-y-auto h-modal ${isActive ? "" : "hidden"}`}>
        <div className="relative align-middle justify-center w-full h-full max-w-2xl">
            <div className="relative bg-gray-900 rounded-xl shadow">
                <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-300">
                        Welcome to the Quiz Activity!
                    </h3>
                    <button type="button" className="text-gray-300 bg-transparent hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-600"
                    onClick={() => isActive(false)}>
                        <SquareX className={"w-10 h-10 fill-gray-300"}/>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-base leading-relaxed text-gray-300 dark:text-gray-400">
                        This is the quiz taking activity. There will be 10 questions per quiz. Each question is multiple choice. 
                        Select the best answer for each question. When you're done, click the button at the end to view your results! 
                    </p>
                </div>
                <div className="flex items-center justify-center p-6 border-t rounded-b border-gray-600">
                    <button type="button" className="text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    onClick={() => isActive(false)}>
                        Lets Go!
                    </button>
                </div>
            </div>
        </div>
    </div>
)

export default QuizModal