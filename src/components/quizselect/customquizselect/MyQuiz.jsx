import { useEffect, useState, useCallback } from "react";
import CustomQuizSelectButton from "./CustomQuizSelectButton";
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../../contexts/AuthContext";
import quizRetrievalService from "../../../services/quiz/quizRetrievalService";

const MyQuiz = ({
  title = "Quizzes",
  dataSource = "browseCustomQuizzes",
  showRefreshButton = true,
  className = ""
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesToDisplay, setQuizzesToDisplay] = useState([]);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!currentUser || !currentUser.uid) {
        setQuizzes([]);
        setQuizzesToDisplay([]);
        setError('You need to be signed in to view your quizzes.');
        return;
      }

      console.debug('[MyQuiz] fetching for user:', currentUser?.uid);
      try {
        const result = await quizRetrievalService.getQuizzes({
          creatorId: currentUser.uid,
          orderByField: 'createdAt',
          orderDirection: 'desc',
          limitCount: 50
        });
        const quizArray = result?.quizzes || [];
        const onlyMine = quizArray.filter(q => {
          const creatorIdFromData = q.creatorID || q.creator?.userId || q.creator?.uid;
          return creatorIdFromData === currentUser.uid;
        });

        console.debug('[MyQuiz] filtered owner-only count:', onlyMine.length);
        console.debug('[MyQuiz] server-side getQuizzes result count:', quizArray.length);

        if (!quizArray.length) {
          console.debug('[MyQuiz] falling back to getCustomQuizzesByUser');
          const fallback = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
          setQuizzes(Array.isArray(fallback) ? fallback : []);
          setQuizzesToDisplay(Array.isArray(fallback) ? fallback : []);
        } else {
          setQuizzes(onlyMine);
          setQuizzesToDisplay(onlyMine);
        }
      } catch (err) {
        console.error('[MyQuiz] getQuizzes failed, fallback to getCustomQuizzesByUser:', err);
        const fallback = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
        setQuizzes(Array.isArray(fallback) ? fallback : []);
        setQuizzesToDisplay(Array.isArray(fallback) ? fallback : []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError(error.message || 'Failed to load quizzes');
      setQuizzes([]);
      setQuizzesToDisplay([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchQuizzes();
  }, [dataSource, currentUser?.uid, fetchQuizzes]);

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
        difficulty: 'Medium',
        category: 'Education',
        isPrivate: false,
        attempts: quiz.quizTaken || 0,
        averageScore: 0,
        createdAt: quiz.createdAt,
        updatedAt: quiz.lastEdit
      };
    }
  };

  const handleQuizDeleted = (deletedId) => {
    setQuizzes((prev) => prev.filter((quiz) => normalizeQuizData(quiz).id !== deletedId));
    setQuizzesToDisplay((prev) => prev.filter((quiz) => normalizeQuizData(quiz).id !== deletedId));
  };

  return (
    <div className={`min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)] ${className}`}>
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          {title}
        </h1>

        <div className="flex justify-center mt-4">
          <NavLink
            to="/customquiz"
            aria-label="Make A Quiz"
            className="inline-block px-4 py-2 bg-[var(--primary-400)] rounded-lg font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Make A Quiz
          </NavLink>
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
              {dataSource === "browseCustomQuizzes" ? 'Loading your awesome quizzes...' : 'Loading quizzes...'}
            </div>
          </div>
        ) : (
          <>
            {quizzesToDisplay.length === 0 ? (
              <div className="text-center mt-12">
                <p className="text-lg text-muted">You haven't created any quizzes yet.</p>
                <NavLink to="/customquiz" className="inline-block mt-4 px-4 py-2 bg-[var(--primary-400)] rounded-lg text-white">Create Your First Quiz</NavLink>
              </div>
            ) : (
              <div id="customQuizDiv" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
                {
                  quizzesToDisplay.map((quiz) => {
                    const quizData = normalizeQuizData(quiz);
                    let creatorId = null;
                    if (dataSource === "browseCustomQuizzes") {
                      creatorId = quiz.creatorID || quiz.creator?.userId || null;
                    }
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
                        creatorId={creatorId}
                        currentUserId={currentUser?.uid}
                        onDeleted={handleQuizDeleted}
                      />
                    );
                  })
                }
              </div>
            )}
          </>
        )}

        <div className="flex justify-center mt-8">
          <button
            className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
            onClick={fetchQuizzes}
            disabled={loading}
          >
            {loading ? 'Loading...' : (showRefreshButton ? 'Refresh' : 'Refresh')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyQuiz;
