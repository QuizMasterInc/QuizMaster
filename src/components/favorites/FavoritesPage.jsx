/*import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuizFiltering } from '../../hooks/useQuizFiltering';
//import QuizCard from '../quiz/QuizCard';
import QuizList from "../quizselect/customquizselect/QuizList";
//import './FavoritesPage.css';
import FlashcardCard from '../flashcards/FlashcardCard';

const FavoritesPage = () => {
  const [favoriteQuizzes, setFavoriteQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorite = async() => {
        const user = auth.getCurrentUser();
        if (!user) return;

        const userData = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const favoriteIds = userData.favorites || [];
        if (favoriteIds.length > 0) {
            const quizPromises = favoriteIds.map(id => getDoc(doc(db, 'quizzes', id)));
            const querySnapshot = await getDocs(collection(db, 'quizzes'));
            const quizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFavoriteQuizzes(quizzes);
        }
        setLoading(false);
    };

    fetchFavorite();
  }, []);


if (loading) {
    return <div>Loading...</div>;
}

return (
    <div className="favorites-page">
        <h2>Your Favorite Quizzes</h2>
        {favoriteQuizzes.length > 0 ? (
            <div className="quiz-grid">
                {favoriteQuizzes.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                ))}
            </div>
        ) : (
            <p>You haven't favorited any quizzes yet.</p>
        )}
    </div>
);
};

export default FavoritesPage;*/
import React from 'react';
import QuizList from "../quizselect/customquizselect/QuizList";

const FavoritesPage = () => {
    return (
        <div className="w-full">
            {/* By passing dataSource="userFavorites", QuizList will 
              automatically trigger the special logic we added to it.
            */}
            <QuizList 
                title="My Favorite Quizzes" 
                dataSource="userFavorites" 
                enabledFilters={["search", "sort"]} 
            />
        </div>
    );
};

export default FavoritesPage;