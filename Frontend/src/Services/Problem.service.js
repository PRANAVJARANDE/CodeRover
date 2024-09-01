import { toast } from 'react-hot-toast';
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const getAllProblemsService = async () => {
  try {
    const response = await fetch(`${backendURL}/problem`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (response?.status === 200) {
      return data.data;
    } 
    else 
    {
      toast.error('Server Error');
      return false;
    }
  } 
  catch (error) 
  {
    toast.error('Server Error');
    console.error(error);
    return false;
  }
};

export const getProblemService = async (id) => {
    try {
      const response = await fetch(`${backendURL}/problem/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await response.json();
      if (response?.status === 200) {
        return data.data;
      } 
      else 
      {
        toast.error('Server Error');
        return false;
      }
    } 
    catch (error) 
    {
      toast.error('Server Error');
      console.error(error);
      return false;
    }
  };
  