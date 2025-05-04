/**
 * This hosts the results for each quiz 
 */
import React, { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../contexts/AuthContext';

export const QuizResult = ({ category, icon }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchResults(uid) {
      setLoading(true);
      const data = { uid: uid, category: category.toLowerCase() };

      try {
        const response = await fetch(
          'https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabResults',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          const resultData = await response.json();
          setResult(resultData.score ?? 0);
          setAvgScore(resultData.avgScore ?? 0);
        } else {
          console.error('Fetch error:', response.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }

      setLoading(false);
    }

    fetchResults(currentUser.uid);
  }, []);

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
