import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where
} from 'firebase/firestore';

import { db } from '../../services/firebase/firebaseService';

const getQuizSortTime = (item) => {
  const value =
    item?.timestamps?.updatedAt ||
    item?.metadata?.updatedAt ||
    item?.updatedAt ||
    item?.timestamps?.createdAt ||
    item?.metadata?.createdAt ||
    item?.createdAt ||
    null;

  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const mergeUniqueById = (docs) => {
  const map = new Map();

  docs.forEach((item) => {
    if (item?.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

const normalizeCategory = (value) => {
  if (typeof value !== 'string') return 'General';
  const trimmed = value.trim();
  return trimmed || 'General';
};

const PUBLIC_CONTENT_CATEGORIES = [
  'Math',
  'Science',
  'History',
  'Literature',
  'Software Engineering',
  'Geography',
  'Languages',
  'Art',
  'Music',
  'Business',
  'Economics',
  'Physics',
  'Chemistry',
  'Biology',
  'Programming',
  'General Knowledge',
  'Sports',
  'Politics',
  'Technology',
  'Health',
  'Psychology',
  'Philosophy',
  'Education',
  'Movies',
  'TV',
  'Pop Culture',
  'Religion',
  'Environment',
  'Travel',
  'Food',
];

export default function PublicUserPage() {
  const { username: rawUsername } = useParams();

  const username = useMemo(() => {
    return (rawUsername || '').trim().replace(/^@/, '').toLowerCase();
  }, [rawUsername]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);

  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [publicDecks, setPublicDecks] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleQuizCount, setVisibleQuizCount] = useState(5);
  const [visibleDeckCount, setVisibleDeckCount] = useState(5);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        setUid(null);
        setPublicQuizzes([]);
        setPublicDecks([]);

        setSearchTerm('');
        setContentType('all');
        setSelectedCategory('all');
        setVisibleQuizCount(5);
        setVisibleDeckCount(5);

        if (!username) {
          setError('Invalid username.');
          return;
        }

        const unameRef = doc(db, 'usernames', username);
        const unameSnap = await getDoc(unameRef);

        if (!unameSnap.exists()) {
          setError('User not found.');
          return;
        }

        const unameData = unameSnap.data() || {};
        const resolvedUid =
          unameData.uid || unameData.userId || unameData.ownerUid || null;

        if (!resolvedUid) {
          setError('User record is missing a uid mapping.');
          return;
        }

        if (!isMounted) return;
        setUid(resolvedUid);

        const quizzesRef = collection(db, 'custom_quizzes');
        const quizQueries = [
          query(
            quizzesRef,
            where('metadata.isPublic', '==', true),
            where('creator.uid', '==', resolvedUid),
            limit(50)
          ),
          query(
            quizzesRef,
            where('metadata.isPublic', '==', true),
            where('creatorId', '==', resolvedUid),
            limit(50)
          ),
          query(
            quizzesRef,
            where('metadata.isPublic', '==', true),
            where('creatorID', '==', resolvedUid),
            limit(50)
          ),
          query(
            quizzesRef,
            where('metadata.isPublic', '==', true),
            where('createdBy', '==', resolvedUid),
            limit(50)
          ),
          query(
            quizzesRef,
            where('metadata.isPublic', '==', true),
            where('userId', '==', resolvedUid),
            limit(50)
          )
        ];

        const decksRef = collection(db, 'flashcard_decks');
        const deckQueries = [
          query(
            decksRef,
            where('isPublic', '==', true),
            where('creatorId', '==', resolvedUid),
            limit(50)
          ),
          query(
            decksRef,
            where('isPublic', '==', true),
            where('creator.uid', '==', resolvedUid),
            limit(50)
          ),
          query(
            decksRef,
            where('isPublic', '==', true),
            where('userId', '==', resolvedUid),
            limit(50)
          )
        ];

        const [quizSnapshots, deckSnapshots] = await Promise.all([
          Promise.all(quizQueries.map((q) => getDocs(q))),
          Promise.all(deckQueries.map((q) => getDocs(q)))
        ]);

        const quizzes = mergeUniqueById(
          quizSnapshots.flatMap((snap) =>
            snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          )
        ).sort((a, b) => getQuizSortTime(b) - getQuizSortTime(a));

        const decks = mergeUniqueById(
          deckSnapshots.flatMap((snap) =>
            snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          )
        ).sort((a, b) => getQuizSortTime(b) - getQuizSortTime(a));

        if (!isMounted) return;
        setPublicQuizzes(quizzes);
        setPublicDecks(decks);
      } catch (e) {
        console.error('PublicUserPage error:', e);
        if (!isMounted) return;

        const msg = typeof e?.message === 'string' ? e.message : '';
        if (msg.toLowerCase().includes('requires an index')) {
          setError(
            'This page needs a Firestore composite index. Check the console for the index link.'
          );
        } else {
          setError('Failed to load user page.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [username]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const availableCategories = useMemo(() => {
    return ['all', ...PUBLIC_CONTENT_CATEGORIES];
  }, []);

  const filteredQuizzes = useMemo(() => {
    return publicQuizzes.filter((qz) => {
      const quizTitle = (qz?.metadata?.title || qz?.title || '').toLowerCase();
      const quizCategory = normalizeCategory(
        qz?.metadata?.category || qz?.category
      );

      const matchesSearch =
        !normalizedSearch || quizTitle.includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === 'all' || quizCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [publicQuizzes, normalizedSearch, selectedCategory]);

  const filteredDecks = useMemo(() => {
    return publicDecks.filter((dk) => {
      const deckTitle = (dk?.title || '').toLowerCase();
      const deckCategory = normalizeCategory(dk?.category);

      const matchesSearch =
        !normalizedSearch || deckTitle.includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === 'all' || deckCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [publicDecks, normalizedSearch, selectedCategory]);

  const visibleQuizzes = filteredQuizzes.slice(0, visibleQuizCount);
  const visibleDecks = filteredDecks.slice(0, visibleDeckCount);

  const showQuizzes = contentType === 'all' || contentType === 'quizzes';
  const showDecks = contentType === 'all' || contentType === 'flashcards';

  const contentGridClassName =
    showQuizzes && showDecks
      ? 'grid grid-cols-1 lg:grid-cols-2 gap-8'
      : 'max-w-3xl mx-auto';

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)]">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gradient-primary drop-shadow-lg">
              @{username || 'user'}
            </h1>
            {uid && (
              <div className="text-sm text-[var(--text-secondary)] mt-2">
                Public content by this user
              </div>
            )}
          </div>

          <Link
            to="/"
            className="inline-block px-5 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Back Home
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-gradient-primary text-lg">
              Loading user page...
            </div>
          </div>
        ) : error ? (
          <div className="flex mt-5 justify-center items-center">
            <div className="error-message font-medium">{error}</div>
          </div>
        ) : (
          <>
            <div className="card rounded-lg shadow-lg border border-[var(--border)] p-5 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setVisibleQuizCount(5);
                      setVisibleDeckCount(5);
                    }}
                    placeholder="Search quizzes or flashcards..."
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--primary-500)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => {
                      setContentType(e.target.value);
                      setVisibleQuizCount(5);
                      setVisibleDeckCount(5);
                    }}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--primary-500)]"
                  >
                    <option value="all">All</option>
                    <option value="quizzes">Quizzes</option>
                    <option value="flashcards">Flashcards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setVisibleQuizCount(5);
                      setVisibleDeckCount(5);
                    }}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--primary-500)]"
                  >
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={contentGridClassName}>
              {showQuizzes && (
                <div className="card rounded-lg shadow-lg border border-[var(--border)] p-6">
                  <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">
                    Public Quizzes
                  </h2>

                  {filteredQuizzes.length === 0 ? (
                    <div className="text-[var(--text-secondary)]">
                      No public quizzes found.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        {visibleQuizzes.map((qz) => {
                          const quizTitle =
                            qz?.metadata?.title ||
                            qz?.title ||
                            'Untitled Quiz';
                          const quizCategory =
                            qz?.metadata?.category ||
                            qz?.category ||
                            'General';
                          const questionCount =
                            qz?.metadata?.questionCount ||
                            qz?.numQuestions ||
                            qz?.questionCount ||
                            null;

                          return (
                            <div
                              key={qz.id}
                              className="card relative rounded-lg shadow-lg hover:shadow-xl border border-accent px-6 py-5 transition-all duration-200"
                            >
                              <div className="text-center">
                                <div className="text-2xl text-[var(--primary-500)] font-semibold break-words">
                                  {quizTitle}
                                </div>
                                <div className="mt-3 text-base text-[var(--text-primary)]">
                                  Category:{' '}
                                  <span className="text-[var(--text-secondary)]">
                                    {quizCategory}
                                  </span>
                                </div>
                                {questionCount ? (
                                  <div className="mt-1 text-base text-[var(--text-primary)]">
                                    Questions:{' '}
                                    <span className="text-[var(--text-secondary)]">
                                      {questionCount}
                                    </span>
                                  </div>
                                ) : null}
                                <div className="mt-5">
                                  <Link
                                    to={`/quiz/${qz.id}`}
                                    className="inline-block rounded-lg bg-[var(--primary-500)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
                                  >
                                    Open Quiz
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {visibleQuizCount < filteredQuizzes.length && (
                        <div className="mt-5 flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleQuizCount((prev) => prev + 5)
                            }
                            className="rounded-lg bg-[var(--primary-500)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
                          >
                            Load More Quizzes
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {showDecks && (
                <div className="card rounded-lg shadow-lg border border-[var(--border)] p-6">
                  <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">
                    Public Flashcards
                  </h2>

                  {filteredDecks.length === 0 ? (
                    <div className="text-[var(--text-secondary)]">
                      No public flashcard decks found.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        {visibleDecks.map((dk) => {
                          const deckTitle = dk?.title || 'Untitled Deck';
                          const deckCategory = dk?.category || 'General';
                          const cardCount =
                            dk?.cardCount ||
                            dk?.totalCards ||
                            dk?.flashcards?.length ||
                            null;

                          return (
                            <div
                              key={dk.id}
                              className="card relative rounded-lg shadow-lg hover:shadow-xl border border-accent px-6 py-5 transition-all duration-200"
                            >
                              <div className="text-center">
                                <div className="text-2xl text-[var(--primary-500)] font-semibold break-words">
                                  {deckTitle}
                                </div>
                                <div className="mt-3 text-base text-[var(--text-primary)]">
                                  Category:{' '}
                                  <span className="text-[var(--text-secondary)]">
                                    {deckCategory}
                                  </span>
                                </div>
                                {cardCount ? (
                                  <div className="mt-1 text-base text-[var(--text-primary)]">
                                    Cards:{' '}
                                    <span className="text-[var(--text-secondary)]">
                                      {cardCount}
                                    </span>
                                  </div>
                                ) : null}
                                <div className="mt-5">
                                  <Link
                                    to={`/flashcards/study/${dk.id}`}
                                    className="inline-block rounded-lg bg-[var(--primary-500)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
                                  >
                                    Study Deck
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {visibleDeckCount < filteredDecks.length && (
                        <div className="mt-5 flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleDeckCount((prev) => prev + 5)
                            }
                            className="rounded-lg bg-[var(--primary-500)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
                          >
                            Load More Flashcards
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!loading &&
          !error &&
          filteredQuizzes.length === 0 &&
          filteredDecks.length === 0 && (
            <div className="mt-10 text-center text-[var(--text-secondary)]">
              This user hasn’t posted any public quizzes or flashcards yet.
            </div>
          )}
      </div>
    </div>
  );
}