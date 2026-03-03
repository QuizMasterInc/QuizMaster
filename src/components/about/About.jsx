// This is our information tab page that displays info to the user

import { useState } from 'react';
import flier from '../about/flier.png';

export default function About() {
  const [isFlierOpen, setIsFlierOpen] = useState(false);

  // Return JSX for the About component
  return (
    <div className="min-h-screen py-20 px-6 font-main bg-primary text-primary">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 font-main text-gradient-primary">
          About Us
        </h1>
        <p className="text-xl text-center mb-10 text-secondary">
          Welcome to QuizMaster, your platform for managing, taking, and creating quizzes!
        </p>

        {/* Flyer dropdown */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsFlierOpen((v) => !v)}
              aria-expanded={isFlierOpen}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-card text-primary font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-2 border-accent"
            >
              <span className="text-gradient-primary">{isFlierOpen ? 'Hide Flyer' : 'View Flyer'}</span>
              <span
                className={`transition-transform duration-300 ${isFlierOpen ? 'rotate-180' : 'rotate-0'}`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-400 ease-out ${
              isFlierOpen ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <div className={`transform transition-transform duration-400 ${isFlierOpen ? 'scale-100' : 'scale-[0.98]'}`}>
              <div className="relative mx-auto max-w-xl rounded-3xl bg-card border border-accent shadow-2xl p-2">
                <img
                  src={flier}
                  alt="QuizMaster Flyer"
                  loading="lazy"
                  className="w-full max-h-[70vh] object-contain rounded-2xl"
                />
                <div className="absolute inset-0 rounded-3xl ring-2 ring-accent opacity-10 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Card - About QuizMaster */}
          <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent">
            <h2 className="text-3xl font-semibold mb-6 text-center font-main text-gradient-primary">
              What is QuizMaster?
            </h2>
            <p className="text-lg leading-7 mb-8 text-secondary">
              QuizMaster is your interactive study platform designed to help you learn smarter, not harder.
              Create custom quizzes, build flashcard decks, and track your progress — whether you're 
              preparing for exams, learning new material, or helping others study.
            </p>
            
            <div className="border-t border-primary pt-6">
              <h3 className="text-2xl font-semibold mb-4 text-center font-main text-gradient-primary">
                Key Features
              </h3>
              {/* List of features */}
              <ul className="space-y-4 text-base">
                {/* Feature: Create Quizzes */}
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
                  <span className="text-secondary">Create and share custom quizzes with your classmates</span>
                </li>
                {/* Feature: Flashcards */}
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
                  <span className="text-secondary">Build flashcard decks for quick and effective studying</span>
                </li>
                {/* Feature: Progress Tracking */}
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
                  <span className="text-secondary">Track your progress and pick up where you left off</span>
                </li>
                {/* Feature: Auto-save */}
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
                  <span className="text-secondary">Auto-save your quiz progress so you never lose your work</span>
                </li>
                {/* Feature: Browse Public Content */}
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
                  <span className="text-secondary">Browse and study from public quizzes and flashcard decks</span>
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
                We use <span className="font-medium text-accent">Firestore</span> for real-time data storage and seamless progress tracking, ensuring your study sessions are always saved and synchronized across devices.
              </p>
              <p className="text-lg leading-7 text-secondary">
                Create an account or log in to unlock the full QuizMaster experience and start your study journey today!
              </p>
            </div>

            <div className="text-center mt-8">
              
                <a href="/register"
                className="inline-block px-8 py-3 bg-accent hover:bg-accent-hover text-btn-primary rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
              >
                Start Studying Today!
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}