/**
 * This component hosts a button to click for each custom quizz
 */
import { Link } from "react-router-dom";

function displayTags(tags) {
    if (tags.length > 0) {
        return "User Tag(s): " + tags
    }
    return;
  }

const CustomQuizSelectButton = ({title, numQuestions, tags, uid}) => (
    <div className="w-1/3 p-5 text-center -sm:p-1">
        <Link to={'/quizstarted/' + uid}>
        <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
            <div className="text-2xl">{title}</div>
            <div className="text-base">{displayTags(tags)}</div>
            <div className="text-base">Questions: {numQuestions}</div>
        </div>
        </Link>
    </div>
)

//grabCustomQuiz/?quizid= {DESTINATION}
export default CustomQuizSelectButton;