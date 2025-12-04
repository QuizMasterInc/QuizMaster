import React from 'react';

const ActivityHistory = ({ quizzes, decks, results }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gradient-primary mb-2">Recent Activity</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">Showing activity from the last 7 days</p>

      <div className="space-y-6">
        {/* Custom Quizzes Section */}
        <div>
          <h3 className="text-lg font-medium mb-3 text-[var(--primary-600)]">Recent Custom Quiz Attempts</h3>
          {quizzes && quizzes.length > 0 ? (
            <div className="space-y-3">
              {quizzes.map((quiz, index) => (
                <div key={`quiz-${quiz.id || quiz.uid || index}`} className="bg-[var(--bg-secondary)] rounded-lg p-4 border-l-4 border-[var(--primary-500)] shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--text-primary)]">{quiz.title || 'Untitled Quiz'}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {quiz.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-[var(--text-muted)]">
                        <span>Questions: {quiz.numQuestions || quiz.questionCount || 0}</span>
                        <span>Category: {quiz.category || 'Uncategorized'}</span>
                        <span>Last Attempt: {formatDate(quiz.lastAttempt || quiz.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.isPublic ? 'bg-[var(--success)] text-white' : 'bg-[var(--neutral-400)] text-[var(--text-primary)]'
                      }`}>
                        {quiz.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] italic">No recent custom quiz attempts found.</p>
          )}
        </div>

        {/* Recent Default Quiz Attempts Section */}
        <div>
          <h3 className="text-lg font-medium mb-3 text-[var(--warning)]">Recent Default Quiz Attempts</h3>
          {results && results.filter(r => r.quizType === 'default').length > 0 ? (
            <div className="space-y-3">
              {Object.entries(
                results.filter(r => r.quizType === 'default').reduce((acc, result) => {
                  const key = `${result.category}_${result.difficulty}`;
                  if (!acc[key]) acc[key] = { category: result.category, difficulty: result.difficulty, attempts: 0, lastAttempt: result.submittedAt };
                  acc[key].attempts += 1;
                  if (result.submittedAt > acc[key].lastAttempt) acc[key].lastAttempt = result.submittedAt;
                  return acc;
                }, {})
              ).map(([key, data], index) => (
                <div key={`default-attempt-${index}`} className="bg-[var(--bg-secondary)] rounded-lg p-4 border-l-4 border-[var(--warning)] shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--text-primary)]">{data.category} Quiz (Difficulty {data.difficulty})</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">Recent attempts in this category</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-[var(--text-muted)]">
                        <span>Attempts: {data.attempts}</span>
                        <span>Last Attempt: {formatDate(data.lastAttempt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] italic">No recent default quiz attempts found.</p>
          )}
        </div>

        {/* Flashcard Decks Section */}
        <div>
          <h3 className="text-lg font-medium mb-3 text-[var(--info)]">Recent Flashcard Activity</h3>
          {decks && decks.length > 0 ? (
            <div className="space-y-3">
              {decks.map((deck, index) => (
                <div key={`deck-${deck.id || index}`} className="bg-[var(--bg-secondary)] rounded-lg p-4 border-l-4 border-[var(--info)] shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--text-primary)]">{deck.title || 'Untitled Deck'}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {deck.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-[var(--text-muted)]">
                        <span>Cards: {deck.cardCount || 0}</span>
                        <span>Category: {deck.category || 'Uncategorized'}</span>
                        <span>Last Studied: {formatDate(deck.analytics?.stats?.lastStudiedAt || deck.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deck.isPublic ? 'bg-[var(--success)] text-white' : 'bg-[var(--neutral-400)] text-[var(--text-primary)]'
                      }`}>
                        {deck.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] italic">No recent flashcard activity found.</p>
          )}
        </div>
      </div>

      {(quizzes?.length === 0 && decks?.length === 0) && (
        <div className="text-center py-8">
          <p className="text-[var(--text-muted)]">No recent activity found. Start taking quizzes and creating flashcards!</p>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
