/**
 * This button will send the user to a random quiz
 */
import { Link } from "react-router-dom";

const RandomQuizButton = ({ category, icon, destination}) => (
    <div  className="w-1/2 p-4 text-center -sm:p-1">
        <Link to={'/quizzes/' + destination} state={{category}}>
            <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
                <div className="-sm:text-sm">Random</div>
                <div>{icon}</div>
            </div>
        </Link>
    </div>
)

export default RandomQuizButton;