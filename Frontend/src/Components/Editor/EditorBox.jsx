import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { getdefaultlangtempService, updatedefaultlangService, updateTemplateService } from '../../Services/Problem.service.js';
import { isLoggedIn } from '../../Services/Auth.service.js';
import Loading from '../Loading/Loading.jsx';
import { runExampleCasesService, submitCodeService } from '../../Services/CodeRun.service.js';
import Executing from './Executing.jsx';
import LoginToCode from './LoginToCode.jsx';
import ExampleCasesOutput from './ExampleCasesOutput.jsx';
import SampleCases from './SampleCases.jsx';
import SubmissionResult from './SubmissionResult.jsx';

function EditorBox({ problem }) {
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
    const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submissionStatus,setsubmissionStatus] =useState(null);

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

    const clickRun = async() => {
        setExampleCasesExecution(null);
        setsubmissionStatus(null);
        setExecuting(true);
        const response = await runExampleCasesService(language, code, problem.example_cases);
        if (response) {
            setExampleCasesExecution(response);
        }
        setExecuting(false);
    };

    const submitCode=async()=>{
        setExampleCasesExecution(null);
        setsubmissionStatus(null);
        setSubmitting(true);
        const response=await submitCodeService(language,code,problem._id);
        if(response)
        {
            setsubmissionStatus(response);
        }
        setSubmitting(false);
    }

    if(isLoading) return <Loading />;
    return (
        <div>
            {!isLoggedIn() ? (<LoginToCode/>) : (
            <div>
                <div className="flex justify-between items-center bg-gray-900 border-b-2 border-gray-700 pb-4">
                    <div className="flex space-x-4 ">
                        <button onClick={clickRun}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            Run
                        </button>
                        {problem && (
                            <button onClick={submitCode}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            >
                                Submit
                            </button>
                        )}
                    </div>
                    <div className="flex space-x-4 items-center  rounded-t-lg">
                        <select
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            value={language}
                            className="p-1 text-white bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-500"
                        >
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                        </select>

                        <select
                            onChange={(e) => handleThemeChange(e.target.value)}
                            value={theme}
                            className="p-1 text-white bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring focus:ring-blue-500"
                        >
                            <option value="vs-dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="hc-black">High Contrast</option>
                        </select>

                        <button
                            className="px-2 py-1 text-white bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={async () => {
                                await updateTemplateService(language, { code });
                                setIsLoading(true);
                                loadTemplateAndLanguage();
                            }}
                        >
                            Set as Template
                        </button>
                    </div>
                </div>

                <div className="p-5 bg-gray-800 rounded-lg shadow-lg my-4">
                    <Editor
                        height="63vh"
                        width="100%"
                        language={language}
                        value={code}
                        theme={theme}
                        onChange={(e) => setCode(e)}
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
                {submitting ? <Executing text={"Submitting"}/> :  
                <>
                {submissionStatus ? <SubmissionResult submissionStatus={submissionStatus}/> :
                <>
                {submitting && <Executing text={"Submitting"}/>}
                    {problem && !submitting && ( 
                        <div className="mt-4">
                            {executing ? (<Executing text={"Executing"}/>) : (
                                <>
                                    {exampleCasesExecution ? (<ExampleCasesOutput exampleCasesExecution={exampleCasesExecution}/>) 
                                        : (<SampleCases example_cases={problem.example_cases}/>)}
                                </>
                            )}
                        </div>
                    )}
                </>
                }
                </>
                }
            </div>
            )}
        </div>
    );
}

export default EditorBox;
