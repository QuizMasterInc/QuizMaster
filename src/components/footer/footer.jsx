import React from 'react';

const Footer = () => {
  const footerClasses = 'text-white text-center box-border w-full fixed bottom-0 left-0 right-0 p-2 bg-gray-900';

  return (
    <footer className={footerClasses}>
      <p>QuizMaster. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
