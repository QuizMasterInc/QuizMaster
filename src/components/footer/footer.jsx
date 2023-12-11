import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const footerStyle = {
    //backgroundColor: '#333', look nicer
    color: 'white',
    textAlign: 'center',
    padding: '10px',
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    boxSizing: 'border-box',
  };

  const [showFooter, setShowFooter] = useState(false);
  const navigate = useNavigate();

  const handleScroll = () => {
    // Calculate the scroll position
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    // Calculate the height of the entire content
    const contentHeight = document.documentElement.scrollHeight;

    // Calculate the height of the viewport
    const windowHeight = window.innerHeight;

    // Set the state to show/hide the footer based on the scroll position
    setShowFooter(scrollY + windowHeight >= contentHeight);
  };

  useLayoutEffect(() => {
    // Check on component mount
    handleScroll();

    // Attach the event listener to the scroll event
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  useEffect(() => {
    // Check on route change
    handleScroll();

    // Clean up any existing state
    return () => {
      setShowFooter(false);
    };
  }, [navigate]); // Run the effect whenever the route changes

  return (
    <div class="z-1">
      {showFooter && (
        <footer style={footerStyle}>
          <p>&copy; QuizMaster. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
};

export default Footer;
