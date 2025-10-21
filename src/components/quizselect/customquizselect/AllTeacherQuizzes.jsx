import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import SearchBar from "./SearchBar";
import SortByList from "./SortByList";

const AllTeacherQuizzes = () => {
	let [loading, setLoading] = useState(true)
	// quizzes contains array of all custom quizzes
	
  	let [quizzes, setQuizzes] = useState([
		{
			"uid": "loading",
			"numQuestions": 0,
			"createdAt": "",
			"creator": "",
			"questions": {},
			"quizTaken": 0,
			"title": "Loading Questions...",
			"lastEdit": "",
			"tags": []
	}])
  const [quizzesToDisplay, setQuizzesToDisplay] = useState(quizzes);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current filter values from URL
  const filters = {
    searchTerm: searchParams.get('q') || '',
    sortBy: searchParams.get('sort') || 'newest'
  };

  useEffect(() => {
	async function fetchCustomQuizzes() {
	  try {
		const response = await fetch(
		  "https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabAllCustomQuizzes",
		  {
			method: "POST",
			headers: {
			  Accept: "application/json",
			  "Content-Type": "application/json"
			}
		  }
		);

		if (response.ok) {
		  const json = await response.json();
		  const quizData = json.data;

        // Filter to include only quizzes with the 'teachermade' tag
        // Handle both string and array formats for tags
        const filtered = quizData.filter((quiz) => {
          const tags = quiz.tags;
          if (Array.isArray(tags)) {
            return tags.some((tag) => tag.toLowerCase() === "teachermade (no other tags can be added)");
          } else if (typeof tags === 'string') {
            return tags.toLowerCase().includes("teachermade (no other tags can be added)");
          }
          return false;
        });

        // Force the tag to only be 'teachermade'
        const cleaned = filtered.map((quiz) => ({
          ...quiz,
          tags: ["teachermade"]
        }));

        setQuizzes(cleaned);
        setQuizzesToDisplay(cleaned);
      } else {
        console.error("Fetch error:", response.statusText);
      }
	  } catch (error) {
		console.error("Fetch error:", error);
	  }
	  setLoading(false);
	}

	fetchCustomQuizzes();
  }, []);

  // Apply filters when URL params change
  useEffect(() => {
    sortQuizzes();
    search();
  }, [searchParams]);

	function parseCreatedAt(createdAt) {
		if (!createdAt) return 0;

		// Firestore Timestamp object
		if (createdAt.seconds) {
			return createdAt.seconds * 1000;
		}

		// Fallback for string
		return new Date(createdAt).getTime();
	}

	function sortQuizzes(sortValue = filters.sortBy) {
		let sortedQuizzes = [...quizzes];

		switch (sortValue) {
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

	function checkTags(quiz, searchTerm) {
		if (quiz.tags) {
			if (Array.isArray(quiz.tags) && quiz.tags.length > 0) {
				// Handle tags as array
				for (let tag of quiz.tags) {
					if (tag.toLowerCase().includes(searchTerm)) return true;
				}
			} else if (typeof quiz.tags === 'string' && quiz.tags.length > 0) {
				// Handle tags as string
				return quiz.tags.toLowerCase().includes(searchTerm);
			}
		}
		return false;
	}

	function search() {
		const searchTerm = filters.searchTerm?.toLowerCase() || "";
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
		search();
	}

	// Update URL params when filters change
	const updateFilters = useCallback((newFilters) => {
		const updatedFilters = { ...filters, ...newFilters };

		// Build clean URL params (omit defaults)
		const params = {};
		if (updatedFilters.searchTerm.trim()) {
			params.q = updatedFilters.searchTerm.trim();
		}
		if (updatedFilters.sortBy !== 'newest') {
			params.sort = updatedFilters.sortBy;
		}

		// Update URL without creating history entries
		setSearchParams(params, { replace: true });
	}, [filters, setSearchParams]);


	return (
		<div className="min-h-screen bg-primary relative overflow-hidden py-20 px-6">
			<div className="relative z-10">
	  
				<div>
					<h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
						Teacher-Made Quizzes
					</h1>
					
					<div className="flex justify-center items-center gap-4 mt-4">
          				<SearchBar 
							value={filters.searchTerm} 
							onChange={(searchTerm) => updateFilters({ searchTerm })} 
						/>
						<SortByList 
							value={filters.sortBy} 
							onChange={(sortBy) => updateFilters({ sortBy })} 
						/>
						<button
							className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
							onClick={searchAndFilter}
						>
							Search & Filter
						</button>
					</div>

					<p className="mt-6 text-center text-lg">
							Displaying <span className="font-bold text-gradient-primary">{quizzesToDisplay.length}</span> quizzes
					</p>

					<div id="customQuizDiv" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
						{quizzesToDisplay.map((q) => (
							<CustomQuizSelectButton
								key={q.uid}
								title={q.title}
								numQuestions={q.numQuestions}
								tags={q.tags}
								uid={q.uid}
								quizPassword={q.quizPassword}
								creator={q.creator}
							/>
						))}
					</div>
				</div>
			</div>
		</div> 
	);
};

export default AllTeacherQuizzes;