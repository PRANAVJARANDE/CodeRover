import React, { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import Loading from '../Loading/Loading.jsx';

const actionCards = [
    {
        title:'Problems',
        text:'Practice coding questions and submit solutions.',
        to:'/problems',
        accent:'from-cyan-300 to-blue-500',
    },
    {
        title:'Discuss',
        text:'Ask doubts and share ideas with others.',
        to:'/discuss',
        accent:'from-emerald-300 to-teal-500',
    },
    {
        title:'Interview',
        text:'Join or create scheduled interview rooms.',
        to:'/join-interview',
        accent:'from-violet-400 to-fuchsia-500',
    },
];

function Home() {
    
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer); 
    }, []);
    if (isLoading) {
        return <Loading />;
    }

    return (
        <main className="min-h-screen bg-slate-800 px-5 py-8 text-white lg:px-8">
            <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-7 lg:grid-cols-[0.82fr_1.18fr]">
                <div className="flex min-h-[360px] items-center justify-center p-4">
                    <img src="/homelogo.png" alt="CodeRover" className="h-64 w-64 rounded-full object-cover shadow-2xl shadow-black/40 sm:h-80 sm:w-80" />
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 lg:p-8">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Workspace</p>
                    <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Welcome to CodeRover</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-400">
                        Choose where you want to go next. Simple, fast, and focused.
                    </p>

                    <div className="mt-6 grid gap-4">
                        {actionCards.map((card) => (
                            <Link
                                key={card.title}
                                to={card.to}
                                className="group rounded-2xl border border-white/10 bg-slate-900/80 p-5 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-slate-900"
                            >
                                <div className={`mb-4 h-1.5 w-14 rounded-full bg-gradient-to-r ${card.accent}`} />
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-white">{card.title}</h2>
                                        <p className="mt-1.5 text-sm leading-6 text-slate-400">{card.text}</p>
                                    </div>
                                    <span className="inline-flex w-fit rounded-full bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950 transition group-hover:bg-white">
                                        Open
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home

