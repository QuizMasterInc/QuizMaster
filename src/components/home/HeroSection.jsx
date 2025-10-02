import { motion } from "framer-motion";

const HeroSection = ({ isAuthenticated }) => (
  <section
    className="relative flex items-center justify-center py-32 min-h-[80vh]"
    
  >
    {/* Dark overlay for excellent text contrast */}
    <div 
      className="absolute inset-0" 
      style={{ 
        background: `linear-gradient(135deg, 
          rgba(15, 5, 29, 0.85) 0%, 
          rgba(29, 10, 60, 0.9) 30%, 
          rgba(45, 20, 85, 0.9) 60%, 
          rgba(15, 5, 29, 0.85) 100%)`
      }} 
    />

    {/* Subtle accent overlay for visual interest */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{ 
        background: `radial-gradient(circle at 30% 50%, var(--primary-500), transparent 50%),
                     radial-gradient(circle at 70% 30%, var(--info), transparent 40%)`
      }}
    />

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative z-10 text-center px-6"
    >
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight font-main text-white drop-shadow-2xl">
        Welcome to{" "}
        <span 
          className="bg-clip-text text-transparent drop-shadow-2xl"
          style={{ 
            backgroundImage: `linear-gradient(135deg, var(--primary-300), var(--primary-400))`,
            textShadow: '0 0 40px rgba(168, 85, 247, 0.5)'
          }}
        >
          QuizMaster
        </span>
        !
      </h1>
      <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-main text-gray-100 drop-shadow-lg">
        Create, play, and track your progress — quiz like a pro.
      </p>

      <div className="mt-10 flex justify-center gap-4 flex-wrap">
        {!isAuthenticated ? (
          <>
            <a
              href="/register"
              className="btn-primary px-6 py-3 rounded-lg text-white font-semibold shadow-md"
            >
              Get Started
            </a>
            <a
              href="/signin"
              className="btn-secondary px-6 py-3 rounded-lg text-text-primary font-medium shadow-sm"
            >
              Login
            </a>
          </>
        ) : (
          <a
            href="/dashboard"
            className="btn-primary px-6 py-3 rounded-lg text-white font-semibold shadow-md"
          >
            Go to Dashboard
          </a>
        )}
      </div>
    </motion.div>
  </section>
);

export default HeroSection;
