import { useCallback, useEffect, useState } from 'react'
import { isLoggedIn} from '../../Services/Auth.service.js'
import { Link, useNavigate } from 'react-router-dom'
import { useSocket } from '../../Features/useSocket.js';
import Executing from '../Editor/Executing.jsx';
import { getMyInterviewsService, getVerificationUploadService, uploadVerificationVideoService } from '../../Services/Interview.service.js';
import { getPreJoinEnvironmentCheck } from '../../Services/Proctor.service.js';

const generateVerificationCode = () => {
    const characters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code='';
    for(let i=0;i<6;i++)
    {
        code+=characters[Math.floor(Math.random()*characters.length)];
    }
    return code;
};

const generateRequestId = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
};

function JoinInterview() {
    const socket=useSocket();
    const navigate=useNavigate();
    const [joining,setjoining]=useState(false);
    const [scheduledInterviews,setScheduledInterviews]=useState([]);
    const [loadingInterviews,setLoadingInterviews]=useState(false);
    const [verificationRequest,setVerificationRequest]=useState(null);
    const [localUploadError,setLocalUploadError]=useState('');
    const [localUploading,setLocalUploading]=useState(false);


    const handleJoinRoom = useCallback((data)=>{
        const {ta,room,user}=data;
        if(room==='')return;
        setjoining(false);
        navigate(`/room/${room}`,{state:{user,remoteSocketId:ta,role:'interviewer'}});
    },[navigate])

    useEffect(()=>{
        socket.on('room:join',handleJoinRoom);
        return ()=>{
            socket.off('room:join',handleJoinRoom);
        }
    },[socket,handleJoinRoom]);

    useEffect(()=>{
        const fetchInterviews=async()=>{
            if(!isLoggedIn())return;
            setLoadingInterviews(true);
            const interviews=await getMyInterviewsService();
            setScheduledInterviews(interviews);
            setLoadingInterviews(false);
        };

        fetchInterviews();
    },[]);

    const completeIntervieweeJoin = useCallback(async({interview,user,proctorCheck,verificationVideo})=>{
        socket.emit('room:join_request',{
            room:interview.roomId,
            user,
            id:socket.id,
            proctorCheck,
            verificationVideo,
        });
        navigate(`/room/${interview.roomId}`,{state:{role:'interviewee',proctorCheck,verificationVideo}});
    },[navigate,socket]);

    useEffect(()=>{
        if(!verificationRequest)return;

        const pollUpload=async()=>{
            const verificationVideo=await getVerificationUploadService(verificationRequest.requestId);
            if(!verificationVideo)return;
            await completeIntervieweeJoin({...verificationRequest,verificationVideo});
            setVerificationRequest(null);
            setjoining(false);
        };

        const intervalId=setInterval(pollUpload,2500);
        pollUpload();

        return ()=>{
            clearInterval(intervalId);
        };
    },[completeIntervieweeJoin,verificationRequest]);

    const joinScheduledInterview=async(interview)=>{
        const nonparsedUser=localStorage.getItem('user');
        const user = JSON.parse(nonparsedUser);
        const scheduledRole=user.email===interview.interviewer.email ? 'interviewer' : 'interviewee';
        setjoining(true);

        if(scheduledRole==='interviewer')
        {
            socket.emit('room:join',{room:interview.roomId,user,id:socket.id});
        }
        else
        {
            const code=generateVerificationCode();
            const requestId=generateRequestId();
            const proctorCheck=await getPreJoinEnvironmentCheck();
            const uploadUrl=`${window.location.origin}/verify-video-upload?roomId=${encodeURIComponent(interview.roomId)}&code=${encodeURIComponent(code)}&requestId=${encodeURIComponent(requestId)}`;
            setVerificationRequest({interview,user,proctorCheck,code,requestId,uploadUrl});
        }
    };

    const getInterviewRole = (interview) => {
        const nonparsedUser=localStorage.getItem('user');
        const user = JSON.parse(nonparsedUser);
        return user.email===interview.interviewer.email ? 'Interviewer' : 'Interviewee';
    };

    const formatSchedule = (scheduledAt) => {
        return new Date(scheduledAt).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const cancelVerification = () => {
        setVerificationRequest(null);
        setLocalUploadError('');
        setLocalUploading(false);
        setjoining(false);
    };

    const skipVerification = async() => {
        if(!verificationRequest)return;
        const verificationVideo={
            requestId:verificationRequest.requestId,
            roomId:verificationRequest.interview.roomId,
            code:verificationRequest.code,
            skipped:true,
            uploadedAt:new Date().toISOString(),
        };

        await completeIntervieweeJoin({...verificationRequest,verificationVideo});
        setVerificationRequest(null);
        setLocalUploadError('');
        setLocalUploading(false);
        setjoining(false);
    };

    const getVideoDuration = (file) => {
        return new Promise((resolve,reject)=>{
            const video=document.createElement('video');
            const objectUrl=URL.createObjectURL(file);
            video.preload='metadata';
            video.onloadedmetadata=()=>{
                URL.revokeObjectURL(objectUrl);
                resolve(video.duration);
            };
            video.onerror=()=>{
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Unable to read video duration'));
            };
            video.src=objectUrl;
        });
    };

    const handleLocalVerificationUpload = async(event) => {
        const file=event.target.files?.[0];
        event.target.value='';
        if(!file || !verificationRequest)return;

        setLocalUploadError('');
        setLocalUploading(true);
        try {
            const duration=await getVideoDuration(file);

            const verificationVideo=await uploadVerificationVideoService({
                roomId:verificationRequest.interview.roomId,
                code:verificationRequest.code,
                requestId:verificationRequest.requestId,
                duration,
                video:file,
            });

            await completeIntervieweeJoin({...verificationRequest,verificationVideo});
            setVerificationRequest(null);
            setjoining(false);
        } catch (error) {
            setLocalUploadError(error.message || 'Unable to upload video from this device.');
        } finally {
            setLocalUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white p-10">
            <div className="min-h-[calc(100vh-5rem)] bg-gray-900 rounded-lg p-10">
                {isLoggedIn() ? (
                <div className="bg-gray-800 p-8 rounded-2xl min-h-full">
                    {verificationRequest && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 py-8">
                            <div className="w-full max-w-2xl rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-2xl">
                                <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Verification Required</p>
                                <h2 className="mt-1 text-2xl font-extrabold text-white">Record mobile verification video</h2>
                                <p className="mt-3 text-gray-300">
                                    Scan this QR from your phone. Record a short video showing this laptop screen and the secret code below. The join request will be sent after upload.
                                </p>
                                <p className="mt-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-200">
                                    Mobile note: if the QR opens localhost on your phone, run/open the frontend using your laptop LAN IP or a tunnel URL for development.
                                </p>
                                <div className="mt-5 grid grid-cols-[220px_1fr] gap-5">
                                    <div className="rounded-lg bg-white p-3">
                                        <img
                                            alt="Verification upload QR"
                                            className="h-[220px] w-[220px]"
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verificationRequest.uploadUrl)}`}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-yellow-500 bg-yellow-500/10 p-4">
                                            <p className="text-sm font-semibold text-yellow-200">Secret code</p>
                                            <p className="mt-1 text-4xl font-black tracking-widest text-yellow-300">{verificationRequest.code}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                                            <p className="font-semibold text-gray-100">Waiting for mobile upload...</p>
                                            <p className="mt-1 text-sm text-gray-400">Keep this window open. Upload is checked automatically.</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                                            <p className="font-semibold text-gray-100">Upload from this device</p>
                                            <p className="mt-1 text-sm text-gray-400">
                                                Choose a video that shows this laptop screen and the secret code.
                                            </p>
                                            {localUploadError && (
                                                <p className="mt-2 rounded bg-red-600/20 p-2 text-sm text-red-200">{localUploadError}</p>
                                            )}
                                            <label className={`mt-3 inline-block cursor-pointer rounded-lg px-4 py-2 font-semibold text-white ${localUploading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                                {localUploading ? 'Uploading...' : 'Choose video'}
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    disabled={localUploading}
                                                    onChange={handleLocalVerificationUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={skipVerification}
                                                className="rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white hover:bg-yellow-700"
                                            >
                                                Skip verification
                                            </button>
                                            <button
                                                onClick={cancelVerification}
                                                className="rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <h2 className="text-3xl font-extrabold text-gray-100 mb-6">Scheduled Interviews</h2>
                    {loadingInterviews ? (
                        <Executing text="Loading interviews"/>
                    ) : scheduledInterviews.length ? (
                        <div className="grid grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2">
                            {scheduledInterviews.map((interview)=>(
                                <div key={interview._id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <div className="mb-3 inline-block rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                                                You are {getInterviewRole(interview)}
                                            </div>
                                            <p className="text-sm text-gray-400">{formatSchedule(interview.scheduledAt)}</p>
                                            <p className="mt-2 text-white font-semibold">Interviewer: {interview.interviewer.fullname}</p>
                                            <p className="text-gray-300 text-sm">{interview.interviewer.email}</p>
                                            <p className="mt-2 text-white font-semibold">Interviewee: {interview.interviewee.fullname}</p>
                                            <p className="text-gray-300 text-sm">{interview.interviewee.email}</p>
                                            <p className="mt-2 text-yellow-400 text-sm">Room: {interview.roomId}</p>
                                        </div>
                                        <button
                                            onClick={()=>joinScheduledInterview(interview)}
                                            disabled={joining}
                                            className="shrink-0 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white font-semibold"
                                        >
                                            {joining ? 'Joining...' : 'Join'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">No scheduled interviews found.</p>
                    )}
                </div>
                    ) : (<div className='p-40 bg-gray-800 rounded-lg'>
                        <div className=" flex items-center justify-center n bg-gray-800 rounded-lg">
                                <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">You need to login</h2>
                                    <p className="text-gray-600 mb-6">Please log to Join Interview.</p>
                                    <Link to="/login"
                                        className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300"
                                            >
                                        Login Now
                                    </Link>
                                </div>
                            </div>
                        </div>)}
            </div>
        </div>
    )
}

export default JoinInterview
