import React, { useState, useEffect } from 'react';

const BackGroundMusicControl = () => {
  const [selectedTrack, setSelectedTrack] = useState('');
  const [audio, setAudio] = useState(null);
  const [trackList, setTrackList] = useState([
    'lofi1.mp3',
    'lofi2.mp3',
    'studybeat1.mp3',
    'ambientloop.mp3',
    'jazzyvibes.mp3',
    'focuswave.mp3',
    'calmrain.mp3',
    'Straight-Ahead.mp3',
  ]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const handleTrackChange = (e) => {
    const selected = e.target.value;
    setSelectedTrack(selected);

    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(`/music/${selected}`);
    newAudio.loop = true;
    newAudio.play();
    setAudio(newAudio);
  };

  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-purple-800 to-blue-800 shadow-lg text-white space-y-4">
      <h3 className="text-xl font-bold">Background Music</h3>
      <p className="text-sm text-gray-300">
        Select a track to play in the background while you're taking a quiz.
      </p>
      <select
        value={selectedTrack}
        onChange={handleTrackChange}
        className="bg-gray-900 border border-purple-500 text-white px-4 py-2 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="" disabled>
          Choose music
        </option>
        {trackList.map((track, index) => (
          <option key={index} value={track}>
            {track.replace('.mp3', '').replace(/([a-z])([A-Z])/g, '$1 $2')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BackGroundMusicControl;
