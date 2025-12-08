import { useAuth } from '../../contexts/AuthContext';
import useProfileSectionData from '../../hooks/useProfileSectionData';

const CustomQuizPerformance = () => {
  const { user } = useAuth();
  const { quizAverages, loading, error } = useProfileSectionData(user?.uid);

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
      <div className="dashboard-content">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl">Loading custom quiz performance...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">Error loading custom quiz performance: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="relative max-w-[1600px] mx-auto space-y-20 mb-10">
        <section className="text-center space-y-2">
          <h1 className="dashboard-title text-5xl font-extrabold tracking-tight drop-shadow sm:text-6xl text-gradient-primary">
            Custom Quiz Performance
          </h1>
          <p className="dashboard-subtitle text-lg text-secondary">
            Detailed performance analysis for all your custom quizzes.
          </p>
        </section>

        <div className="dashboard-section">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gradient-primary mb-6">All Custom Quiz Details</h2>

            {quizAverages && quizAverages.length > 0 ? (
              <div className="space-y-6">
                {quizAverages.map((quiz, index) => (
                  <div key={quiz.quizId || index} className="bg-[var(--bg-secondary)] rounded-lg p-6 border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-medium text-[var(--text-primary)]">{quiz.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          Last attempted: {formatDate(quiz.lastAttempt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${getScoreBg(quiz.averageScore)} ${getScoreColor(quiz.averageScore)}`}>
                          Avg: {quiz.averageScore}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="text-[var(--text-muted)] text-xs uppercase tracking-wide">Attempts</div>
                        <div className="text-2xl font-bold text-[var(--primary-600)] mt-1">{quiz.totalAttempts}</div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <div className="text-[var(--text-muted)] text-xs uppercase tracking-wide">Best Score</div>
                        <div className={`text-2xl font-bold mt-1 ${getScoreColor(quiz.maxScore)}`}>{quiz.maxScore}%</div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <div className="text-[var(--text-muted)] text-xs uppercase tracking-wide">Lowest Score</div>
                        <div className={`text-2xl font-bold mt-1 ${getScoreColor(quiz.minScore)}`}>{quiz.minScore}%</div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <div className="text-[var(--text-muted)] text-xs uppercase tracking-wide">Questions</div>
                        <div className="text-2xl font-bold text-[var(--primary-600)] mt-1">{quiz.totalQuestions}</div>
                      </div>
                    </div>

                    {/* Performance Trend */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Performance Trend</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${quiz.averageScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-[var(--text-muted)]">{quiz.averageScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--text-muted)] text-lg">No custom quiz performance data found.</p>
                <p className="text-[var(--text-muted)] text-sm mt-2">Take some custom quizzes to see your detailed performance here!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomQuizPerformance;