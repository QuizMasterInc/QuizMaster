import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#333',
    color: 'white',
    textAlign: 'center',
    padding: '10px',
    position: 'fixed',
    bottom: '0',
    left: '0', // Align with the left side of the viewport
    right: '0', // Align with the right side of the viewport
    boxSizing: 'border-box',
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; QuizMaster. All rights reserved.</p>
    </footer>
  );
};

export default Footer;