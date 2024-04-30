import React, { useEffect } from "react";
import sound1 from "./SoundAssets/TA-DA.mp3"; // Import the audio file
import sound2 from "./SoundAssets/levelUp.mp3";
import sound3 from "./SoundAssets/passSound.mp3";


function App() {
  useEffect(() => {
    const sounds = [sound1, sound2, sound3]
    const randomNumber = Math.floor(Math.random() * 3) //Gets a random number from 1-3 to pick from the sounds list
    const sound = sounds[randomNumber] //creates the sound of the random number
    const audio = new Audio(sound); //creates the sound
    audio.play();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

}

export default App;
