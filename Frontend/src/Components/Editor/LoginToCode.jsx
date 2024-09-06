import React from 'react'
import { Link } from 'react-router-dom'

function LoginToCode() {
    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 rounded-lg">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">You need to login</h2>
            <p className="text-gray-600 mb-6">Please log in to access the code editor.</p>
            <Link to="/login"
                className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300"
                    >
                Login Now
            </Link>
        </div>
    </div>
    )
}

export default LoginToCode
