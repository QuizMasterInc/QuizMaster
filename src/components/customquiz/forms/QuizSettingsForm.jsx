/**
 * QuizSettingsForm Component
 * Handles privacy settings, password, and teacher quiz toggle
 */

export default function QuizSettingsForm({
  privateQuiz,
  onPrivateQuizChange,
  privateQuizPassword,
  onPasswordChange,
  teacherQuiz,
  onTeacherQuizChange
}) {
  return (
    <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
        ⚙️ Quiz Settings
      </h2>

      <div className="space-y-6">
        {/* Private Quiz */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-secondary font-medium md:text-right">
            Private Quiz?
          </label>
          <div className="md:col-span-3">
            <select
              onChange={onPrivateQuizChange}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              value={privateQuiz ? 'yes' : 'no'}
              disabled={teacherQuiz}
            >
              <option value="no">No - Anyone can access</option>
              <option value="yes">Yes - Requires password</option>
            </select>
          </div>
        </div>

        {/* Password Field (conditional) */}
        {privateQuiz && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-secondary font-medium md:text-right">
              Password:
            </label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={privateQuizPassword}
                onChange={onPasswordChange}
                className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                placeholder="Enter password for quiz access"
              />
            </div>
          </div>
        )}

        {/* Teacher Quiz */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-secondary font-medium md:text-right">
            Teacher Quiz?
          </label>
          <div className="md:col-span-3">
            <select
              onChange={onTeacherQuizChange}
              className="w-full bg-card text-primary border border-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              value={teacherQuiz ? 'yes' : 'no'}
            >
              <option value="no">No</option>
              <option value="yes">Yes - Auto-private with teacher tag</option>
            </select>
            {teacherQuiz && (
              <p className="text-sm text-accent mt-2">
                ℹ️ Teacher quizzes are automatically set to private. You can set your own password.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
