import React from "react";
import { motion } from "framer-motion";
import Bckg5 from "../../assets/background5.png";

const HeroSection = ({ isAuthenticated }) => (
  <section
    className="relative flex items-center justify-center bg-cover bg-center py-28"
    style={{ backgroundImage: `url(${Bckg5})` }}
  >
    <div className="absolute inset-0 bg-black bg-opacity-60" />
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative z-10 text-center px-6"
    >
      <h1 className="text-6xl font-extrabold text-white drop-shadow-lg">
        Welcome to <span className="text-blue-400">QuizMaster</span>!
      </h1>
      <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
        Create, play, and track your progress. Quiz like a pro.
      </p>
      <div className="mt-8 space-x-4">
        {!isAuthenticated ? (
          <>
            <a href="/register" className="bg-blue-500 hover:scale-105 transition px-6 py-3 rounded-md font-semibold text-white shadow-lg">
              Get Started
            </a>
            <a href="/signin" className="bg-gray-700 hover:scale-105 transition px-6 py-3 rounded-md text-white">
              Login
            </a>
          </>
        ) : (
          <a href="/dashboard" className="bg-blue-500 hover:scale-105 transition px-6 py-3 rounded-md text-white">
            Go to Dashboard
          </a>
        )}
      </div>
    </motion.div>
  </section>
);

export default HeroSection;
