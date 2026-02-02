import HeroSection from "./HeroSection";
import RecentActivity from './RecentActivity';
import { FaRocket, FaChartLine, FaPenFancy } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

// Optimized FeatureCard component using CSS animations
const FeatureCard = ({ icon, title, desc, delayClass, route, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(isAuthenticated ? route : "/signin");
  };

  return (
    <div
      onClick={handleClick}
      className={`feature-card bg-card border border-accent rounded-2xl p-6 w-72 cursor-pointer animate-hover-scale animate-tap-scale shadow-xl ${delayClass}`}
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
    </div>
  );
};

function Home() {
  const { isAuthenticated } = useAuth();
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden font-main bg-primary text-primary">
      <div>
        <HeroSection isAuthenticated={isAuthenticated} />
      </div>

      <RecentActivity limit={6} />

      <section ref={sectionRef} className="py-20 text-center px-4 relative z-10 animate-on-scroll">
        <h2 className="text-4xl font-bold mb-12 font-main text-gradient-primary">
          What can you do?
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          <FeatureCard
            icon={<FaRocket />}
            title="Take Quizzes"
            desc="Test your knowledge!"
            delayClass="animate-fade-in-up-delay-100"
            route="/typeofquiz"
            isAuthenticated={isAuthenticated}
          />
          <FeatureCard
            icon={<FaChartLine />}
            title="Track Progress"
            desc="Visualize your performance."
            delayClass="animate-fade-in-up-delay-200"
            route="/dashboard"
            isAuthenticated={isAuthenticated}
          />
          <FeatureCard
            icon={<FaPenFancy />}
            title="Create Quizzes"
            desc="Craft your own challenges."
            delayClass="animate-fade-in-up-delay-300"
            route="/customquiz"
            isAuthenticated={isAuthenticated}
          />
        </div>
      </section>
    </div>
  );
}

export default Home;
