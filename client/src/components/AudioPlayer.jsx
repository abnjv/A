import React, { useEffect, useRef } from 'react';

const AudioPlayer = ({ peer }) => {
  const audioRef = useRef();

  useEffect(() => {
    peer.on('stream', (stream) => {
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }
    });
  }, [peer]);

  return <audio ref={audioRef} autoPlay />;
};

export default AudioPlayer;
