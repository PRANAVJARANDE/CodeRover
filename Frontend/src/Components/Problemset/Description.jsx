import React from 'react'

function Description({problem}) {
    return (
        <>
        <div className="mb-4">
            <p className="whitespace-pre-line">{problem.description}</p>
        </div>
        <div className="mb-4 bg-gray-800 p-7 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Input:</h2>
            <p className="whitespace-pre-line">{problem.input_format}</p>
        </div>

        <div className="mb-4 bg-gray-800 p-7 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Output:</h2>
            <p className="whitespace-pre-line">{problem.output_format}</p>
        </div>

        <div className="mb-4 bg-gray-800 p-7 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Constraints:</h2>
            <ul className="list-disc pl-5 text-gray-300">
                {problem.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                ))}
            </ul>
        </div>

        <div className="mb-4 bg-gray-800 p-7 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Example Cases:</h2>
            {problem.example_cases.map((example, index) => (
                <div key={index} className="mb-4">
                    <h3 className="font-semibold my-2">Input:</h3>
                    <pre className="bg-black p-2 rounded">{example.input}</pre>
                    <h3 className="font-semibold my-2">Output:</h3>
                    <pre className="bg-black p-2 rounded">{example.output}</pre>
                    <p className="text-gray-200 my-2"><em>{example.explanation}</em></p>
                </div>
            ))}
        </div>   
        </> 
    )
}

export default Description
