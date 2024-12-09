import React, { useEffect } from "react";
import { useVolumeSettings } from "../../contexts/VolumeContext";

// Import each sound effect individually
import SoundEffect1 from "./SoundAssets/SoundEffects/FailSoundEffects/brassFail.mp3"; 
import SoundEffect2 from "./SoundAssets/SoundEffects/FailSoundEffects/NegativeBeeps.mp3";
import SoundEffect3 from "./SoundAssets/SoundEffects/FailSoundEffects/sadTrombone.mp3";

// Add the imported files to an array
const soundEffects = [SoundEffect1, SoundEffect2, SoundEffect3];

function App() {
  const { volume } = useVolumeSettings(); // Access volume state from VolumeContext

  useEffect(() => {
    const playRandomSound = () => {
      const randomIndex = Math.floor(Math.random() * soundEffects.length);
      const selectedSound = soundEffects[randomIndex];
      const audio = new Audio(selectedSound);

      // Adjust volume before playing the audio
      audio.volume = volume;
      audio.play();

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    };

    const cleanup = playRandomSound();

    // Cleanup when the component unmounts
    return cleanup;
  }, [volume]); // Re-run effect when volume changes

  return null; // This component does not render any UI
}

export default App;
