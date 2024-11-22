/**
 * This modal appears when the quiz is completed or the timer is up. 
 * It simply will host the number of correct questions out of the 
 * amount of questions. 
 */
import React from "react";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import SquareX from "../icons/SquareX";
import { Link } from "react-router-dom";
import { useVolumeSettings } from "../../contexts/VolumeContext.jsx";

//Import sound components for quiz results
import PassedSound from "../sounds/PassedSound.jsx"; 
import FailSound from "../sounds/FailSound.jsx"; 
import AverageSound from "../sounds/AverageSound.jsx"; 
 


const DoneModal = ({ isActive, amountCorrect, totalAmount, active, loading }) => {
    
    //set varible to user inputed PassThreshold
    const { passThreshold } = useVolumeSettings();
  console.log('Modal open')
    // Handles which sounds to play depending on the score
    const [playPassSound, setPassSound] = useState(false);
    const [playFailSound, setFailSound] = useState(false);
    const [playAverageSound, setAverageSound] = useState(false);
  
    useEffect(() => {
      const score = (amountCorrect / totalAmount) * 100;
      if (score >= passThreshold) {
        setPassSound(true);
        setFailSound(false);
        setAverageSound(false);
      } else if (score >= (passThreshold-20) && score < (passThreshold - 1)) {
        setPassSound(false);
        setFailSound(false);
        setAverageSound(true);
      } else {
        setPassSound(false);
        setFailSound(true);
        setAverageSound(false);
      }
    }, [amountCorrect, totalAmount, passThreshold]);
  


    return (
      <Modal
        isOpen={active}
        contentLabel="Done Modal"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: "transparent",
            height: "max-content",
            width: "max-content",
          },
          content: {
            background: "transparent",
            outline: "none",
            border: "none",
          },
        }}
      >
        <div className="flex fixed z-50 align-middle justify-center w-full p-4 overflow-x-hidden overflow-y-auto h-modal">
          <div className="relative align-middle justify-center w-full h-full max-w-2xl right-16 -md:ml-20 -md:mr-2 -md:mt-6">
            <div className="relative bg-gray-900 rounded-xl shadow -md:text-small">
              <div className="flex items-center justify-center p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-2xl font-semibold text-gray-300 -md:text-xl">
                  Results!
                </h3>
                <button
                  type="button"
                  className="text-gray-300 bg-transparent hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-600"
                  onClick={() => isActive(false)}
                >
                  <SquareX className={"w-10 h-10 fill-gray-300"} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-center leading-relaxed text-gray-300 dark:text-gray-400 text-9xl -md:text-xl">
                  <div>
                    {amountCorrect.toString()}/{totalAmount.toString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 border-t rounded-b border-gray-600 space-x-8">
                <Link to={"/typeofquiz"}>
                  <div
                    type="button"
                    className="text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    onClick={() => isActive(false)}
                  >
                    Take Another Quiz!
                  </div>
                </Link>
                <Link to={"/dashboard"}>
                  <div
                    type="button"
                    className="text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    onClick={() => isActive(false)}
                  >
                    View Results!
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Conditionally render the sound components based on score */}
        {playPassSound && <PassedSound />}
        {playFailSound && <FailSound />}
        {playAverageSound && <AverageSound/>}
      </Modal>
    );
  };
  
  export default DoneModal;