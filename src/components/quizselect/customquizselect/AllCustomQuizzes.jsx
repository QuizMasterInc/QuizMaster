import React, { useEffect, useState } from "react";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import SearchBar from "./SearchBar";
import PrivacyList from "./PrivacyList";
import SortByList from "./SortByList";
import { useAuth } from "../../../contexts/AuthContext";
import quizRetrievalService from "../../../services/quizRetrievalService";

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
  }, [currentUser]); // Remove browseOptions dependency to prevent infinite loops

  // Optimized fetch function using server-side operations and Firestore indexes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get filter values from sessionStorage or use defaults
      const searchTerm = sessionStorage.getItem("searchQuery") || '';
      const sortBy = sessionStorage.getItem("sortingQuery") || 'newest';  
      const privacy = sessionStorage.getItem("privacy") || 'all';

      const options = {
        searchTerm: searchTerm.trim(),
        sortBy,
        privacy: privacy.toLowerCase(),
        limit: 50,
        currentUserId: currentUser?.uid || null,
        // Leverage indexes for optimized queries
        useIndexes: true,
        // Specify which fields we need based on ACTUAL database schema
        fields: [
          'metadata.title',
          'metadata.tags', 
          'metadata.difficulty',
          'metadata.category',
          'metadata.questionCount',
          'metadata.isPublic',
          'metadata.hasPassword',
          'creator.uid',
          'creator.displayName',
          'creator.username',
          'timestamps.createdAt',
          'timestamps.updatedAt'
        ]
      };

      console.log('Fetching quizzes with indexed options:', options);

      const result = await quizRetrievalService.browseCustomQuizzes(options);
      setQuizzes(result.quizzes || []);
      
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError(error.message || 'Failed to load quizzes');
      
      // Fallback: try to get user's own quizzes if browse fails
      if (currentUser?.uid) {
        try {
          const userQuizzes = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
          setQuizzes(userQuizzes || []);
          setError('Showing your quizzes only (server temporarily unavailable)'); // Inform user
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setQuizzes([]); // Set empty array as final fallback
        }
      } else {
        setQuizzes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger refetch when user changes filters
  const handleSearchAndFilter = () => {
    fetchQuizzes();
  };

  // Handle filter updates from child components
  const updateFilters = (newFilters) => {
    setBrowseOptions(prev => ({
      ...prev,
      ...newFilters
    }));
    
    // Update sessionStorage
    if (newFilters.searchTerm !== undefined) {
      sessionStorage.setItem("searchQuery", newFilters.searchTerm);
    }
    if (newFilters.sortBy !== undefined) {
      sessionStorage.setItem("sortingQuery", newFilters.sortBy);
    }
    if (newFilters.privacy !== undefined) {
      sessionStorage.setItem("privacy", newFilters.privacy);
    }
    
    // Fetch with new filters
    setTimeout(fetchQuizzes, 100); // Small delay to ensure sessionStorage is updated
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)]">
      
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          User-Made Quizzes
        </h1>

        <div className="flex justify-center items-center gap-4 mt-4">
          <SearchBar onSearch={(term) => updateFilters({ searchTerm: term })} />
          <PrivacyList onPrivacyChange={(privacy) => updateFilters({ privacy })} />
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
            {quizzes.map((q) => {
              // Use the normalized data from the service layer or fallback
              const quizData = quizRetrievalService.normalizeQuizData ? quizRetrievalService.normalizeQuizData(q) : {
                // Fallback normalization using corrected schema mapping
                id: q.id || q.uid,
                title: q.metadata?.title || q.title || 'Untitled Quiz',
                numQuestions: q.metadata?.questionCount || q.numQuestions || q.questionCount || 0,
                tags: Array.isArray(q.metadata?.tags) ? q.metadata.tags.join(', ') : (q.tags || ''),
                // FIXED: Check for password fields that backend actually returns
                quizPassword: q.hasPassword || q.metadata?.hasPassword || q.password || q.metadata?.password ? 'protected' : null,
                creator: q.creator?.displayName || q.creator?.username || q.creator || 'Anonymous User', // Use display name!
                difficulty: q.metadata?.difficulty || q.difficulty || 'Medium',
                category: q.metadata?.category || q.category || 'General',
                isPrivate: !q.metadata?.isPublic || q.isPrivate || false,
                createdAt: q.timestamps?.createdAt || q.createdAt,
                updatedAt: q.timestamps?.updatedAt || q.updatedAt
              };
              


              return (
                <CustomQuizSelectButton
                  key={quizData.id + quizData.title}
                  title={quizData.title}
                  numQuestions={quizData.numQuestions}
                  tags={Array.isArray(quizData.tags) ? quizData.tags.join(', ') : quizData.tags}
                  uid={quizData.id}
                  quizPassword={quizData.password}
                  creator={quizData.creator}
                  difficulty={quizData.difficulty}
                  category={quizData.category}
                  attempts={quizData.attempts}
                  averageScore={quizData.averageScore}
                  createdAt={quizData.createdAt}
                  isPrivate={quizData.isPrivate}
                />
              );
            })}
          </div>
        )}

      </div>
    </div> 
  );
  
};

export default AllCustomQuizzes;