import React, { useEffect, useState } from "react";
import { useVolumeSettings } from "../../contexts/VolumeContext";
import Mozart_Eine_Kleine_Nachtmusik from "./SoundAssets/Mozart-Serenade-in-G-major.mp3";
import Mozart_Sonata from "./SoundAssets/Mozart-Sonata-No-3-In-B-Flat-Major.mp3";
import Mozart_Piano_Concerto from "./SoundAssets/Mozart Piano Concerto n° 1.mp3";

//Future implmentation might involve  serpating the sounds assets for sounds effects and background
//Also instead of importing them indivually a better solsution woudl to jst import them in a single file. 


function BackGroundMusic() {
  const { volume } = useVolumeSettings(); // Access volume state from VolumeContext
  const musicTracks = [
    Mozart_Eine_Kleine_Nachtmusik,
    Mozart_Sonata,
    Mozart_Piano_Concerto,
  ];
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    let audio;

    const playRandomTrack = (previousTrack = null) => {
      let nextTrack;
      do {
        nextTrack = musicTracks[Math.floor(Math.random() * musicTracks.length)];
      } while (nextTrack === previousTrack);

      setCurrentTrack(nextTrack);
      audio = new Audio(nextTrack);
      audio.volume = volume;
      audio.play();

      // Play another random track when this one ends
      audio.onended = () => {
        playRandomTrack(nextTrack);
      };
    };

    // Start playing a random track when the component mounts
    playRandomTrack();

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [volume]); // Re-run effect when volume changes

  return null; // This component does not render any UI
}

export default BackGroundMusic;
