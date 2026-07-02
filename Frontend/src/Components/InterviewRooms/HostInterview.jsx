import { useCallback, useEffect, useState } from 'react';
import { isLoggedIn } from '../../Services/Auth.service.js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../Features/useSocket.js';
import { createInterviewService } from '../../Services/Interview.service.js';

function HostInterview() {
    const socket = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const [existingRoom,setExistingRoom]=useState(location.state?.roomId || '');
    const [interviewerEmail,setInterviewerEmail]=useState('');
    const [intervieweeEmail,setIntervieweeEmail]=useState('');
    const [scheduledAt,setScheduledAt]=useState('');
    const [scheduling,setScheduling]=useState(false);
    const [scheduledInterview,setScheduledInterview]=useState(null);

    const handleJoinRoom = useCallback((data) => {
        const {user,room} = data;
        navigate(`/room/${room}`,{state:{user,role:'interviewer'}});
    },[navigate]);

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () => {
            socket.off('room:join', handleJoinRoom);
        };
    }, [socket,handleJoinRoom]);

    const handleCreateInterview = async (e) => {
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
            setExistingRoom(interview.roomId);
            setInterviewerEmail('');
            setIntervieweeEmail('');
            setScheduledAt('');
        }
    };

    const handleRejoinRoom = (e) => {
        e.preventDefault();
        if(!existingRoom)return;
        const nonparsedUser = localStorage.getItem('user');
        const user = JSON.parse(nonparsedUser);
        socket.emit('room:join', { room: existingRoom, user, id: socket.id });
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white p-10">
            <div className="min-h-[calc(100vh-5rem)] bg-gray-900 rounded-lg flex items-center justify-center p-8">
                {isLoggedIn() ? (
                    <div className='bg-gray-800 p-10 rounded-2xl w-full max-w-2xl'>
                        <div className="flex flex-col gap-6 bg-gray-900 p-10 rounded-3xl shadow-lg">
                            <h2 className="text-4xl font-extrabold text-gray-100 mb-2 tracking-wide text-center">
                                Create Interview
                            </h2>
                            <p className="text-gray-400 mb-4 text-lg">
                                Schedule a room after validating both user emails.
                            </p>
                            <form onSubmit={handleCreateInterview} className="flex flex-col gap-4">
                                <input
                                    type="email"
                                    value={interviewerEmail}
                                    onChange={(e)=>setInterviewerEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Interviewer email"
                                />
                                <input
                                    type="email"
                                    value={intervieweeEmail}
                                    onChange={(e)=>setIntervieweeEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Interviewee email"
                                />
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e)=>setScheduledAt(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={scheduling}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                                >
                                    {scheduling ? 'Scheduling...' : 'Schedule Interview'}
                                </button>
                            </form>
                            {scheduledInterview ? (
                                <div className="rounded-lg border border-green-700 bg-green-950 p-4 text-sm text-green-100">
                                    <p className="font-semibold">Interview scheduled</p>
                                    <p>Room: {scheduledInterview.roomId}</p>
                                    <p>{scheduledInterview.interviewer.fullname} with {scheduledInterview.interviewee.fullname}</p>
                                </div>
                            ) : null}
                            <div className="border-t border-gray-700 pt-6">
                                <label htmlFor="existingRoom" className="block text-gray-300 mb-2 font-semibold">
                                    Rejoin existing room
                                </label>
                                <input
                                    id="existingRoom"
                                    type="text"
                                    value={existingRoom}
                                    onChange={(e)=>setExistingRoom(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter Room ID"
                                />
                                <button
                                    onClick={handleRejoinRoom}
                                    className="w-full px-6 py-3 mt-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                                >
                                    Rejoin Room
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='p-40 bg-gray-800 rounded-lg'>
                        <div className="flex items-center justify-center n bg-gray-800 rounded-lg">
                            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">You need to login</h2>
                                <p className="text-gray-600 mb-6">Please log in to create or join an interview room.</p>
                                <Link
                                    to="/login"
                                    className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300"
                                >
                                    Login Now
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HostInterview;
