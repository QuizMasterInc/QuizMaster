import React, { useEffect, useState } from "react";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import SearchBar from "./SearchBar";
import PrivacyList from "./PrivacyList";
import SortByList from "./SortByList";

const AllTeacherQuizzes = () => {
	let [loading, setLoading] = useState(true)
	// quizzes contains array of all custom quizzes

    
	
  	let [quizzes, setQuizzes] = useState([
		{
			"numQuestions": 0,
			"createdAt": "",
			"creator": "",
			"questions": {},
			"quizTaken": 0,
			"title": "Loading Questions...",
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

            let newQuizzes;
            // Gets the teacher quizzes, so we can filter out non-teacher quizzes later
            let teacherQuizzes = quizzes.filter((quiz) => quiz.teacherQuiz === true);
        
            // Check the teacher quiz flag in sessionStorage
            if (sessionStorage.getItem('teacherQuiz') === 'Teacher') {
                // Show only teacher quizzes
                newQuizzes = teacherQuizzes;
            } else {
                // Show all quizzes (filter out teacher quizzes)
                newQuizzes = quizzes
            }
        
            // Update the quizzes to display with the filtered list
            setQuizzesToDisplay([...newQuizzes]);

          } else {
            // Handle the case when the response is not okay
            console.error('Fetch error:', response.statusText);
          }

        } catch (error) {
          // Handle any fetch-related errors here
          console.error('Fetch error:', error)
		} finally {
            setLoading(false);
        }
    }
		fetchCustomQuizzes();
	}, []);

	function parseCreatedAt(createdAt) {
		if (!createdAt) return 0;

		// Firestore Timestamp object
		if (createdAt.seconds) {
			return createdAt.seconds * 1000;
		}

		// Fallback for string
		return new Date(createdAt).getTime();
	}

	function sortQuizzes() {
		let sortedQuizzes = [...quizzes];

		switch (sessionStorage.getItem("sortingQuery")) {
			case "newest":
				sortedQuizzes.sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
				break;
			case "oldest":
				sortedQuizzes.sort((a, b) => parseCreatedAt(a.createdAt) - parseCreatedAt(b.createdAt));
				break;
			case "title":
				sortedQuizzes.sort((a, b) => a.title.localeCompare(b.title));
				break;
			case "titleReverse":
				sortedQuizzes.sort((a, b) => b.title.localeCompare(a.title));
				break;
			case "shortest":
				sortedQuizzes.sort((a, b) => a.numQuestions - b.numQuestions);
				break;
			case "longest":
				sortedQuizzes.sort((a, b) => b.numQuestions - a.numQuestions);
				break;
			default:
				sortedQuizzes.sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
		}

		setQuizzes(sortedQuizzes);
	}

	function filterByPrivacy() {
		let newQuizzes;
		let privateQuizzes = quizzes.filter(
			(quiz) => quiz.quizPassword != null && quiz.quizPassword !== ""
		);

		if (sessionStorage.getItem("privacy") === "Public") {
			newQuizzes = quizzes.filter((quiz) => !privateQuizzes.includes(quiz));
		} else if (sessionStorage.getItem("privacy") === "Private") {
			newQuizzes = privateQuizzes;
		} else {
			newQuizzes = quizzes;
		}

		setQuizzesToDisplay([...newQuizzes]);
	}

	function checkTags(quiz, searchTerm) {
		if (quiz.tags && quiz.tags.length > 0) {
			for (let tag of quiz.tags) {
				if (tag.toLowerCase().includes(searchTerm)) return true;
			}
		}
		return false;
	}

	function search() {
		const searchTerm = sessionStorage.getItem("searchQuery")?.toLowerCase() || "";
		let searchedQuizzes;

		if (searchTerm.length > 0) {
			searchedQuizzes = quizzesToDisplay.filter(
				(quiz) =>
					quiz.title.toLowerCase().includes(searchTerm) ||
					checkTags(quiz, searchTerm)
			);

			setQuizzesToDisplay([...searchedQuizzes]);
		}
	}

	function searchAndFilter() {
		sortQuizzes();
		filterByPrivacy();
		search();
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1b1444] to-[#0f051d] text-white relative overflow-hidden py-20 px-6">
		  {/* Background glow effects */}
		  <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-700 opacity-30 blur-[120px] rounded-full z-0" />
		  <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-blue-500 opacity-30 blur-[120px] rounded-full z-0" />
		  <div className="relative z-10">
	  
		<div>
			<h1 className="text-4xl font-extrabold text-white text-center mb-6 drop-shadow-lg">
  Teacher-Made Quizzes
</h1>
			<div className="justify-center mt-5">
				<SearchBar />
			</div>
			<div className="flex flex-wrap justify-center items-center gap-4 mt-4">
  <PrivacyList />
  <SortByList onSortChange={searchAndFilter} />
  <button
    className="bg-purple-600 hover:bg-purple-500 transition text-white font-semibold px-4 py-2 rounded shadow-md"
    onClick={searchAndFilter}
  >
    Search & Filter
  </button>
</div>
	<p className="mt-6 text-center text-gray-300 text-lg">
  		Displaying <span className="font-bold text-white">{quizzesToDisplay.length}</span> quizzes
	</p>

	<div id="customQuizDiv" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
				{quizzesToDisplay.map((q) => (
					<CustomQuizSelectButton
						title={q.title}
						numQuestions={q.numQuestions}
						tags={q.tags}
						uid={q.uid}
						quizPassword={q.quizPassword}
					/>
				))}
			</div>
			</div> {/* End of z-10 content wrapper */}
		  </div> {/* End of background gradient wrapper */}
		</div> 
	);
};


export default AllTeacherQuizzes;
