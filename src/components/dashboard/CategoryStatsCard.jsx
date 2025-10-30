/**
 * This displays the quiz performance stats for each category on the dashboard
 */
import { ClipLoader } from 'react-spinners';
import { useResults } from '../../contexts/ResultsContext';

export const CategoryStatsCard = ({ category, icon }) => {
  const { loading, getResultsByCategory } = useResults();
  
  // Get results for this category from context (no API call needed!)
  const results = getResultsByCategory(category);
  const { score, avgScore } = results;

  return (
    <div className="p-2">
      <div className="flex flex-col items-center px-6 py-6 rounded-xl card shadow-md hover:scale-105 transition-transform duration-200 border border-accent">
        <div className="text-2xl font-extrabold uppercase tracking-wide text-gradient-primary mb-2">
          {category}
        </div>
        <div className="mb-4 fill-current text-[var(--primary-300)]">{icon}</div>
        {loading ? (
          <ClipLoader color="#bf8bff" size={22} />
        ) : (
          <div className="space-y-1 text-sm text-center">
            <p>
              <span className="font-bold">Best:</span>{' '}
              {Math.round(score * 100)}%
            </p>
            <p>
              <span className="font-bold">Avg:</span>{' '}
              {Math.round(avgScore * 100)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};