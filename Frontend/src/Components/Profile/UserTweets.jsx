import React from 'react'

function UserTweets({user}) {
    return (
        <div className="max-h-screen w-full overflow-y-auto">
            <h2 className="mb-5 text-2xl font-black text-white">Your Tweets</h2>
                {(user.mytweets && user.mytweets.length > 0) ? (
                    user.mytweets.map((tweet, index) => (
                        <div key={index} className="mb-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-md">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-400">
                                    {new Date(tweet.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="mb-4 whitespace-pre-line text-base leading-7 text-slate-200">{tweet.content}</p>
                            {tweet.image && (<img src={tweet.image} alt="Tweet" className="mb-4 max-h-[420px] w-full rounded-2xl border border-white/10 object-cover"/>)}
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 text-center text-slate-500">No tweets available</div>
                )}
        </div>
    )
}

export default UserTweets
