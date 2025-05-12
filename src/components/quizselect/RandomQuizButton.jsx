import { useNavigate } from "react-router-dom";

const RandomQuizButton = ({ category, icon, allSubcategories, selectCategory }) => {
  const navigate = useNavigate();

  const handleRandomClick = () => {
    selectCategory(category);
    allSubcategories(category);
    navigate(`/quizzes/${category.toLowerCase()}`);
  };

  return (
    <div className="w-full max-w-[200px]">
      <div
        onClick={handleRandomClick}
        className="flex flex-col items-center justify-center h-36 p-4 space-y-2 bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-700 transition-all text-white cursor-pointer"
      >
        <div className="text-sm font-semibold">Random</div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default RandomQuizButton;
