import { useCallback, useEffect, useMemo, useState } from 'react'
import { isLoggedIn} from '../../Services/Auth.service.js'
import { Link, useNavigate } from 'react-router-dom'
import { useSocket } from '../../Features/useSocket.js';
import Executing from '../Editor/Executing.jsx';
import { createInterviewService, getMyInterviewsService, getVerificationUploadService, uploadVerificationVideoService } from '../../Services/Interview.service.js';
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
    const [showCreateForm,setShowCreateForm]=useState(false);
    const [interviewerEmail,setInterviewerEmail]=useState('');
    const [intervieweeEmail,setIntervieweeEmail]=useState('');
    const [scheduledAt,setScheduledAt]=useState('');
    const [scheduling,setScheduling]=useState(false);
    const [scheduledInterview,setScheduledInterview]=useState(null);

    const sortedScheduledInterviews = useMemo(() => {
        return [...scheduledInterviews].sort((first,second)=>{
            return new Date(second.scheduledAt).getTime() - new Date(first.scheduledAt).getTime();
        });
    },[scheduledInterviews]);


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

    const handleCreateInterview = async(e) => {
        e.preventDefault();
        setScheduling(true);
        const interview=await createInterviewService({
            interviewerEmail,
            intervieweeEmail,
            scheduledAt,
        });
        setScheduling(false);

        if(interview)
        {
            setScheduledInterview(interview);
            setScheduledInterviews((current)=>[interview,...current]);
            setInterviewerEmail('');
            setIntervieweeEmail('');
            setScheduledAt('');
            setShowCreateForm(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-800 px-5 py-10 text-white lg:px-8">
            <div className="mx-auto max-w-7xl">
                {isLoggedIn() ? (
                <div>
                    {verificationRequest && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 py-8">
                            <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                                <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Verification Required</p>
                                <h2 className="mt-1 text-2xl font-extrabold text-white">Record mobile verification video</h2>
                                <p className="mt-3 text-gray-300">
                                    Scan this QR from your phone. Record a short video showing this laptop screen and the secret code below. The join request will be sent after upload.
                                </p>
                                <p className="mt-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-200">
                                    Mobile note: if the QR opens localhost on your phone, run/open the frontend using your laptop LAN IP or a tunnel URL for development.
                                </p>
                                <div className="mt-5 grid items-start gap-5 md:grid-cols-[244px_1fr]">
                                    <div className="self-start rounded-2xl bg-white p-3">
                                        <img
                                            alt="Verification upload QR"
                                            className="block h-[220px] w-[220px]"
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
                        <div className="mb-8 rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-black/20">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Interview</p>
                                <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Schedule, join, and run interviews</h1>
                                <p className="mt-4 max-w-2xl text-slate-400">
                                    See your scheduled rooms and create new interview sessions from one clean workspace.
                                </p>
                            </div>
                            <button
                                onClick={()=>setShowCreateForm((value)=>!value)}
                                className="rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:-translate-y-1 hover:bg-white"
                            >
                                {showCreateForm ? 'Hide Form' : 'Create Interview'}
                            </button>
                        </div>
                    </div>

                    {showCreateForm && (
                        <div className="mb-8 rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-6 shadow-2xl shadow-black/20">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Create Interview</p>
                                    <h2 className="mt-2 text-2xl font-black text-white">Schedule a validated room</h2>
                                </div>
                            </div>
                            <form onSubmit={handleCreateInterview} className="grid gap-4 lg:grid-cols-[1fr_1fr_260px_auto]">
                                <input
                                    type="email"
                                    value={interviewerEmail}
                                    onChange={(e)=>setInterviewerEmail(e.target.value)}
                                    className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
                                    placeholder="Interviewer email"
                                    required
                                />
                                <input
                                    type="email"
                                    value={intervieweeEmail}
                                    onChange={(e)=>setIntervieweeEmail(e.target.value)}
                                    className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
                                    placeholder="Interviewee email"
                                    required
                                />
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e)=>setScheduledAt(e.target.value)}
                                    className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-cyan-300/50"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={scheduling}
                                    className="rounded-2xl bg-emerald-400 px-6 py-4 font-black text-slate-950 transition hover:bg-white disabled:bg-slate-600 disabled:text-slate-300"
                                >
                                    {scheduling ? 'Scheduling...' : 'Schedule'}
                                </button>
                            </form>
                            {scheduledInterview ? (
                                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                                    <p className="font-black">Interview scheduled</p>
                                    <p className="mt-1">Room: {scheduledInterview.roomId}</p>
                                    <p>{scheduledInterview.interviewer.fullname} with {scheduledInterview.interviewee.fullname}</p>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white">Scheduled Interviews</h2>
                        <span className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-bold text-slate-300">
                            {sortedScheduledInterviews.length} rooms
                        </span>
                    </div>
                    {loadingInterviews ? (
                        <Executing text="Loading interviews"/>
                    ) : sortedScheduledInterviews.length ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {sortedScheduledInterviews.map((interview)=>(
                                <div key={interview._id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/15 transition hover:border-cyan-300/30 hover:bg-slate-900/80">
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <div className="mb-3 inline-block rounded-full bg-cyan-300 px-3 py-1 text-sm font-black text-slate-950">
                                                You are {getInterviewRole(interview)}
                                            </div>
                                            <p className="text-sm font-bold text-slate-400">{formatSchedule(interview.scheduledAt)}</p>
                                            <p className="mt-3 text-white font-black">Interviewer: {interview.interviewer.fullname}</p>
                                            <p className="text-slate-400 text-sm">{interview.interviewer.email}</p>
                                            <p className="mt-3 text-white font-black">Interviewee: {interview.interviewee.fullname}</p>
                                            <p className="text-slate-400 text-sm">{interview.interviewee.email}</p>
                                            <p className="mt-3 text-cyan-300 text-sm font-black">Room: {interview.roomId}</p>
                                        </div>
                                        <button
                                            onClick={()=>joinScheduledInterview(interview)}
                                            disabled={joining}
                                            className="shrink-0 rounded-full bg-emerald-400 px-7 py-3 text-base font-black text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-white disabled:bg-slate-600 disabled:text-slate-300"
                                        >
                                            {joining ? 'Joining...' : 'Join'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-10 text-center text-slate-400">
                            No scheduled interviews found. Create one using the button above.
                        </div>
                    )}
                </div>
                    ) : (<div className='rounded-3xl border border-white/10 bg-slate-950/70 p-10'>
                        <div className=" flex items-center justify-center">
                                <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">You need to login</h2>
                                    <p className="text-gray-600 mb-6">Please login to open interviews.</p>
                                    <Link to="/login"
                                        className="inline-block rounded-full bg-slate-800 px-6 py-3 font-black text-white transition hover:bg-cyan-700"
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

