import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../Features/useSocket.js';
import Editor from '@monaco-editor/react';
import Timer from './Timer.jsx';
import { runExampleCasesService } from '../../Services/CodeRun.service.js';
import Executing from '../Editor/Executing.jsx'
import ExampleCasesOutput from '../Editor/ExampleCasesOutput.jsx';

function Room() {
  const defaultCodes = {
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
      c: `#include<stdio.h>\n\nint main() {\n    // Your code here\n\n    return 0;\n}`,
      java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
      python: `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
  };
  const [cases, setCases] = useState([
    { id: 1, input: '', output: '' },
    { id: 2, input: '', output: '' }
  ]);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(defaultCodes.cpp);
  const [theme, setTheme] = useState('vs-dark');
  const { roomId } = useParams();
  const [isAudioOn, setAudioOn] = useState(false);
  const [isVideoOn, setVideoOn] = useState(false);
  const [exampleCasesExecution, setExampleCasesExecution] = useState(null);
  const [executing, setExecuting] = useState(false);
  const socket=useSocket();
  const navigate=useNavigate();
  useEffect(()=>{

  },[]);

  const toggleAudio = () => {
    setAudioOn(!isAudioOn);
  };

  const toggleVideo = () => {
    setVideoOn(!isVideoOn);
  };

  const handleLanguageChange = async (newLanguage) => {
      setLanguage(newLanguage);
      setCode(defaultCodes[newLanguage]);
      await updatedefaultlangService(newLanguage);
  };

  const handleThemeChange = (newTheme) => {
      setTheme(newTheme);
  };

  const handleInputChange = (index, field, value) => {
    const newCases = [...cases];
    newCases[index][field] = value;
    setCases(newCases);
  };

    const clickRun = async() => {
        setExampleCasesExecution(null);
        setExecuting(true);
        const response = await runExampleCasesService(language, code, cases);
        if (response) {
            setExampleCasesExecution(response);
        }
        setExecuting(false);
    };

    const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); 
      })
      .catch(() => {
        setCopySuccess(false);
      });
  };


  return (
    <div className="h-screen p-6 bg-gray-800 flex text-white justify-evenly">
      <div className='bg-gray-900 p-6 rounded-lg w-1/4'>
        <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-evenly space-x-4">
          <button className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition" onClick={()=>{
            navigate('/join-interview');
          }}>
            <img className="h-6 w-6" src={'/endcall.png'} alt="end call" />
          </button>
          <button className={`py-2 px-4 rounded-lg shadow-md transition ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`} onClick={toggleAudio}>
              <img className="h-6 w-6" src={isAudioOn ? '/micon.png' : '/micoff.png'} alt="Microphone" />
          </button>
          <button className={`py-2 px-4 rounded-lg shadow-md transition ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`} onClick={toggleVideo}>
              <img className="h-6 w-6" src={isVideoOn ? '/camera-on.png' : '/camera-off.png'} alt="Camera" />
          </button>
        </div>

        <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-300 text-center">Test Cases</h3>
            {executing ? <Executing text={"Executing"}/> :
            <>
              {exampleCasesExecution ? 
              <>
                <div className='bg-gray-700 rounded-lg p-2'>
                  <ExampleCasesOutput exampleCasesExecution={exampleCasesExecution}/>
                </div>
              </>: 
              <>{cases.map((exampleCase, index) => (
            <div key={exampleCase.id} className="bg-gray-700 p-4 rounded-lg shadow-md space-y-2">
              <div>
                <label className="pb-1 block text-sm font-medium text-gray-300">Input</label>
                <input
                  type="text"
                  value={exampleCase.input}
                  onChange={(e) => handleInputChange(index, 'input', e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
                />
              </div>
              <div>
                <label className="pb-1 block text-sm font-medium text-gray-300">Expected Output</label>
                <input
                  type="text"
                  value={exampleCase.output}
                  onChange={(e) => handleInputChange(index, 'output', e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
                />
              </div>
            </div>
          ))}</>
              }
            </>
            }
      
        </div>
      </div>
      </div>

    <div className="px-6 bg-gray-900 mx-8 rounded-lg p-8 w-1/2">
      <div className="bg-gray-900 rounded-lg shadow-md relative h-full">
      <div>
        <div className="flex justify-between items-center bg-gray-900 border-b-2 border-gray-700 pb-4">
          <div className="flex space-x-4 ">
          <button onClick={clickRun} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
            Run
          </button>
        </div>
        <div className="flex space-x-4 items-center  rounded-t-lg">
          <select onChange={(e) => handleLanguageChange(e.target.value)}value={language}
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
        </div>
      </div>
      <div className="p-5 bg-gray-800 rounded-lg shadow-lg my-4">
        <Editor height="63vh" width="100%"
            language={language}
            value={code}
            theme={theme}
            onChange={(e) => setCode(e)}
            options={{fontSize: 16,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: "on",
                      }}
            className="rounded-lg overflow-hidden border border-gray-700"/>
        </div>
        </div>
        </div>
    </div>
    
    <div className='w-1/4 flex flex-col h-full bg-gray-900 p-4 rounded-lg'>
      <div className='bg-green-600 mb-6 p-2 rounded-xl flex justify-between items-center'>
        <p className="text-3xl font-bold text-center">Room: {roomId}</p>
        {copySuccess? <>
          <p className="text-lg text-white text-center">Copied!</p>
        </>:
        <button onClick={handleCopy} className="bg-white text-white px-3 py-1 rounded-lg ml-4 hover:bg-blue-200 transition-all">
          <img className='w-6' src='/copy.png'/>
        </button>
        }
      </div>
      <div className="bg-gray-700 mb-6 p-4 rounded-lg">
        <Timer />
      </div>
      <div className="bg-gray-700 p-2 rounded-lg shadow-md flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold mb-2">Interviewee</h3>
        <div className="bg-gray-800 h-48 w-full rounded-lg flex justify-center items-center">
          Video
        </div>
      </div>
    </div>
</div>

  );
}

export default Room;
