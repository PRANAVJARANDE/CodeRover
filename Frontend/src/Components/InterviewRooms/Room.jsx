import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EditorBox from '../Editor/EditorBox.jsx'; 
import { useSocket } from '../../Features/useSocket.js';

function Room() {
  const { roomId } = useParams();
  const [isAudioOn, setAudioOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(true);
  const socket=useSocket();

  useEffect(()=>{

  },[]);



  const toggleAudio = () => {
    setAudioOn(!isAudioOn);
  };

  const toggleVideo = () => {
    setVideoOn(!isVideoOn);
  };

  return (
    <div className="h-screen p-10 bg-gray-900 flex text-white justify-evenly">
        <div className="flex flex-col space-y-6 w-1/5">
            <div className="flex items-center space-x-4">
                <button className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition">
                    Leave
                </button>
                <button className="bg-gray-700 py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition" onClick={toggleAudio}>
                    {isAudioOn ? 'Audio On' : 'Audio Off'}
                </button>
                <button className="bg-gray-700 py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition" onClick={toggleVideo}>
                    {isVideoOn ? 'Video On' : 'Video Off'}
                </button>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Example Cases</h3>
                <div className="bg-gray-700 p-4 h-24 rounded-lg shadow-md">Case 1</div>
                <div className="bg-gray-700 p-4 h-24 rounded-lg shadow-md">Case 2</div>
                <div className="bg-gray-700 p-4 h-24 rounded-lg shadow-md">Case 3</div>
            </div>
        </div>

  <div className="w-3/5 px-6">
    <div className="bg-gray-900 rounded-lg shadow-md relative h-full">
      <EditorBox />
    </div>
  </div>

  <div className="flex flex-col space-y-4 w-1/5 h-full justify-evenly">
    <p className="text-xl font-bold text-center">Room: {roomId}</p>
    <div className="bg-gray-700 p-4 rounded-lg shadow-md flex justify-around">
      <h3 className="text-lg font-semibold">Timer</h3>
        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition">
           Set Timer
        </button>
    </div>
    <div className="bg-gray-700 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Interviewee</h3>
      <div className="bg-gray-800 h-36 rounded-lg mt-2 flex justify-center items-center">Video</div>
    </div>
    <div className="bg-gray-700 p-4 rounded-lg shadow-md ">
      <h3 className="text-lg font-semibold">Interviewer</h3>
      <div className="bg-gray-800 h-36 rounded-lg mt-2 flex justify-center items-center">Video</div>
    </div>
  </div>
</div>

  );
}

export default Room;
