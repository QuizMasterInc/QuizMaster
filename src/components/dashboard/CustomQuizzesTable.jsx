import React, { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Q from '../icons/Q'

const CustomQuizzesTable = () => {
    const [customQuizzes, setCustomQuizzes] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingColor, setLoadingColor] = useState("d1d5db")
    const {currentUser} = useAuth()
    const Qicon = useState(<Q className={"w-10 h-10 fill-gray-300 -sm:w-8 -sm:h-8"}/>)[0];

    const navigate = useNavigate() // used when custom quiz is clicked

    async function fetchUserQuizzes() {
      setLoading(true);
      try {
        //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabCustomQuizzesByUser
        //https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuizzesByUser
        const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuizzesByUser?creator=' + currentUser.uid, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        })
        if (response.ok) {
          const data = await response.json()
          setCustomQuizzes(data.data)
        } else {
          // Handle the case when the response is not ok (e.g., error handling)
          console.error('Response Error:', response.statusText);
        }
      } catch (error) {
        // Handle any fetch-related errors here
        console.error('Fetch error:', error);
        console.log(customQuizzes)
      }
  
      setLoading(false);
    }

    const renderQuizzes = () => {
      console.log("custom quizzes: ", customQuizzes)
      return customQuizzes.map((quiz, index) => (
         <div key={index} className="w-1/2 p-4 text-center -sm:p-1 hover:cursor-pointer hover:bg-slate-500" onClick={() => navigate(`/customquiz/${quiz.uid}`)} >
            <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg">
                <div className="-m:text-m font-bold">{quiz.data.title}</div>
                <div>{Qicon}</div>
            </div>
        </div>
        )
      )
    }
    //////////////////////////////////////
    /**
   * This is useEffect() is used to grab the results for each quiz
   * Here we are using a Firebase function 
  */
  useEffect(() => {
    fetchUserQuizzes(currentUser.uid);
    
  }, []);
  ///////////////////////////////////////////////////////////
  //Conditional 
  
  return(
    <>
      {
        customQuizzes == null
        ?
        <></>
        :
        renderQuizzes()
      }
    </>
  )
}

export default CustomQuizzesTable