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
import { doc, getDoc, getDocs, collection, query, where, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../../services/firebase/firebaseService";

// --- Username helpers (for all viewers, including public browsing) ---
const collectCreatorUid = (item) => {
  const createdBy = item?.createdBy;

  return (
    item?.creator?.uid ||
    item?.creator?.userId ||
    item?.creator?.id ||
    item?.creatorId ||
    item?.creatorID ||
    item?.ownerId ||
    item?.ownerID ||
    item?.userId ||
    item?.userID ||
    item?.uidOfCreator ||
    (typeof createdBy === "string" ? createdBy : null) ||
    createdBy?.uid ||
    createdBy?.userId ||
    createdBy?.id ||
    item?.metadata?.creatorId ||
    item?.metadata?.creatorID ||
    item?.metadata?.creator?.uid ||
    null
  );
};

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
      creatorUsername:
        (normalizedUname && isValidUsername(normalizedUname) ? uname : null) ||
        (q?.creator?.username && isValidUsername(String(q.creator.username).replace(/^@/, "")) ? q.creator.username : null) ||
        (q?.creatorUsername && isValidUsername(String(q.creatorUsername).replace(/^@/, "")) ? q.creatorUsername : null) ||
        (q?.username && isValidUsername(String(q.username).replace(/^@/, "")) ? q.username : null),

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

const normalizeQuizId = (quiz) =>
  quiz?.id ||
  quiz?.uid ||
  quiz?.quizId ||
  quiz?.docId ||
  quiz?.metadata?.id ||
  quiz?.metadata?.uid ||
  null;

const getQuizArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.quizzes)) return value.quizzes;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result?.quizzes)) return value.result.quizzes;
  if (Array.isArray(value?.result?.data)) return value.result.data;
  return [];
};

const QuizList = ({
  title,
  dataSource = "browseCustomQuizzes",
  filters: enabledFilters = ["search", "creator", "privacy", "sort"],
  showRefreshButton = true,
  className = "",
  linkCreatorToProfile = false,
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesToDisplay, setQuizzesToDisplay] = useState([]);

  //New Coltin Rogge
  const [userFavorites, setUserFavorites] = useState(undefined);

  const {
    filters,
    debouncedSearchTerm,
	debouncedCreatorSearchTerm,
    updateFilters,
    applyClientSideFilters
  } = useQuizFiltering(enabledFilters);


  // New again Coltin Rogge - fetch user favorites for potential use in filtering or display
  useEffect(() => {
      const fetchUserFavorites = async () => {
        if (!currentUser?.uid) return;
        try{
          const userData = await getDoc(doc(db, 'users', currentUser.uid));
          if(userData.exists()){
            setUserFavorites(userData.data().favorites || []);
          }
        } catch (error) {
          console.error("Error fetching user favorites:", error);
        }
      };
      fetchUserFavorites();
  }, [currentUser?.uid]);

  //Coltin Rogge again
  const toggleFavorite = async (quizId) => {
    if (!currentUser) return alert("You must be logged in to favorite quizzes.");
    
    const userRef = doc(db, 'users', currentUser.uid);
    const isFavorited = userFavorites.includes(quizId);

    try{
      if (isFavorited) {
        await updateDoc(userRef, {
          favorites: arrayRemove(quizId)
        });
        setUserFavorites((prev) => prev.filter(id => id !== quizId));
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(quizId)
        });
        setUserFavorites((prev) => [...prev, quizId]);
      }
    } catch (error) {
      console.error("Error updating favorite quizzes:", error);
    }
  };

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;

      if (dataSource === "browseCustomQuizzes") {
        const privacySafe = (filters.privacy || "all").toLowerCase();

        const options = {
          searchTerm: debouncedSearchTerm.trim(),
		  creatorSearchTerm: debouncedCreatorSearchTerm,
          sortBy: filters.sortBy,
          privacy: privacySafe,
          limit: 50,
          currentUserId: currentUser?.uid || null,
          useIndexes: true,
          fields: [
            "metadata.title", "metadata.tags", "metadata.difficulty",
            "metadata.category", "metadata.questionCount", "metadata.isPublic",
            "metadata.description", "description", "quizDescription",
            "metadata.summary", "summary", "details.description",
            "quizDetails.description", "settings.description", "content.description",
            "content.metadata.description", "metadata.hasPassword", "metadata.creatorId", "metadata.creatorID",
            "creator.uid", "creator.userId", "creator.id", "creator.displayName",
            "creator.username", "creatorId", "creatorID", "createdBy", "userId",
            "ownerId", "timestamps.createdAt", "timestamps.updatedAt"
          ]
        };

        result = await quizRetrievalService.browseCustomQuizzes(options);

        if (getQuizArray(result).length === 0 && currentUser?.uid) {
          try {
            const userQuizzes = await quizRetrievalService.getCustomQuizzesByUser(currentUser.uid);
            result = { quizzes: getQuizArray(userQuizzes) };
            setError("Showing your quizzes only (server temporarily unavailable)");
          } catch (fallbackError) {
            console.warn("Fallback quiz fetch failed:", fallbackError);
            result = { quizzes: [] };
          }
        }
      } else if (dataSource === "teacherQuizzes") {
        result = await cloudFunctionsAPI.getTeacherQuizzes({
          searchTerm: filters.searchTerm,
          sortBy: filters.sortBy,
          limit: 50
        });
      }

      else if (dataSource === "userFavorites") {
        // If favorites haven't been loaded from the user doc yet, wait.
        if (userFavorites === undefined) return;

        if (userFavorites.length === 0) {
          setQuizzes([]);
          setQuizzesToDisplay([]);
          setLoading(false);
          return;
        } else { 
          try {
            const favoriteIds = userFavorites.slice(0, 30);

            //const quizzesCollection = collection(db, "custom_quizzes");
            
            const q = query(
              collection(db, "custom_quizzes"),
              where("__name__", "in", favoriteIds),
              where("metadata.isPublic", "==", true)
            );

            const querySnapshot = await getDocs(q);
            const favs = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                uid:doc.id,
                title: data.metadata?.title || data.title,
                numQuestions: data.metadata?.questionCount || data.numQuestions || 0,
              };
            });

            result = { quizzes: favs };
          } catch (err) {
            console.error("Error fetching favorite quizzes:", err);
            setError("Failed to load favorite quizzes");
            //setLoading(false);
            result = { quizzes: [] };
          }
      }
      }

      const quizArray = getQuizArray(result);

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
  }, [dataSource, debouncedSearchTerm, debouncedCreatorSearchTerm, filters.sortBy, filters.privacy, currentUser?.uid, userFavorites]);

  useEffect(() => {
    if (dataSource === "teacherQuizzes") {
      fetchQuizzes();
    }
  }, [dataSource]);

  useEffect(() => {
    if (dataSource === "browseCustomQuizzes") {
      fetchQuizzes();
    }
  }, [dataSource, currentUser?.uid, debouncedSearchTerm, debouncedCreatorSearchTerm, filters.sortBy, filters.privacy]);

  useEffect(() => {
    if (dataSource === "teacherQuizzes") {
      const filtered = applyClientSideFilters(quizzes);
      setQuizzesToDisplay(filtered);
    }
  }, [dataSource, filters, quizzes, applyClientSideFilters]);

  // Unified trigger for all data sources
  useEffect(() => {
    const isFavoritesPage = dataSource === "userFavorites";
    
    // Wait for IDs if we are on the Favorites page
    if (isFavoritesPage && userFavorites === undefined) return;

    fetchQuizzes();
  
  // This dependency array ensures the page refreshes automatically 
  // when your favorites load or a heart is clicked.
  }, [
    fetchQuizzes, 
    dataSource, 
    userFavorites, 
    debouncedSearchTerm, 
    filters.sortBy, 
    filters.privacy,
    currentUser?.uid
  ]);

  const normalizeQuizData = (quiz) => {
    if (dataSource === "browseCustomQuizzes") {
      const normalizedQuiz = quizRetrievalService.normalizeQuizData(quiz);

      return {
        ...normalizedQuiz,
        id: normalizedQuiz.id || normalizeQuizId(quiz),
        uid: normalizedQuiz.uid || normalizeQuizId(quiz),
        title: normalizedQuiz.title || quiz?.title || quiz?.metadata?.title || "Untitled Quiz",
        description: normalizedQuiz.description || getQuizDescription(quiz),
        createdAt: normalizedQuiz.createdAt || getQuizCreatedAt(quiz),
        updatedAt: normalizedQuiz.updatedAt || getQuizUpdatedAt(quiz),
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
  };

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
      className={`min-h-screen bg-primary relative overflow-x-hidden py-20 pl-[88px] pr-4 sm:pr-6 text-[var(--text-primary)] ${className}`}
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          {title}
        </h1>

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
          <div
            id="customQuizDiv"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-14 w-full max-w-6xl mx-auto items-start justify-items-center"
          >
            {quizzesToDisplay.map((quiz, index) => {
              const quizData = normalizeQuizData(quiz);

              let creatorId = null;
              if (dataSource === "browseCustomQuizzes") {
                creatorId = collectCreatorUid(quiz);
              }

              return (
                <div className="w-full max-w-[360px]" key={`${quizData.id || index}-${quizData.title}`}>
                  <CustomQuizSelectButton
                    title={quizData.title}
                    description={quizData.description}
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
                    alwaysShowStartButton={true}
                    showCreatedAtFooter={true}
                    isPrivate={quizData.isPrivate}
                    creatorId={creatorId}
                    currentUserId={currentUser?.uid}
                    linkCreatorToProfile={linkCreatorToProfile}
                    onDeleted={handleQuizDeleted}
                    isFavorited={userFavorites ? userFavorites.includes(quizData.id) : false}
                    onToggleFavorite={() => toggleFavorite(quizData.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;