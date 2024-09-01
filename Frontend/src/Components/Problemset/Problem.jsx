import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../Loading/Loading.jsx';
import { getProblemService } from '../../Services/Problem.service.js';
import Solution from './Solution.jsx';
import Description from './Description.jsx';
import DiscussProblem from './DiscussProblem.jsx';
import EditorBox from '../Editor/EditorBox.jsx';

const difficultyColors = {
    easy: 'bg-green-500 text-white',
    medium: 'bg-yellow-500 text-white',
    hard: 'bg-red-600 text-white'
};

function Problem() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [activeTab, setActiveTab] = useState('description'); 

    useEffect(() => {
        const helper = async () => {
            const response = await getProblemService(id);
            if (response) setProblem(response);
        }
        helper();
    }, [id]);

    if (!problem) return <Loading />

    return (
        <div className="min-h-screen bg-gray-800 text-white flex p-8">
            <div className="w-1/2 min-h-screen p-7 bg-gray-900 rounded-lg mr-3">
                <div className="flex bg-gray-900 pb-4 border-b-2 border-gray-700 mb-4">
                    <button
                        className={`mx-2 px-4 py-2 font-semibold rounded-lg focus:outline-none transition duration-300 ${
                            activeTab === 'description' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                        onClick={() => setActiveTab('description')}>
                        Description
                    </button>
                    <button
                        className={`mx-2 px-4 py-2 font-semibold rounded-lg focus:outline-none transition duration-300 ${
                            activeTab === 'solution' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                        onClick={() => setActiveTab('solution')}>
                        Solution
                    </button>
                    <button
                        className={`mx-2 px-4 py-2 font-semibold rounded-lg focus:outline-none transition duration-300 ${
                            activeTab === 'discuss' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                        onClick={() => setActiveTab('discuss')}>
                        Discuss
                    </button>
                    <button
                        className={`mx-2 px-4 py-2 font-semibold rounded-lg focus:outline-none transition duration-300 ${
                            activeTab === 'submissions' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                        onClick={() => setActiveTab('submissions')}>
                        Submissions
                    </button>
                </div>
                <h1 className="text-4xl font-semibold mb-4">{problem.title}</h1>
                <div className="flex items-center mb-4">
                    <span className={`text-sm font-semibold px-4 py-1 rounded ${difficultyColors[problem.difficulty]}`}>
                        {problem.difficulty}
                    </span>
                </div>
                {activeTab === 'description' && (<Description problem={problem}/>)}
                {activeTab === 'solution' && (<Solution solution={problem.solution}/>)}
                {activeTab === 'discuss' && (<DiscussProblem id={id}/>)}
                {activeTab === 'submissions' && (<></>)}
            </div>

            <div className="w-1/2 min-h-screen p-7 bg-gray-900 ml-3 rounded-lg">
                <EditorBox/>
            </div>
        </div>
    );
}

export default Problem;
