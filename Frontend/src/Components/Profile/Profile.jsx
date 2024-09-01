import React, { useEffect, useState } from 'react';
import { getMyProfile } from '../../Services/Auth.service';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import Header from '../Header/Header.jsx';
import Loading from '../Loading/Loading.jsx';

const Profile = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await getMyProfile(); 
      setUser(response);
    };
    fetchUserProfile();
  }, []);

  const problems={
    easy:2,
    medium:2,
    hard:2,
  }
  const navigate=useNavigate();
  if (!user) return <Loading/>;

  return (
    <>
    <Header user={user}/>
    <div className="min-h-screen bg-gray-800 text-white flex p-10">
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

        <div className="w-2/3 py-10 px-14 space-y-6 flex flex-col">
            <h1 className="text-4xl font-bold text-center">{user.fullname}</h1>
            <hr className="border-gray-600" />

            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold mb-5 text-center">Problem Stats</h2>
                <div className="flex items-center mb-2">
                    <span className="text-lg w-24 text-green-400">Easy</span>
                    <div className="flex-1 bg-gray-700 h-6 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-green-500 rounded-lg" style={{ width: `${(user.easyCount / problems.easy) * 100}%`}}/>
                    </div>
                    <span className="ml-4 text-lg ">{user.easyCount}</span>
                </div>

                <div className="flex items-center mb-2">
                    <span className="text-lg w-24 text-yellow-400">Medium</span>
                    <div className="flex-1 bg-gray-700 h-6 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-yellow-500 rounded-lg" style={{ width: `${(user.mediumCount / problems.medium) * 100}%`}}/>
                    </div>
                    <span className="ml-4 text-lg">{user.mediumCount}</span>
                </div>

                <div className="flex items-center">
                    <span className="text-lg w-24 text-red-400">Hard</span>
                    <div className="flex-1 bg-gray-700 h-6 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-red-500 rounded-lg" style={{ width: `${(user.hardCount / problems.hard) * 100}%`}}/>
                    </div>
                    <span className="ml-4 text-lg">{user.hardCount}</span>
                </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-lg shadow-lg mx-auto w-full ">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Your Tweets</h2>
                <div className="space-y-6">
                    {(user.mytweets && user.mytweets.length > 0) ? (
                        user.mytweets.map((tweet, index) => (
                            <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-md">
                                <div className="flex flex-row-reverse items-center justify-between mb-3">
                                    <span className="text-gray-400 text-lg">
                                        {new Date(tweet.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-white mb-4 text-xl">{tweet.content}</p>
                                {tweet.image && (<img src={tweet.image} alt="Tweet" className="rounded-lg mb-4 max-w-full h-auto"/>)}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400">No tweets available</div>
                    )}
                </div>
            </div>

        </div>
    </div>
    </>
  );
};

export default Profile;
