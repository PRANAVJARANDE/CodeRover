import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { getdefaultlangtempService, updatedefaultlangService, updateTemplateService } from '../../Services/Problem.service.js';
import { isLoggedIn } from '../../Services/Auth.service.js';
import Loading from '../Loading/Loading.jsx';
import {Link} from 'react-router-dom'

function EditorBox() {
    if (!isLoggedIn()) {
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
        );
    }
    const defaultCodes = {
        cpp: `#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
        c: `#include<stdio.h>\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
        python: `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
    };

    const [isLoading, setIsLoading] = useState(true);
    const [template, setTemplate] = useState(defaultCodes);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(defaultCodes.cpp);
    const [theme, setTheme] = useState('vs-dark');

    const loadTemplateAndLanguage = async () => {
        const data = await getdefaultlangtempService();
        if (data) {
            setTemplate(data.template);
            setLanguage(data.default_language);
            setCode(data.template[data.default_language]);
        }
        setIsLoading(false);
    };
    useEffect(() => {
        loadTemplateAndLanguage();
    }, []);

    const handleLanguageChange = async (newLanguage) => {
        setLanguage(newLanguage);
        setCode(template[newLanguage]);
        await updatedefaultlangService(newLanguage);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div>
            <div className='flex justify-end items-center space-x-4 bg-gray-900 border-b-2 border-gray-700 pb-4 rounded-t-lg'>
                <select
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    value={language}
                    className="p-2 text-white bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-500"
                >
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                </select>

                <select
                    onChange={(e) => handleThemeChange(e.target.value)}
                    value={theme}
                    className="p-2 text-white bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-500"
                >
                    <option value="vs-dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="hc-black">High Contrast</option>
                </select>

                <button 
                    className='px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    onClick={async () => {
                        await updateTemplateService(language, { code });
                        setIsLoading(true);
                        loadTemplateAndLanguage();
                    }}
                >
                    Set as Template
                </button>
            </div>
            
            <div className='p-5 bg-gray-800 rounded-lg shadow-lg my-4'>
            <Editor
                height="70vh"
                width="100%"
                language={language}
                value={code}
                theme={theme}
                onChange={(value) => setCode(value)}
                options={{
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                }}
                className="rounded-lg overflow-hidden border border-gray-700"
            />
            </div> 
        </div>
    );
}

export default EditorBox;
