import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const getQuizId = (quiz) => quiz?.uid || quiz?.id || null;

const getQuizTitle = (quiz) => quiz?.metadata?.title || quiz?.title || 'Untitled Quiz';

const getQuizQuestionCount = (quiz) =>
  quiz?.content?.totalQuestions ||
  quiz?.metadata?.questionCount ||
  quiz?.questionCount ||
  quiz?.numQuestions ||
  (quiz?.content?.questions ? Object.keys(quiz.content.questions).length : 0);

const getQuizCategory = (quiz) => quiz?.metadata?.category || quiz?.category || 'General';

const isQuizPublic = (quiz) => {
  if (typeof quiz?.metadata?.isPublic === 'boolean') return quiz.metadata.isPublic;
  if (typeof quiz?.isPublic === 'boolean') return quiz.isPublic;
  if (typeof quiz?.isPrivate === 'boolean') return !quiz.isPrivate;
  return true;
};

const getDeckId = (deck) => deck?.id || null;

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

function QuizCard({ quiz }) {
  const quizId = getQuizId(quiz);
  const quizTags = formatTags(quiz?.metadata?.tags || quiz?.tags);
  const publicQuiz = isQuizPublic(quiz);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-accent shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            to={`/customquiz/settings/${quizId}`}
            className="text-lg font-semibold text-[var(--primary-500)] hover:underline"
          >
            {getQuizTitle(quiz)}
          </Link>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
            <span>Questions: {getQuizQuestionCount(quiz)}</span>
            <span>Category: {getQuizCategory(quiz)}</span>
          </div>
          {quizTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {quizTags.map((tag) => (
                <span
                  key={`${quizId}-${tag}`}
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
          <Link
            to={`/flashcards/edit/${deckId}`}
            className="text-lg font-semibold text-[var(--primary-500)] hover:underline"
          >
            {deck?.title || 'Untitled Deck'}
          </Link>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
            <span>Cards: {deck?.cardCount || 0}</span>
            <span>Category: {deck?.category || 'General'}</span>
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={`${deckId}-${tag}`}
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
  const [activeSection, setActiveSection] = useState('public');

  const { publicQuizzes, privateQuizzes } = useMemo(() => {
    const publicItems = [];
    const privateItems = [];

    quizzes.forEach((quiz) => {
      if (isQuizPublic(quiz)) publicItems.push(quiz);
      else privateItems.push(quiz);
    });

    return { publicQuizzes: publicItems, privateQuizzes: privateItems };
  }, [quizzes]);

  const sections = [
    { id: 'public', label: 'Public Quizzes', count: publicQuizzes.length, tone: 'text-[var(--primary-600)]' },
    { id: 'private', label: 'Private Quizzes', count: privateQuizzes.length, tone: 'text-[var(--warning)]' },
    { id: 'decks', label: 'Flashcard Decks', count: decks.length, tone: 'text-[var(--info)]' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gradient-primary mb-2">My Study Material</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Review the quizzes and flashcard decks you created, including both public and private quizzes.
      </p>

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
        {activeSection === 'public' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-[var(--primary-600)]">My Public Quizzes</h3>
              <span className="text-sm text-[var(--text-muted)]">{publicQuizzes.length} total</span>
            </div>
            {publicQuizzes.length > 0 ? (
              publicQuizzes.map((quiz) => (
                <QuizCard key={getQuizId(quiz)} quiz={quiz} />
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
              privateQuizzes.map((quiz) => (
                <QuizCard key={getQuizId(quiz)} quiz={quiz} />
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
              <span className="text-sm text-[var(--text-muted)]">{decks.length} total</span>
            </div>
            {decks.length > 0 ? (
              decks.map((deck) => (
                <DeckCard key={getDeckId(deck)} deck={deck} />
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
