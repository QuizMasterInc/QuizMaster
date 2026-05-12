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