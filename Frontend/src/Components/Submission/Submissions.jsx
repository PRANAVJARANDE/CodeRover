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
        <div className="p-4 bg-gray-700 rounded-lg max-h-screen overflow-y-auto">
    {loading ? (
        <Loading />
    ) : (
        submissions.length === 0 ? (
            <p className="bg-gray-900 rounded-lg text-white font-extrabold p-2 text-2xl ">No submissions</p>
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
