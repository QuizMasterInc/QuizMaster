// This is our information tab page that displays info to the user
// Updated design on March 23, 2025 by sami alzoubi

export default function About() {
  // Return JSX for the About component
  return (
    <div className="min-h-screen py-20 px-6 font-main bg-primary text-primary">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 font-main text-gradient-primary">
          About Us
        </h1>
        <p className="text-xl text-center mb-16 text-secondary">
          Welcome to QuizMaster, your platform for managing, taking, and creating quizzes!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Card - About QuizMaster */}
          <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent">
            <h2 className="text-3xl font-semibold mb-6 text-center font-main text-gradient-primary">
              What is QuizMaster?
            </h2>
            <p className="text-lg leading-7 mb-8 text-secondary">
              QuizMaster is your interactive platform to test your knowledge, challenge yourself,
              or create your own quizzes. Whether you're prepping for an exam or just having fun,
              QuizMaster offers a way to sharpen your mind with a variety of quizzes.
            </p>
            
            <div className="border-t border-primary pt-6">
              <h3 className="text-2xl font-semibold mb-4 text-center font-main text-gradient-primary">
                Key Features
              </h3>
              {/* List of features */}
              <ul className="space-y-4 text-base">
                {/* Feature: Randomization */}
                <li className="flex gap-x-3 items-start">
                  <svg
                    className="h-6 w-5 flex-none text-accent mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-secondary">Randomization of multiple choice questions</span>
                </li>
                {/* Feature: Time Limit */}
                <li className="flex gap-x-3 items-start">
                  <svg
                    className="h-6 w-5 flex-none text-accent mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-secondary">Set customizable time limits</span>
                </li>
                {/* Feature: Immediate Results */}
                <li className="flex gap-x-3 items-start">
                  <svg
                    className="h-6 w-5 flex-none text-accent mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-secondary">Immediate results and detailed feedback</span>
                </li>
                {/* Feature: Option to hide correct answers */}
                <li className="flex gap-x-3 items-start">
                  <svg
                    className="h-6 w-5 flex-none text-accent mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-secondary">Option to hide answers and reveal them later</span>
                </li>
                <li className="flex gap-x-3 items-start">
                  <svg
                    className="h-6 w-5 flex-none text-accent mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-secondary">Create and share custom quizzes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Card - Team Info */}
          <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-semibold mb-6 text-center font-main text-gradient-primary">
                Our Technology Stack
              </h2>
              <p className="text-lg leading-7 mb-6 text-secondary">
                Our talented team leverages modern web technologies including{' '}
                <span className="font-medium text-accent">React.js</span>,{' '}
                <span className="font-medium text-accent">Firebase</span>, and{' '}
                <span className="font-medium text-accent">Tailwind CSS</span> to deliver a fast, scalable, and modern experience.
              </p>
              <p className="text-lg leading-7 mb-6 text-secondary">
                We use <span className="font-medium text-accent">Firestore</span> for real-time data storage and seamless quiz performance tracking, ensuring your progress is always saved and synchronized.
              </p>
              <p className="text-lg leading-7 text-secondary">
                Create an account or log in to unlock the full QuizMaster experience and start your learning journey today!
              </p>
            </div>

            <div className="text-center mt-8">
              <a
                href="/register"
                className="inline-block px-8 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
              >
                Get Started Today!
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
