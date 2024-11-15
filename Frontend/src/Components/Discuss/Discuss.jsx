import React, { useEffect, useState } from 'react';
import { fetchTweets } from '../../Services/Tweet.service';
import Reply from './Reply';
import Loading from '../Loading/Loading.jsx';

const Discuss = () => {
    const [tweets, setTweets] = useState(null);
    const [replyToTweetId, setReplyToTweetId] = useState(null);
    const [hasNewReply, setHasNewReply] = useState(false); 
    
    useEffect(() => {
        const helper = async () => {
            const response = await fetchTweets();
            setTweets(response);
        };
        helper();
    }, [replyToTweetId, hasNewReply]);  

    if (tweets === null) return (<Loading/>);
    return (
        <div className="min-h-screen bg-gray-800 text-white p-10">
            <div className="bg-gray-900 p-8 mb-6 rounded-xl shadow-lg">
                <Reply onReplySuccess={() => setHasNewReply(!hasNewReply)} />
            </div>

            <div className="bg-gray-900 p-8 rounded-lg shadow-lg mx-auto w-full">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Recent Tweets</h2>
                <div className="space-y-6">
                    {tweets && tweets.length > 0 ? (
                        tweets.map((tweet, index) => (
                            <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-md">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex flex-row items-center">
                                        {tweet?.owner?.avatar && (
                                            <img src={tweet.owner.avatar} alt="User Avatar" className="w-10 h-10 rounded-full mr-4 mb-2" />
                                        )}
                                        <span className="text-white font-semibold">{tweet.owner?.username || 'Unknown User'}</span>
                                    </div>
                                    <span className="text-gray-400 text-lg">
                                        {new Date(tweet.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-white mb-4 text-xl">{tweet.content}</p>
                                {tweet.image && <img src={tweet.image} alt="Tweet" className="rounded-lg mb-4 max-w-full h-auto" />}

                                {tweet.replys && tweet.replys.length > 0 && (
                                    <div className="ml-8 mt-4 bg-gray-900 p-8 rounded-lg shadow-2xl mb-6">
                                        <h3 className="text-white text-lg mb-3">Replies:</h3>
                                        {tweet.replys.map((reply, replyIndex) => (
                                            <div key={replyIndex} className="bg-gray-600 p-4 rounded-lg shadow-md mb-3">
                                                <div className='flex flex-row-reverse'>
                                                    <div className="flex items-center mb-2">
                                                        {reply?.owner?.avatar && (
                                                            <img src={reply.owner.avatar} alt="Reply Owner Avatar" className="w-8 h-8 rounded-full mr-3" />
                                                        )}
                                                        <span className="text-white font-semibold">{reply.owner?.username || 'Unknown User'}</span>
                                                    </div>
                                                </div>
                                                <p className="text-white mb-2">{reply.content}</p>
                                                <span className="text-gray-400 text-sm">
                                                    {new Date(reply.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {replyToTweetId === tweet._id && (
                                    <Reply replyOf={replyToTweetId} onReplySuccess={() => setHasNewReply(!hasNewReply)} />
                                )}

                                <div className='flex flex-row-reverse'>
                                    <button onClick={() => setReplyToTweetId(replyToTweetId === tweet._id ? null : tweet._id)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-10 rounded-lg mt-4 transition duration-200"
                                    >
                                        {replyToTweetId === tweet._id ? 'Cancel' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400">No tweets available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Discuss;
