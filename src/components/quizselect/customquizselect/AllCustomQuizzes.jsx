import React, { useCallback, useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import PrivacyList from "./PrivacyList";
import SortByList from "./SortByList";



const AllCustomQuizzes = () => {
	let [loading, setLoading] = useState(true)
	
	// quizzes contains array of all custom quizzes
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
	// quizzesToDisplay will be mutable and contain filtered quizzes
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

	function sortQuizzes() {
		let sortedQuizzes
		switch(sessionStorage.getItem('sortingQuery')) {
			case 'title':
				setQuizzes(quizzes.sort((a, b) => (a.title > b.title) ? 1 : -1))
				break

			case 'titleReverse':
				sortedQuizzes = quizzes.sort((a, b) => (a.title < b.title) ? 1 : -1)
				break

			default: 
				console.log("oops")
		}

		//setQuizzes(sortedQuizzes)
		//console.log("Sorted:", sortedQuizzes)
	}

	function filterByPrivacy() {
		let newQuizzes
		// gets privateQuizzes so we can filter out public quizzes later
		// no way in Firebase to filter when field does not exist in a document/object
		let privateQuizzes = quizzes.filter((quiz) => {
			return quiz.quizPassword != null && quiz.quizPassword != ""
		  })

		if (sessionStorage.getItem('privacy') === 'Public') {
			newQuizzes = quizzes.filter((quiz) => {
				return privateQuizzes.indexOf(quiz) == -1
			  })

		} else if (sessionStorage.getItem('privacy') === 'Private') {
			newQuizzes = privateQuizzes
		
		} else {
			newQuizzes = quizzes
		}
		
		setQuizzesToDisplay(newQuizzes)
	}

	function sortAndFilter() {
		sortQuizzes()
		filterByPrivacy()
	}

	
  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-300 -sm:text-lg">User-Made Quizzes</h1>
		<div className="flex flex-wrap justify-center mt-12 mx-3">
			<PrivacyList />
			<SortByList />
			<button className="bg-white font-bold float-right rounded mx-5 px-3" onClick={sortAndFilter}>Sort & Filter</button>		
		</div>
		<h2 className="text-white">Displaying {quizzesToDisplay.length} quizzes</h2>
		<div id="customQuizDiv" className="flex flex-wrap justify-center mt-14 mx-32">
			{quizzesToDisplay.map(q => (<CustomQuizSelectButton title={q.title} numQuestions={q.numQuestions} tags={q.tags} uid={q.uid}/>))} 
	  	</div>
    </div>
  )
  }


export default AllCustomQuizzes