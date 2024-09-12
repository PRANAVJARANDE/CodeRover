import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProblemsService } from '../../Services/Problem.service';
import Loading from '../Loading/Loading.jsx';
import { getSolvedProblemService } from '../../Services/Submissions.service.js';


const difficultyColors = {
    easy: 'bg-green-500 text-white',
    medium: 'bg-yellow-500 text-white',
    hard: 'bg-red-600 text-white'
};

const AllProblems = () => {
    const [solvedProblems, setSolvedProblems] = useState(new Set());
    const navigate=useNavigate();
    const [problems,setproblems]=useState(null);
    useEffect(()=>{
        const helper=async ()=>{
            const response1=await getAllProblemsService();
            const response2=await getSolvedProblemService();
            if(response1)setproblems(response1);
            if(response2)setSolvedProblems(response2);
        }
        helper();
    },[]);

    if(!problems)return <Loading/>
    return (
        <div className="min-h-screen flex bg-gray-800 text-white p-10">
            <div className="w-1/3 flex items-center justify-center p-6 rounded-lg  bg-gray-900">
                <img src="/homelogo.png" alt="Logo" className="h-96 drop-shadow-lg rounded-full object-cover"/>
            </div>
            
            <div className="w-2/3 m-14">
                <h1 className="text-5xl font-extrabold text-yellow-400 mb-12 animate-fade-in underline underline-offset-8">
                    Problems
                </h1>
                <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden flex justify-center">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-600 text-sm font-bold text-gray-300 tracking-wider text-center ">
                            <tr>
                                <th className="text-left px-6 py-5">TITLE</th>
                                <th className="px-6 py-5">DIFFICULTY</th>
                                <th className="px-6 py-5">SOLVED</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        
                            {problems.map((problem,index) => (
                                <tr key={problem._id} onClick={()=>{
                                    navigate(`/problems/${problem._id}`, { state: { solved: solvedProblems.has(problem._id) } });
                                }} className="hover:bg-gray-700 transition duration-300 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-100">
                                        {index+1}. {problem.title}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-md text-center font-medium ${difficultyColors[problem.difficulty]}`}>
                                        {problem.difficulty}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap flex justify-center">
                                        {solvedProblems.has(problem._id) &&  
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-9 w-9"
                                                viewBox="0 0 20 20"
                                                fill="green"
                                            >
                                                <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                                clipRule="evenodd"
                                                />
                                            </svg>
                                        </> }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllProblems;
