import React, { useEffect } from "react";
import { useVolume } from "../../contexts/VolumeContext";
import sound1 from "./SoundAssets/correct-check.mp3"; // Import the audio file
import sound2 from "./SoundAssets/ding-effect.mp3"; // Import the audio file
import sound3 from "./SoundAssets/correct-answer-sound.mp3"; // Import the audio file


function App() {
  const { volume } = useVolume(); // Access volume state from VolumeContext

  useEffect(() => {
    const sounds = [sound1, sound2, sound3];
    const randomNumber = Math.floor(Math.random() * 3);
    const sound = sounds[randomNumber];
    const audio = new Audio(sound);
    
    // Adjust volume before playing the audio
    audio.volume = volume;

    audio.play();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [volume]); // Re-run effect when volume changes
}

export default App;