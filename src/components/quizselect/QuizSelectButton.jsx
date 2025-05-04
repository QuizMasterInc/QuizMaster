import { Link } from "react-router-dom";

const QuizSelectButton = ({ index, category, icon, destination, selectCategory, allSubcategories }) => {
  const handleClick = () => {
    selectCategory(category);
    allSubcategories(category);
  };

  return (
    <div key={index} className="w-full max-w-[200px]" onClick={handleClick}>
      <Link to={`/quizzes/${destination}`} state={{ category }}>
        <div className="flex flex-col items-center justify-center h-36 p-4 space-y-2 bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-700 transition-all text-white">
          <div className="text-sm font-semibold">{category}</div>
          <div className="text-3xl">{icon}</div>
        </div>
      </Link>
    </div>
  );
};

export default QuizSelectButton;
