/**
 * This hosts the results for each quiz - UI focused, business logic in resultService
 */
import React, { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../contexts/AuthContext';
import resultService from '../../services/resultService';

export const QuizResult = ({ category, icon }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        const results = await resultService.getResultsByCategory(currentUser.uid, category);
        setResult(results.score);
        setAvgScore(results.avgScore);
      } catch (error) {
        console.error('Error fetching quiz results:', error);
        // Set default values on error
        setResult(0);
        setAvgScore(0);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [currentUser.uid, category]);

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
              {Math.round(result * 100)}%
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
