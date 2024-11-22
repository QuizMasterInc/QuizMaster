import React, { useEffect } from "react";
import { useVolumeSettings } from "../../contexts/VolumeContext";

// Import each audio file individually
import MozartPianoConcerto1 from "./SoundAssets/BackGroundMusic/Mozart_Piano_Concerto_No_1.mp3";
import MozartSonataNo3 from "./SoundAssets/BackGroundMusic/Mozart-Sonata-No-3-In-B-Flat-Major.mp3";
import MozartSerenadeG from "./SoundAssets/BackGroundMusic/Mozart-Serenade-in-G-major.mp3";

// Add the imported files to an array
const musicTracks = [MozartPianoConcerto1, MozartSonataNo3, MozartSerenadeG];

function BackGroundMusic() {
  const { backgroundMusicVolume } = useVolumeSettings(); // Access volume state from VolumeContext

  useEffect(() => {
    const audio = new Audio();
    let currentTrack = null;

    // Function to play a random track
    const playRandomTrack = () => {
      let nextTrack;
      do {
        nextTrack = musicTracks[Math.floor(Math.random() * musicTracks.length)];
      } while (nextTrack === currentTrack);

      currentTrack = nextTrack;
      audio.src = nextTrack;
      audio.volume = backgroundMusicVolume;
      audio.play();

      // Play another random track when this one ends
      audio.onended = playRandomTrack;
    };

    playRandomTrack();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [backgroundMusicVolume]);

  return null; // This component does not render any UI
}

export default BackGroundMusic;
