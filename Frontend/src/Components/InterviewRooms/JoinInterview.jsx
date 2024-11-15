import React, { useCallback, useEffect, useState } from 'react'
import { isLoggedIn, refreshTokenService } from '../../Services/Auth.service.js'
import { Link, useNavigate } from 'react-router-dom'
import { useSocket } from '../../Features/useSocket.js';
import Executing from '../Editor/Executing.jsx';

function JoinInterview() {
    const socket=useSocket();
    const navigate=useNavigate();
    const [room,setroom]=useState('');
    const [joining,setjoining]=useState(false);

    useEffect(()=>{
        refreshTokenService();
    },[])

    const handleJoinRoom = (data)=>{
        const {ta,room,id,requser_id}=data;
        if(room==='')return;
        setjoining(false);
        navigate(`/room/${room}`,{state:ta});
        console.log('id isss-',ta);
    }

    useEffect(()=>{
        socket.on('room:join',handleJoinRoom);
        return ()=>{
            socket.off('room:join',handleJoinRoom);
        }
    },[socket]);

    const handleSubmit=(e)=>{
        e.preventDefault();
        const nonparsedUser=localStorage.getItem('user');
        const user = JSON.parse(nonparsedUser); 
        setjoining(true); 
        socket.emit('room:join_request',{room,user,id:socket.id});
    }

    return (
        <div className="min-h-screen flex bg-gray-800 text-white p-10">
            <div className="w-1/3 flex items-center justify-center  rounded-lg  p-6 bg-gray-900">
                <img src="/homelogo.png" alt="Logo" className="h-96 drop-shadow-lg rounded-full object-cover"/>
            </div>    
            <div className="w-2/3 flex  bg-gray-900 items-center justify-center space-y-8 mx-10 rounded-lg">
                {isLoggedIn() ? (
                    <>
                <div className='bg-gray-800 p-16 rounded-2xl'>
                    <form className="flex flex-col gap-6 bg-gray-900 p-12 rounded-3xl shadow-lg max-w-md mx-auto">
                        <label htmlFor="roomId" className="text-3xl font-extrabold text-gray-100 mb-2 tracking-wide">
                            Enter Room ID
                        </label>
                        <input type="text" id="roomId" value={room} onChange={(e)=>{setroom(e.target.value)}}
                            className="px-5 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out placeholder-gray-400"
                            placeholder="Enter Room ID"
                        />
                        {joining ? <>
                            <div>
                                <Executing text={"Joining room"}/>
                            </div>
                        </>:
                        <button onClick={handleSubmit}
                            className="px-6 py-3 mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                        >
                            Join Room
                        </button>}
                    </form>
                </div>
                
                </>    
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
