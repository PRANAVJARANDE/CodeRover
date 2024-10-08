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
import peer from '../../Services/peer.js';

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
  const [requsername,setrequestusername]=useState([]);
  const [connectionReady,setconnectionReady]=useState(false);
  
  
  const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
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
    setrequestusername((prev) => {
      return [...prev, { user, id, requser_id }];
    });
  };

  const acceptrequest=(index)=>{
    setconnectionReady(true);
    setremoteUser(requsername[index].user);
    setremoteSocketId(requsername[index].id);
    setrequestusername([]);
    socket.emit('host:req_accepted',{ta:socket.id,user:requsername[index].user,room:roomId,id:requsername[index].id,requser_id:requsername[index].requser_id});
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

  const help3=({code})=>{
    setCode(code);
  }

  const help4=({language})=>{
    setLanguage(language);
    setCode(defaultCodes[language]);
  }

  const help5=({cases})=>{
    setCases(cases);
  }

  const help6=({exampleCasesExecution})=>{
    setExampleCasesExecution(exampleCasesExecution);
  }
  const [remoteStream,setRemoteStream]=useState(null);
  useEffect(()=>{
    peer.peer.addEventListener('track',async (ev) =>{
      const stream=ev.streams;
      console.log("Got tracks")
      setRemoteStream(stream[0]);
    })
  },[])

  const handleNegotiation=async()=>{
    const offer=await peer.createOffer();
    socket.emit('peer:nego:needed',{offer,to:remoteSocketId});
  }

  useEffect(()=>{
    peer.peer.addEventListener('negotiationneeded',handleNegotiation);
    return ()=>{
      peer.peer.removeEventListener('negotiationneeded',handleNegotiation);
    }
  },[handleNegotiation])

  const handleIncommingCall=async({from,offer})=>{
    const answer=await peer.handleOffer(offer);
    if(!remoteSocketId)
    {
      setremoteSocketId(from);
    }
    if(!mystream)
    {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMystream(stream);
    }
    socket.emit('call:accepted',{to:from,answer});
  }

  const handleCallAccepted=async({from,answer})=>{
    peer.setLocalDescription(answer);
    if (mystream) {
      const tracks = mystream.getTracks();
      tracks.forEach(track => {
        peer.peer.addTrack(track,mystream);
      });
    }
  }

  const handleNegotiationIncomming=async({from,offer})=>{
    const ans=await peer.handleOffer(offer);
    socket.emit('peer:nego:done',{to:from,ans}); 
  }
  
  const handleFinalNego=async({ans})=>{
    await peer.setLocalDescription(ans)
  }

  useEffect(()=>{
    socket.on('user:requested_to_join',handleJoinRequest);
    socket.on('host:hasleft',help1);
    socket.on('interviewee:hasleft',help2);
    socket.on('change:code',help3);
    socket.on('change:language',help4);
    socket.on('change:cases',help5);
    socket.on('run:code',help6);
    socket.on('incomming:call',handleIncommingCall);
    socket.on('call:accepted',handleCallAccepted);
    socket.on('peer:nego:needed',handleNegotiationIncomming);
    socket.on('peer:nego:final',handleFinalNego);
    return ()=>{
      socket.off('user:requested_to_join',handleJoinRequest);
      socket.off('host:hasleft',help1);
      socket.off('interviewee:hasleft',help2);
      socket.off('change:code',help3);
      socket.off('change:language',help4);
      socket.off('change:cases',help5);
      socket.off('run:code',help6);
      socket.off('incomming:call',handleIncommingCall);
      socket.off('call:accepted',handleCallAccepted);
      socket.off('peer:nego:needed',handleNegotiationIncomming);
      socket.off('peer:nego:final',handleFinalNego);
    }
  },[socket,handleJoinRequest,help1,help2,help3,help4,help5,help6,handleIncommingCall,handleCallAccepted,handleNegotiationIncomming,handleFinalNego]);

  const [mystream,setMystream]=useState(null);
  const [isAudioOn,setAudioOn]=useState(true);
  const [isVideoOn,setVideoOn]=useState(true);

  useEffect(() => {
    const getMediaStream = async () => {
      if (connectionReady) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          if (mystream) {
            const tracks = mystream.getTracks();
            tracks.forEach(track => {
              peer.peer.addTrack(track,mystream);
            });
          }
          const offer=await peer.createOffer();
          socket.emit("user:call",{remoteSocketId,offer});
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
      socket.emit('language:change',{remoteSocketId,language:newLanguage});
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
    socket.emit('cases:change',{remoteSocketId,cases:newCases});
  };

  const [executing, setExecuting] = useState(false);
  const clickRun = async() => {
        setExampleCasesExecution(null);
        setExecuting(true);
        const response = await runExampleCasesService(language, code, cases);
        if (response) {
            setExampleCasesExecution(response);
        }
        if(!previlige)
        {
          socket.emit('code:run',{remoteSocketId,exampleCasesExecution:response});
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

  const changecode=(e)=>{
    setCode(e);
    socket.emit('code:change',{remoteSocketId,code:e});
  }

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
                <button className='px-2 py-1 rounded-lg bg-blue-600 text-white' onClick={()=>{
                  setExampleCasesExecution(null);
                }}>Reset Testcases</button>
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
            <Timer previlige={previlige} remoteSocketId={remoteSocketId}/>
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
              onChange={(e) => {changecode(e)}}
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
          <h3 className="text-xl font-semibold mb-3 text-white text-center">{remoteUser? remoteUser.fullname : 'Interviewer'}</h3>
          <div className="bg-gray-900 h-48 w-full rounded-lg flex justify-center items-center text-white shadow-inner border border-gray-700">
            {remoteStream ? (
              <video
                ref={videoRef => {
                  if (videoRef && remoteStream) {
                    videoRef.srcObject = remoteStream;
                    videoRef.muted = false;
                  }
                }}
                autoPlay
                playsInline
                className="rounded-lg h-full w-full"
              />
              ) : (
                <p className="text-gray-400">Video Off</p>
              )}
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
        {requsername.length ? (
          <>
          {requsername.map((x,index)=>(
            <div key={index} className="flex items-evenly items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
              <img className='h-10 w-10 rounded-full border-gray-50 border-2' src={x.user.avatar}/>
              <p className="text-gray-300">{x.user.fullname}</p>
              <button 
                onClick={()=>{acceptrequest(index)}} 
                className="px-2 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
              >
                Accept
              </button>
            </div>
          ))}
          </>
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
