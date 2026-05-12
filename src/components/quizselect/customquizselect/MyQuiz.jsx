import { useEffect, useState, useCallback } from "react";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import quizRetrievalService from "../../../services/quiz/quizRetrievalService";

const getQuizCreatedAt = (quiz) =>
  quiz?.timestamps?.createdAt ||
  quiz?.createdAt ||
  quiz?.timeCreated ||
  quiz?.createdOn ||
  quiz?.metadata?.createdAt ||
  null;

const getQuizUpdatedAt = (quiz) =>
  quiz?.timestamps?.updatedAt ||
  quiz?.updatedAt ||
  quiz?.lastEdit ||
  quiz?.metadata?.updatedAt ||
  null;

const getQuizDescription = (quiz) => {
  const description =
    quiz?.metadata?.description ||
    quiz?.description ||
    quiz?.quizDescription ||
    quiz?.summary ||
    quiz?.metadata?.summary ||
    quiz?.details?.description ||
    quiz?.quizDetails?.description ||
    quiz?.settings?.description ||
    quiz?.content?.description ||
    quiz?.content?.metadata?.description ||
    '';

  return typeof description === 'string' ? description.trim() : '';
};

const getQuizOwnerId = (quiz) => {
  const createdBy = quiz?.createdBy;

  return (
    quiz?.creator?.uid ||
    quiz?.creator?.userId ||
    quiz?.creator?.id ||
    quiz?.creatorId ||
    quiz?.creatorID ||
    quiz?.ownerId ||
    quiz?.ownerID ||
    quiz?.userId ||
    quiz?.userID ||
    quiz?.uidOfCreator ||
    (typeof createdBy === "string" ? createdBy : null) ||
    createdBy?.uid ||
    createdBy?.userId ||
    createdBy?.id ||
    quiz?.metadata?.creatorId ||
    quiz?.metadata?.creatorID ||
    quiz?.metadata?.creator?.uid ||
    null
  );
};

const getQuizArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.quizzes)) return value.quizzes;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result?.quizzes)) return value.result.quizzes;
  if (Array.isArray(value?.result?.data)) return value.result.data;
  return [];
};

const normalizeQuizId = (quiz) =>
  quiz?.id ||
  quiz?.uid ||
  quiz?.quizId ||
  quiz?.docId ||
  quiz?.metadata?.id ||
  quiz?.metadata?.uid ||
  null;

const MyQuiz = ({
  title = "My Quizzes",
  dataSource = "browseCustomQuizzes",
  showRefreshButton = true,
  className = "",
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesToDisplay, setQuizzesToDisplay] = useState([]);

  const normalizeQuizData = useCallback(
    (quiz) => {
      if (dataSource === "browseCustomQuizzes") {
        const normalizedQuiz = quizRetrievalService.normalizeQuizData(quiz);
        const id = normalizedQuiz.id || normalizeQuizId(quiz);

        return {
          ...normalizedQuiz,
          id,
          uid: normalizedQuiz.uid || id,
          title:
            normalizedQuiz.title ||
            quiz?.title ||
            quiz?.metadata?.title ||
            "Untitled Quiz",
          description: normalizedQuiz.description || getQuizDescription(quiz),
          createdAt: normalizedQuiz.createdAt || getQuizCreatedAt(quiz),
          updatedAt: normalizedQuiz.updatedAt || getQuizUpdatedAt(quiz),
          creator: normalizedQuiz.creator || quiz?.creator,
        };
      }

      return {
        id: normalizeQuizId(quiz),
        title: quiz.title,
        description: getQuizDescription(quiz),
        numQuestions: quiz.numQuestions,
        tags: quiz.tags,
        password: quiz.quizPassword,
        creator: quiz.creator,
        difficulty: "Medium",
        category: "Education",
        isPrivate: false,
        attempts: quiz.quizTaken || 0,
        averageScore: 0,
        createdAt: getQuizCreatedAt(quiz),
        updatedAt: getQuizUpdatedAt(quiz),
      };
    },
    [dataSource]
  );

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser?.uid) {
        setQuizzes([]);
        setQuizzesToDisplay([]);
        setError("You need to be signed in to view your quizzes.");
        return;
      }

      let quizArray = [];

      try {
        const result = await quizRetrievalService.getCustomQuizzesByUser(
          currentUser.uid
        );
        quizArray = getQuizArray(result);
      } catch (primaryError) {
        console.warn(
          "[MyQuiz] getCustomQuizzesByUser failed, trying fallback:",
          primaryError
        );
      }

      if (quizArray.length === 0) {
        try {
          const fallbackResult = await quizRetrievalService.getQuizzes({
            creatorId: currentUser.uid,
            orderByField: "createdAt",
            orderDirection: "desc",
            limitCount: 50,
          });

          const fallbackArray = getQuizArray(fallbackResult);
          quizArray = fallbackArray.filter(
            (quiz) => getQuizOwnerId(quiz) === currentUser.uid
          );
        } catch (fallbackError) {
          console.warn("[MyQuiz] fallback getQuizzes failed:", fallbackError);
        }
      }

      const ownerTaggedQuizzes = quizArray.map((quiz) => ({
        ...quiz,
        __profileOwnerId: currentUser.uid,
      }));

      setQuizzes(ownerTaggedQuizzes);
      setQuizzesToDisplay(ownerTaggedQuizzes);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError(err.message || "Failed to load quizzes");
      setQuizzes([]);
      setQuizzesToDisplay([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

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
    <div
      className={`min-h-screen bg-primary relative overflow-x-hidden py-20 px-4 sm:px-6 text-[var(--text-primary)] ${className}`}
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gradient-primary text-center drop-shadow-lg">
            {title}
          </h1>

          <div className="flex justify-center">
            <NavLink
              to="/customquiz"
              aria-label="Make A Quiz"
              className="inline-block px-4 py-2 bg-[var(--primary-400)] rounded-lg font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Make A Quiz
            </NavLink>
          </div>
        </div>

        {error && (
          <div className="flex mt-5 justify-center items-center">
            <div className="error-message font-medium">{error}</div>
          </div>
        )}

        <p className="mt-8 text-center text-lg">
          Displaying{" "}
          <span className="font-bold text-[var(--primary-400)]">
            {quizzesToDisplay.length}
          </span>{" "}
          quizzes
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-gradient-primary text-lg">
              Loading quizzes...
            </div>
          </div>
        ) : quizzesToDisplay.length === 0 ? (
          <div className="text-center mt-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-lg">
            <p className="text-lg text-muted">
              You haven't created any quizzes yet.
            </p>
            <NavLink
              to="/customquiz"
              className="inline-block mt-4 px-4 py-2 bg-[var(--primary-400)] rounded-lg text-white"
            >
              Create Your First Quiz
            </NavLink>
          </div>
        ) : (
          <div
            id="customQuizDiv"
            className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 mt-14 w-full max-w-6xl mx-auto items-start justify-items-center"
          >
            {quizzesToDisplay.map((quiz, index) => {
              const quizData = normalizeQuizData(quiz);
              const creatorId = getQuizOwnerId(quiz) || currentUser?.uid;

              return (
                <div
                  className="w-full max-w-[390px]"
                  key={`${quizData.id || index}-${quizData.title}`}
                >
                  <CustomQuizSelectButton
                    title={quizData.title}
                    description={quizData.description}
                    numQuestions={quizData.numQuestions}
                    tags={
                      Array.isArray(quizData.tags)
                        ? quizData.tags.join(", ")
                        : quizData.tags
                    }
                    uid={quizData.id}
                    quizPassword={quizData.password}
                    creator={quizData.creator}
                    difficulty={quizData.difficulty}
                    category={quizData.category}
                    attempts={quizData.attempts}
                    averageScore={quizData.averageScore}
                    createdAt={quizData.createdAt}
                    alwaysShowStartButton={true}
                    showCreatedAtFooter={true}
                    isPrivate={quizData.isPrivate}
                    creatorId={creatorId}
                    currentUserId={currentUser?.uid}
                    onDeleted={handleQuizDeleted}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <button
            className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={fetchQuizzes}
            disabled={loading}
          >
            {loading ? "Loading..." : showRefreshButton ? "Refresh" : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyQuiz;