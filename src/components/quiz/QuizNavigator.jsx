import { useMemo, useState } from 'react';
import { Flag } from '../icons';

function hasAnswer(answer) {
  if (answer === null || answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'string') return answer.trim().length > 0;
  return true;
}

function QuizNavigator({
  questions,
  userAnswers,
  reviewQueue,
  onNavigate,
  onToggleReview
}) {
  const [collapsed, setCollapsed] = useState(false);

  // reviewQueue is an array of questionIds
  const reviewSet = useMemo(() => new Set(reviewQueue || []), [reviewQueue]);

  const answeredCount = useMemo(
    () =>
      questions.reduce(
        (count, q) => (hasAnswer(userAnswers?.[q.questionId]) ? count + 1 : count),
        0
      ),
    [questions, userAnswers]
  );

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[360px] max-w-[calc(100vw-1.5rem)]">
      <div className="bg-card border border-accent rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-accent">
          <div>
            <p className="text-sm font-semibold text-primary">Quick Navigator</p>
            <p className="text-xs text-secondary">
              {answeredCount}/{questions.length} answered • {reviewSet.size} marked
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="px-2 py-1 rounded-md text-xs border border-accent text-secondary hover:bg-[var(--bg-secondary)] transition-colors duration-200"
          >
            {collapsed ? 'Open' : 'Hide'}
          </button>
        </div>

        {!collapsed && (
          <div className="p-3 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {questions.map((q, index) => {
                const qid = q.questionId;
                const marked = reviewSet.has(qid);
                const answered = hasAnswer(userAnswers?.[qid]);

                return (
                  <div key={qid} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onNavigate(index)}
                      className={`flex-1 h-9 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                        marked
                          ? 'bg-yellow-300 border-yellow-500 text-black'
                          : answered
                          ? 'bg-green-500 border-green-600 text-white'
                          : 'bg-[var(--neutral-200)] border-primary text-black hover:bg-[var(--neutral-300)]'
                      }`}
                      title={`Go to question ${index + 1}`}
                    >
                      {index + 1}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleReview(qid, !marked)}
                      className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                        marked
                          ? 'bg-yellow-500 border-yellow-500 text-black'
                          : 'bg-transparent border-gray-400 text-secondary hover:border-gray-500'
                      }`}
                      title={marked ? `Unmark question ${index + 1} for review` : `Mark question ${index + 1} for review`}
                    >
                      <Flag className={`w-3.5 h-3.5 ${marked ? 'fill-black' : 'fill-current'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizNavigator;