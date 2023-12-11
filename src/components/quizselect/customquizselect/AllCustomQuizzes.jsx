import React, { useCallback, useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import SearchBar from "./SearchBar"
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
	let [quizzesByDate, setQuizzesByDate] = useState([...quizzes])
	
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
			// uses deep clone so quizzesByDate is constant
			setQuizzesByDate([...quizData])
			while (quizData.length == 1) {
				// wait
			}
			quizzesByDate = [...quizData]

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
		let sortedQuizzes = quizzes
		switch(sessionStorage.getItem('sortingQuery')) {
			case 'newest':
				sortedQuizzes = [...quizzesByDate]
				break

			case 'oldest':
				sortedQuizzes = [...quizzesByDate]
				sortedQuizzes.reverse()
				break

			case 'title':
				sortedQuizzes.sort((a, b) => (a.title > b.title) ? 1 : -1)
				break

			case 'titleReverse':
				sortedQuizzes.sort((a, b) => (a.title < b.title) ? 1 : -1)
				break

			case 'shortest':
				sortedQuizzes.sort((a, b) => (a.numQuestions > b.numQuestions) ? 1 : -1)
				break
	
			case 'longest':					
				sortedQuizzes.sort((a, b) => (a.numQuestions < b.numQuestions) ? 1 : -1)
				break

			default:
				sortedQuizzes = quizzes
		}

		setQuizzes([...sortedQuizzes])
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
		
		setQuizzesToDisplay([...newQuizzes])
	}

	// function that filters quizzes by title
	function search() {
		const searchTerm = sessionStorage.getItem('searchQuery').toLowerCase()
		let searchedQuizzes
		if(searchTerm.length > 0) {
			searchedQuizzes = quizzesToDisplay.filter((quiz) => {
				return quiz.title.toLowerCase().includes(searchTerm) || checkTags(quiz, searchTerm)
			})

			setQuizzesToDisplay([...searchedQuizzes])
		} 
	}

	// function that filters quizzes by tags
	function checkTags(quiz, searchTerm) {
		if (quiz.tags != undefined && quiz.tags.length > 0) {
			quiz.tags.forEach((tag) => {
				if (tag.toLowerCase().includes(searchTerm)) {
					console.log(tag, quiz.title)
					return quiz
				}
			})
		}
		return false
	}

	function searchAndFilter() {
		sortQuizzes()
		filterByPrivacy()
		search()
	}

	
  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-300 -sm:text-lg">User-Made Quizzes</h1>
		<div className="justify-center mt-5">
			<SearchBar />
		</div>
		<div className="flex flex-wrap justify-center mt-3 mx-3">
			<PrivacyList />
			<SortByList />
			<button className="bg-white font-bold float-right rounded mx-5 px-3" onClick={searchAndFilter}>Search & Filter</button>		
		</div>
		<h2 className="text-white mt-4">Displaying {quizzesToDisplay.length} quizzes</h2>
		<div id="customQuizDiv" className="flex flex-wrap justify-center mt-14 mx-32">
			{quizzesToDisplay.map(q => (<CustomQuizSelectButton title={q.title} numQuestions={q.numQuestions} tags={q.tags} uid={q.uid} quizPassword={q.quizPassword}/>))} 
	  	</div>
    </div>
  )
  }


export default AllCustomQuizzes