// This is our information tab page that displays info to the user
// Updated design on April 1st, 2024

// Define the functional component About
export default function About() {
  // Return JSX for the About component
  return (
    // Container div with styling classes
    <div className=" text-white py-24 sm:py-32">
      {/* Container for content */}
      <div className="mx-auto max-w-8xl px-6 lg:px-8">
        {/* Container for text content */}
        <div className="mx-auto max-w-2xl sm:text-center">
          {/* Heading */}
          <h2 className="font-bold tracking-tight text-white sm:text-6xl mb-10">
            About Us
          </h2>
          {/* Description */}
          <p className="mt-5 text-2xl leading-8 text-white">
            Welcome to QuizMaster, your platform for managing, taking, 
            and creating quizzes!
          </p>
        </div>
        {/* Container for features */}
        <div className="mx-auto mt-10 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          {/* Left side: Features */}
          <div className="p-8 sm:p-10 lg:flex-auto">
            {/* Feature: QuizMaster */}
            <h3 className="text-2xl font-bold tracking-tight text-white leading-10 text-center">
              QuizMaster {" "}
            </h3>
            <div className="h-px flex-auto bg-gray-100"></div>  {/* Divider */}
            {/* Description of QuizMaster */}
            <p className="mt-6 text-lg leading-7 text-white">
              Quiz Master is a website that has been built to allow users to take quizzes and test their knowledge before taking an exam.
              Why would someone be interested in trying out Quiz Master you might ask? 
              The answer is pretty straightforward from the name of the website, "Quiz Master".
              We are constantly developing our quiz questions to see how intelligent you are! 
              We want you to create your own quizzes OR take the challenge and try to ace our challenging questions! 
              Try our quizzes and put that brain into gear.
            </p>
            {/* Separator */}
            <div className="mt-10 flex-none gap-x-4">
              <h4 className="flex-auto text-2xl font-bold leading-10 text-white text-center">
                What’s included
              </h4>
              <div className="h-px flex-auto bg-gray-100"></div>  {/* Divider */}
            </div>
            {/* List of features */}
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-base leading-6 text-white sm:grid-cols-2 sm:gap-6"
            >
              {/* Feature: Randomization */}
              <li className="flex gap-x-3 text-left">
                <svg
                  className="h-6 w-5 flex-none text-white text-bold text-md"
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
                Randomization of multiple choice questions
              </li>
              {/* Feature: Time Limit */}
              <li className="flex gap-x-3 text-left">
                <svg
                  className="h-6 w-5 flex-none text-white text-bold text-md"
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
                Set a time limit{" "}
              </li>
              {/* Feature: Immediate Results */}
              <li className="flex gap-x-3 text-left">
                <svg
                  className="h-6 w-5 flex-none text-white text-bold text-md"
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
                Immediate Results
              </li>
              {/* Feature: Option to hide correct answers */}
              <li className="flex gap-x-3 text-left">
                <svg
                  className="h-6 w-5 flex-none text-white text-bold text-md"
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
                Option to hide the correct answer and reveal them later{" "}
              </li>
            </ul>
          </div>
          {/* Right side: Team */}
          <div className="p-2 lg:mt-2 lg:w-full lg:max-w-lg lg:flex-shrink-0 lg:mr-2 lg:mb-2">
            {/* Container for team information */}
            <div className="rounded-2xl bg-gray-900 text-center lg:justify-center lg:py-10 lg:h-full lg:w-sm text-white">
              {/* Container for team details */}
              <div className="mx-auto max-w-sm px-8">
                {/* Heading */}
                <h5 className="text-2xl font-bold text-white mb-1 mt-0"> 
                  Our Team 
                </h5>
                <div className="h-px flex-auto bg-gray-100 "></div>  {/* Divider */}
                {/* Description of team */}
                <p className="mt-10 text-white flex items-baseline justify-center gap-x-2 text-xl">
                  Our talented team leverages React.js, Firebase hosting,
                  Tailwind CSS styling, and Golang for robust backend support.
                  We use Firestore to ensure seamless storage and updating of
                  quizzes and results.
                </p>
                <p className="mt-10 text-white flex items-baseline justify-center gap-x-2 text-xl mb-10">
                Login or create an account to take advantage of all we have to offer!
                </p>
                <div className="h-px flex-auto bg-gray-100 "></div>  {/* Divider */}
                {/* Call-to-action button */}
                <a
                  href="/register"
                  className="mt-10 block w-sm rounded-md bg-slate-700 px-3 py-2 text-center text-lg font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get Started!
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
