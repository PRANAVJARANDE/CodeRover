import { toast } from 'react-hot-toast';
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const runExampleCasesService = async (language, code, example_cases) => {
    try {
        const userData ={language,code,example_cases};
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${backendURL}/runcode/runexaplecases`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (response.status === 200) {
            toast.success('Executed Successfully');
            return data.data;
        } else if (response.status === 403) {
            if(data.data.actualOutput=="TLE")toast.error('TLE');
            else toast.error('Syntax Error');
            return data.data;
        } else {
            toast.error('Server Error');
            return null;
        }
    } catch (error) {
        toast.error("Server Error");
        return null;
    }
};

export const submitCodeService = async(language,code,problem_id)=>{
    try {
        const userData={language,code,problem_id};
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${backendURL}/runcode/submitcode`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if(response.status === 200) 
        {
            if(!data.data.data)toast.success("Correct Submission");
            else toast.error("Incorrect Submission");
            return data.data;
        }
        else if (response.status === 403) 
        {
            if(data.data=="Time Limit Exceeded")toast.error('TLE');
            else toast.error('Syntax Error');
            return data.data;
        } 
        else
        {
            toast.error('Wrong Answer');
            return null
        }
        
    } catch (e){
        toast.error("Server Error");
        return null;
    }
}