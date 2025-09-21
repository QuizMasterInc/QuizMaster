import HeroSection from "./HeroSection";
import { FaRocket, FaChartLine, FaPenFancy } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Optimized FeatureCard component using CSS variables
const FeatureCard = ({ icon, title, desc, delay, route, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(isAuthenticated ? route : "/signin");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }} // Simplified hover effect
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="feature-card bg-card border border-accent rounded-2xl p-6 w-72 cursor-pointer transition-all duration-200 shadow-xl"
    >
      <div className="text-4xl mb-4 text-accent">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2 tracking-wide font-main text-primary">
        {title}
      </h3>
      <p className="text-sm text-secondary">
        {desc}
      </p>
    </motion.div>
  );
};

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden font-main bg-primary text-primary">
      <div>
        <HeroSection isAuthenticated={isAuthenticated} />
      </div>

      <motion.section
        initial={{ opacity: 0, rotateX: -10 }}
        whileInView={{ opacity: 1, rotateX: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="py-20 text-center px-4 relative z-10"
      >
        <h2 className="text-4xl font-bold mb-12 font-main text-gradient-primary">
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