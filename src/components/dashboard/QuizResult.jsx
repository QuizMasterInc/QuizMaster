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
        const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabResults', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

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
    <div className="p-2 text-center">
      <div className="flex flex-col items-center p-4 space-y-3 bg-gray-800 rounded-xl text-white shadow-md">
        <div className="text-md font-semibold">{category}</div>
        <div>{icon}</div>
        {loading ? (
          <ClipLoader color={'#d1d5db'} size={25} />
        ) : (
          <>
            <p className="text-sm">Best: {Math.round(result * 100)}%</p>
            <p className="text-sm">Avg: {Math.round(avgScore * 100)}%</p>
          </>
        )}
      </div>
    </div>
  );
};
