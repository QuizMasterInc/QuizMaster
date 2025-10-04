import { useState, useEffect, useRef } from 'react';
import slide1 from './slide1.webp';
import slide2 from './slide2.webp';
import slide3 from './slide3.webp';
import slide4 from './slide4.webp';
import slide5 from './slide5.webp';
import slide6 from './slide6.webp';
import slide7 from './slide7.webp';
import slide8 from './slide8.webp';
import slide9 from './slide9.webp';
import slide10 from './slide10.webp';
import slide11 from './slide11.webp';
import slide12 from './slide12.webp';
import slide13 from './slide13.webp';
import slide14 from './slide14.webp';
import slide15 from './slide15.webp';
import slide16 from './slide16.webp';

const slides = [
  { img: slide1, title: 'Welcome to QuizMaster', description: 'QuizMaster is your comprehensive learning platform for creating, taking, and managing quizzes and flashcards.' },
  { img: slide2, title: 'Home Page', description: 'The landing page introduces QuizMaster and provides easy navigation to sign up or log in to start your learning journey.' },
  { img: slide3, title: 'About Us', description: 'Learn about the QuizMaster team, our mission, and what makes our platform the ideal choice for students and educators.' },
  { img: slide4, title: 'Sign Up', description: 'Create your QuizMaster account to access all features including custom quizzes, flashcards, and progress tracking.' },
  { img: slide5, title: 'Dashboard', description: 'View your quiz statistics, track your progress, and access all your learning materials from one central location.' },
  { img: slide6, title: 'Take a Quiz', description: 'Choose from various quiz options to start testing your knowledge and improving your skills.' },
  { img: slide7, title: 'Choose Quiz Type', description: 'Select between random quizzes, category-specific quizzes, or create your own custom quiz to match your learning needs.' },
  { img: slide8, title: 'Category Selection', description: 'Browse through different subject categories and choose the topic you want to study or test yourself on.' },
  { img: slide9, title: 'Sub-Category Selection & Quiz Options', description: 'Select specific sub-categories and customize quiz options including number of questions and difficulty level.' },
  { img: slide10, title: 'Quiz Configuration', description: 'Fine-tune your quiz settings to create the perfect practice session for your study goals.' },
  { img: slide11, title: 'Quiz In Progress', description: 'Answer multiple-choice questions with an intuitive interface. Track your progress as you work through each question.' },
  { img: slide12, title: 'Quiz In Progress (Continued)', description: 'Continue through the quiz with real-time feedback and progress tracking to monitor your performance.' },
  { img: slide13, title: 'Quiz In Progress (Continued)', description: 'Work through additional questions as you progress toward completing your quiz session.' },
  { img: slide14, title: 'Submitting Quiz', description: 'Review your answers and submit your completed quiz to see how well you performed.' },
  { img: slide15, title: 'Quiz Results', description: 'View your detailed results showing correct and incorrect answers, your score, and performance breakdown.' },
  { img: slide16, title: 'Back to Dashboard', description: 'Return to your dashboard to see updated statistics, start another quiz, or explore other learning features.' }
];

// Lazy load image component with fade-in effect
const LazyImage = ({ src, alt, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(index < 3); // Load first 3 immediately
  const imgRef = useRef(null);

  useEffect(() => {
    if (index < 3) return; // Skip observer for first 3 slides

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '300px', // Start loading 300px before slide enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.disconnect();
      }
    };
  }, [index]);

  return (
    <div ref={imgRef} className="flex justify-center mb-6 bg-primary bg-opacity-30 rounded-2xl p-5">
      {isInView ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`max-w-full h-auto rounded-xl shadow-lg transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="w-full h-96 bg-primary bg-opacity-20 rounded-xl flex items-center justify-center">
          <span className="text-secondary">Loading...</span>
        </div>
      )}
    </div>
  );
};

const Presentation = () => {
  return (
    <div className="min-h-screen py-20 px-6 font-main bg-primary text-primary">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 font-main text-gradient-primary">
            QuizMaster Demo
          </h1>
          <p className="text-xl text-secondary">
            A comprehensive guide to using QuizMaster
          </p>
        </header>

        <div className="space-y-20">
          {slides.map((slide, index) => (
            <section
              key={index}
              className="bg-card rounded-3xl p-8 shadow-xl border border-accent"
            >
              <div className="mb-6">
                <span className="inline-block bg-accent bg-opacity-20 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  Step {index + 1} of {slides.length}
                </span>
                <h2 className="text-3xl font-bold mt-3 font-main text-gradient-primary">
                  {slide.title}
                </h2>
              </div>

              <LazyImage src={slide.img} alt={slide.title} index={index} />

              <p className="text-lg leading-7 text-secondary text-center max-w-4xl mx-auto">
                {slide.description}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Presentation;