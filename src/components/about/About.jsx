export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1b1444] to-[#0f051d] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          About QuizMaster
        </h1>
        <p className="text-xl text-center mb-16 text-slate-200">
          Welcome to QuizMaster, your platform for managing, taking, and creating quizzes!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Card - About QuizMaster */}
          <div className="bg-[#1b1444] border border-violet-700 rounded-3xl p-8 shadow-lg hover:shadow-violet-700/40 transition duration-300">
            <h2 className="text-3xl font-bold mb-5 text-center text-purple-300">What is QuizMaster?</h2>
            <p className="text-lg leading-7 text-slate-300 mb-6">
              QuizMaster is your interactive platform to test your knowledge, challenge yourself,
              or create your own quizzes. Whether you're prepping for an exam or just having fun,
              QuizMaster offers a way to sharpen your mind with a variety of quizzes.
            </p>
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-2xl font-semibold mb-3 text-center text-blue-300">Features</h3>
              <ul className="space-y-2 text-base text-slate-300 list-disc list-inside">
                <li>Randomization of multiple choice questions</li>
                <li>Set a time limit</li>
                <li>Immediate results after submission</li>
                <li>Option to hide the correct answers and reveal them later</li>
              </ul>
            </div>
          </div>

          {/* Right Card - Team Info */}
          <div className="bg-[#1b1444] border border-blue-700 rounded-3xl p-8 shadow-lg hover:shadow-blue-700/40 transition duration-300 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-5 text-center text-blue-300">Our Team</h2>
              <p className="text-lg leading-7 text-slate-300">
                Our talented team leverages <span className="font-medium text-white">React.js</span>, <span className="font-medium text-white">Firebase</span>,
                <span className="font-medium text-white"> Tailwind CSS</span>, and <span className="font-medium text-white">Golang</span> to deliver a fast, scalable, and modern experience.
                We use <span className="font-medium text-white">Firestore</span> for real-time data and seamless quiz performance tracking.
              </p>
              <p className="text-lg leading-7 mt-4 text-slate-300">
                Create an account or log in to unlock the full QuizMaster experience!
              </p>
            </div>

            <div className="text-center mt-8">
              <a
                href="/register"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-xl font-semibold transition duration-300"
              >
                Get Started!
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
