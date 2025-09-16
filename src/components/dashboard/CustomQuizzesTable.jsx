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
        <div className="grid">
          {customQuizzes.map((quiz, index) => (
            <div
              key={index}
              onClick={() => navigate(`/customquiz/${quiz.uid}`)}
              className="card custom-quiz-card cursor-pointer btn-hover"
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <Q className="w-12 h-12 fill-current opacity-90" />
                <div className="text-center font-bold text-lg tracking-wide truncate w-full">
                  {quiz.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted text-sm">
          No custom quizzes found.
        </p>
      )}
    </>
  );
};

export default CustomQuizzesTable;