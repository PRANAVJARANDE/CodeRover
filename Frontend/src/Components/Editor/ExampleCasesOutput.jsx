import React, { useState } from 'react';

function ExampleCasesOutput({ exampleCasesExecution }) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  console.log(exampleCasesExecution);

  if (exampleCasesExecution.statusCode === 403) {
    return (
      <div className='bg-red-600 p-6 rounded-lg '>
        <h1 className='text-2xl font-extrabold'>Runtime Error</h1>
        <div className='bg-black rounded-lg p-3 mt-4'>
          {exampleCasesExecution.data}
        </div>
      </div>
    );
  }

  return (
  <>
  <h3 className="text-2xl font-extrabold text-white mb-4">Execution Results</h3>
  <div className="flex flex-wrap mb-6">
    {exampleCasesExecution.data.map((execution, index) => (
      <button
        key={index}
        className={`px-4 py-2 rounded-lg font-vold mr-2 mb-2 transition-all duration-300 ease-in-out flex items-center text-white ${
          visibleIndex === index
            ? 'bg-gray-500  shadow-lg' 
            : execution.isMatch
            ? 'bg-gray-800' 
            : 'bg-gray-800' 
        }`}
        onClick={() => setVisibleIndex(index)}
      >
        {execution.isMatch ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 bg-black rounded-full"
            viewBox="0 0 20 20"
            fill="green"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 bg-black rounded-full"
            viewBox="0 0 20 20"
            fill="red"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}

        Test Case {index + 1}
      </button>
    ))}
  </div>

  {exampleCasesExecution.data.map((execution, index) =>
    visibleIndex === index ? (
      <div
        key={index}
        className={`p-6 rounded-lg shadow-md text-white transition-all duration-500 ease-in-out ${
          execution.isMatch ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        <h4 className="font-semibold text-lg mb-4">Test Case {index + 1}</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Input */}
          <div className="flex-1">
            <span className="text-gray-300 block mb-1">Input:</span>
            <pre className="bg-gray-800 text-white p-3 rounded-lg whitespace-pre-wrap">
              {execution.input}
            </pre>
          </div>

          {/* Expected Output */}
          <div className="flex-1">
            <span className="text-gray-300 block mb-1">Expected Output:</span>
            <pre className="bg-gray-800 text-white p-3 rounded-lg whitespace-pre-wrap">
              {execution.expectedOutput}
            </pre>
          </div>

          {/* Actual Output */}
          <div className="flex-1">
            <span className="text-gray-300 block mb-1">Actual Output:</span>
            <pre className="bg-gray-800 text-white p-3 rounded-lg whitespace-pre-wrap">
              {execution.actualOutput}
            </pre>
          </div>
        </div>
      </div>
    ) : null
  )}
</>


  );
}

export default ExampleCasesOutput;
