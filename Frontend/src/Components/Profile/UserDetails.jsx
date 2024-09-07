import React from 'react'
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
function UserDetails({user}) {
    const navigate=useNavigate();
    return (
        <>
            <div className="w-1/3 bg-gray-900 p-10 rounded-lg shadow-lg flex flex-col items-center">
                <img src={user.avatar} alt="User Avatar" className="h-64 rounded-lg m-6" />
                <button onClick={()=>{
                    navigate('/editprofile');
                }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg w-full m-6">Edit Avatar</button>
                <div className="text-xl font-medium text-gray-300 self-start mt-4 mb-1">
                    <span className="text-gray-500">Email:</span> {user.email}
                </div>
                <div className="text-xl font-medium text-gray-300 self-start mt-1 mb-4">
                    <span className="text-gray-500">Username:</span> @{user.username}
                </div>
                <LogoutButton/>
            </div>
        </>
    )
}

export default UserDetails
