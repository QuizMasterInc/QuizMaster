import React from "react";
import Student from "../../assets/student.jpg";
import Bckg5 from  "../../assets/background5.png";
;

function Home() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  return (
    <div className="min-h-screen text-gray-300">
      {/* Hero Section backgroundImage: `url(${Bckg1})`, */ }
      <section
        className="flex items-center justify-center bg-gradient-to-t from-gray-900 via-gray-900 to-black  bg-cover bg-center py-14"
        style={{  
          backgroundImage: `url(${Bckg5})`,
        }}
      >
        <div className="backdrop-blur-sm  shadow-5xl p-6 rounded-lg text-center max-w-6xl">
          <p className="text-6xl font-bold text-white">Welcome to QuizMaster!</p>
          <br></br>
          <h1 className="mt-4 text-2xl font-extrabold text-white leading-tight">
            The ultimate destination for all your quiz needs. 
          </h1>
          <br></br>
          <p className="mt-3 text-white text-2xl">
            Take quizzes made by developers or other users, or create your own to study for<br></br>tests or challenge yourself!
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="flex flex-col justify-center items-center py-5 px-4">
        {isAuthenticated ? (
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white">
              You are already logged in!
            </h2>
            <p className="mt-6 text-2xl leading-relaxed  text-gray-300">
              Explore everything QuizMaster has to offer.
            </p>

            <p className="mt-6 text-2xl leading-relaxed text-gray-300">
              Take a quiz{" "}
              <a
                href="/typeofquiz"
                className="font-bold text-blue-400  underline"
              >
                here
              </a>{" "}
              or head to your{" "}
              <a
                href="/dashboard"
                className="font-bold text-blue-400  underline"
              >
                dashboard
              </a>{" "}
              to track your progress. Enjoy!
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white">
              Are you ready to start the QuizMaster experience?
            </h2>
            <br></br>
            <div className="mt-6 flex justify-center space-x-4">
              <a
                href="/register"
                className="bg-blue-400  px-10 py-3.5 rounded-md text-white font-semibold hover:bg-blue-800"
              >
                Get started for free
              </a>
              <a
                href="/signin"
                className="bg-blue-400 px-10 py-3.5 rounded-md text-white font-semibold hover:bg-blue-800"
              >
                Login
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
