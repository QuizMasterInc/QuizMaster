import { Link } from "react-router-dom";

const QuizSelectButton = ({key, category, icon, destination}) => (
    <div key={key} className="w-1/2 text-center p-4">
        <Link to={'/quizzes/' + destination}>
            <div className="flex flex-col space-y-4 items-center p-4 rounded-lg bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-600 text-gray-300">
                <div className="">{category}</div>
                <div>{icon}</div>
            </div>
        </Link>
    </div>
)

export default QuizSelectButton;