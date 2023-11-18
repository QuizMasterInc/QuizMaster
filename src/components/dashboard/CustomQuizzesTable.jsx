import React, { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { useAuth } from '../../contexts/AuthContext'
import Q from '../icons/Q'

const CustomQuizzesTable = () => {
    const [customQuizzes, setCustomQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingColor, setLoadingColor] = useState("d1d5db")
    const {currentUser} = useAuth()
    const Qicon = useState(<Q className={"w-10 h-10 fill-gray-300 -sm:w-8 -sm:h-8"}/>,)

    // TODO: include firebase function to grab custom quiz results
    //////////////////////////////////////
    /**
   * This is useEffect() is used to grab the results for each quiz
   * Here we are using a Firebase function 
  */
  useEffect(() => {
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
          setCustomQuizzes(data)
          console.log('Custom Quizzes:', data)
          
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
  
    fetchUserQuizzes(currentUser.uid);
  }, []);
  ///////////////////////////////////////////////////////////
  //Conditional 
  if (!customQuizzes || !customQuizzes.data) {
    return null; // will place loading indicator
  }
    return(
      customQuizzes.data.map((quiz, index) => (
        <div className="w-1/2 p-4 text-center -sm:p-1">
            <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg">
                <div className="-m:text-m font-bold">{quiz.title}</div>
                <div>{Qicon}</div>
            </div>
        </div>
      ))
    )
}

export default CustomQuizzesTable