import React, { useCallback, useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import PrivacyRadioButtons from "./CustomQuizPrivacyButton";


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
	let [quizzesToDisplay, setQuizzesToDisplay] = useState(quizzes)

	
	  

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
            const json = await response.json()
            const quizData = json.data
            setQuizzes(quizData)
			setQuizzesToDisplay(quizData)
            console.log('QuizData: ', quizData)

          } else {
            // Handle the case when the response is not okay
            console.error('Fetch error:', response.statusText);
          }

        } catch (error) {
          // Handle any fetch-related errors here
          console.error('Fetch error:', error)
		}
		setLoading(false)
      }
    
      
      	fetchCustomQuizzes();
    }, []);

	function updateQuizList() {
		console.log(sessionStorage.getItem('privacy'))
		let newQuizzes
		let privateQuizzes = quizzes.filter((quiz) => {
			return quiz.quizPassword != null && quiz.quizPassword != ""
		  })

		if (sessionStorage.getItem('privacy') === 'Public') {
			newQuizzes = quizzes.filter((quiz) => {
				return privateQuizzes.indexOf(quiz) == -1
			  })
		}

		if (sessionStorage.getItem('privacy') === 'Private') {
			newQuizzes = quizzes.filter((quiz) => {
				return quiz.quizPassword != null && quiz.quizPassword != ""
			  })
		}

		else {
			newQuizzes = quizzes
		}
		
		setQuizzesToDisplay(newQuizzes)
		console.log(newQuizzes)
	}
		
	
	
  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-300 -sm:text-lg">User-Made Quizzes</h1>
        <div className="flex flex-wrap justify-center mt-12 mx-2 py-2">
            <PrivacyRadioButtons />
			<button class="bg-white font-bold rounded mx-4 px-3 py-2" onClick={updateQuizList}>Filter</button>
            
        </div>

		<div id="customQuizDiv" className="flex flex-wrap justify-center mt-14 mx-32">
			{quizzesToDisplay.map(q => (<CustomQuizSelectButton title={q.title} numQuestions={q.numQuestions} tags={q.tags} uid={q.uid}/>))} 
	  	</div>
    </div>
  )
  }


export default AllCustomQuizzes