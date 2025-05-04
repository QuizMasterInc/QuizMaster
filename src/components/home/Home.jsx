import React, { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import FeatureCard from "./FeatureCard";
import { FaRocket, FaChartLine, FaPenFancy } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";

function Home() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const { scrollY } = useScroll();

  // Parallax on Hero Text
  const parallaxY = useTransform(scrollY, [0, 300], [0, -40]);
  const parallaxOpacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  return (
    <div className="relative bg-[#0c0121] text-white font-main min-h-screen overflow-x-hidden">
      {/* Glow Background Blobs */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-purple-500 rounded-full opacity-20 blur-[100px] -top-20 -left-40 z-0"
        animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] bg-blue-400 rounded-full opacity-20 blur-[100px] bottom-[-100px] right-[-100px] z-0"
        animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />

      {/* Hero Section with Parallax */}
      <motion.div style={{ y: parallaxY, opacity: parallaxOpacity }}>
        <HeroSection isAuthenticated={isAuthenticated} />
      </motion.div>

      {/* Animated Feature Section */}
      <motion.section
        initial={{ opacity: 0, rotateX: -10 }}
        whileInView={{ opacity: 1, rotateX: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="py-20 text-center px-4 relative z-10"
      >
        <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-main">
          What can you do?
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          <FeatureCard
            icon={<FaRocket />}
            title="Take Quizzes"
            desc="Test your knowledge!"
            delay={0.1}
            route="/typeofquiz"
            isAuthenticated={isAuthenticated}
          />
          <FeatureCard
            icon={<FaChartLine />}
            title="Track Progress"
            desc="Visualize your performance."
            delay={0.2}
            route="/dashboard"
            isAuthenticated={isAuthenticated}
          />
          <FeatureCard
            icon={<FaPenFancy />}
            title="Create Quizzes"
            desc="Craft your own challenges."
            delay={0.3}
            route="/customquiz"
            isAuthenticated={isAuthenticated}
          />
        </div>
      </motion.section>
    </div>
  );
}

export default Home;
