import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
      whileHover={{
        scale: 1.05,
        boxShadow: "0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(56, 189, 248, 0.3)",
      }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className="cursor-pointer bg-[#1b1444] border border-purple-500 rounded-2xl p-6 w-72 shadow-lg transition-all duration-300"
    >
      <div className="text-4xl text-purple-400 mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-wide font-main">{title}</h3>
      <p className="text-sm text-gray-300">{desc}</p>
    </motion.div>
  );
};

export default FeatureCard;
