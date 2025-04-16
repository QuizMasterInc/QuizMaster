import React from "react";
import HeroSection from "./HeroSection";
import FeatureCard from "./FeatureCard";
import { FaRocket, FaChartLine, FaPenFancy } from "react-icons/fa";

function Home() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  return (
    <div className="bg-black text-gray-300 min-h-screen">
      <HeroSection isAuthenticated={isAuthenticated} />

      {/* Feature Cards Section */}
      <section className="py-20 bg-gradient-to-t from-black to-gray-900 text-center">
        <h2 className="text-4xl font-bold text-white mb-12">What can you do?</h2>
        <div className="flex flex-wrap justify-center gap-10 px-4">
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
      </section>
    </div>
  );
}

export default Home;
