import React from 'react'

function ProblemStats({user}) {
    const problems={
        easy:2,
        medium:2,
        hard:2,
      }
    const stats=[
        {label:'Easy',value:user.easyCount,total:problems.easy,color:'bg-emerald-400',text:'text-emerald-300'},
        {label:'Medium',value:user.mediumCount,total:problems.medium,color:'bg-amber-400',text:'text-amber-300'},
        {label:'Hard',value:user.hardCount,total:problems.hard,color:'bg-red-400',text:'text-red-300'},
    ];
    return (
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white">Problem Stats</h2>
                    <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-cyan-200">
                        {(user.easyCount || 0) + (user.mediumCount || 0) + (user.hardCount || 0)} solved
                    </span>
                </div>
                <div className="grid gap-4">
                    {stats.map((stat)=>{
                        const width=Math.min(((stat.value || 0) / stat.total) * 100,100);
                        return (
                            <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className={`text-sm font-black ${stat.text}`}>{stat.label}</span>
                                    <span className="text-sm font-bold text-slate-400">{stat.value || 0}/{stat.total}</span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                                    <div className={`h-full rounded-full ${stat.color}`} style={{ width: `${width}%`}}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
    )
}

export default ProblemStats
