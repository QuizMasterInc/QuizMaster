import React, { useEffect } from "react";
import { useVolumeSettings } from "../../contexts/VolumeContext";

// Import each audio file individually
import ChillMusic from "./SoundAssets/BackGroundMusic/chill-music.mp3";
import Lofi from "./SoundAssets/BackGroundMusic/lofi.mp3";
import DeepElectronic from "./SoundAssets/BackGroundMusic/deep-electronic.mp3";
import DebussyClairDeLune from './SoundAssets/BackGroundMusic/Debussy - Clair de Lune.mp3';
import BeethovenFurElise from './SoundAssets/BackGroundMusic/Beethoven-Fur-Elise.mp3';
import Funk2Min from "./SoundAssets/BackGroundMusic/funk-2-min.mp3";


// Add the imported files to an array
const musicTracks = [ChillMusic, Lofi, DeepElectronic, DebussyClairDeLune, BeethovenFurElise, Funk2Min, StraightAhead];


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
