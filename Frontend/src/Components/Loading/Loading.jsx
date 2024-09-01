import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="w-20 h-20 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-green-500 border-solid rounded-full animate-spin delay-150"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-yellow-500 border-solid rounded-full animate-spin delay-300"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-red-500 border-solid rounded-full animate-spin delay-450"></div>
      </div>
    </div>
  );
};

export default Loading;
