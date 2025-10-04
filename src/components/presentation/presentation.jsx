import { useState, useEffect, useRef } from 'react';
import slide1 from './slide1.png';
import slide2 from './slide2.png';
import slide3 from './slide3.png';
import slide4 from './slide4.png';
import slide5 from './slide5.png';
import slide6 from './slide6.png';
import slide7 from './slide7.png';
import slide8 from './slide8.png';
import slide9 from './slide9.png';
import slide10 from './slide10.png';
import slide11 from './slide11.png';
import slide12 from './slide12.png';
import slide13 from './slide13.png';
import slide14 from './slide14.png';
import slide15 from './slide15.png';
import slide16 from './slide16.png';

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

const Presentation = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1a1a2e, #16213e)', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>QuizMaster Demo</h1>
          <p style={{ fontSize: '20px', color: '#94a3b8' }}>A comprehensive guide to using QuizMaster</p>
        </header>

        {slides.map((slide, index) => (
          <section
            key={index}
            style={{
              marginBottom: '80px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(59,130,246,0.2)',
                color: '#60a5fa',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                Step {index + 1} of {slides.length}
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '12px' }}>{slide.title}</h2>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <img
                src={slide.img}
                alt={slide.title}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                }}
              />
            </div>

            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#cbd5e1',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {slide.description}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Presentation;
