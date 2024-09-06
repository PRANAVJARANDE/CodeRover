import React from 'react';

const Executing = ({text}) => {
    return (
        <div className="p-10 rounded-lg inset-0 bg-gray-700 bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50">
            <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 mb-4 animate-spin"></div>
                <p className="text-lg font-semibold text-gray-700">{text}...</p>
            </div>
        </div>
    );
};

export default Executing;
