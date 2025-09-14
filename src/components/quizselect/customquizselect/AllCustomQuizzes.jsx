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

  // All sorting, filtering, and searching now handled server-side!
  // This eliminates O(n²) client-side operations

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1b1444] to-[#0f051d] text-white relative overflow-hidden py-20 px-6">
      {/* Background glow effects */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-700 opacity-30 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-blue-500 opacity-30 blur-[120px] rounded-full z-0" />
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-white text-center mb-6 drop-shadow-lg">
          User-Made Quizzes
        </h1>

        <div className="justify-center mt-5">
          <SearchBar />
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
          <PrivacyList />
          <SortByList onSortChange={handleSearchAndFilter} />
          <button
            className="bg-purple-600 hover:bg-purple-500 transition text-white font-semibold px-4 py-2 rounded shadow-md"
            onClick={handleSearchAndFilter}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Search & Filter'}
          </button>
        </div>

        {error && (
          <div className="mt-6 text-center bg-red-500 text-white py-2 px-4 rounded shadow-md">
            {error}
          </div>
        )}

        <p className="mt-6 text-center text-gray-300 text-lg">
          Displaying <span className="font-bold text-white">{quizzes.length}</span> quizzes
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-white text-lg">Loading optimized results...</div>
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
      </div> {/* End of z-10 content wrapper */}
    </div> 
  );
};

export default AllCustomQuizzes;
