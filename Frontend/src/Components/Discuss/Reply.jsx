import React, { useState } from 'react'
import {  useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../Services/Auth.service';
import { toast } from 'react-hot-toast';
import { createTweetService } from '../../Services/Tweet.service';

function Reply({replyOf=''}) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const navigate=useNavigate();

    const handleTweetCreate = () => {
        if(!isLoggedIn())
        {
            toast.error('Login to Tweet');
            navigate('/login');
            return;
        }
        if(!content)
        {
            toast.error('Content Required');
            return;
        }
        const helper=async()=>{
            const response=await createTweetService(content,replyOf,file);
            if(response)
            {
                toast.success('Tweet Created');
                content('');
                file(null);
                navigate('/discuss');
            }
        }

        helper();
    };
    

    return (
        <>
        <div className="mb-4">
            <textarea placeholder="Write your content..." value={content} onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="flex items-center justify-between">
            <input type="file" className="text-white bg-gray-700 py-2 px-4 rounded-lg cursor-pointer focus:outline-none" onChange={(e) => setFile(e.target.files[0])}/>
            <button onClick={handleTweetCreate} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200">
                {replyOf==='' && (<>Create Tweet</>)}
                {replyOf && (<>Send</>)}
            </button>
        </div>
        </>
    )
}

export default Reply
