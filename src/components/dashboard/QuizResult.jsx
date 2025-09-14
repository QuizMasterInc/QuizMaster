/**
 * This hosts the results for each quiz - UI focused, uses ResultsContext for optimized data
 */
import React from 'react';
import { ClipLoader } from 'react-spinners';
import { useResults } from '../../contexts/ResultsContext';

export const QuizResult = ({ category, icon }) => {
  const { loading, getResultsByCategory } = useResults();
  
  // Get results for this category from context (no API call needed!)
  const results = getResultsByCategory(category);
  const { score, avgScore } = results;

  return (
    <div className="p-2">
      <div className="flex flex-col items-center px-6 py-6 rounded-xl bg-gradient-to-br from-[#35106a] to-[#210d42] border border-violet-700 text-white shadow-md hover:shadow-xl hover:scale-[1.03] transition-transform duration-200">
        <div className="text-xs font-bold uppercase tracking-wide text-violet-300 mb-2">
          {category}
        </div>
        <div className="mb-4">{icon}</div>
        {loading ? (
          <ClipLoader color="#ffffff" size={22} />
        ) : (
          <div className="space-y-1 text-sm text-gray-200 text-center">
            <p>
              <span className="text-white font-medium">Best:</span>{' '}
              {Math.round(score * 100)}%
            </p>
            <p>
              <span className="text-white font-medium">Avg:</span>{' '}
              {Math.round(avgScore * 100)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
