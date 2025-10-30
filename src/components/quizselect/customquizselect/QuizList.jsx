import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import FilterSelect from "./FilterSelect";
import { useAuth } from "../../../contexts/AuthContext";
import quizRetrievalService from "../../../services/quiz/quizRetrievalService";

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

  // Get current filter values from URL
  const filters = {
    searchTerm: searchParams.get('q') || '',
    sortBy: searchParams.get('sort') || 'newest',
    privacy: searchParams.get('privacy') || 'All'
  };

  // Data fetching logic based on dataSource
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;

      if (dataSource === "browseCustomQuizzes") {
        // AllCustomQuizzes logic
        const options = {
          searchTerm: filters.searchTerm.trim(),
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
        // AllTeacherQuizzes logic
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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        const quizData = json.data;

        // Filter for teacher-made quizzes
        const filtered = quizData.filter((quiz) => {
          const tags = quiz.tags;
          if (Array.isArray(tags)) {
            return tags.some((tag) => tag.toLowerCase() === "teachermade (no other tags can be added)");
          } else if (typeof tags === 'string') {
            return tags.toLowerCase().includes("teachermade (no other tags can be added)");
          }
          return false;
        });

        // Clean tags to only show 'teachermade'
        const cleaned = filtered.map((quiz) => ({
          ...quiz,
          tags: ["teachermade"]
        }));

        result = { quizzes: cleaned };
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
  }, [dataSource, filters, currentUser?.uid]);

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
  }, [dataSource, currentUser?.uid, searchParams]); // Refetch custom quizzes when filters change

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
    if (createdAt.seconds) return createdAt.seconds * 1000;
    return new Date(createdAt).getTime();
  };

  const checkTags = (quiz, searchTerm) => {
    if (quiz.tags) {
      if (Array.isArray(quiz.tags) && quiz.tags.length > 0) {
        return quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      } else if (typeof quiz.tags === 'string' && quiz.tags.length > 0) {
        return quiz.tags.toLowerCase().includes(searchTerm);
      }
    }
    return false;
  };

  // Update URL params when filters change
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };

    const params = {};
    if (updatedFilters.searchTerm.trim()) {
      params.q = updatedFilters.searchTerm.trim();
    }
    if (updatedFilters.sortBy !== 'newest') {
      params.sort = updatedFilters.sortBy;
    }
    if (enabledFilters.includes('privacy') && updatedFilters.privacy !== 'All') {
      params.privacy = updatedFilters.privacy;
    }

    setSearchParams(params, { replace: true });
  }, [filters, enabledFilters, setSearchParams]);

  // Normalize quiz data for display
  const normalizeQuizData = (quiz) => {
    if (dataSource === "browseCustomQuizzes") {
      // Complex normalization for browseCustomQuizzes
      return quizRetrievalService.normalizeQuizData ?
        quizRetrievalService.normalizeQuizData(quiz) : {
          id: quiz.id || quiz.uid,
          title: quiz.metadata?.title || quiz.title || 'Untitled Quiz',
          numQuestions: quiz.metadata?.questionCount || quiz.numQuestions || quiz.questionCount || 0,
          tags: Array.isArray(quiz.metadata?.tags) ? quiz.metadata.tags :
                (quiz.tags ? (typeof quiz.tags === 'string' ? quiz.tags.split(',').map(t => t.trim()) : quiz.tags) : []),
          password: (quiz.hasPassword || quiz.metadata?.hasPassword || quiz.password || quiz.metadata?.password) ? 'protected' : null,
          creator: quiz.creator?.displayName || quiz.creator?.username || quiz.creator?.userId || quiz.creator || quiz.creatorID || 'Anonymous User',
          difficulty: quiz.metadata?.difficulty || quiz.difficulty || '3',
          category: quiz.metadata?.category || quiz.category || 'General',
          isPrivate: !quiz.metadata?.isPublic || quiz.access?.visibility === 'private' || !!quiz.quizPassword || quiz.hasPassword,
          attempts: quiz.analytics?.stats?.attempts || quiz.attemptCount || 0,
          averageScore: quiz.analytics?.stats?.averageScore || quiz.averageScore || 0,
          createdAt: quiz.timestamps?.createdAt || quiz.createdAt,
          updatedAt: quiz.timestamps?.updatedAt || quiz.updatedAt
        };
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