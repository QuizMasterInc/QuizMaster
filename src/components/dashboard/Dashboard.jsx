/**
 * This is the dashboard parent component
 * this will only get mounted if the user is logged in
 */
import React, {useState, useEffect} from 'react'
import { useCategory } from '../../contexts/CategoryContext'
import {useAuth} from '../../contexts/AuthContext'
import { QuizResult } from './QuizResult'
import CustomQuizzesTable  from './CustomQuizzesTable'
import { Link, Navigate } from 'react-router-dom'

export default function Dashboard() {
  /**
   * state variables
   */
    const [error, setError] = useState('')
    const {currentUser, logout, isGoogleAuth} = useAuth()
    const [loading, setLoading] = useState(false)
    const {quizCategories, icons} = useCategory()

  /**
   * The view here...
   * THis will generate a QuizResult for each quiz category
   */
  return (
    <>
    <div className="flex min-h-full items-center justify-around py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="flex flex-col items-center h-full mb-4 -xl:ml-20 -xl:w-3/4">
              <h2 className="text-2xl font-bold text-gray-300 -md:text-lg">Your QuizMaster Quiz Scores:</h2>
              <div className="flex">
              {quizCategories.map((category, index) => (
                  <QuizResult category={category} key={index} icon={icons[index]} />
                ))}
              </div>
            </div>
            {error && <label className="block mt-3 font-semi-bold text-center text-black bg-red-400 py-3">{error}</label>}
          </div>
          <div className="">
            <h2 className="text-2xl font-bold text-gray-300 -md:text-lg">Your Custom Quizzes:</h2>
            <div className = "flex items-center justify-around">
              {/* Table of Custom Quizzes here */
                <CustomQuizzesTable />
              }
            </div>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <Link to={'/typeofquiz'}>
                  <div className='flex relative items-center mb-4 p-4 pl-8 pr-8 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
                    Take another quiz!
                  </div>
            </Link>
            {isGoogleAuth && <Link to={'/updateprofile'}>
                  <div className='flex relative items-center mb-4 p-4 pl-8 pr-8 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
                    Update Profile
                  </div>
                  </Link>}
          </div>
        </div>
    </div>
    </>
  )
}