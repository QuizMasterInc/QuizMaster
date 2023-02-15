const QuizSelectButton = ({index, category, icon, destination}) => (
    <div key={index} className="w-1/2 text-center p-4">
        <a href={destination} className="flex flex-col space-y-4 items-center p-4 rounded-lg bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-600 text-gray-300">
            <div className="">{category}</div>
            <div>{icon}</div>
        </a>
    </div>
)

export default QuizSelectButton;