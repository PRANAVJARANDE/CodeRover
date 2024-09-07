import React from 'react'

function UserTweets({user}) {
    return (
        <div className="bg-gray-700 p-5 rounded-lg shadow-lg mx-auto w-full max-h-screen overflow-y-auto ">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Your Tweets</h2>
                {(user.mytweets && user.mytweets.length > 0) ? (
                    user.mytweets.map((tweet, index) => (
                        <div key={index} className="bg-gray-900 p-6 mb-10 rounded-lg shadow-md">
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
    )
}

export default UserTweets
