import React from 'react'
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
function UserDetails({user}) {
    const navigate=useNavigate();
    return (
        <>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 lg:sticky lg:top-28 lg:h-fit">
                <div className="flex flex-col items-center">
                <img src={user.avatar || '/defaultuser.png'} alt="User Avatar" className="h-48 w-48 rounded-3xl border border-white/10 object-cover shadow-2xl shadow-black/30" />
                <h2 className="mt-5 text-center text-2xl font-black text-white">{user.fullname}</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">@{user.username}</p>
                <button onClick={()=>{
                    navigate('/editprofile');
                }} className="mt-6 w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-white">Edit Avatar</button>
                </div>
                <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Email</p>
                    <p className="mt-1 break-all text-sm font-bold text-slate-300">{user.email}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Username</p>
                    <p className="mt-1 text-sm font-bold text-slate-300">@{user.username}</p>
                </div>
                </div>
                <div className="mt-5">
                <LogoutButton/>
                </div>
            </div>
        </>
    )
}

export default UserDetails
