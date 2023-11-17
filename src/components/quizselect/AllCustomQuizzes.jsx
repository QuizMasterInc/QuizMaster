import React, { useCallback, useEffect } from "react";
import { Link } from 'react-router-dom'


useEffect(() => {
  async function fetchCustomQuizzes() {
    const data = await fetch("https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabAllCustomQuizzes")
    //const data = await fetch("http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabAllCustomQuizzes")
      .then((res) => res.json())
      .then((data) => {
        return data;
      })
      .catch((err) => {
          console.log(err);
      });
      console.log('Final Data: ', data)
    }

  })


const AllCustomQuizzes = () => {
  return (
    <div >
        <h1 className="text-2xl font-bold text-gray-300 -sm:text-lg">User-Made Quizzes</h1>
        <div className="flex flex-wrap justify-center">
            
        </div>
    </div>
  )
}


export default AllCustomQuizzes