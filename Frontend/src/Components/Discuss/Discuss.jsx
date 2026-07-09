import React, { useEffect, useState } from 'react';
import { fetchTweets } from '../../Services/Tweet.service';
import Reply from './Reply';
import Loading from '../Loading/Loading.jsx';

const Discuss = () => {
    const [tweets, setTweets] = useState(null);
    const [replyToTweetId, setReplyToTweetId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    
    useEffect(() => {
        let cancelled=false;
        const helper = async () => {
            const response = await fetchTweets();
            if(!cancelled)setTweets(response || []);
        };
        helper();

        return ()=>{
            cancelled=true;
        };
    }, [refreshKey]);

    const refreshTweets=()=>{
        setRefreshKey((key)=>key+1);
    };

    if (tweets === null) return (<Loading/>);
    return (
        <div className="min-h-screen bg-slate-800 px-5 py-8 text-white lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[380px_1fr]">
                <aside className="lg:sticky lg:top-28 lg:h-fit">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Discuss</p>
                        <h1 className="mt-3 text-3xl font-black text-white">Share what you are thinking</h1>
                        <p className="mt-3 text-sm leading-6 text-slate-400">Post a doubt, share a trick, or reply to someone solving the same thing.</p>
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-black text-white">Create post</h2>
                        </div>
                        <Reply onReplySuccess={refreshTweets} />
                    </div>
                </aside>

                <section>
                    <div className="mb-5 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-4">
                        <h2 className="text-xl font-black text-white">Recent discussions</h2>
                        <span className="text-sm font-bold text-slate-500">Newest first</span>
                    </div>

                <div className="space-y-4">
                    {tweets && tweets.length > 0 ? (
                        tweets.map((tweet, index) => (
                            <div key={index} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/15 transition hover:border-cyan-300/25 hover:bg-slate-900/80">
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <div className="flex flex-row items-center gap-3">
                                        {tweet?.owner?.avatar && (
                                            <img src={tweet.owner.avatar} alt="User Avatar" className="h-10 w-10 rounded-full border border-slate-700 object-cover" />
                                        )}
                                        <div>
                                            <span className="block font-black text-white">{tweet.owner?.username || 'Unknown User'}</span>
                                            <span className="text-xs font-bold text-slate-500">Community post</span>
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-500">
                                        {new Date(tweet.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="mb-4 whitespace-pre-line text-base leading-7 text-slate-200">{tweet.content}</p>
                                {tweet.image && <img src={tweet.image} alt="Tweet" className="mb-4 max-h-[420px] w-full rounded-2xl border border-white/10 object-cover" />}

                                {tweet.replys && tweet.replys.length > 0 && (
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                                        <h3 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Replies</h3>
                                        {tweet.replys.map((reply, replyIndex) => (
                                            <div key={replyIndex} className="mb-3 rounded-2xl bg-slate-900/80 p-3 last:mb-0">
                                                <div className="mb-2 flex items-center gap-2">
                                                    {reply?.owner?.avatar && (
                                                        <img src={reply.owner.avatar} alt="Reply Owner Avatar" className="h-7 w-7 rounded-full object-cover" />
                                                    )}
                                                    <span className="text-sm font-bold text-white">{reply.owner?.username || 'Unknown User'}</span>
                                                    <span className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-300">{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {replyToTweetId === tweet._id && (
                                    <Reply replyOf={replyToTweetId} onReplySuccess={refreshTweets} />
                                )}

                                <div className='flex justify-end'>
                                    <button onClick={() => setReplyToTweetId(replyToTweetId === tweet._id ? null : tweet._id)}
                                        className="mt-4 rounded-full bg-slate-800 px-5 py-2 text-sm font-black text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:text-slate-950"
                                    >
                                        {replyToTweetId === tweet._id ? 'Cancel' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-10 text-center text-slate-400">No discussions yet.</div>
                    )}
                </div>
                </section>
            </div>
        </div>
    );
};

export default Discuss;

