import React, { useEffect, useState } from "react";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import SearchBar from "./SearchBar";
import PrivacyList from "./PrivacyList";
import SortByList from "./SortByList";
import { useAuth } from "../../../contexts/AuthContext";
import quizService from "../../../services/quizService";

const AllCustomQuizzes = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [browseOptions, setBrowseOptions] = useState({
    searchTerm: '',
    sortBy: 'newest',
    privacy: 'all',
    limit: 50
  });

  useEffect(() => {
    fetchQuizzes();
  }, [browseOptions, currentUser]);

  // Optimized fetch function using server-side operations
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchTerm = sessionStorage.getItem("searchQuery") || '';
      const sortBy = sessionStorage.getItem("sortingQuery") || 'newest';  
      const privacy = sessionStorage.getItem("privacy") || 'all';

      const options = {
        searchTerm: searchTerm.trim(),
        sortBy,
        privacy: privacy.toLowerCase(),
        limit: 50,
        currentUserId: currentUser?.uid || null
      };

      const result = await quizService.browseCustomQuizzes(options);
      setQuizzes(result.quizzes || []);
      
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError(error.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Trigger refetch when user changes filters
  const handleSearchAndFilter = () => {
    fetchQuizzes();
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)]">
      
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          User-Made Quizzes
        </h1>

        <div className="flex justify-center items-center gap-4 mt-4">
          <SearchBar />
          <PrivacyList />
          <SortByList onSortChange={handleSearchAndFilter} />
          <button
            className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
            onClick={handleSearchAndFilter}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Search & Filter'}
          </button>
        </div>

        {error && (
          <div className="flex mt-5 justify-center items-center">
            <div className="error-message font-medium">
              {error}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-lg">
          Displaying <span className="font-bold text-[var(--primary-400)]">{quizzes.length}</span> quizzes
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-gradient-primary text-lg">Loading optimized results...</div>
          </div>
        ) : (
          <div id="customQuizDiv" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
            {quizzes.map((q) => (
              <CustomQuizSelectButton
                key={q.title + q.uid}
                title={q.title}
                numQuestions={q.numQuestions}
                tags={q.tags}
                uid={q.uid}
                quizPassword={q.quizPassword}
                creator={q.creator}
              />
            ))}
          </div>
        )}

      </div>
    </div> 
  );
  
};

export default AllCustomQuizzes;