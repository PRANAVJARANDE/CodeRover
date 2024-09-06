import React, { useState } from 'react'

function SampleCases({example_cases}) {
    const [visibleIndex, setVisibleIndex] = useState(0);
    return (
    <>
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">Example Cases</h3>
            <div className="mb-4">
                {example_cases.map((x, index) => (
                <button key={index} className={`px-3 py-1 rounded-lg mr-2 ${visibleIndex===index?'bg-blue-600 text-white':'bg-gray-500 text-gray-300'}`}
                    onClick={() => setVisibleIndex(index)}>
                    Test Case {index + 1}
                </button>
                ))}
            </div>

            {example_cases.map((example, index) =>
                visibleIndex === index ? (
                <div key={index} className="bg-gray-700 p-4 rounded-lg mb-4 shadow-md">
                    <h4 className="text-white font-semibold mb-2">Example {index + 1}</h4>
                    <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="flex-1">
                        <span className="text-gray-300 font-semibold">Input:</span>
                        <pre className="bg-black text-white p-2 rounded-lg mt-1 whitespace-pre-wrap">
                        {example.input}
                        </pre>
                    </div>
                    <div className="flex-1 mt-4 sm:mt-0">
                        <span className="text-gray-300 font-semibold">Expected Output:</span>
                        <pre className="bg-black text-white p-2 rounded-lg mt-1 whitespace-pre-wrap">
                        {example.output}
                        </pre>
                    </div>
                    </div>
                    {example.explanation && (
                    <div className="text-gray-200 my-2">
                        <em>{example.explanation}</em>
                    </div>
                    )}
                </div>
                ) : null
            )}
        </div>
    </>        
    )
}

export default SampleCases
