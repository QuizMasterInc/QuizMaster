// This is our information tab page that displays info to the user
// Updated design on March 23, 2025 by sami alzoubi

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4">About Us</h1>
        <p className="text-xl text-center mb-16">
          Welcome to QuizMaster, your platform for managing, taking, and creating quizzes!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Card - About QuizMaster */}
          <div className="bg-gray-900 rounded-3xl p-8 shadow-lg ring-1 ring-slate-700">
            <h2 className="text-3xl font-semibold mb-4 text-center">What is QuizMaster?</h2>
            <p className="text-lg leading-7 mb-6">
              QuizMaster is your interactive platform to test your knowledge, challenge yourself,
              or create your own quizzes. Whether you're prepping for an exam or just having fun,
              QuizMaster offers a way to sharpen your mind with a variety of quizzes.
            </p>
            <div className="border-t border-slate-600 pt-4">
              <h3 className="text-2xl font-semibold mb-3 text-center">Features</h3>
              <ul className="space-y-3 text-base pl-4 list-disc">
                <li>Randomization of multiple choice questions</li>
                <li>Set a time limit</li>
                <li>Immediate results after submission</li>
                <li>Option to hide the correct answers and reveal them later</li>
              </ul>
            </div>
          </div>

          {/* Right Card - Team Info */}
          <div className="bg-gray-900 rounded-3xl p-8 shadow-lg ring-1 ring-slate-700 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-semibold mb-4 text-center">Our Team</h2>
              <p className="text-lg leading-7">
                Our talented team leverages <span className="font-medium">React.js</span>, <span className="font-medium">Firebase</span>,
                <span className="font-medium"> Tailwind CSS</span>, and <span className="font-medium">Golang</span> to deliver a fast, scalable, and modern experience.
                We use <span className="font-medium">Firestore</span> for real-time data and seamless quiz performance tracking.
              </p>
              <p className="text-lg leading-7 mt-4">
                Create an account or log in to unlock the full QuizMaster experience!
              </p>
            </div>

            <div className="text-center mt-8">
              <a
                href="/register"
                className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
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
