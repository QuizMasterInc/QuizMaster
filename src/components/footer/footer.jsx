import React from 'react';

/**
 * Non‑sticky footer for QuizMaster.
 * ‑ Renders at the bottom of the page after all content.
 * ‑ Uses Tailwind for full‑width layout and dark background.
 */
const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-white text-center p-4">
      <p>© {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
