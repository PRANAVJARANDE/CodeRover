import React, { useEffect, useState } from 'react'
import Reply from '../Discuss/Reply.jsx';
import { fetchProblemTweets } from '../../Services/Tweet.service.js';
function DiscussProblem({id}) {
    const [tweets, setTweets] = useState([]);
    useEffect(()=>{
        const helper=async()=>{
            const response=await fetchProblemTweets(id);
            if(response)setTweets(response);
        }
        helper();
    });
    return (
        <div className='min-h-screen flex flex-col'>
            <div className="space-y-6 mt-4 mb-10">
                {tweets.length > 0 ? (
                    tweets.map((tweet, index) => (
                        <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-row items-center">
                                    {tweet.owner.avatar && (
                                        <img src={tweet.owner.avatar} alt="User Avatar" className="w-10 h-10 rounded-full mr-4 mb-2" />
                                    )}
                                    <span className="text-white font-semibold">{tweet.owner.username}</span>
                                </div>
                                <span className="text-gray-400 text-lg">
                                    {new Date(tweet.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-white mb-4 text-xl">{tweet.content}</p>
                            {tweet.image && <img src={tweet.image} alt="Tweet" className="rounded-lg mb-4 max-w-full h-auto" />}
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400">Nothing Discussed Yet...</div>
                )}
            </div>
            <div className='bg-black p-4 my-6 rounded-lg'>
                <Reply replyOf={id}/>
            </div>
        </div>
    )
}

export default DiscussProblem
