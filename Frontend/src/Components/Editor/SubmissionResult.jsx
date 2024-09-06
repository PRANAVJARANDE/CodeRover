import React from 'react';

const SubmissionResult = ({ submissionStatus }) => {
    if (!submissionStatus) {
        return null;
    }

    if (submissionStatus.statusCode === 200) {
        const isCorrect = !submissionStatus.data;
        const resultMessage = isCorrect ? "Correct Submission" : "Wrong Submission";
        const messageStyle = isCorrect ? "bg-green-700" : "bg-red-600";
        const icon = isCorrect ? "✅" : "❌";
        
        return (
            <div className={`p-4 rounded-md shadow-md ${messageStyle} text-white`}>
                <div className="flex items-center space-x-3 pb-3">
                    <span className="text-3xl">{icon}</span>
                    <h1 className="text-2xl font-extrabold">{resultMessage}</h1>
                </div>
                {!isCorrect && (
                    <div className="mt-2">
                        <h2 className="font-semibold mb-2">Failed on testcase:</h2>
                        <pre className="bg-black p-3 rounded-md mt-1 text-sm">
                            <strong>Input:</strong> {submissionStatus.data.input}
                            <br />
                            <strong>Output:</strong> {submissionStatus.data.output}
                            <br />
                            <strong>Expected:</strong> {submissionStatus.data.expectedOutput}
                        </pre>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div className="p-4 bg-red-600 text-white rounded-lg shadow-md">
                <div className="flex items-center space-x-3 pb-3">
                    <span className="text-3xl">❌</span>
                    <h2 className="text-2xl font-extrabold pb-1">Submission Error:</h2>
                </div>
                <pre className="mt-2 bg-black p-2 rounded-lg text-md">{submissionStatus.data}</pre>
            </div>
        );
    }
};

export default SubmissionResult;
