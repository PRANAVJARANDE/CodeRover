import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

export const useLocalMedia = () => {
  const mystreamRef = useRef(null);
  const mediaRequestRef = useRef(null);
  const [mystream, setMystream] = useState(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [isAudioOn, setAudioOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(true);

  const ensureLocalStream = useCallback(async () => {
    if (mystreamRef.current) return mystreamRef.current;
    if (mediaRequestRef.current) return mediaRequestRef.current;

    mediaRequestRef.current = (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        mystreamRef.current = stream;
        setMystream(stream);
        setMediaReady(true);
        return stream;
      } catch (error) {
        console.error("Unable to access camera/microphone", error);

        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          mystreamRef.current = audioOnlyStream;
          setMystream(audioOnlyStream);
          setMediaReady(true);
          setVideoOn(false);
          toast.error("Camera is busy, joining with microphone only");
          return audioOnlyStream;
        } catch (audioError) {
          console.error("Unable to access microphone", audioError);
          toast.error("Please close other apps using camera/mic, then rejoin the call");
          setAudioOn(false);
          setVideoOn(false);
          setMediaReady(true);
          return null;
        }
      } finally {
        mediaRequestRef.current = null;
      }
    })();

    return mediaRequestRef.current;
  }, []);

  const stopLocalStream = useCallback(() => {
    if (mystreamRef.current) {
      mystreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    mystreamRef.current = null;
    mediaRequestRef.current = null;
    setMystream(null);
    setMediaReady(false);
  }, []);

  return {
    mystream,
    mystreamRef,
    mediaReady,
    isAudioOn,
    setAudioOn,
    isVideoOn,
    setVideoOn,
    ensureLocalStream,
    stopLocalStream,
  };
};
