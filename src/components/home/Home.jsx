// This is our Home tab page
// Updated design on April 1st, 2024 

// Import necessary modules and assets
import React from "react";
import Logo from "../../assets/logo.jpg";
import Student from "../../assets/student.jpg";
import Quiz from "../../assets/quiz.png";
import { Link } from "react-router-dom";

// Define the functional component Home
function Home() {
  // Check if the user is authenticated
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Return JSX for the Home component
  return (
    // Container div with styling classes
    <div className=" text-gray-300 bg-gray-800 hover:shadow-xl py-12 px-4 sm:px-6 lg:px-8">
      {/* First section: Hero banner */}
      <section
        // Styling classes for section
        className="py-24 bg-no-repeat backdrop-grayscale-0 bg-neutral-900/60 bg-cover bg-center flex items-center justify-center"
        // Styling for background image
        style={{
          backgroundImage: `url(${Student})`,
        }}
      >
        {/* Container div for content */}
        <div className="mx-auto backdrop-grayscale-0 bg-neutral-900/60 p-3 max-w-[50rem]">
          {/* Content in the hero banner */}
          <div className="text-center">
            {/* Heading */}
            <p className="text-lg font-bold leading-8 text-white">
              Welcome to QuizMaster 
            </p>
            <h1 className="mt-3 text-[3.5rem] font-bold leading-[4rem] tracking-tight text-white">
              The ultimate destination for all your quiz needs.
            </h1>
            {/* Description */}
            <p className="mt-3 text-lg leading-relaxed text-white">
              Unlock the world of quizzes with QuizMaster, your ultimate
              destination for interactive learning.
            </p>
          </div>
          {/* Call-to-action buttons */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <a
              href="/register"
              className="transform rounded-md bg-indigo-600/95 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Get started for free
            </a>
            <a
              href="/signin"
              className="transform rounded-md bg-indigo-600/95 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Login{" "}
            </a>
          </div>
        </div>
      </section>

      {/* Second section: Conditional rendering based on authentication */}
      <div className="flex flex-col md:flex-row justify-center items-center min-h-screen">
        {isAuthenticated ? (
          // Display message for authenticated users
          <div className="md:w-1/2 text-center">
            <h1 className="pl-4 mt-10 text-3xl font-bold text-gray-300">
              You are Logged in already!
            </h1>
            <h1 className="pl-4 mt-10 text-3xl font-bold text-gray-300">
              You are now able to do everything Quiz Master has to offer. You can take 
              quizzes made by our developers or quizzes made from other users. You can
              also make your own quizzes to study for tests or just test your knowledge. 
            </h1>
          </div>
        ) : (
          // Display message for non-authenticated users
          <section className="py-16 mx-auto text-white">
            {/* Container for content */}
            <div className="container mx-auto px-4 text-center">
              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Are you ready to start the QuizMaster Experience?
              </h2>
              {/* Description */}
              <p className="text-lg md:text-xl  mb-8">
                Take a quiz{" "}
                <Link to="/typeofquiz" className="font-bold underline">
                  here
                </Link>{" "}
                or go to your{" "}
                <Link to="/dashboard" className="font-bold underline">
                  dashboard
                </Link>{" "}
                to see the progress you have made. Enjoy!
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Export the Home component
export default Home;
