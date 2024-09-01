import React from 'react'

function Solution({solution}) {
    return (
        <div className="space-y-8 p-6 to-gray-800 rounded-lg shadow-lg">
            {Object.keys(solution).map((lang, index) => (
                lang==='_id'? <></>:
                    <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2 bg-gray-800 rounded-lg">
                        <p className="cursor-pointer text-yellow-500 font-bold text-lg mb-2 p-4">
                            {lang.toUpperCase()} Solution
                        </p>
                        <pre className="p-4 bg-black text-yellow-100 rounded-lg overflow-auto">
                            {solution[lang]}
                        </pre>
                    </div>
                ))}
        </div>
    )
}

export default Solution
