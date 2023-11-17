/**
 * This component hosts a button to click for each custom quizz
 */
import { Link } from "react-router-dom";


const CustomQuizSelectButton = ({title, numQuestions}) => (
    <div className="w-1/4 p-4 text-center -sm:p-1">
        <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
            <div className="-sm:text-sm">{title}</div>
            <div className="-sm:text-sm">Questions: {numQuestions}</div>
        </div>
    </div>
)

//grabCustomQuiz/?quizid= {DESTINATION}
export default CustomQuizSelectButton;