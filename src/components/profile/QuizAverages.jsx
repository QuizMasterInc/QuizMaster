
import { useNavigate } from "react-router-dom";

const QuizAverages = ({ quizAverages, overallStats, loading }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[var(--success)]';
    if (score >= 60) return 'text-[var(--warning)]';
    return 'text-[var(--error)]';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-muted)]">Loading quiz performance...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gradient-primary mb-2">Quiz Performance</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">Based on attempts from the last 7 days</p>

      {/* Overall Statistics */}
      {overallStats && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-[var(--text-primary)]">Overall Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overallStats.default && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border shadow-sm">
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Default Quizzes</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Average:</span>
                    <span className={`font-medium ${getScoreColor(overallStats.default.averageScore)}`}>
                      {overallStats.default.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Best:</span>
                    <span className={`font-medium ${getScoreColor(overallStats.default.bestScore)}`}>
                      {overallStats.default.bestScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Attempts:</span>
                    <span className="font-medium text-[var(--text-primary)]">{overallStats.default.totalAttempts}</span>
                  </div>
                </div>
              </div>
            )}

            {overallStats.custom && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border shadow-sm">
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Custom Quizzes</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Average:</span>
                    <span className={`font-medium ${getScoreColor(overallStats.custom.averageScore)}`}>
                      {overallStats.custom.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Best:</span>
                    <span className={`font-medium ${getScoreColor(overallStats.custom.bestScore)}`}>
                      {overallStats.custom.bestScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Attempts:</span>
                    <span className="font-medium text-[var(--text-primary)]">{overallStats.custom.totalAttempts}</span>
                  </div>
                </div>
              </div>
            )}

            {overallStats.overall && (
              <div className="bg-[var(--primary-100)] rounded-lg p-4 border border-[var(--primary-200)]">
                <h4 className="font-medium text-[var(--primary-800)] mb-2">All Quizzes</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--primary-700)]">Average:</span>
                    <span className={`font-medium ${getScoreColor(overallStats.overall.averageScore)}`}>
                      {overallStats.overall.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--primary-700)]">Best:</span>
                    <span className={`font-medium ${getScoreColor(overallStats.overall.bestScore)}`}>
                      {overallStats.overall.bestScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--primary-700)]">Total Attempts:</span>
                    <span className="font-medium text-[var(--primary-900)]">{overallStats.overall.totalAttempts}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Quiz Performance Details */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-[var(--text-primary)]">Custom Quiz Details</h3>
        {quizAverages.length > 0 ? (
          <div className="space-y-4">
            {/* Show only the first quiz */}
            <div key={quizAverages[0].quizId} className="bg-[var(--bg-secondary)] rounded-lg p-4 border shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{quizAverages[0].title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Last attempted: {formatDate(quizAverages[0].lastAttempt)}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(quizAverages[0].averageScore)} ${getScoreColor(quizAverages[0].averageScore)}`}>
                    Avg: {quizAverages[0].averageScore}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Attempts:</span>
                  <span className="ml-2 font-medium text-[var(--text-primary)]">{quizAverages[0].totalAttempts}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Best Score:</span>
                  <span className={`ml-2 font-medium ${getScoreColor(quizAverages[0].maxScore)}`}>{quizAverages[0].maxScore}%</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Lowest Score:</span>
                  <span className={`ml-2 font-medium ${getScoreColor(quizAverages[0].minScore)}`}>{quizAverages[0].minScore}%</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Questions:</span>
                  <span className="ml-2 font-medium text-[var(--text-primary)]">{quizAverages[0].totalQuestions}</span>
                </div>
              </div>
            </div>
            {/* Show More button if more quizzes exist */}
            {quizAverages.length > 1 && (
              <div className="text-center py-4">
                <button
                  className="px-4 py-2 bg-[var(--primary-500)] text-white rounded shadow hover:bg-[var(--primary-600)]"
                  onClick={() => navigate('/profile/custom-quizzes')}
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[var(--text-muted)]">No custom quiz attempts found. Take some custom quizzes to see your performance!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAverages;