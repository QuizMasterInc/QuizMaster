/**
 * Shared UI components for consistent design across the app
 */
import React from 'react';
import { Link } from 'react-router-dom';

// Reusable Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 shadow-lg hover:shadow-pink-500/40 focus:ring-pink-500',
    secondary: 'bg-gray-800 text-gray-300 hover:bg-gray-600 hover:text-white focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  return (
    <button 
      className={classes} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Reusable Back Button Component
export const BackButton = ({ 
  to, 
  children = 'Back', 
}) => {
  return (
    <div>
      <Link to={to} className='inline-block px-8 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent'>
        {children}
      </Link>
    </div>
  );
};

// Reusable Card Component
export const Card = ({ 
  children, 
  className = '', 
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-lg';
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-200' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Reusable Footer Component
export const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-[#1a0533] via-[#220b47] to-[#100222] text-center py-4 text-sm text-gray-300 mt-auto border-t border-purple-800 shadow-inner z-50">
      <p className="font-medium tracking-wide text-gray-400">
        © 2025 <span className="text-purple-400 font-semibold">QuizMaster</span>. All rights reserved.
      </p>
    </footer>
  );
  
};