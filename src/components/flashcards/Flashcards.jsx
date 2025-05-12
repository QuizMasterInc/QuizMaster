import React, { useState } from 'react';
import DeckManager from './DeckManager';

export default function Flashcards() {
  return (
    <div className="relative min-h-screen text-white py-16 px-4 md:px-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml,...')] bg-[#14002e] bg-repeat bg-[length:100px_100px]" />
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-500 blur-[140px] opacity-30 rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-pink-500 blur-[140px] opacity-30 rounded-full z-0" />

      {/* Foreground */}
      <div className="relative z-10">
        <DeckManager />
      </div>
    </div>
  );
}
