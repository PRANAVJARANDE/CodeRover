import React, { useEffect, useState } from 'react';
import { getMyProfile } from '../../Services/Auth.service';
import Header from '../Header/Header.jsx';
import Loading from '../Loading/Loading.jsx';
import ProblemStats from './ProblemStats.jsx';
import UserDetails from './UserDetails.jsx';
import UserTweets from './UserTweets.jsx';
import Submissions from '../Submission/Submissions.jsx';
import { useNavigate } from 'react-router-dom';
const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions'); 
  const navigate=useNavigate();
  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await getMyProfile(); 
      setUser(response);
      if(!response)
      {
        navigate('/login');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    };
    fetchUserProfile();
  }, []);

  if (!user) return <Loading/>;

  return (
    <>
      <Header user={user} />
      <div className="min-h-screen bg-gray-800 text-white flex p-10">
        <UserDetails user={user} />
        
        <div className="w-2/3 py-10 px-14 space-y-6 flex flex-col">
          <h1 className="text-4xl font-bold text-center">{user.fullname}</h1>
          <hr className="border-gray-600" />

          <ProblemStats user={user} />
          <div className="flex justify-center space-x-4 mb-4">
            <button
                onClick={() => setActiveTab('submissions')}
                className={`py-2 px-4 font-extrabold rounded-lg ${activeTab === 'submissions' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}
                >
              Solved Questions
            </button>
            <button
              onClick={() => setActiveTab('tweets')}
              className={`py-2 px-4 font-extrabold  rounded-lg ${activeTab === 'tweets' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              My Tweets
            </button>
            
          </div>
            <div className='p-4 rounded-lg bg-gray-900'>
                {activeTab === 'tweets' ? (
                    <UserTweets user={user} />
                ) : (
                    <Submissions displayproblem={true}/>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
