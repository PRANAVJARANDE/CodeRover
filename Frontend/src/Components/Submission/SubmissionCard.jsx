import React, { useState } from 'react';

function SubmissionCard({ submission,displayproblem}) {
    const [showCode, setShowCode] = useState(false);
    const toggleCode = () => setShowCode(!showCode);
    return (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 shadow-md flex flex-col space-y-1">
            {displayproblem && 
                <div className='bg-gray-800 py-1 px-2 rounded-lg shadow-md flex justify-between mb-2'>
                    <div className='text-2xl font-extrabold text-blue-400 mb-1'>
                        {submission.problem.title}
                    </div>
                    <div className={`text-xl mr-2 font-extrabold ${submission.problem.difficulty === 'easy' ? 'text-green-400' : submission.problem.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {submission.problem.difficulty}
                    </div>
                </div>
            }

            <div className="flex justify-between items-center">
                <span className="flex font-extrabold text-gray-300">Language : <p className='text-blue-400 ml-2 '> {submission.language}</p></span>
                <span className="text-gray-100">{new Date(submission.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex  justify-between items-center pb-1 ">
                <span className={`font-extrabold text-lg ${submission.status ? 'text-green-400' : 'text-red-600'} `}>
                    {submission.status ? 'Accepted' : 'Rejected'}
                </span>
            </div>
            
            <div className="flex flex-col">
                <button
                    className="text-white bg-blue-700 hover:bg-yellow-400 py-1 px-2 rounded-md transition-colors"
                    onClick={toggleCode}
                >
                    {showCode ? 'Hide Code' : 'Show Code'}
                </button>
                {showCode && (
                    <div className="relative mt-2">
                        <pre className="whitespace-pre-wrap bg-gray-800 p-4 rounded-md shadow-inner overflow-auto max-h-64">
                            {submission.code}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SubmissionCard;
