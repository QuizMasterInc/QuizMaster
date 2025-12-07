/**
 * DifficultySelector Component
 * Interactive difficulty level selector for quiz questions
 */

export default function DifficultySelector({
  difficulty,
  onDifficultyChange
}) {
  const getDifficultyLabel = (level) => {
    const labels = {
      1: '⭐ Very Easy',
      2: '⭐⭐ Easy',
      3: '⭐⭐⭐ Medium',
      4: '⭐⭐⭐⭐ Hard',
      5: '⭐⭐⭐⭐⭐ Very Hard'
    };
    return labels[level] || '⭐⭐⭐ Medium';
  };

  return (
    <div className="bg-card border border-primary rounded-xl p-6 md:p-8 shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
        🎯 Difficulty Level
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="text-secondary font-medium md:text-right">
          Difficulty:
          <br />
          <span className="text-sm text-muted">(1 = easiest, 5 = hardest)</span>
        </label>
        <div className="md:col-span-3 space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onDifficultyChange(level)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 ${
                  difficulty === level
                    ? 'bg-accent text-white border-accent shadow-lg scale-105'
                    : 'bg-card text-secondary border-primary hover:border-accent hover:bg-secondary'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="text-center">
            <span className="text-accent font-semibold text-lg">
              {getDifficultyLabel(difficulty)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
