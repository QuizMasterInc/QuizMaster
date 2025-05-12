import React from 'react';
import DarkLightMode from './DarkLightMode';
import HighContrastToggle from './HighContrastToggle';
import BackGroundMusicControl from './BackGroundMusicControl';
import SoundEffectsVolumeControl from './SoundEffectsVolumeControl';
import ThresholdInput from './ThresholdInput';

export default function Settings() {
  const handleThresholdChange = (value) => {
    console.log('Threshold changed to:', value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-md">Settings</h1>
          <p className="text-gray-300 text-lg">Customize your QuizMaster experience</p>
        </div>

        {/* Appearance Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gradient-to-r from-purple-700 to-blue-800 p-6 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-white">Appearance</h2>
            <DarkLightMode />
            <HighContrastToggle />
          </div>

          {/* Music & Sound Section */}
          <div className="bg-gradient-to-r from-blue-800 to-purple-700 p-6 rounded-2xl shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-white">Music & Sound</h2>
            <BackGroundMusicControl />
            <SoundEffectsVolumeControl />
          </div>
        </div>

        {/* Threshold Section */}
        <div className="bg-gradient-to-r from-purple-800 to-blue-800 p-6 rounded-2xl shadow-lg">
          <ThresholdInput initialThreshold={30} onThresholdChange={handleThresholdChange} />
        </div>
        
      </div>
    </div>
  );
}
