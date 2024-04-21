import React, { useEffect } from "react";
import sound from "./SoundAssets/TA-DA.mp3"; // Import the audio file

function App() {
  useEffect(() => {
    const audio = new Audio(sound);
    audio.play();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

}

export default App;
