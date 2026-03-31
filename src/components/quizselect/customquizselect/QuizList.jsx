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
import { fetchUsernamesByUids, isValidUsername } from "../../../services/firebase/usernameService";

// --- Username helpers (for all viewers, including public browsing) ---
const collectCreatorUid = (item) =>
  item?.creator?.uid ||
  item?.creatorId ||
  item?.creatorID ||
  item?.createdBy ||
  item?.userId ||
  item?.creator?.userId ||
  null;

const getCreatorHandle = (item) => {
  const raw = (item?.creatorUsername || item?.creator?.username || item?.username || "").trim();
  const cleaned = raw.replace(/^@/, "");
  if (cleaned && isValidUsername(cleaned)) return `@${cleaned}`;
  return null;
};

const attachCreatorUsernames = async (items) => {
  const uids = Array.from(new Set(items.map(collectCreatorUid).filter(Boolean)));
  const usernameMap = uids.length > 0 ? await fetchUsernamesByUids(uids) : {};

  return items.map((q) => {
    const uidForItem = collectCreatorUid(q);
    const uname = uidForItem ? usernameMap[uidForItem] : undefined;
    const normalizedUname = uname ? String(uname).replace(/^@/, "") : "";

    return {
      ...q,
      // stash a resolved username on the root for easy rendering
      creatorUsername:
        (normalizedUname && isValidUsername(normalizedUname) ? uname : null) ||
        (q?.creator?.username && isValidUsername(String(q.creator.username).replace(/^@/, "")) ? q.creator.username : null) ||
        (q?.creatorUsername && isValidUsername(String(q.creatorUsername).replace(/^@/, "")) ? q.creatorUsername : null) ||
        (q?.username && isValidUsername(String(q.username).replace(/^@/, "")) ? q.username : null),

      // also mirror onto creator for components that read creator.username
      creator: {
        ...(q?.creator || {}),
        username:
          (normalizedUname && isValidUsername(normalizedUname) ? normalizedUname : null) ||
          (q?.creator?.username &&
          isValidUsername(String(q.creator.username).replace(/^@/, ""))
            ? String(q.creator.username).replace(/^@/, "")
            : null) ||
          null,
      },
    };
  });
};

const QuizList = ({
  title,
  dataSource = "browseCustomQuizzes",
  filters: enabledFilters = ["search", "privacy", "sort"],
  showRefreshButton = true,
  className = "",
  linkCreatorToProfile = false,
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
        // IMPORTANT:
        // Firestore rules can't "partially" allow a mixed query.
        // If we ask for "all", the server may include private quizzes owned by other users -> permission error.
        // So, treat "all" as "public" for browsing.
        const privacySafe =
          (filters.privacy || "all").toLowerCase() === "all"
            ? "public"
            : (filters.privacy || "public").toLowerCase();

        // AllCustomQuizzes logic
        const options = {
          searchTerm: debouncedSearchTerm.trim(),
          sortBy: filters.sortBy,
          privacy: privacySafe,
          limit: 50,
          currentUserId: currentUser?.uid || null,
          useIndexes: true,
          fields: [
            "metadata.title", "metadata.tags", "metadata.difficulty",
            "metadata.category", "metadata.questionCount", "metadata.isPublic",
            "metadata.hasPassword", "creator.uid", "creator.displayName",
            "creator.username", "timestamps.createdAt", "timestamps.updatedAt"
          ]
        };

        result = await quizRetrievalService.browseCustomQuizzes(options);

        // Fallback logic for AllCustomQuizzes
        if (!result.quizzes && currentUser?.uid) {
          try {
            const userQuizzes = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
            result = { quizzes: userQuizzes };
            setError("Showing your quizzes only (server temporarily unavailable)");
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

      const quizArray = result?.quizzes || [];

      // Username enrichment should NEVER crash the whole list
      let quizArrayWithUsernames = quizArray;
      if (dataSource === "browseCustomQuizzes") {
        try {
          quizArrayWithUsernames = await attachCreatorUsernames(quizArray);
        } catch (e) {
          console.warn("Username enrichment failed; continuing without usernames.", e);
          quizArrayWithUsernames = quizArray;
        }
      }

      setQuizzes(quizArrayWithUsernames);
      setQuizzesToDisplay(quizArrayWithUsernames);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError(error.message || "Failed to load quizzes");
      setQuizzes([]);
      setQuizzesToDisplay([]);
    } finally {
      setLoading(false);
    }
  }, [dataSource, debouncedSearchTerm, filters.sortBy, filters.privacy, currentUser?.uid]);

  // Initial fetch - different behavior based on dataSource
  useEffect(() => {
    if (dataSource === "teacherQuizzes") {
      fetchQuizzes();
    }
  }, [dataSource]);

  useEffect(() => {
    if (dataSource === "browseCustomQuizzes") {
      fetchQuizzes();
    }
  }, [dataSource, currentUser?.uid, debouncedSearchTerm, filters.sortBy, filters.privacy]);

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
      return quizRetrievalService.normalizeQuizData(quiz);
    } else {
      return {
        id: quiz.uid,
        title: quiz.title,
        numQuestions: quiz.numQuestions,
        tags: quiz.tags,
        password: quiz.quizPassword,
        creator: quiz.creator,
        difficulty: "Medium",
        category: "Education",
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
          onRefresh={
            dataSource === "teacherQuizzes"
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
              {dataSource === "browseCustomQuizzes" ? "Loading optimized results..." : "Loading quizzes..."}
            </div>
          </div>
        ) : (
          <div id="customQuizDiv" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
            {quizzesToDisplay.map((quiz) => {
              const quizData = normalizeQuizData(quiz);

              // Used to decide if the Delete button should be shown (only for its owner).
              let creatorId = null;
              if (dataSource === "browseCustomQuizzes") {
                creatorId = collectCreatorUid(quiz);
              }

              return (
                <CustomQuizSelectButton
                  key={quizData.id + quizData.title}
                  title={quizData.title}
                  numQuestions={quizData.numQuestions}
                  tags={Array.isArray(quizData.tags) ? quizData.tags.join(", ") : quizData.tags}
                  uid={quizData.id}
                  quizPassword={quizData.password}
                  creatorUsername={
                    (typeof quiz?.creatorUsername === "string" && quiz.creatorUsername.trim())
                      ? quiz.creatorUsername.trim()
                      : null
                  }
                  creator={{
                    ...(quizData.creator || {}),
                    username: getCreatorHandle(quiz)
                      ? getCreatorHandle(quiz).replace(/^@/, "")
                      : (quizData.creator?.username || null),
                    handle: getCreatorHandle(quiz) || null,
                  }}
                  difficulty={quizData.difficulty}
                  category={quizData.category}
                  attempts={quizData.attempts}
                  averageScore={quizData.averageScore}
                  createdAt={quizData.createdAt}
                  isPrivate={quizData.isPrivate}
                  creatorId={creatorId}
                  currentUserId={currentUser?.uid}
                  linkCreatorToProfile={linkCreatorToProfile}
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