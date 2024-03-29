/**
 * This is the home page.
 * There is no fancy JavaScript.
 * We are simply displaying some HTML here. 
 */
import React from "react";
import Logo from "../../assets/logo.jpg"
import Student from "../../assets/student.jpg";
import Quiz from "../../assets/quiz.png";
import { Link } from "react-router-dom";

function Home () {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === 'true';

  return (
    <div className=" text-gray-300 bg-gray-800 shadow-lg hover:shadow-xl py-12 px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row"> 
      <div className="md:w-1/2 flex items-center justify-center"> 
        <img src={Logo} alt="logo" className="h-64 mx-auto w-76" />
      </div>
      <div className="  md:w-1/2">
        <h1 className="mt-10 text-4xl font-bold text-gray-300">Welcome to QuizMaster</h1>
        <p className="pl-8 pt-8 mb-10 text-2xl text-gray-300">The ultimate destination for all your quiz needs.</p>
      </div>
    </div>
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 flex items-center justify-center">
        <h1 className="pl-12 mt-10 text-2xl font-bold text-gray-300">Subjects ranging from Mathematics, Science, Geography, and More!</h1>
        <p className="pl-6 mt-10 text-2xl text-gray-300 ">The Perfect Quiz Taking Application for both Students and Teachers!</p>
      </div>
      <div className="md:w-1/2">
        <div className="flex items-center justify-center">
          <img src={Student} alt="student" className="h-64 mx-auto w-76" />
        </div>
      </div>
    </div>
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 flex items-center justify-center">
        <img src={Quiz} alt="quiz" className="h-64 mx-auto w-76" />
      </div>
        {isAuthenticated ? (
          <div className="md:w-1/2">
            <h1 className="pl-4 mt-10 text-3xl font-bold text-gray-300">
              You are Logged in already!
            </h1>
            <p className="pt-8 pr-8 mb-10 text-2xl text-gray-300">
              Take a quiz <Link to="/typeofquiz" className="underline">here</Link>  or go to your <Link to="/dashboard" className="underline">dashboard</Link> to see the progress you have made. Enjoy!
            </p>
          </div>
          ) : (
          <div className="md:w-1/2"> 
            <h1 className="pl-4 mt-10 text-3xl font-bold text-gray-300">
              Are you ready to start the QuizMaster Experience?
            </h1>
            <p className="pt-8 pr-8 mb-10 text-2xl text-gray-300">
              Simply Create an account <Link to="/register" className="underline">here</Link> if you don't have one already, or <Link to="/signin" className="underline">login</Link> if you already have an account. Navigate to the <Link to="/quizzes" className="underline">quizzes</Link> page and select a quiz. Enjoy!
            </p>
          </div>
          ) 
        }
    </div>
  </div>
  );
}
export default Home;
