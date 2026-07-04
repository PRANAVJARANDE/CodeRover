/* eslint-disable react/prop-types */
import { memo, useEffect, useRef } from 'react';

const StreamVideo = memo(function StreamVideo({ stream, muted = false, className = "" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.srcObject !== stream) {
      videoElement.srcObject = stream || null;
    }
  }, [stream]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
});

export default StreamVideo;
