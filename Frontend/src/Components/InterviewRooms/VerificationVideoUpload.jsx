import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { uploadVerificationVideoService } from '../../Services/Interview.service.js';

function VerificationVideoUpload() {
  const [searchParams] = useSearchParams();
  const roomId=searchParams.get('roomId');
  const code=searchParams.get('code');
  const requestId=searchParams.get('requestId');
  const videoRef=useRef(null);
  const mediaRecorderRef=useRef(null);
  const streamRef=useRef(null);
  const chunksRef=useRef([]);
  const recordingStartRef=useRef(null);
  const [cameraReady,setCameraReady]=useState(false);
  const [recording,setRecording]=useState(false);
  const [recordedBlob,setRecordedBlob]=useState(null);
  const [duration,setDuration]=useState(0);
  const [uploading,setUploading]=useState(false);
  const [uploaded,setUploaded]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const startCamera=async()=>{
      try {
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:true});
        streamRef.current=stream;
        if(videoRef.current)
        {
          videoRef.current.srcObject=stream;
        }
        setCameraReady(true);
      } catch (cameraError) {
        console.error(cameraError);
        setError('Unable to open camera. Please allow camera and microphone permission.');
      }
    };

    startCamera();

    return ()=>{
      streamRef.current?.getTracks().forEach((track)=>track.stop());
    };
  },[]);

  const startRecording=()=>{
    if(!streamRef.current)return;
    setError('');
    setRecordedBlob(null);
    chunksRef.current=[];
    const recorder=new MediaRecorder(streamRef.current,{mimeType:'video/webm'});
    mediaRecorderRef.current=recorder;
    recordingStartRef.current=Date.now();

    recorder.ondataavailable=(event)=>{
      if(event.data.size>0)
      {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop=()=>{
      const recordedDuration=Math.round((Date.now()-recordingStartRef.current)/1000);
      const blob=new Blob(chunksRef.current,{type:'video/webm'});
      setDuration(recordedDuration);
      setRecordedBlob(blob);
      setRecording(false);
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording=()=>{
    if(mediaRecorderRef.current?.state==='recording')
    {
      mediaRecorderRef.current.stop();
    }
  };

  const uploadVideo=async()=>{
    if(!recordedBlob)return;
    setUploading(true);
    setError('');
    try {
      const file=new File([recordedBlob],`verification-${requestId}.webm`,{type:'video/webm'});
      await uploadVerificationVideoService({roomId,code,requestId,duration,video:file});
      setUploaded(true);
    } catch (uploadError) {
      setError(uploadError.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-5 text-white">
      <div className="mx-auto max-w-xl rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Interview Verification</p>
        <h1 className="mt-1 text-2xl font-extrabold">Record Verification Video</h1>
        <p className="mt-3 text-gray-300">
          Record a short video from your phone showing the laptop screen and this code.
        </p>

        <div className="my-5 rounded-lg border border-yellow-500 bg-yellow-500/10 p-4 text-center">
          <p className="text-sm font-semibold text-yellow-200">Secret Code</p>
          <p className="mt-1 text-4xl font-black tracking-widest text-yellow-300">{code}</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-700 bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="h-80 w-full object-cover" />
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-600/20 p-3 text-sm text-red-200">{error}</p>}
        {uploaded && <p className="mt-4 rounded-lg bg-green-600/20 p-3 text-sm text-green-200">Uploaded. You can return to the laptop now.</p>}

        <div className="mt-5 flex gap-3">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={!cameraReady || uploaded}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-bold text-white disabled:bg-gray-600"
            >
              Record
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-3 font-bold text-gray-950"
            >
              Stop
            </button>
          )}
          <button
            onClick={uploadVideo}
            disabled={!recordedBlob || uploading || uploaded}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:bg-gray-600"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {recordedBlob && (
          <p className="mt-3 text-center text-sm text-gray-400">Recorded length: {duration}s</p>
        )}
      </div>
    </div>
  );
}

export default VerificationVideoUpload;
