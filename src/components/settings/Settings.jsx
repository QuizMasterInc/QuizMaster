/*
This is the main settings page , this page renders  all the setting components where user can adjust them to thier liking 
*/
import React from 'react';
import VolumeControl from './SoundEffectsVolumeControl';
import GlobalThresholdInput from './ThresholdInput '; 
import HighContrastToggle from './HighContrastToggle';
import BackGroundMusicControl from './BackGroundMusicControl';

const SettingsPage = () => {
  

  return (
    <div className="container mx-auto px-4 py-8 text-gray-300">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="bg-gray-900 rounded-lg shadow-lg p-6">
        <p className="text-lg mb-4">Adjust your settings below:</p>


        <HighContrastToggle />
        
        <GlobalThresholdInput />
        <VolumeControl />
        <BackGroundMusicControl/>
      </div>
    </div>
  );
};

export default SettingsPage;
