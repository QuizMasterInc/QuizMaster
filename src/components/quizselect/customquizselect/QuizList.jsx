/**
 * QuizList.jsx
 * Component for rendering filterable quiz lists with server-side or client-side filtering
 */

import { useEffect, useState, useCallback } from "react";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import QuizFilters from "./QuizFilters";
import { useAuth } from "../../../contexts/AuthContext";
import { useQuizFiltering } from "../../../hooks/useQuizFiltering";
import quizRetrievalService from "../../../services/quiz/quizRetrievalService";
import cloudFunctionsAPI from "../../../services/api/cloudFunctions";

const QuizList = ({
  title,
  dataSource = "browseCustomQuizzes",
  filters: enabledFilters = ["search", "privacy", "sort"],
  showRefreshButton = true,
  className = ""
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesToDisplay, setQuizzesToDisplay] = useState([]);

  // Use custom filtering hook
  const {
    filters,
    debouncedSearchTerm,
    updateFilters,
    applyClientSideFilters
  } = useQuizFiltering(enabledFilters);

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
      const filtered = applyClientSideFilters(quizzes);
      setQuizzesToDisplay(filtered);
    }
  }, [dataSource, filters, quizzes, applyClientSideFilters]);

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
  
  // Called after a quiz is successfully deleted on the server.
  const handleQuizDeleted = (deletedId) => {
    setQuizzes((prev) =>
      prev.filter((quiz) => {
        const quizData = normalizeQuizData(quiz);
        return quizData.id !== deletedId;
      })
    );
// Removes that quiz from both the master list and the displayed list
    setQuizzesToDisplay((prev) =>
      prev.filter((quiz) => {
        const quizData = normalizeQuizData(quiz);
        return quizData.id !== deletedId;
      })
    );
  };

  return (
    <div className={`min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)] ${className}`}>
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          {title}
        </h1>

        {/* Filters */}
        <QuizFilters
          enabledFilters={enabledFilters}
          filters={filters}
          onFilterChange={updateFilters}
          onRefresh={dataSource === "teacherQuizzes" 
            ? () => setQuizzesToDisplay(applyClientSideFilters(quizzes))
            : fetchQuizzes
          }
          loading={loading}
          showRefreshButton={showRefreshButton}
        />

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
              // NEW: Used to decide if the Delete button should be shown (only for its owner).
              let creatorId = null;
              if (dataSource === "browseCustomQuizzes") { // Determines the creator's user ID for this quiz.
                // raw Firestore result usually has creator.uid
                creatorId = quiz.creatorID || quiz.creator?.userId || null;
              }

              return (
                // Render a single quiz card, passing down all display data. 
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
                  // props needed by DeleteQuizButton
                  creatorId={creatorId}
                  currentUserId={currentUser?.uid}
                  onDeleted={handleQuizDeleted}
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