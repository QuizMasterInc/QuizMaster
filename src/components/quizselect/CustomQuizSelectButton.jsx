/**
 * This component hosts a button to click for each quiz category
 */
import { Link } from "react-router-dom";


const CustomQuizSelectButton = ({index, title, numquestions, destination}) => (
    <div key={index} className="w-1/2 p-4 text-center -sm:p-1">
        <Link to={'/customquiz/:uid/' + destination} state={{title}}>

            grabCustomQuiz/?quizid=
            <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
                <div className="-sm:text-sm">{title}</div>
                <div>{numquestions}</div>
            </div>
        </Link>
    </div>
)

//grabCustomQuiz/?quizid= {DESTINATION}
export default CustomQuizSelectButton;