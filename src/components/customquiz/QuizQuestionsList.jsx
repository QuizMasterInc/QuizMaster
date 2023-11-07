import React from 'react'

export default function QuizQuestionsList ({quizData}) {
		
    return(
			<div className='w-full' id="questionsList">
				{quizData.map((quiz, index) => (
					<div key={index} className='flex flex-col pb-4 mb-4 mt-10 bg-gray-900 rounded-lg shadow-lg -md:pl-2 -md:pr-2 -md:pb-2'>
						<div className='flex flex-row pt-4 pb-4 pl-2 pr-6 text-3xl text-gray-300 align-middle space-x-3 -md:text-sm -md:space-x-2S'>
							<p className='ml-2'>{index + 1 + "."}</p>
							<p className='mr-2'>{quizData[index][0]}</p>
						</div>
						<button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][1]}</button>
						<button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][2]}</button>
						<button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][3]}</button>
						<button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][4]}</button>
						<p className='text-2xl mb-4 text-gray-300 align-middle -md:text-sm'>Correct Answer</p>
						<button className='p-2 mb-3 ml-2 mr-2 text-gray-300 bg-gray-800 rounded-md shadow-md -md:text-sm hover:bg-gray-600'>{quizData[index][5]}</button>
					</div>
				))}
			</div>
    )
}