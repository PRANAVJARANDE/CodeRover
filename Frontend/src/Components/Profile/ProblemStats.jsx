import React from 'react'

function ProblemStats({user}) {
    const problems={
        easy:2,
        medium:2,
        hard:2,
      }
    return (
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
    )
}

export default ProblemStats
