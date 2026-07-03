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
      <div className="min-h-screen bg-slate-950 px-5 py-8 text-white lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[360px_1fr]">
        <UserDetails user={user} />
        
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Profile</p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-black text-white md:text-4xl">{user.fullname}</h1>
                <p className="mt-2 text-sm text-slate-500">@{user.username}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-400">
                {user.email}
              </div>
            </div>
          </div>

          <ProblemStats user={user} />
          <div className="flex rounded-2xl border border-white/10 bg-slate-900/70 p-1">
            <button
                onClick={() => setActiveTab('submissions')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-black transition ${activeTab === 'submissions' ? 'bg-cyan-300 text-slate-950' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'}`}
                >
              Solved Questions
            </button>
            <button
              onClick={() => setActiveTab('tweets')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-black transition ${activeTab === 'tweets' ? 'bg-cyan-300 text-slate-950' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'}`}
            >
              My Tweets
            </button>
            
          </div>
            <div className='rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/20'>
                {activeTab === 'tweets' ? (
                    <UserTweets user={user} />
                ) : (
                    <Submissions displayproblem={true}/>
                )}
            </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
