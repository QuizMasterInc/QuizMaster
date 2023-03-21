import React from 'react'

export const QuizResult = ({index, category, icon}) => {
  return (
    <div key={index} className="w-1/2 p-4 text-center -sm:p-1">
        <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
            <div className="-sm:text-sm">{category}</div>
            <div>{icon}</div>
            <p className='text-3xl -md:text-lg'>{'Saved scores coming soon!'}</p>
        </div>
    </div>
  )
}
