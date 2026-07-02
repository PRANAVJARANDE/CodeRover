import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../Features/useSocket.js';
import Editor from '@monaco-editor/react';
import Timer from './Timer.jsx';
import { runExampleCasesService } from '../../Services/CodeRun.service.js';
import Executing from '../Editor/Executing.jsx'
import ExampleCasesOutput from '../Editor/ExampleCasesOutput.jsx';
import { useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player'
import { defaultCodes } from './helper.js';
import { toast } from 'react-hot-toast';
import peer from '../../Services/peer.js';
import Loading from '../Loading/Loading.jsx';
import { getInterviewByRoomIdService, updateInterviewRoomStateService } from '../../Services/Interview.service.js';
import { getPreJoinEnvironmentCheck } from '../../Services/Proctor.service.js';

function Room() {
  const navigate=useNavigate();
  const [question,setquestion]=useState("");
  const [code, setCode] = useState(defaultCodes.cpp);
  const [language, setLanguage] = useState('cpp');
  const [cases, setCases] = useState([
    { id: 1, input: '', output: '' },
    { id: 2, input: '', output: '' }
  ]);

  
  
  const { roomId } = useParams();
  const [remoteUser,setremoteUser]=useState(null);
  const [remoteSocketId,setremoteSocketId]=useState(null);
  const remoteSocketIdRef=useRef(null);
  const mystreamRef=useRef(null);
  const mediaRequestRef=useRef(null);
  const callStartedRef=useRef(false);
  const handlingRemoteOfferRef=useRef(false);
  const makingOfferRef=useRef(false);
  const incomingScreenShareRef=useRef(false);
  const screenStreamRef=useRef(null);
  const [requsername,setrequestusername]=useState([]);
  const [connectionReady,setconnectionReady]=useState(false);
  const [mystream,setMystream]=useState(null);
  const [mediaReady,setMediaReady]=useState(false);
  const [isAudioOn,setAudioOn]=useState(true);
  const [isVideoOn,setVideoOn]=useState(true);
  const [remoteMediaStatus,setRemoteMediaStatus]=useState({audioOn:true,videoOn:true});
  const [roomStateLoaded,setRoomStateLoaded]=useState(false);
  const [screenStream,setScreenStream]=useState(null);
  const [remoteScreenStream,setRemoteScreenStream]=useState(null);
  const [remoteScreenAvailable,setRemoteScreenAvailable]=useState(false);
  const [showRemoteScreen,setShowRemoteScreen]=useState(false);
  
  
  const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
  const location = useLocation();
  const extraInfo = location.state;
  const proctorCheckRef=useRef(extraInfo?.proctorCheck || null);
  const verificationVideoRef=useRef(extraInfo?.verificationVideo || null);
  const [roomParticipantRole,setRoomParticipantRole]=useState(extraInfo?.role || null);
  const [previlige,setprevilige]=useState(false);
  const socket=useSocket();
  const [peerVersion,setPeerVersion]=useState(0);
  const redirectingAfterRefresh=useRef(
    location.key === 'default' &&
    typeof performance !== 'undefined' &&
    performance.getEntriesByType?.('navigation')?.[0]?.type === 'reload'
  ).current;

  const resetPeerConnection=useCallback(()=>{
    peer.resetPeer();
    setPeerVersion((version)=>version+1);
  },[]);

  const updateRemoteSocketId=useCallback((id)=>{
    remoteSocketIdRef.current=id;
    setremoteSocketId(id);
  },[]);

  const ensureLocalStream=useCallback(async()=>{
    if(mystreamRef.current)return mystreamRef.current;
    if(mediaRequestRef.current)return mediaRequestRef.current;

    mediaRequestRef.current=(async()=>{
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        mystreamRef.current=stream;
        setMystream(stream);
        setMediaReady(true);
        return stream;
      } catch (error) {
        console.error("Unable to access camera/microphone", error);

        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          mystreamRef.current=audioOnlyStream;
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
        mediaRequestRef.current=null;
      }
    })();

    return mediaRequestRef.current;
  },[]);

  useEffect(()=>{
      if(redirectingAfterRefresh)return;
      let cancelled=false;
      const initializeRoom=async()=>{
      const nonparsedUser = localStorage.getItem('user');
      const user = JSON.parse(nonparsedUser);
      let resolvedRole=extraInfo?.role || null;
      const isLegacyHostState=(extraInfo?.user && extraInfo.user._id===user._id) || (extraInfo && extraInfo._id===user._id);

      if(!resolvedRole && isLegacyHostState)
      {
        resolvedRole='interviewer';
      }

      const interview=await getInterviewByRoomIdService(roomId);
      if(cancelled)return;

      if(interview?.roomState)
      {
        const {code: savedCode, language: savedLanguage, question: savedQuestion, cases: savedCases, exampleCasesExecution: savedExecution}=interview.roomState;
        const nextLanguage=savedLanguage || 'cpp';
        setLanguage(nextLanguage);
        setCode(typeof savedCode === 'string' && savedCode.length ? savedCode : defaultCodes[nextLanguage] || defaultCodes.cpp);
        setquestion(savedQuestion || "");
        if(Array.isArray(savedCases) && savedCases.length)
        {
          setCases(savedCases);
        }
        if(savedExecution)
        {
          setExampleCasesExecution(savedExecution);
        }
      }

      if(!resolvedRole && interview)
      {
        if(user.email===interview.interviewer.email) resolvedRole='interviewer';
        else if(user.email===interview.interviewee.email) resolvedRole='interviewee';
      }

      setRoomParticipantRole(resolvedRole);
      setprevilige(resolvedRole==='interviewer');
      setRoomStateLoaded(true);

      if(extraInfo?.remoteSocketId)
      {
          updateRemoteSocketId(extraInfo.remoteSocketId);
          setconnectionReady(true);
      }
      else if(typeof extraInfo === 'string')
      {
          updateRemoteSocketId(extraInfo);
          setconnectionReady(true);
      }
      };

      initializeRoom();
      return ()=>{
        cancelled=true;
      };
  },[extraInfo, redirectingAfterRefresh, roomId, updateRemoteSocketId]);

  useEffect(()=>{
    if(!redirectingAfterRefresh)return;
    toast.error('Call refreshed. Please rejoin from scheduled interviews.');
    navigate('/join-interview',{replace:true,state:{roomId}});
  },[navigate, redirectingAfterRefresh, roomId]);

  const handleJoinRequest=useCallback(({user,id,requser_id,proctorCheck,verificationVideo})=>{
    setrequestusername((prev) => {
      const alreadyExists=prev.some((request)=>{
        if(request.user?._id && user?._id)return request.user._id===user._id;
        return request.requser_id===requser_id;
      });
      if(alreadyExists)return prev;
      return [...prev, { user, id, requser_id, proctorCheck, verificationVideo }];
    });
  },[]);

  const handleAcceptedIntoRoom=useCallback(({ta})=>{
    if(previlige || !ta)return;
    updateRemoteSocketId(ta);
    setconnectionReady(true);
  },[previlige, updateRemoteSocketId]);

  const requestToJoinAsInterviewee=useCallback(async()=>{
    if(roomParticipantRole!=='interviewee')return;
    const nonparsedUser = localStorage.getItem('user');
    const user = JSON.parse(nonparsedUser);
    if(!proctorCheckRef.current)
    {
      proctorCheckRef.current=await getPreJoinEnvironmentCheck();
    }
    socket.emit('room:join_request',{room:roomId,user,id:socket.id,proctorCheck:proctorCheckRef.current,verificationVideo:verificationVideoRef.current});
  },[roomId, roomParticipantRole, socket]);

  const acceptrequest=useCallback((index)=>{
    const request=requsername[index];
    if(!request)return;
    updateRemoteSocketId(request.id);
    setconnectionReady(true);
    setremoteUser(request.user);
    setrequestusername([]);
    socket.emit('host:req_accepted',{ta:socket.id,user:request.user,room:roomId,id:request.id,requser_id:request.requser_id});
  },[requsername, roomId, socket, updateRemoteSocketId]);

  const stopLocalStream=useCallback(()=>{
    if (mystreamRef.current) {
      const tracks = mystreamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
    }
    mystreamRef.current=null;
    mediaRequestRef.current=null;
    setMystream(null);
    setMediaReady(false);
  },[]);

  const help1=useCallback(()=>{
    stopLocalStream();
    peer.resetPeer();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.log(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
    toast.error('Host Ended call');
    navigate('/join-interview',{state:{roomId,role:'interviewee'}});
  },[navigate, roomId, stopLocalStream]);

  const help2=useCallback(({msg,disconnected})=>{
    // if (mystream) {
    //   const tracks = mystream.getTracks();
    //   tracks.forEach(track => {
    //     track.stop();
    //   });
    // }
    // setMystream(null);
    
    if(!msg || disconnected)
    {
      toast.error(msg || "Interviewee left");
      setconnectionReady(false);
      updateRemoteSocketId(null);
      setRemoteStream(null);
      callStartedRef.current=false;
      resetPeerConnection();
    }
    else toast.error(msg);
    
    //setMystream(null);
  },[resetPeerConnection, updateRemoteSocketId])

  const help3=useCallback(({code})=>{
    setCode(code);
  },[]);

  const help4=useCallback(({language})=>{
    setLanguage(language);
    setCode(defaultCodes[language]);
  },[]);

  const help5=useCallback(({cases})=>{
    setCases(cases);
  },[]);

  const help6=useCallback(({exampleCasesExecution})=>{
    setExampleCasesExecution(exampleCasesExecution);
  },[]);

  const help7=useCallback(({question})=>{
    setquestion(question);
  },[]);

  const [remoteStream,setRemoteStream]=useState(null);

  const handleHostAvailable=useCallback(()=>{
    if(roomParticipantRole!=='interviewee')return;
    const hadActiveConnection=connectionReady || callStartedRef.current || Boolean(remoteSocketIdRef.current);
    callStartedRef.current=false;
    setconnectionReady(false);
    setRemoteStream(null);
    updateRemoteSocketId(null);
    if(hadActiveConnection)
    {
      resetPeerConnection();
    }
    requestToJoinAsInterviewee();
  },[connectionReady, requestToJoinAsInterviewee, resetPeerConnection, roomParticipantRole, updateRemoteSocketId]);

  useEffect(()=>{
    const currentPeer=peer.peer;
    const handleTrack=async ev =>{
      const rstream=ev.streams;
      console.log("GOT TRACKS");
      if(incomingScreenShareRef.current && ev.track.kind==='video')
      {
        setRemoteScreenStream(rstream[0]);
        setRemoteScreenAvailable(true);
        setShowRemoteScreen(true);
        return;
      }
      setRemoteStream(rstream[0]);
    };
    currentPeer.addEventListener('track',handleTrack);
    return ()=>{
      currentPeer.removeEventListener('track',handleTrack);
    };
  },[peerVersion])

  const handleNegotiation=useCallback(async()=>{
    if(!remoteSocketIdRef.current)return;
    if(peer.peer.signalingState !== 'stable')return;
    if(handlingRemoteOfferRef.current || makingOfferRef.current)return;
    makingOfferRef.current=true;
    try {
      peer.prepareConnection(mystreamRef.current);
      const offer=await peer.getOffer();
      socket.emit('peer:nego:needed',{offer,to:remoteSocketIdRef.current});
    } finally {
      makingOfferRef.current=false;
    }
  },[socket])

  useEffect(()=>{
    const currentPeer=peer.peer;
    currentPeer.addEventListener('negotiationneeded',handleNegotiation);
    return ()=>{
      currentPeer.removeEventListener('negotiationneeded',handleNegotiation);
    }
  },[handleNegotiation,peerVersion])

  useEffect(()=>{
    const currentPeer=peer.peer;
    currentPeer.onicecandidate=({candidate})=>{
      if(candidate && remoteSocketIdRef.current)
      {
        socket.emit('peer:ice-candidate',{to:remoteSocketIdRef.current,candidate});
      }
    };

    return ()=>{
      currentPeer.onicecandidate=null;
    }
  },[peerVersion,socket])


  useEffect(()=>{
    if(redirectingAfterRefresh)return;
    const sthel=async()=>{
      await ensureLocalStream();
    }
    sthel();
  },[ensureLocalStream,redirectingAfterRefresh])

  useEffect(()=>{
    if(redirectingAfterRefresh)return;
    const startCallWhenReady=async()=>{
      if(previlige || !connectionReady || !remoteSocketId || !mediaReady || callStartedRef.current)return;

      callStartedRef.current=true;
      peer.prepareConnection(mystreamRef.current);
      const offer=await peer.getOffer();
      socket.emit("user:call",{remoteSocketId,offer});
    };

    startCallWhenReady();
  },[connectionReady, mediaReady, previlige, redirectingAfterRefresh, remoteSocketId, socket])

  const sendMediaStatus=useCallback((audioOn=isAudioOn,videoOn=isVideoOn)=>{
    if(remoteSocketIdRef.current)
    {
      socket.emit('media:status',{to:remoteSocketIdRef.current,audioOn,videoOn});
    }
  },[isAudioOn,isVideoOn,socket])

  const handleIncommingCall=useCallback(async({from,offer})=>{
    callStartedRef.current=true;
    updateRemoteSocketId(from);
    handlingRemoteOfferRef.current=true;
    try {
      const stream=await ensureLocalStream();
      peer.prepareConnection(stream);
      const answer=await peer.getAnswer(offer);
      socket.emit('call:accepted',{to:from,answer});
      sendMediaStatus();
    } finally {
      handlingRemoteOfferRef.current=false;
    }
  },[ensureLocalStream, sendMediaStatus, socket, updateRemoteSocketId])

  const handleCallAccepted=useCallback(async({from,answer})=>{
    callStartedRef.current=true;
    updateRemoteSocketId(from);
    await peer.setLocalDescription(answer);
    peer.prepareConnection(mystreamRef.current);
    sendMediaStatus();
  },[sendMediaStatus, updateRemoteSocketId])

  const handleNegotiationIncomming=useCallback(async({from,offer})=>{
    updateRemoteSocketId(from);
    handlingRemoteOfferRef.current=true;
    try {
      peer.prepareConnection(mystreamRef.current);
      const ans=await peer.getAnswer(offer);
      socket.emit('peer:nego:done',{to:from,ans}); 
    } finally {
      handlingRemoteOfferRef.current=false;
    }
  },[socket, updateRemoteSocketId])
  
  const handleFinalNego=useCallback(async({ans})=>{
    await peer.setLocalDescription(ans)
  },[])

  const handleIceCandidate=useCallback(async({from,candidate})=>{
    updateRemoteSocketId(from);
    await peer.addIceCandidate(candidate);
  },[updateRemoteSocketId])

  const handleRemoteMediaStatus=useCallback(({audioOn,videoOn})=>{
    setRemoteMediaStatus({audioOn,videoOn});
  },[])

  const sendProctorEvent=useCallback((type,message)=>{
    toast.error(message);
    if(remoteSocketIdRef.current)
    {
      socket.emit('proctor:event',{to:remoteSocketIdRef.current,type,message});
    }
  },[socket])

  const handleProctorEvent=useCallback(({message})=>{
    if(previlige)
    {
      toast.error(message);
    }
  },[previlige])

  const handleRemoteScreenStarted=useCallback(()=>{
    incomingScreenShareRef.current=true;
    setRemoteScreenAvailable(true);
    setShowRemoteScreen(true);
    toast.success("Interviewee started screen sharing");
  },[])

  const handleRemoteScreenStopped=useCallback(()=>{
    incomingScreenShareRef.current=false;
    setRemoteScreenStream(null);
    setRemoteScreenAvailable(false);
    setShowRemoteScreen(false);
    toast.error("Interviewee stopped screen sharing");
  },[])

  const stopScreenShare=useCallback(()=>{
    if(!screenStreamRef.current)return;
    peer.removeStream(screenStreamRef.current);
    screenStreamRef.current.getTracks().forEach((track)=>track.stop());
    screenStreamRef.current=null;
    setScreenStream(null);
    if(remoteSocketIdRef.current)
    {
      socket.emit('screen:share-stopped',{to:remoteSocketIdRef.current});
    }
  },[socket])

  const startScreenShare=useCallback(async()=>{
    if(previlige || !connectionReady || !remoteSocketIdRef.current)return;
    try {
      const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
      screenStreamRef.current=stream;
      setScreenStream(stream);
      incomingScreenShareRef.current=false;
      socket.emit('screen:share-started',{to:remoteSocketIdRef.current});
      peer.addStream(stream);
      stream.getVideoTracks()[0].onended=()=>{
        stopScreenShare();
      };
    } catch (error) {
      console.error("Unable to share screen",error);
      toast.error("Screen sharing was cancelled");
    }
  },[connectionReady, previlige, socket, stopScreenShare])

  useEffect(()=>{
    if(connectionReady && remoteSocketId)
    {
      sendMediaStatus();
    }
  },[connectionReady, remoteSocketId, sendMediaStatus])



  useEffect(()=>{
    socket.on('room:join',handleAcceptedIntoRoom);
    socket.on('user:requested_to_join',handleJoinRequest);
    socket.on('host:available',handleHostAvailable);
    socket.on('host:hasleft',help1);
    socket.on('interviewee:hasleft',help2);
    socket.on('change:code',help3);
    socket.on('change:question',help7);
    socket.on('change:language',help4);
    socket.on('change:cases',help5);
    socket.on('run:code',help6);
    socket.on('incomming:call',handleIncommingCall);
    socket.on('call:accepted',handleCallAccepted);
    socket.on('peer:nego:needed',handleNegotiationIncomming);
    socket.on('peer:nego:final',handleFinalNego);
    socket.on('peer:ice-candidate',handleIceCandidate);
    socket.on('media:status',handleRemoteMediaStatus);
    socket.on('proctor:event',handleProctorEvent);
    socket.on('screen:share-started',handleRemoteScreenStarted);
    socket.on('screen:share-stopped',handleRemoteScreenStopped);
    return ()=>{
      socket.off('room:join',handleAcceptedIntoRoom);
      socket.off('user:requested_to_join',handleJoinRequest);
      socket.off('host:available',handleHostAvailable);
      socket.off('host:hasleft',help1);
      socket.off('interviewee:hasleft',help2);
      socket.off('change:code',help3);
      socket.off('change:question',help7);
      socket.off('change:language',help4);
      socket.off('change:cases',help5);
      socket.off('run:code',help6);
      socket.off('incomming:call',handleIncommingCall);
      socket.off('call:accepted',handleCallAccepted);
      socket.off('peer:nego:needed',handleNegotiationIncomming);
      socket.off('peer:nego:final',handleFinalNego);
      socket.off('peer:ice-candidate',handleIceCandidate);
      socket.off('media:status',handleRemoteMediaStatus);
      socket.off('proctor:event',handleProctorEvent);
      socket.off('screen:share-started',handleRemoteScreenStarted);
      socket.off('screen:share-stopped',handleRemoteScreenStopped);
    }
  },[socket,handleAcceptedIntoRoom,handleJoinRequest,handleHostAvailable,help1,help2,help3,help4,help5,help6,help7,handleIncommingCall,handleCallAccepted,handleNegotiationIncomming,handleFinalNego,handleIceCandidate,handleRemoteMediaStatus,handleProctorEvent,handleRemoteScreenStarted,handleRemoteScreenStopped]);

  useEffect(()=>{
    if(redirectingAfterRefresh || !roomParticipantRole)return;
    const nonparsedUser = localStorage.getItem('user');
    const user = JSON.parse(nonparsedUser);

    if(roomParticipantRole==='interviewer')
    {
      socket.emit('room:join',{room:roomId,user,id:socket.id});
      socket.emit('host:ready',{room:roomId});
      return;
    }

    requestToJoinAsInterviewee();
  },[redirectingAfterRefresh, requestToJoinAsInterviewee, roomId, roomParticipantRole, socket]);

  useEffect(()=>{
    return ()=>{
      if(screenStreamRef.current)
      {
        if(remoteSocketIdRef.current)
        {
          socket.emit('screen:share-stopped',{to:remoteSocketIdRef.current});
        }
        screenStreamRef.current.getTracks().forEach((track)=>track.stop());
      }
      peer.resetPeer();
    };
  },[socket]);

  const toggleAudio = () => {
    if (mystream) {
      const audioTrack = mystream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled; 
        setAudioOn(audioTrack.enabled);
        sendMediaStatus(audioTrack.enabled,isVideoOn);
      }
    }
  };
  
  const toggleVideo = () => {
    if (mystream) {
      const videoTrack = mystream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled; 
        setVideoOn(videoTrack.enabled);
        sendMediaStatus(isAudioOn,videoTrack.enabled);
      }
    }
  };
  
  const handleLanguageChange = async (newLanguage) => {
      setLanguage(newLanguage);
      setCode(defaultCodes[newLanguage]);
      socket.emit('language:change',{remoteSocketId,language:newLanguage});
  };

  useEffect(()=>{
    if(redirectingAfterRefresh || !roomStateLoaded)return;
    const autosaveTimer=setTimeout(()=>{
      updateInterviewRoomStateService(roomId,{
        code,
        language,
        question,
        cases,
        exampleCasesExecution,
      });
    },600);

    return ()=>{
      clearTimeout(autosaveTimer);
    };
  },[cases, code, exampleCasesExecution, language, question, redirectingAfterRefresh, roomId, roomStateLoaded]);

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
    stopScreenShare();
    stopLocalStream();
    peer.resetPeer();
    callStartedRef.current=false;
    if(previlige)
    {
      socket.emit('host:leave',{remoteSocketId,room:roomId});
      navigate('/host-interview',{state:{roomId}});
    }
    else 
    {
      socket.emit('interviewee:leave',{remoteSocketId,room:roomId,msg});
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.log(`Error attempting to exit full-screen mode: ${err.message}`);
        });
      }
      navigate('/join-interview',{state:{roomId,role:'interviewee'}});
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !previlige) {
        sendProctorEvent('fullscreen-exit',"Interviewee exited fullscreen");
      }
    };
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && !previlige) {
            sendProctorEvent('tab-switch',"Tab switching detected");
        }
    };
    const handleClipboardEvent = (event) => {
      if(previlige)return;
      const eventType=event.type;
      const message=eventType==='paste' ? "Paste detected" : eventType==='copy' ? "Copy detected" : "Cut detected";
      sendProctorEvent(eventType,message);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleClipboardEvent);
    document.addEventListener('paste', handleClipboardEvent);
    document.addEventListener('cut', handleClipboardEvent);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleClipboardEvent);
      document.removeEventListener('paste', handleClipboardEvent);
      document.removeEventListener('cut', handleClipboardEvent);
    };
  },[previlige, sendProctorEvent]);

  const changecode=(e)=>{
    setCode(e);
    socket.emit('code:change',{remoteSocketId,code:e});
  }

  const changeQs = (e) => {
    const newQuestion = e.target.value;
    setquestion(newQuestion);
    socket.emit('question:change', { remoteSocketId, question: newQuestion });
  };

  const [showQuestion, setShowQuestion] = useState(false);
  const dropdownqs = () => {
    setShowQuestion((prev) => !prev);
  };

  if(!mediaReady)
  {
    return (
      <>
        <Loading/>
      </>
    )
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
            <button onClick={dropdownqs} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
              Question
            </button>
            {!previlige && connectionReady && (
              <button
                onClick={screenStream ? stopScreenShare : startScreenShare}
                className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 ${screenStream ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'}`}
              >
                {screenStream ? 'Stop Share' : 'Share Screen'}
              </button>
            )}
            {previlige && remoteScreenAvailable && (
              <button
                onClick={()=>setShowRemoteScreen(true)}
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                View Screen
              </button>
            )}

            {showQuestion && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-8"
                onClick={()=>setShowQuestion(false)}
              >
                <div
                  className="flex h-[min(78vh,720px)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-2xl"
                  onClick={(event)=>event.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-6 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Interview Problem</p>
                      <h2 className="text-2xl font-extrabold text-white">Question</h2>
                    </div>
                    <button
                      type="button"
                      onClick={()=>setShowQuestion(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-900 text-2xl leading-none text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Close question"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-gray-950 p-6">
                    {previlige ? (
                      <textarea
                        value={question}
                        onChange={(e)=>{changeQs(e)}}
                        placeholder="Write the interview question here..."
                        className="h-full min-h-[420px] w-full resize-none rounded-lg border border-gray-700 bg-gray-900 p-5 text-lg leading-8 text-gray-100 shadow-inner outline-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                      />
                    ) : (
                      <div className="min-h-[420px] rounded-lg border border-gray-700 bg-gray-900 p-6 text-lg leading-8 text-gray-100 shadow-inner">
                        {question ? (
                          <p className="whitespace-pre-wrap">{question}</p>
                        ) : (
                          <p className="text-gray-500">No question added yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {showRemoteScreen && previlige && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3"
                onClick={()=>setShowRemoteScreen(false)}
              >
                <div
                  className="flex h-[94vh] w-[96vw] flex-col overflow-hidden rounded-lg border border-purple-500/60 bg-gray-900 shadow-2xl"
                  onClick={(event)=>event.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-5 py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-purple-300">Screen Share</p>
                      <h2 className="text-xl font-extrabold text-white">Interviewee Screen</h2>
                    </div>
                    <button
                      type="button"
                      onClick={()=>setShowRemoteScreen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-900 text-2xl leading-none text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      aria-label="Close screen share"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black p-2">
                    {remoteScreenStream ? (
                      <video
                        ref={videoRef => {
                          if (videoRef && remoteScreenStream) {
                            videoRef.srcObject = remoteScreenStream;
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="max-h-full max-w-full object-contain"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <p className="text-gray-400">Waiting for shared screen...</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
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
          <div className="mb-3 text-center">
            <h3 className="text-xl font-semibold text-white">{remoteUser? remoteUser.fullname : 'Interviewer'}</h3>
          </div>
          <div className="relative bg-gray-900 h-48 w-full rounded-lg flex justify-center items-center text-white shadow-inner border border-gray-700">
            <div className={`absolute right-2 top-2 z-10 flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${remoteMediaStatus.audioOn ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
              <img className="h-4 w-4" src={remoteMediaStatus.audioOn ? '/micon.png' : '/micoff.png'} alt={remoteMediaStatus.audioOn ? 'Unmuted' : 'Muted'} />
              <span>{remoteMediaStatus.audioOn ? 'Unmuted' : 'Muted'}</span>
            </div>
            {!remoteMediaStatus.videoOn ? (
              <p className="text-gray-400">Video turned off</p>
            ) : remoteStream ? (
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
                <p className="text-gray-400">Waiting for video</p>
              )}
          </div>
        </div>

        <div className="w-full bg-gray-900 p-4 rounded-lg">
          <div className="mb-3 text-center">
            <h3 className="text-xl font-semibold text-white">You</h3>
          </div>
          <div className="relative bg-gray-900 h-48 w-full rounded-lg flex justify-center items-center text-white shadow-inner border border-gray-700">
            <div className={`absolute right-2 top-2 z-10 flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${isAudioOn ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
              <img className="h-4 w-4" src={isAudioOn ? '/micon.png' : '/micoff.png'} alt={isAudioOn ? 'Unmuted' : 'Muted'} />
              <span>{isAudioOn ? 'Unmuted' : 'Muted'}</span>
            </div>
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
              <p className="text-gray-400">Video turned off</p>
            )}
          </div>
        </div>
      </div>
    </>
  ) : previlige ? (
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
            <div key={index} className="space-y-4 rounded-lg bg-gray-700 p-4 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img className='h-10 w-10 rounded-full border-gray-50 border-2' src={x.user.avatar}/>
                  <div>
                    <p className="font-semibold text-gray-100">{x.user.fullname}</p>
                    <p className="text-xs text-gray-400">Waiting for approval</p>
                  </div>
                </div>
                <button 
                  onClick={()=>{acceptrequest(index)}} 
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
                >
                  Accept
                </button>
              </div>
              <div className="rounded-lg border border-gray-600 bg-gray-800 p-3 text-sm">
                <p className="mb-2 font-semibold text-blue-300">Pre-join check</p>
                {x.proctorCheck ? (
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="font-semibold text-gray-100">Monitors: </span>
                      {x.proctorCheck.monitors?.status === 'available'
                        ? `${x.proctorCheck.monitors.count} detected${x.proctorCheck.monitors.isExtended ? ' (extended display)' : ''}`
                        : x.proctorCheck.monitors?.message || 'Monitor details unavailable'}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-100">Screen: </span>
                      {x.proctorCheck.screen?.width} x {x.proctorCheck.screen?.height}, DPR {x.proctorCheck.screen?.pixelRatio}
                    </p>
                    <p className="text-xs text-gray-500">
                      Checked at {new Date(x.proctorCheck.checkedAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">No pre-join check received.</p>
                )}
              </div>
              <div className="rounded-lg border border-gray-600 bg-gray-800 p-3 text-sm">
                <p className="mb-2 font-semibold text-yellow-300">Verification video</p>
                {x.verificationVideo ? (
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="font-semibold text-gray-100">Secret code: </span>
                      <span className="rounded bg-yellow-500/20 px-2 py-1 font-black tracking-widest text-yellow-200">{x.verificationVideo.code}</span>
                    </p>
                    {x.verificationVideo.skipped ? (
                      <p className="rounded-lg bg-yellow-600/20 p-2 font-semibold text-yellow-200">
                        Verification video skipped by interviewee.
                      </p>
                    ) : (
                      <>
                        <p>
                          <span className="font-semibold text-gray-100">Duration: </span>
                          {x.verificationVideo.duration ? `${Math.round(x.verificationVideo.duration)}s` : 'Not provided'}
                        </p>
                        <a
                          href={x.verificationVideo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700"
                        >
                          Open uploaded video
                        </a>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">No verification video uploaded.</p>
                )}
              </div>
            </div>
          ))}
          </>
        ) : (
          <p className="text-gray-400">No requests yet.</p>
        )}
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
        <p className="text-lg font-semibold mb-4">Waiting for interviewer</p>
        <p className="text-gray-400">You are in the room. The call will start after the interviewer accepts your request.</p>
      </div>
    </>
  )}
  
      </div>
    
    </div>

  );
}

export default Room;
