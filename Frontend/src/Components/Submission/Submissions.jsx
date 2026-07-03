import React, { useEffect, useState } from 'react';
import { getSubmissionService } from '../../Services/Submissions.service.js';
import Loading from '../Loading/Loading.jsx';
import SubmissionCard from './SubmissionCard.jsx';

function Submissions({ problem_id,displayproblem}) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { 
        const fetchSubmissions = async () => {
            setLoading(true); 
            const response = await getSubmissionService(problem_id);
            setSubmissions(response);
            setLoading(false); 
        };
        fetchSubmissions();
    }, []);

    return (
        <div className="max-h-screen overflow-y-auto">
    {loading ? (
        <Loading />
    ) : (
        submissions.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center text-xl font-extrabold text-white">No submissions</p>
        ) : (
            <div className="space-y-4">
                {submissions.map((submission, index) => (
                    <>
                    <SubmissionCard key={index} submission={submission} displayproblem={displayproblem}/>
                    </>
                ))}
            </div>
        )
    )}
</div>

    );
}

export default Submissions;
