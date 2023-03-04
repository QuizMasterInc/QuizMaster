import React from "react";
import Modal from "react-modal";
import SquareX from "../icons/SquareX";
import { Link } from "react-router-dom";

const DoneModal = ({isActive, amountCorrect, totalAmount, active}) => (
    <Modal  isOpen={active}
            contentLabel="Done Modal"
            ariaHideApp={false}
            style={{
                overlay: {
                  backgroundColor: 'transparent',
                  height: 'max-content',
                  width: 'max-content',
                }
    }}>
        <div className={"flex fixed z-50 align-middle justify-center w-full p-4 overflow-x-hidden overflow-y-auto h-modal mr-6"}>
            <div className="relative align-middle justify-center w-full h-full max-w-2xl">
                <div className="relative bg-gray-900 rounded-xl shadow">
                    <div className="flex items-center justify-center p-4 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-2xl font-semibold text-gray-300">
                            Results!
                        </h3>
                        <button type="button" className="text-gray-300 bg-transparent hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-600"
                        onClick={() => isActive(false)}>
                            <SquareX className={"w-10 h-10 fill-gray-300"}/>
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <p className="flex items-center justify-center leading-relaxed text-gray-300 dark:text-gray-400 text-9xl">
                            {amountCorrect.toString()}/{totalAmount.toString()}
                        </p>
                    </div>
                    <div className="flex items-center justify-center p-6 border-t rounded-b border-gray-600">
                        <Link to={'/quizzes'}>
                        <div type="button" className="text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        onClick={() => isActive(false)}>
                            Take Another Quiz!
                        </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
)

export default DoneModal