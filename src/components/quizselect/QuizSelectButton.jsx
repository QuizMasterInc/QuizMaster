/**
 * This component hosts a button to click for each quiz category
 */
import { Link } from "react-router-dom";

const QuizSelectButton = ({index, category, icon, destination, selectCategory, allSubcategories }) => {
    const handleClick = () => {
        selectCategory(category)
        allSubcategories(category)
        console.log('Sip')
    }
    return (
    <div key={index} className="w-1/2 p-4 text-center -sm:p-1" onClick={handleClick}>
        <Link to={'/quizzes/' + destination} state={{category}}>
            <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
                <div className="-sm:text-sm">{category}</div>
                <div>{icon}</div>
            </div>

        </Link>
    </div>
    )
}

export default QuizSelectButton;