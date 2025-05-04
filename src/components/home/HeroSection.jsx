import React from "react";
import { motion } from "framer-motion";
import Bckg5 from "../../assets/background5.png";

const HeroSection = ({ isAuthenticated }) => (
  <section
    className="relative flex items-center justify-center bg-cover bg-center py-32 min-h-[80vh]"
    style={{ backgroundImage: `url(${Bckg5})` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#0f051d] via-[#1b1444] to-[#0f051d] opacity-90" />

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative z-10 text-center px-6"
    >
      <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight font-main">
        Welcome to{" "}
        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          QuizMaster
        </span>
        !
      </h1>
      <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-main">
        Create, play, and track your progress — quiz like a pro.
      </p>

      <div className="mt-10 flex justify-center gap-4 flex-wrap">
        {!isAuthenticated ? (
          <>
            <a
              href="/register"
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:brightness-110 px-6 py-3 rounded-lg text-white font-semibold shadow-md"
            >
              Get Started
            </a>
            <a
              href="/signin"
              className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-medium shadow-sm"
            >
              Login
            </a>
          </>
        ) : (
          <a
            href="/dashboard"
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:brightness-110 px-6 py-3 rounded-lg text-white font-semibold shadow-md"
          >
            Go to Dashboard
          </a>
        )}
      </div>
    </motion.div>
  </section>
);

export default HeroSection;
