import React, { useCallback, useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import CustomQuizSelectButton from "./CustomQuizSelectButton";


const AllCustomQuizzes = () => {
	let [loading, setLoading] = useState(true)
  	let [quizzes, setQuizzes] = useState([
		{
			"numQuestions": 0,
			"createdAt": "",
			"creator": "",
			"questions": {},
			"quizTaken": 0,
			"title": "Loading...",
			"lastEdit": "",
			"tags": []
	}])
	  

	/**
	 * This useEffect() is used to grab all custom quizzes
	 * We are using a Firebase cloud function (grabAllCustomQuizzes)
	 */
    useEffect(() => {
      async function fetchCustomQuizzes() {
        try {
          //production: https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabAllCustomQuizzes
          //testing: http://127.0.0.1:6001/quizmaster-c66a2/us-central1/grabAllCustomQuizzes
          const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabAllCustomQuizzes', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          });
    
          if (response.ok) {
            const json = await response.json();
            const quizData = json.data
            setQuizzes(quizData)
			

          } else {
            // Handle the case when the response is not ok (e.g., error handling)
            console.error('Fetch error:', response.statusText);
          }

        } catch (error) {
          // Handle any fetch-related errors here
          console.error('Fetch error:', error);
		}
		setLoading(false)
      }
    
      fetchCustomQuizzes();
    }, []);

	if (loading == true) {
		console.log("hasn't loaded yet")
		console.log("Title: " + quizzes[0].title)
	}

    if (loading == false) {
		console.log("loading done")
		console.log("Title: " + quizzes[0])
	}
	
  return (
    <div>
      	<h1 className="text-2xl font-bold text-gray-300 -sm:text-lg">User-Made Quizzes</h1>
		<div className="flex flex-wrap justify-center mt-14">
			{quizzes.map(q => (<CustomQuizSelectButton title={q.title} numQuestions={q.numQuestions} />))} 
	  	</div>
    </div>
  )
}


export default AllCustomQuizzes