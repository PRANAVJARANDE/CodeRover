import { toast } from 'react-hot-toast';
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const getSubmissionService=async (problem_id)=>{
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${backendURL}/submissions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({problem_id}),
        });
        const data = await response.json();
        if (response.status === 200) {
            return data.data;
        } 
        else 
        {
            toast.error(data.message);  
            return [];
        }
    } catch (error) {
        toast.error("Server error",error);  
        return [];
    }    
}

export const getSolvedProblemService=async ()=>{
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${backendURL}/submissions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (response.status === 200) {
            const solved = new Set(data.data.map((x) => x.problem._id));
            console.log(solved);
            return solved;
        } 
        return null;
    } catch (error) {
        console.log(error);
        toast.error("Serverrrrrrrrrrrr error",error);  
        return null;
    }    
}