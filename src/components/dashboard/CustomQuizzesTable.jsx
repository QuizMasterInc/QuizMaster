import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Q } from '../icons/index.jsx';
import QuizService from '../../services/quizService.js';

const CustomQuizzesTable = () => {
  const [customQuizzes, setCustomQuizzes] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserQuizzes = async () => {
      try {
        const quizzes = await QuizService.getCustomQuizzesByUser(currentUser.uid);
        setCustomQuizzes(quizzes);
      } catch (error) {
        console.error('Error fetching user quizzes:', error);
        setCustomQuizzes([]);
      }
    };

    if (currentUser?.uid) {
      fetchUserQuizzes();
    }
  }, [currentUser]);

  if (!customQuizzes) return null;

  return (
    <>
      {customQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {customQuizzes.map((quiz, index) => (
            <div
              key={index}
              onClick={() => navigate(`/customquiz/${quiz.uid}`)}
              className="cursor-pointer rounded-xl bg-gradient-to-br from-[#3a1069] to-[#200e40] border border-purple-700 hover:border-white p-6 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <Q className="w-12 h-12 fill-white opacity-90" />
                <div className="text-center font-bold text-lg tracking-wide truncate w-full">
                  {quiz.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm">
          No custom quizzes found.
        </p>
      )}
    </>
  );
};

export default CustomQuizzesTable;
