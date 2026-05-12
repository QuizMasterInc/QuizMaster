import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import quizRetrievalService from '../../services/quiz/quizRetrievalService';
import { db } from '../../services/firebase/firebaseService';

const getQuizId = (quiz) =>
  quiz?.uid ||
  quiz?.id ||
  quiz?.quizId ||
  quiz?.docId ||
  quiz?.metadata?.uid ||
  quiz?.metadata?.id ||
  quiz?.__profileFallbackId ||
  null;

const getQuizTitle = (quiz) =>
  quiz?.metadata?.title ||
  quiz?.title ||
  quiz?.name ||
  'Untitled Quiz';

const getQuizQuestionCount = (quiz) =>
  quiz?.content?.totalQuestions ||
  quiz?.metadata?.questionCount ||
  quiz?.questionCount ||
  quiz?.numQuestions ||
  quiz?.questions?.length ||
  (quiz?.content?.questions ? Object.keys(quiz.content.questions).length : 0);

const getQuizCategory = (quiz) => quiz?.metadata?.category || quiz?.category || 'General';

const getQuizOwnerId = (quiz) => {
  const createdBy = quiz?.createdBy;

  return (
    quiz?.__profileOwnerId ||
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
    (typeof createdBy === 'string' ? createdBy : null) ||
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

const isQuizPublic = (quiz) => {
  if (typeof quiz?.metadata?.isPublic === 'boolean') return quiz.metadata.isPublic;
  if (typeof quiz?.isPublic === 'boolean') return quiz.isPublic;
  if (typeof quiz?.public === 'boolean') return quiz.public;
  if (typeof quiz?.metadata?.isPrivate === 'boolean') return !quiz.metadata.isPrivate;
  if (typeof quiz?.isPrivate === 'boolean') return !quiz.isPrivate;
  return false;
};

const getDeckId = (deck) => deck?.id || deck?.uid || null;

const formatTags = (tags) => {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeQuizForProfile = (quiz, fallbackOwnerId, index = 0) => {
  const normalized = quizRetrievalService.normalizeQuizData
    ? quizRetrievalService.normalizeQuizData(quiz)
    : quiz;

  const id =
    getQuizId(normalized) ||
    getQuizId(quiz) ||
    `profile_quiz_${fallbackOwnerId || 'user'}_${index}`;

  return {
    ...quiz,
    ...normalized,
    id,
    uid: normalized?.uid || quiz?.uid || id,
    title: getQuizTitle(normalized) || getQuizTitle(quiz),
    metadata: {
      ...(quiz?.metadata || {}),
      ...(normalized?.metadata || {}),
    },
    __profileOwnerId: fallbackOwnerId || getQuizOwnerId(quiz),
    __profileFallbackId: id,
  };
};

const mergeUniqueQuizzes = (...quizLists) => {
  const quizMap = new Map();

  quizLists.flat().forEach((quiz, index) => {
    if (!quiz) return;
    const id = getQuizId(quiz) || `profile_quiz_${index}`;
    quizMap.set(id, { ...quiz, id, uid: quiz?.uid || id });
  });

  return Array.from(quizMap.values());
};

const fetchUserQuizzesDirectly = async (userId) => {
  const fieldsToCheck = [
    'creator.uid',
    'creator.userId',
    'creator.id',
    'creatorId',
    'creatorID',
    'createdBy',
    'userId',
    'userID',
    'ownerId',
    'ownerID',
    'metadata.creatorId',
    'metadata.creatorID',
  ];

  const results = await Promise.allSettled(
    fieldsToCheck.map(async (field) => {
      const snapshot = await getDocs(
        query(collection(db, 'custom_quizzes'), where(field, '==', userId))
      );

      return snapshot.docs.map((quizDoc) => ({
        id: quizDoc.id,
        uid: quizDoc.id,
        ...quizDoc.data(),
        __profileOwnerId: userId,
      }));
    })
  );

  return results.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  );
};

function QuizCard({ quiz }) {
  const quizId = getQuizId(quiz);
  const quizTags = formatTags(quiz?.metadata?.tags || quiz?.tags);
  const publicQuiz = isQuizPublic(quiz);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-accent shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {quizId ? (
            <Link
              to={`/customquiz/settings/${quizId}`}
              className="break-words text-lg font-semibold text-[var(--primary-500)] hover:underline"
            >
              {getQuizTitle(quiz)}
            </Link>
          ) : (
            <span className="break-words text-lg font-semibold text-[var(--primary-500)]">
              {getQuizTitle(quiz)}
            </span>
          )}

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
            <span>Questions: {getQuizQuestionCount(quiz)}</span>
            <span>Category: {getQuizCategory(quiz)}</span>
          </div>

          {quizTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {quizTags.map((tag) => (
                <span
                  key={`${quizId || getQuizTitle(quiz)}-${tag}`}
                  className="px-2 py-1 rounded-full bg-[var(--primary-400)] text-white text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <span
          className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
            publicQuiz
              ? 'bg-[var(--success)] text-white'
              : 'bg-[var(--neutral-400)] text-[var(--text-primary)]'
          }`}
        >
          {publicQuiz ? 'Public' : 'Private'}
        </span>
      </div>
    </div>
  );
}

function DeckCard({ deck }) {
  const deckId = getDeckId(deck);
  const tags = formatTags(deck?.tags);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-accent shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {deckId ? (
            <Link
              to={`/flashcards/edit/${deckId}`}
              className="break-words text-lg font-semibold text-[var(--primary-500)] hover:underline"
            >
              {deck?.title || deck?.name || 'Untitled Deck'}
            </Link>
          ) : (
            <span className="break-words text-lg font-semibold text-[var(--primary-500)]">
              {deck?.title || deck?.name || 'Untitled Deck'}
            </span>
          )}

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
            <span>Cards: {deck?.cardCount || deck?.cards?.length || 0}</span>
            <span>Category: {deck?.category || 'General'}</span>
          </div>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={`${deckId || deck?.title}-${tag}`}
                  className="px-2 py-1 rounded-full bg-[var(--info)] text-white text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <span
          className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
            deck?.isPublic
              ? 'bg-[var(--success)] text-white'
              : 'bg-[var(--neutral-400)] text-[var(--text-primary)]'
          }`}
        >
          {deck?.isPublic ? 'Public' : 'Private'}
        </span>
      </div>
    </div>
  );
}

export default function MyStudyMaterial({ decks = [], quizzes = [] }) {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState('all');
  const [fallbackQuizzes, setFallbackQuizzes] = useState([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const propQuizzes = Array.isArray(quizzes) ? quizzes.filter(Boolean) : [];
    if (propQuizzes.length > 0) {
      setFallbackQuizzes([]);
      return;
    }

    let cancelled = false;

    const loadFallbackQuizzes = async () => {
      try {
        setFallbackLoading(true);
        setFallbackError(null);

        const [serviceResult, directResult] = await Promise.allSettled([
          quizRetrievalService.getCustomQuizzesByUser(currentUser.uid),
          fetchUserQuizzesDirectly(currentUser.uid),
        ]);

        if (cancelled) return;

        const serviceQuizzes =
          serviceResult.status === 'fulfilled'
            ? getQuizArray(serviceResult.value).map((quiz, index) =>
                normalizeQuizForProfile(quiz, currentUser.uid, index)
              )
            : [];

        const directQuizzes =
          directResult.status === 'fulfilled'
            ? getQuizArray(directResult.value).map((quiz, index) =>
                normalizeQuizForProfile(quiz, currentUser.uid, index)
              )
            : [];

        const merged = mergeUniqueQuizzes(serviceQuizzes, directQuizzes).filter(
          (quiz) => getQuizOwnerId(quiz) === currentUser.uid || quiz.__profileOwnerId === currentUser.uid
        );

        setFallbackQuizzes(merged);
      } catch (error) {
        if (!cancelled) {
          console.error('[Profile Study Material] Failed to load fallback quizzes:', error);
          setFallbackError(error);
        }
      } finally {
        if (!cancelled) {
          setFallbackLoading(false);
        }
      }
    };

    loadFallbackQuizzes();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, quizzes]);

  const sourceQuizzes = useMemo(() => {
    const propQuizzes = Array.isArray(quizzes) ? quizzes.filter(Boolean) : [];
    const normalizedProps = propQuizzes.map((quiz, index) =>
      normalizeQuizForProfile(quiz, getQuizOwnerId(quiz) || currentUser?.uid, index)
    );

    return mergeUniqueQuizzes(normalizedProps, fallbackQuizzes);
  }, [quizzes, fallbackQuizzes, currentUser?.uid]);

  const { allQuizzes, publicQuizzes, privateQuizzes } = useMemo(() => {
    const safeQuizzes = Array.isArray(sourceQuizzes) ? sourceQuizzes.filter(Boolean) : [];
    const publicItems = [];
    const privateItems = [];

    safeQuizzes.forEach((quiz) => {
      if (isQuizPublic(quiz)) publicItems.push(quiz);
      else privateItems.push(quiz);
    });

    return {
      allQuizzes: safeQuizzes,
      publicQuizzes: publicItems,
      privateQuizzes: privateItems,
    };
  }, [sourceQuizzes]);

  const safeDecks = Array.isArray(decks) ? decks.filter(Boolean) : [];

  const sections = [
    { id: 'all', label: 'All Quizzes', count: allQuizzes.length, tone: 'text-[var(--primary-600)]' },
    { id: 'public', label: 'Public Quizzes', count: publicQuizzes.length, tone: 'text-[var(--primary-600)]' },
    { id: 'private', label: 'Private Quizzes', count: privateQuizzes.length, tone: 'text-[var(--warning)]' },
    { id: 'decks', label: 'Flashcard Decks', count: safeDecks.length, tone: 'text-[var(--info)]' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gradient-primary mb-2">My Study Material</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Review the quizzes and flashcard decks you created, including both public and private quizzes.
      </p>

      {fallbackLoading ? (
        <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          Loading your quizzes...
        </div>
      ) : null}

      {fallbackError ? (
        <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Could not load your quizzes from the fallback source.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 mb-6">
        {sections.map((section) => {
          const active = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-[var(--primary-400)] text-white border-[var(--primary-400)] shadow-md'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-accent hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {section.label} ({section.count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {activeSection === 'all' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-[var(--primary-600)]">All My Quizzes</h3>
              <span className="text-sm text-[var(--text-muted)]">{allQuizzes.length} total</span>
            </div>
            {allQuizzes.length > 0 ? (
              allQuizzes.map((quiz, index) => (
                <QuizCard key={`${getQuizId(quiz) || index}-all`} quiz={quiz} />
              ))
            ) : (
              <p className="text-[var(--text-muted)] italic">You have not created any quizzes yet.</p>
            )}
          </>
        )}

        {activeSection === 'public' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-[var(--primary-600)]">My Public Quizzes</h3>
              <span className="text-sm text-[var(--text-muted)]">{publicQuizzes.length} total</span>
            </div>
            {publicQuizzes.length > 0 ? (
              publicQuizzes.map((quiz, index) => (
                <QuizCard key={`${getQuizId(quiz) || index}-public`} quiz={quiz} />
              ))
            ) : (
              <p className="text-[var(--text-muted)] italic">You have not created any public quizzes yet.</p>
            )}
          </>
        )}

        {activeSection === 'private' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-[var(--warning)]">My Private Quizzes</h3>
              <span className="text-sm text-[var(--text-muted)]">{privateQuizzes.length} total</span>
            </div>
            {privateQuizzes.length > 0 ? (
              privateQuizzes.map((quiz, index) => (
                <QuizCard key={`${getQuizId(quiz) || index}-private`} quiz={quiz} />
              ))
            ) : (
              <p className="text-[var(--text-muted)] italic">You have not created any private quizzes yet.</p>
            )}
          </>
        )}

        {activeSection === 'decks' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-[var(--info)]">My Flashcard Decks</h3>
              <span className="text-sm text-[var(--text-muted)]">{safeDecks.length} total</span>
            </div>
            {safeDecks.length > 0 ? (
              safeDecks.map((deck, index) => (
                <DeckCard key={`${getDeckId(deck) || index}-deck`} deck={deck} />
              ))
            ) : (
              <p className="text-[var(--text-muted)] italic">You have not created any flashcard decks yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
