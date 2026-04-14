import React from 'react';

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

const getSortTime = (item) => {
  const value =
    item?.timestamps?.updatedAt ||
    item?.updatedAt ||
    item?.timestamps?.createdAt ||
    item?.createdAt ||
    null;

  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown';

  if (dateValue instanceof Date) {
    return dateValue.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function RecentStudyActivity({ quizzes = [], decks = [] }) {
  const recentQuizzes = [...quizzes].sort((a, b) => getSortTime(b) - getSortTime(a)).slice(0, 5);
  const recentDecks = [...decks].sort((a, b) => getSortTime(b) - getSortTime(a)).slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gradient-primary mb-2">Recent Activity</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">Showing your latest quizzes and flashcard decks.</p>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3 text-[var(--primary-600)]">Recent Quiz Activity</h3>
          {recentQuizzes.length > 0 ? (
            <div className="space-y-3">
              {recentQuizzes.map((quiz) => (
                <div
                  key={`recent-quiz-${getQuizId(quiz)}`}
                  className="bg-[var(--bg-secondary)] rounded-lg p-4 border-l-4 border-[var(--primary-500)] shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--text-primary)]">{getQuizTitle(quiz)}</h4>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-[var(--text-muted)]">
                        <span>Questions: {getQuizQuestionCount(quiz)}</span>
                        <span>Category: {getQuizCategory(quiz)}</span>
                        <span>
                          Last Updated: {formatDate(
                            quiz?.timestamps?.updatedAt ||
                              quiz?.updatedAt ||
                              quiz?.timestamps?.createdAt ||
                              quiz?.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isQuizPublic(quiz)
                          ? 'bg-[var(--success)] text-white'
                          : 'bg-[var(--neutral-400)] text-[var(--text-primary)]'
                      }`}
                    >
                      {isQuizPublic(quiz) ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] italic">No quiz activity found.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3 text-[var(--info)]">Recent Flashcard Activity</h3>
          {recentDecks.length > 0 ? (
            <div className="space-y-3">
              {recentDecks.map((deck) => (
                <div
                  key={`recent-deck-${getDeckId(deck)}`}
                  className="bg-[var(--bg-secondary)] rounded-lg p-4 border-l-4 border-[var(--info)] shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--text-primary)]">{deck?.title || 'Untitled Deck'}</h4>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-[var(--text-muted)]">
                        <span>Cards: {deck?.cardCount || 0}</span>
                        <span>Category: {deck?.category || 'General'}</span>
                        <span>Last Updated: {formatDate(deck?.updatedAt || deck?.createdAt)}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deck?.isPublic
                          ? 'bg-[var(--success)] text-white'
                          : 'bg-[var(--neutral-400)] text-[var(--text-primary)]'
                      }`}
                    >
                      {deck?.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] italic">No flashcard activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
