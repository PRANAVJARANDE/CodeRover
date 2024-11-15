import React, { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import Loading from '../Loading/Loading.jsx';
import { refreshTokenService } from '../../Services/Auth.service.js';

function Home() {
    
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        refreshTokenService()
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer); 
    }, []);
    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen flex bg-gray-800 text-white p-10">
            <div className="w-1/3 flex items-center justify-center  rounded-lg  p-6 bg-gray-900 ">
                <img src="/homelogo.png" alt="Logo" className="h-96 drop-shadow-lg rounded-full object-cover" />
            </div>

            <div className="w-2/3 flex flex-col items-center justify-center p-16 space-y-8 m-12">
                <h1 className="text-5xl font-extrabold text-yellow-400 mb-12 animate-fade-in">Welcome to CodeRover</h1>
                <div className="w-full flex flex-col space-y-6">
                    <Link to="/problems" className="w-full">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-xl transform hover:scale-105 transition duration-300 text-2xl">
                            Problemset
                        </button>
                    </Link>
                    <Link to="/discuss" className="w-full">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-xl transform hover:scale-105 transition duration-300 text-2xl">
                            Discuss
                        </button>
                    </Link>
                    <Link to="/join-interview" className="w-full">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-xl transform hover:scale-105 transition duration-300 text-2xl">
                            Join Interview
                        </button>
                    </Link>
                    <Link to="/host-interview" className="w-full">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-xl transform hover:scale-105 transition duration-300 text-2xl">
                            Host Interview
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Home
