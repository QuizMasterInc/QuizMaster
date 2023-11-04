/**
 * This hosts the results for each quiz 
 */
import React, { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { useAuth } from '../../contexts/AuthContext'

export const QuizResult = ({index, category, icon}) => {
  //state variables
  const [loading, setLoading] = useState(true)
  const [loadingColor, setLoadingColor] = useState("d1d5db")
  const [result, setResult] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const {currentUser} = useAuth()

  /**
   * This is useEffect() is used to grab the results for each quiz
   * Here we are using a Firebase function 
  */
  useEffect(() => {
    async function fetchResults(uid) {
      setLoading(true);
      const data = {
        uid: uid,
        category: category.toLowerCase()
      }
  
      try {
        //http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabResults
        //https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabResults
        const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabResults', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        if (response.ok) {
          const resultData = await response.json();
          setResult(resultData.score);
          setAvgScore(resultData.avgScore);
        } else {
          // Handle the case when the response is not ok (e.g., error handling)
          console.error('Fetch error:', response.statusText);
        }
      } catch (error) {
        // Handle any fetch-related errors here
        console.error('Fetch error:', error);
      }
  
      setLoading(false);
    }
  
    fetchResults(currentUser.uid);
  }, []);

  /**
   * The view element. 
   * A loading circle will be mounted while the component is getting the data.  
   */
  return (
    <div key={index} className="w-1/2 p-4 text-center -sm:p-1">
        <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
            <div className="-sm:text-sm">{category}</div>
            <div>{icon}</div>
            {loading ? <ClipLoader loading={loading} color={loadingColor} width={25} height={100}/> : <p className='text-3xl -md:text-lg'>{'Best Score: ' + Math.round(result * 100) + '%'}</p>}
            {loading ? <ClipLoader loading={loading} color={loadingColor} width={25} height={100}/> : <p className='text-3xl -md:text-lg'>{'Average: ' + Math.round(avgScore * 100) + '%'}</p>}
        </div>
    </div>
  )
}
