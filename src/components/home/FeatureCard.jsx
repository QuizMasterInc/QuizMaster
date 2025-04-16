import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ icon, title, desc, delay, route, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate(route);
    } else {
      navigate("/signin");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      onClick={handleClick}
      className="cursor-pointer bg-gray-800 hover:bg-gray-700 hover:scale-105 transition-all p-6 rounded-xl w-72 text-left shadow-md"
    >
      <div className="text-4xl text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </motion.div>
  );
};

export default FeatureCard;
