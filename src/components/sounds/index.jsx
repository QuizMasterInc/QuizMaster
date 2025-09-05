import React, { useEffect } from "react";
import { useVolumeSettings } from "../../contexts/VolumeContext";

// Sound effect imports organized by type
const SOUND_EFFECTS = {
  passed: [
    () => import("./SoundAssets/SoundEffects/PassedSoundEffects/correct-check.mp3"),
    () => import("./SoundAssets/SoundEffects/PassedSoundEffects/passSound.mp3"),
    () => import("./SoundAssets/SoundEffects/PassedSoundEffects/TA-DA.mp3"),
  ],
  fail: [
    () => import("./SoundAssets/SoundEffects/FailSoundEffects/brassFail.mp3"),
    () => import("./SoundAssets/SoundEffects/FailSoundEffects/NegativeBeeps.mp3"),
    () => import("./SoundAssets/SoundEffects/FailSoundEffects/sadTrombone.mp3"),
  ],
  average: [
    () => import("./SoundAssets/SoundEffects/AverageSoundEffects/correct-answer-sound.mp3"),
    () => import("./SoundAssets/SoundEffects/AverageSoundEffects/ding-effect.mp3"),
    () => import("./SoundAssets/SoundEffects/AverageSoundEffects/levelUp.mp3"),
  ]
};

/**
 * Unified Sound Effect Component
 * Plays random sound effects based on quiz result type
 * 
 * @param {string} type - Sound type: 'passed', 'fail', or 'average'
 * @param {boolean} autoPlay - Whether to play sound automatically (default: true)
 */
export const SoundEffect = ({ type, autoPlay = true }) => {
  const { volume } = useVolumeSettings();

  useEffect(() => {
    if (!autoPlay || !SOUND_EFFECTS[type]) return;

    const playRandomSound = async () => {
      try {
        const soundArray = SOUND_EFFECTS[type];
        const randomIndex = Math.floor(Math.random() * soundArray.length);
        const soundModule = await soundArray[randomIndex]();
        const audio = new Audio(soundModule.default);
        audio.volume = volume / 100;
        audio.play();
      } catch (error) {
        console.error(`Failed to play ${type} sound:`, error);
      }
    };

    playRandomSound();
  }, [type, volume, autoPlay]);

  return null; // This component doesn't render anything visual
};

// Legacy component exports for backward compatibility
export const PassedSound = () => <SoundEffect type="passed" />;
export const FailSound = () => <SoundEffect type="fail" />;
export const AverageSound = () => <SoundEffect type="average" />;

export default SoundEffect;
