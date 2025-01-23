import React from "react";
import Student from "../../assets/student.jpg";

function Home() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  return (
    <div className="min-h-screen bg-gradient-to-t from-black via-gray-900 to-gray-800 text-gray-300">
      {/* Hero Section */}
      <section
        className="flex items-center justify-center bg-cover bg-center py-24"
        style={{
          backgroundImage: `url(${Student})`,
        }}
      >
        <div className="backdrop-blur-sm bg-black/60 p-6 rounded-lg shadow-lg text-center max-w-3xl">
          <p className="text-lg font-bold text-white">Welcome to QuizMaster</p>
          <h1 className="mt-4 text-4xl font-extrabold text-white leading-tight">
            The ultimate destination for all your quiz needs.
          </h1>
          <p className="mt-3 text-white text-lg">
            Unlock the world of quizzes with QuizMaster, your ultimate
            destination for interactive learning.
          </p>
          {!isAuthenticated && (
            <div className="mt-6 flex justify-center space-x-4">
              <a
                href="/register"
                className="bg-indigo-600 px-5 py-3 rounded-md text-white font-semibold hover:bg-indigo-700"
              >
                Get started for free
              </a>
              <a
                href="/signin"
                className="bg-indigo-600 px-5 py-3 rounded-md text-white font-semibold hover:bg-indigo-700"
              >
                Login
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <div className="flex flex-col justify-center items-center py-12 px-4">
        {isAuthenticated ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-300">
              You are already logged in!
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-300">
              You can now explore everything QuizMaster has to offer. Take
              quizzes made by developers or other users, or create your own to
              study for tests or challenge yourself!
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-300">
              Are you ready to start the QuizMaster experience?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-300">
              Take a quiz{" "}
              <a
                href="/typeofquiz"
                className="font-bold text-indigo-400 underline"
              >
                here
              </a>{" "}
              or head to your{" "}
              <a
                href="/dashboard"
                className="font-bold text-indigo-400 underline"
              >
                dashboard
              </a>{" "}
              to track your progress. Enjoy!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
