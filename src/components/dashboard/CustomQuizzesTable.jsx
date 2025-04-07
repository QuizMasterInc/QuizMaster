import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Q from '../icons/Q';

const CustomQuizzesTable = () => {
  const [customQuizzes, setCustomQuizzes] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const Qicon = <Q className="w-10 h-10 fill-white" />;

  async function fetchUserQuizzes() {
    try {
      const response = await fetch(
        'https://us-central1-quizmaster-c66a2.cloudfunctions.net/grabCustomQuizzesByUser?creator=' + currentUser.uid,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCustomQuizzes(data.data);
      } else {
        console.error('Fetch error:', response.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  useEffect(() => {
    fetchUserQuizzes();
  }, []);

  if (!customQuizzes) return null;

  return (
    <>
      {customQuizzes.length > 0 ? (
        customQuizzes.map((quiz, index) => (
          <div
            key={index}
            onClick={() => navigate(`/customquiz/${quiz.uid}`)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg cursor-pointer flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <div className="font-bold text-xl mb-2 text-center">{quiz.data.title}</div>
            {Qicon}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400 col-span-full">No custom quizzes found.</p>
      )}
    </>
  );
};

export default CustomQuizzesTable;
