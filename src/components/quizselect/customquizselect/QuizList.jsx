import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import FilterSelect from "./FilterSelect";
import { useAuth } from "../../../contexts/AuthContext";
import quizRetrievalService from "../../../services/quiz/quizRetrievalService";
import cloudFunctionsAPI from "../../../services/api/cloudFunctions";

const QuizList = ({
  title,
  dataSource = "browseCustomQuizzes", // "browseCustomQuizzes" | "teacherQuizzes"
  filters: enabledFilters = ["search", "privacy", "sort"],
  showRefreshButton = true,
  className = ""
}) => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesToDisplay, setQuizzesToDisplay] = useState([]);

  // Debounced search state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimerRef = useRef(null);

  // Get current filter values from URL (memoized to prevent infinite re-renders)
  const filters = useMemo(() => ({
    searchTerm: searchParams.get('q') || '',
    sortBy: searchParams.get('sort') || 'newest',
    privacy: searchParams.get('privacy') || 'All'
  }), [searchParams]);

  // Data fetching logic based on dataSource
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;

      if (dataSource === "browseCustomQuizzes") {
        // AllCustomQuizzes logic
        const options = {
          searchTerm: debouncedSearchTerm.trim(),
          sortBy: filters.sortBy,
          privacy: filters.privacy.toLowerCase(),
          limit: 50,
          currentUserId: currentUser?.uid || null,
          useIndexes: true,
          fields: [
            'metadata.title', 'metadata.tags', 'metadata.difficulty',
            'metadata.category', 'metadata.questionCount', 'metadata.isPublic',
            'metadata.hasPassword', 'creator.uid', 'creator.displayName',
            'creator.username', 'timestamps.createdAt', 'timestamps.updatedAt'
          ]
        };

        result = await quizRetrievalService.browseCustomQuizzes(options);

        // Fallback logic for AllCustomQuizzes
        if (!result.quizzes && currentUser?.uid) {
          try {
            const userQuizzes = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
            result = { quizzes: userQuizzes };
            setError('Showing your quizzes only (server temporarily unavailable)');
          } catch (fallbackError) {
            result = { quizzes: [] };
          }
        }

      } else if (dataSource === "teacherQuizzes") {
        // AllTeacherQuizzes logic - now uses server-side filtering
        result = await cloudFunctionsAPI.getTeacherQuizzes({
          searchTerm: filters.searchTerm,
          sortBy: filters.sortBy,
          limit: 50
        });
      }

      const quizArray = result.quizzes || [];
      setQuizzes(quizArray);
      setQuizzesToDisplay(quizArray);

    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError(error.message || 'Failed to load quizzes');
      setQuizzes([]);
      setQuizzesToDisplay([]);
    } finally {
      setLoading(false);
    }
  }, [dataSource, debouncedSearchTerm, filters.sortBy, filters.privacy, currentUser?.uid]);

  // Initial fetch - different behavior based on dataSource
  useEffect(() => {
    if (dataSource === "teacherQuizzes") {
      // Teacher quizzes: fetch once on mount
      fetchQuizzes();
    }
  }, [dataSource]); // Only fetch teacher quizzes once

  useEffect(() => {
    if (dataSource === "browseCustomQuizzes") {
      // Custom quizzes: fetch when filters change (server-side filtering)
      fetchQuizzes();
    }
  }, [dataSource, currentUser?.uid, debouncedSearchTerm, filters.sortBy, filters.privacy]); // Refetch custom quizzes when filters change

  // For teacher quizzes, apply client-side filtering when filters change
  useEffect(() => {
    if (dataSource === "teacherQuizzes") {
      applyClientSideFilters();
    }
  }, [dataSource, filters, quizzes]);

  const applyClientSideFilters = useCallback(() => {
    let filtered = [...quizzes];

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm) ||
        checkTags(quiz, searchTerm)
      );
    }

    // Apply sorting
    filtered = sortQuizzes(filtered, filters.sortBy);

    setQuizzesToDisplay(filtered);
  }, [quizzes, filters]);

  const sortQuizzes = (quizArray, sortValue) => {
    const sorted = [...quizArray];

    switch (sortValue) {
      case "newest":
        sorted.sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
        break;
      case "oldest":
        sorted.sort((a, b) => parseCreatedAt(a.createdAt) - parseCreatedAt(b.createdAt));
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleReverse":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "shortest":
        sorted.sort((a, b) => a.numQuestions - b.numQuestions);
        break;
      case "longest":
        sorted.sort((a, b) => b.numQuestions - a.numQuestions);
        break;
      default:
        sorted.sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
    }

    return sorted;
  };

  const parseCreatedAt = (createdAt) => {
    if (!createdAt) return 0;
    return new Date(createdAt).getTime();
  };

  const checkTags = (quiz, searchTerm) => {
    if (quiz.tags && Array.isArray(quiz.tags) && quiz.tags.length > 0) {
      return quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    }
    return false;
  };

  // Update URL params when filters change
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };

    // Handle search term with debouncing
    if (newFilters.searchTerm !== undefined) {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set new timer for 300ms delay
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedSearchTerm(newFilters.searchTerm);
      }, 300);
    }

    // Update URL params immediately for all filters
    const params = {};
    if (updatedFilters.searchTerm !== undefined ? updatedFilters.searchTerm.trim() : filters.searchTerm.trim()) {
      params.q = updatedFilters.searchTerm !== undefined ? updatedFilters.searchTerm.trim() : filters.searchTerm.trim();
    }
    if (updatedFilters.sortBy !== undefined ? updatedFilters.sortBy !== 'newest' : filters.sortBy !== 'newest') {
      params.sort = updatedFilters.sortBy !== undefined ? updatedFilters.sortBy : filters.sortBy;
    }
    if (enabledFilters.includes('privacy') && (updatedFilters.privacy !== undefined ? updatedFilters.privacy !== 'All' : filters.privacy !== 'All')) {
      params.privacy = updatedFilters.privacy !== undefined ? updatedFilters.privacy : filters.privacy;
    }

    setSearchParams(params, { replace: true });
  }, [filters, enabledFilters, setSearchParams]);

  // Normalize quiz data for display
  const normalizeQuizData = (quiz) => {
    if (dataSource === "browseCustomQuizzes") {
      // Use service-level normalization for browseCustomQuizzes
      return quizRetrievalService.normalizeQuizData(quiz);
    } else {
      // Simple normalization for teacher quizzes
      return {
        id: quiz.uid,
        title: quiz.title,
        numQuestions: quiz.numQuestions,
        tags: quiz.tags,
        password: quiz.quizPassword,
        creator: quiz.creator,
        difficulty: 'Medium', // Default for teacher quizzes
        category: 'Education', // Default for teacher quizzes
        isPrivate: false,
        attempts: quiz.quizTaken || 0,
        averageScore: 0,
        createdAt: quiz.createdAt,
        updatedAt: quiz.lastEdit
      };
    }
  };

  return (
    <div className={`min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)] ${className}`}>
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          {title}
        </h1>

        <div className="flex justify-center items-center gap-4 mt-4">
          {enabledFilters.includes('search') && (
            <FilterSelect
              type="search"
              label="Search:"
              placeholder="Search"
              value={filters.searchTerm}
              onChange={(searchTerm) => updateFilters({ searchTerm })}
              inputClassName="w-[150px] p-1 ml-1 text-black"
            />
          )}

          {enabledFilters.includes('privacy') && (
            <FilterSelect
              type="select"
              label="Display:"
              value={filters.privacy}
              onChange={(privacy) => updateFilters({ privacy })}
              options={[
                { value: "All", label: "All Quizzes" },
                { value: "Public", label: "Public Quizzes" },
                { value: "Private", label: "Private Quizzes" }
              ]}
              selectName="listPrivacyFilter"
            />
          )}

          {enabledFilters.includes('sort') && (
            <FilterSelect
              type="select"
              label="Sort by:"
              value={filters.sortBy}
              onChange={(sortBy) => updateFilters({ sortBy })}
              options={[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "title", label: "Title, A→Z" },
                { value: "titleReverse", label: "Title, Z→A" },
                { value: "shortest", label: "Shortest" },
                { value: "longest", label: "Longest" }
              ]}
              selectName="listSortMethod"
            />
          )}

          <button
            className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
            onClick={dataSource === "teacherQuizzes" ? applyClientSideFilters : fetchQuizzes}
            disabled={loading}
          >
            {loading ? 'Loading...' : (showRefreshButton ? 'Refresh' : 'Search & Filter')}
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
          Displaying <span className="font-bold text-[var(--primary-400)]">{quizzesToDisplay.length}</span> quizzes
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-gradient-primary text-lg">
              {dataSource === "browseCustomQuizzes" ? 'Loading optimized results...' : 'Loading quizzes...'}
            </div>
          </div>
        ) : (
          <div id="customQuizDiv" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
            {quizzesToDisplay.map((quiz) => {
              const quizData = normalizeQuizData(quiz);

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

export default QuizList;