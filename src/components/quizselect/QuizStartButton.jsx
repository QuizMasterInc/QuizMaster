/**
 * This component hosts a button to click for each quiz category
 */
import { Link } from "react-router-dom";

const QuizStartButton = ({ category, destination }) => (
  <div className="text-center">
    <Link to={`/quizzes/${destination}`} state={{ category }}>
      <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-pink-500/40 hover:scale-105 transition">
        {category}
      </button>
    </Link>
  </div>
);

export default QuizStartButton;
