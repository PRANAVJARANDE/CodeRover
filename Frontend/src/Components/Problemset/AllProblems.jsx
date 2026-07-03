import React, { useMemo, useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProblemsService } from '../../Services/Problem.service';
import Loading from '../Loading/Loading.jsx';
import { getSolvedProblemService } from '../../Services/Submissions.service.js';


const difficultyColors = {
    easy: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
    medium: 'bg-amber-400/15 text-amber-200 border-amber-300/30',
    hard: 'bg-red-400/15 text-red-200 border-red-300/30'
};

const AllProblems = () => {
    const [solvedProblems, setSolvedProblems] = useState(new Set());
    const [search,setSearch]=useState('');
    const [difficulty,setDifficulty]=useState('all');
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

    const filteredProblems=useMemo(()=>{
        if(!problems)return [];
        return problems.filter((problem)=>{
            const matchesSearch=problem.title.toLowerCase().includes(search.toLowerCase());
            const matchesDifficulty=difficulty==='all' || problem.difficulty===difficulty;
            return matchesSearch && matchesDifficulty;
        });
    },[difficulty,problems,search]);

    if(!problems)return <Loading/>
    return (
        <div className="min-h-screen bg-slate-950 px-5 py-10 text-white lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/20">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Problemset</p>
                            <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Sharpen your coding edge</h1>
                            <p className="mt-4 max-w-2xl text-slate-400">Pick a challenge, run your solution, and keep your solved streak moving.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                                <p className="text-2xl font-black">{problems.length}</p>
                                <p className="text-xs font-bold uppercase text-slate-400">Problems</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                                <p className="text-2xl font-black text-emerald-300">{solvedProblems.size}</p>
                                <p className="text-xs font-bold uppercase text-slate-400">Solved</p>
                            </div>
                            <div className="col-span-2 rounded-2xl border border-white/10 bg-slate-900 p-4 sm:col-span-1">
                                <p className="text-2xl font-black text-cyan-300">{filteredProblems.length}</p>
                                <p className="text-xs font-bold uppercase text-slate-400">Showing</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
                    <input
                        value={search}
                        onChange={(e)=>setSearch(e.target.value)}
                        placeholder="Search problems"
                        className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:bg-white/[0.08]"
                    />
                    <select
                        value={difficulty}
                        onChange={(e)=>setDifficulty(e.target.value)}
                        className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 font-bold text-white outline-none transition focus:border-cyan-300/50"
                    >
                        <option value="all">All difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20">
                    <div className="grid grid-cols-[1fr_150px_120px] border-b border-white/10 bg-slate-900/70 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        <span>Title</span>
                        <span className="text-center">Difficulty</span>
                        <span className="text-center">Status</span>
                    </div>
                    <div className="divide-y divide-white/10">
                        {filteredProblems.map((problem,index) => (
                            <button
                                key={problem._id}
                                onClick={()=>{
                                    navigate(`/problems/${problem._id}`, { state: { solved: solvedProblems.has(problem._id) } });
                                }}
                                className="grid w-full grid-cols-[1fr_150px_120px] items-center px-6 py-5 text-left transition hover:bg-cyan-300/5"
                            >
                                <span className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-sm font-black text-cyan-200">
                                        {index+1}
                                    </span>
                                    <span className="font-bold text-slate-100">{problem.title}</span>
                                </span>
                                <span className="text-center">
                                    <span className={`inline-flex min-w-24 justify-center rounded-full border px-3 py-1 text-xs font-black uppercase ${difficultyColors[problem.difficulty]}`}>
                                        {problem.difficulty}
                                    </span>
                                </span>
                                <span className="text-center">
                                    {solvedProblems.has(problem._id) ? (
                                        <span className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200">Solved</span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-black text-slate-400">Open</span>
                                    )}
                                </span>
                            </button>
                        ))}
                        {!filteredProblems.length && (
                            <div className="px-6 py-12 text-center text-slate-400">No problems match your filters.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProblems;
