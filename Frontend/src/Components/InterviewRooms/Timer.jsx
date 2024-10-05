import React, { useState, useEffect } from 'react';
import { useSocket } from '../../Features/useSocket';

const Timer = ({previlige,remoteSocketId}) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputTime, setInputTime] = useState(''); 
  const socket=useSocket();

  const help1=({tm})=>{
    setTime(tm);
  }

  useEffect(()=>{
    socket.on('change:time',help1);
    return ()=>{
      socket.off('change:time',help1);
    }
  },[socket]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(()=>{
    if(previlige)
    {
      socket.emit('time:change',{remoteSocketId,tm:time});
    }
  },[time]);

  const handleStart = () => {
    if (inputTime > 0) {
      setTime(60*inputTime);
      setIsRunning(true);
      setInputTime('');
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setInputTime('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value >= 0) {
      setInputTime(Number(value));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center pb-2 bg-gray-800 rounded-lg text-white">
      <div className="px-4 py-2 bg-black rounded-lg text-4xl font-semibold mb-4">{formatTime(time)}</div>
      {previlige && 
      <>
      <div className="flex space-x-1 ">
        <button onClick={handleStart} className="bg-green-500 text-white py-1 px-2 rounded-lg hover:bg-green-600 transition duration-300">
          Start
        </button>
        <button onClick={handleStop} className="bg-red-500 text-white py-1 px-2 rounded-lg hover:bg-red-600 transition duration-300">
          Stop
        </button>
        <button onClick={handleReset} className="bg-blue-500 text-white py-1 px-2 rounded-lg hover:bg-blue-600 transition duration-300">
          Reset
        </button>
        <input type="number" min="0" value={inputTime} onChange={handleInputChange} placeholder="Mins"
        className="px-2 py-1 w-28 rounded-md border border-gray-600 text-black"/>
      </div>
      </>
      }
    </div>
  );
};

export default Timer;
