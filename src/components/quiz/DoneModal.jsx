import React from "react";
import { useState } from "react";
import Modal from "react-modal";
import SquareX from "../icons/SquareX";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const DoneModal = ({isActive, amountCorrect, totalAmount, active, loading}) => {
    const [loadingColor, setLoadingColor] = useState("d1d5db")

    return (
    <Modal  isOpen={active}
            contentLabel="Done Modal"
            ariaHideApp={false}
            style={{
                overlay: {
                  backgroundColor: 'transparent',
                  height: 'max-content',
                  width: 'max-content',
                },
                content: {
                    background: 'transparent',
                    outline: 'none',
                    border: 'none',
                }
    }}>
        <div className="flex fixed z-50 align-middle justify-center w-full p-4 overflow-x-hidden overflow-y-auto h-modal">
            <div className="relative align-middle justify-center w-full h-full max-w-2xl right-16 -md:ml-20 -md:mr-2 -md:mt-6">
                <div className="relative bg-gray-900 rounded-xl shadow -md:text-small">
                    <div className="flex items-center justify-center p-4 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-2xl font-semibold text-gray-300 -md:text-xl">
                            Results!
                        </h3>
                        <button type="button" className="text-gray-300 bg-transparent hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-600"
                        onClick={() => isActive(false)}>
                            <SquareX className={"w-10 h-10 fill-gray-300"}/>
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-center leading-relaxed text-gray-300 dark:text-gray-400 text-9xl -md:text-xl">
                            {!loading ? <ClipLoader loading={loading} color={loadingColor} width={50} height={150}/> : <div>{amountCorrect.toString()}/{totalAmount.toString()}</div>}
                        </div>
                    </div>
                    <div className="flex items-center justify-center p-6 border-t rounded-b border-gray-600 space-x-8">
                        <Link to={'/quizzes'}>
                        <div type="button" className="text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        onClick={() => isActive(false)}>
                            Take Another Quiz!
                        </div>
                        </Link>
                        <button type="button" className="text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        onClick={() => isActive(false)}>
                            View Results!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
)}

export default DoneModal