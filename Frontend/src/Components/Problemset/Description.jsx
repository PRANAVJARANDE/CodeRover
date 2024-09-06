import React from 'react'

function Description({problem}) {
    return (
        <>
        <div className="mb-4">
            <p className="whitespace-pre-line">{problem.description}</p>
        </div>
        <div className="mb-4 bg-gray-700 p-7 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Input:</h2>
            <p className="whitespace-pre-line">{problem.input_format}</p>
        </div>

        <div className="mb-4 bg-gray-700 p-7 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Output:</h2>
            <p className="whitespace-pre-line">{problem.output_format}</p>
        </div>

        <div className="mb-4 bg-gray-700 p-7 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Constraints:</h2>
            <ul className="list-disc pl-5 text-gray-300">
                {problem.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                ))}
            </ul>
        </div>
 
        </> 
    )
}

export default Description
