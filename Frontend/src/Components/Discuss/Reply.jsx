import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../Services/Auth.service';
import { toast } from 'react-hot-toast';
import { createTweetService } from '../../Services/Tweet.service';

function Reply({ replyOf = '', onReplySuccess }) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleTweetCreate = () => {
        if (!isLoggedIn()) {
            toast.error('Login to Tweet');
            navigate('/login');
            return;
        }
        if (!content) {
            toast.error('Content Required');
            return;
        }
        const helper = async () => {
            const response = await createTweetService(content, replyOf, file);
            if (response) {
                toast.success('Tweet Created');
                setContent('');
                setFile(null);
                onReplySuccess(); // Trigger the callback on successful tweet/reply
                navigate('/discuss');
            }
        };

        helper();
    };

    return (
        <>
            <div className="mb-4">
                <textarea
                    placeholder="Write your content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
                />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <label className="flex min-w-0 cursor-pointer items-center rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-700">
                    <span className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-slate-950">Choose File</span>
                    <span className="ml-3 truncate">{file?.name || 'No file chosen'}</span>
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                </label>
                <button
                    onClick={handleTweetCreate}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-400 sm:self-stretch"
                >
                    {replyOf === '' ? <>Create Tweet</> : <>Send</>}
                </button>
            </div>
        </>
    );
}

export default Reply;
