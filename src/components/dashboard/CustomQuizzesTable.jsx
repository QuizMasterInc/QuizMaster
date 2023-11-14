import React, { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { useAuth } from '../../contexts/AuthContext'
import Q from '../icons/Q'

const CustomQuizzesTable = () => {
    const [customQuizzes, updateCustomQuizzes] = useState([])
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
        const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuizzesByUser', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        if (response.ok) {
          const customQuizData = await response.json();
          console.log(customQuizData)
          
        } else {
          // Handle the case when the response is not ok (e.g., error handling)
          console.error('Fetch error:', response.statusText);
        }
      } catch (error) {
        // Handle any fetch-related errors here
        console.error('Fetch error:', error);
        console.log(customQuizData)
      }
  
      setLoading(false);
    }
  
    fetchUserQuizzes(currentUser.uid);
  }, []);
  ///////////////////////////////////////////////////////////

    return(
    <div className="w-1/2 p-4 text-center -sm:p-1">
        <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg">
            <div className="-m:text-m font-bold">{'Custom Quiz Name'}</div>
            <div>{Qicon}</div>
        </div>
    </div>
    )
}

export default CustomQuizzesTable