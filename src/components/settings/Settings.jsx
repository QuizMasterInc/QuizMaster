import React from 'react';
import VolumeControl from '../sounds/VolumeControl'; 

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-gray-300">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className=" bg-gray-900 rounded-lg shadow-lg p-6 ">
        <p className="text-lg mb-4">Adjust your settings below:</p>
        <div className="flex items-center">
          <span className="mr-4" ></span>
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
