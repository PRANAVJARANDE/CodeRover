import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../Features/useSocket.js';
import Editor from '@monaco-editor/react';
import Timer from './Timer.jsx';
import { runExampleCasesService } from '../../Services/CodeRun.service.js';
import Executing from '../Editor/Executing.jsx'
import ExampleCasesOutput from '../Editor/ExampleCasesOutput.jsx';
import { useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player'
import { defaultCodes, enterFullScreen } from './helper.js';
import { toast } from 'react-hot-toast';

function Room() {
  const navigate=useNavigate();
  const [code, setCode] = useState(defaultCodes.cpp);
  const [cases, setCases] = useState([
    { id: 1, input: '', output: '' },
    { id: 2, input: '', output: '' }
  ]);
  
  const { roomId } = useParams();
  const [remoteUser,setremoteUser]=useState(null);
  const [remoteSocketId,setremoteSocketId]=useState(null);
  const [requsername,setrequestusername]=useState(null);
  const [connectionReady,setconnectionReady]=useState(false);
  

  const location = useLocation();
  const extraInfo = location.state;
  const [previlige,setprevilige]=useState(false);
  useEffect(()=>{
      const nonparsedUser = localStorage.getItem('user');
      const user = JSON.parse(nonparsedUser); 
      if(extraInfo && extraInfo._id===user._id)setprevilige(true);
      else if(extraInfo)
      {
          enterFullScreen();
          setremoteSocketId(extraInfo);
          setconnectionReady(true);
      }
  },[remoteSocketId]);

  const socket=useSocket();

  const handleJoinRequest=({user,id,requser_id})=>{
    setrequestusername({user,id,requser_id});
  };

  const acceptrequest=()=>{
    setconnectionReady(true);
    setremoteSocketId(requsername.id);
    setrequestusername(null);
    socket.emit('host:req_accepted',{ta:socket.id,user:requsername.user,room:roomId,id:requsername.id,requser_id:requsername.requser_id});
  }

  const help1=()=>{
    if (mystream) {
      const tracks = mystream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
    }
    setMystream(null);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.log(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
    toast.error('Host Ended call');
    navigate('/join-interview');
  };

  const help2=({msg})=>{
    if (mystream) {
      const tracks = mystream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
    }
    setMystream(null);
    toast.error(msg);
    toast.error("Interviewee left");
    setconnectionReady(false);
    setremoteSocketId(false);
    setMystream(null);
  }

  useEffect(()=>{
    socket.on('user:requested_to_join',handleJoinRequest);
    socket.on('host:hasleft',help1);
    socket.on('interviewee:hasleft',help2);
    return ()=>{
      socket.off('user:requested_to_join',handleJoinRequest);
      socket.off('host:hasleft',help1);
      socket.off('interviewee:hasleft',help2);
    }
  },[socket,handleJoinRequest,help1,help2]);

  const [mystream,setMystream]=useState(null);
  const [isAudioOn,setAudioOn]=useState(true);
  const [isVideoOn,setVideoOn]=useState(true);

  useEffect(() => {
    const getMediaStream = async () => {
      if (connectionReady) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          setMystream(stream);
          setAudioOn(stream.getAudioTracks()[0]?.enabled || false);
          setVideoOn(stream.getVideoTracks()[0]?.enabled || false);
        } catch (error) {
          console.error('Error accessing media devices:', error);
        }
      }
    };
    getMediaStream();
    return () => {
      if (mystream) {
        mystream.getTracks().forEach(track => track.stop());
      }
    };
  },[connectionReady]);

  const toggleAudio = () => {
    if (mystream) {
      const audioTrack = mystream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled; 
        setAudioOn(audioTrack.enabled); 
      }
    }
  };
  
  const toggleVideo = () => {
    if (mystream) {
      const videoTrack = mystream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled; 
        setVideoOn(videoTrack.enabled);
      }
    }
  };
  
  const [language, setLanguage] = useState('cpp');
  const handleLanguageChange = async (newLanguage) => {
      setLanguage(newLanguage);
      setCode(defaultCodes[newLanguage]);
      await updatedefaultlangService(newLanguage);
  };

  const [theme, setTheme] = useState('vs-dark');
  const handleThemeChange = (newTheme) => {
      setTheme(newTheme);
  };

  const handleInputChange = (index, field, value) => {
    if(!previlige)return;
    const newCases = [...cases];
    newCases[index][field] = value;
    setCases(newCases);
  };

  const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
  const [executing, setExecuting] = useState(false);
  const clickRun = async() => {
        setExampleCasesExecution(null);
        setExecuting(true);
        const response = await runExampleCasesService(language, code, cases);
        if (response) {
            setExampleCasesExecution(response);
        }
        setExecuting(false);
  };
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); 
      })
      .catch(() => {
        setCopySuccess(false);
      });
  };

  const exitroom=({msg})=>{
    if (mystream) {
      const tracks = mystream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
    }
    setMystream(null);
    if(previlige)
    {
      socket.emit('host:leave',{remoteSocketId,room:roomId});
      navigate('/host-interview');
    }
    else 
    {
      if(!msg)msg="Interviewee left";
      socket.emit('interviewee:leave',{remoteSocketId,room:roomId,msg});
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.log(`Error attempting to exit full-screen mode: ${err.message}`);
        });
      }
      navigate('/join-interview');
    }
    
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !previlige) {
        exitroom({msg:"Tried to exit Fullscreen"});
        toast.error("Tried to exit Fullscreen");
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !previlige) {
          exitroom({ msg: "Tab switching found" });
          toast.error("Tab switching found");
      }
  };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });

  return (
    <div className="h-screen p-6 bg-gray-800 flex text-white justify-evenly">
      <div className='bg-gray-900 p-6 rounded-lg w-1/4 flex flex-col'>
        <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-evenly space-x-4">
          <button className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition" onClick={exitroom}>
            <img className="h-6 w-6" src={'/endcall.png'} alt="end call" />
          </button>
          <button className={`py-2 px-4 rounded-lg shadow-md transition ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`} onClick={toggleAudio}>
              <img className="h-6 w-6" src={isAudioOn ? '/micon.png' : '/micoff.png'} alt="Microphone" />
          </button>
          <button className={`py-2 px-4 rounded-lg shadow-md transition ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`} onClick={toggleVideo}>
              <img className="h-6 w-6" src={isVideoOn ? '/camera-on.png' : '/camera-off.png'} alt="Camera" />
          </button>
        </div>

        <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-300 text-center">Test Cases</h3>
            {executing ? <Executing text={"Executing"}/> :
            <>
              {exampleCasesExecution ? 
              <>
                <div className='bg-gray-700 rounded-lg p-2'>
                  <ExampleCasesOutput exampleCasesExecution={exampleCasesExecution}/>
                </div>
              </>: 
              <>{cases.map((exampleCase, index) => (
            <div key={exampleCase.id} className="bg-gray-700 p-4 rounded-lg shadow-md space-y-2">
              <div>
                <label className="pb-1 block text-sm font-medium text-gray-300">Input</label>
                <input
                  type="text"
                  value={exampleCase.input}
                  onChange={(e) => handleInputChange(index, 'input', e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
                />
              </div>
              <div>
                <label className="pb-1 block text-sm font-medium text-gray-300">Expected Output</label>
                <input
                  type="text"
                  value={exampleCase.output}
                  onChange={(e) => handleInputChange(index, 'output', e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
                />
              </div>
            </div>
          ))}</>
            }
          </>
          }
          <div className="bg-gray-800 p-2 rounded-lg shadow-lg">
            <Timer previlige={previlige} />
          </div>
        </div>
      </div>
      </div>

      <div className="px-6 bg-gray-900 mx-8 rounded-lg p-8 w-1/2">
        <div className="bg-gray-900 rounded-lg shadow-md relative h-full">
        <div>
          <div className="flex justify-between items-center bg-gray-900 border-b-2 border-gray-700 pb-4">
            <div className="flex space-x-4 ">
            <button onClick={clickRun} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
              Run
            </button>
          </div>
          <div className="flex space-x-4 items-center  rounded-t-lg">
            <select onChange={(e) => handleLanguageChange(e.target.value)}value={language}
                className="p-1 text-white bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-500"
            >
              <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
              </select>

              <select
                  onChange={(e) => handleThemeChange(e.target.value)}
                  value={theme}
                  className="p-1 text-white bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-500"
              >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="hc-black">High Contrast</option>
              </select>
          </div>
        </div>
        <div className="p-5 bg-gray-800 rounded-lg shadow-lg my-4">
          <Editor height="63vh" width="100%"
              language={language}
              value={code}
              theme={theme}
              onChange={(e) => setCode(e)}
              options={{fontSize: 16,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: "on",
                        }}
              className="rounded-lg overflow-hidden border border-gray-700"/>
          </div>
          </div>
          </div>
      </div>
    
      <div className='w-1/4 h-full bg-gray-900 p-6 rounded-lg'>
  {connectionReady ? (
    <>
      <div className="bg-gray-800 h-full p-4 w-full rounded-lg shadow-md flex flex-col justify-evenly items-center space-y-6">
    
        <div className="w-full bg-gray-900 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 text-white text-center">Interviewee</h3>
          <div className="bg-gray-900 h-48 w-full rounded-lg flex justify-center items-center text-white shadow-inner border border-gray-700">
            <p className="text-gray-400">Video</p>
          </div>
        </div>

        <div className="w-full bg-gray-900 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 text-white text-center">You</h3>
          <ReactPlayer muted={!isAudioOn} height="0%" width="0%" url={mystream}/>
          <div className="bg-gray-900 h-48 w-full rounded-lg flex justify-center items-center text-white shadow-inner border border-gray-700">
            {isVideoOn ? (
              <ReactPlayer 
                playing={isVideoOn} 
                muted={!isAudioOn}
                height="100%" 
                width="100%" 
                url={mystream}
                className="rounded-lg"
              />
            ) : (
              <p className="text-gray-400">Video Off</p>
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className='bg-green-600 mb-6 p-2 rounded-xl flex justify-between items-center'>
            <p className="text-3xl font-bold text-center">Room: {roomId}</p>
            {copySuccess? <>
              <p className="text-lg text-white text-center">Copied!</p>
            </>:
            <button onClick={handleCopy} className="bg-white text-white px-3 py-1 rounded-lg ml-4 hover:bg-blue-200 transition-all">
              <img className='w-6' src='/copy.png'/>
            </button>
            }
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
        <p className="text-lg font-semibold mb-4">Join Requests</p>
        {requsername ? (
          <div className="flex items-evenly items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
            <img className='h-8 w-8' src={requsername.user.avatar}/>
            <p className="text-gray-300">{requsername.user.fullname}</p>
            <button 
              onClick={acceptrequest} 
              className="px-2 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
            >
              Accept
            </button>
          </div>
        ) : (
          <p className="text-gray-400">No requests yet.</p>
        )}
      </div>
    </>
  )}
</div>

</div>

  );
}

export default Room;
