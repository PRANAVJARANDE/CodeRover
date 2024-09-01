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

export const updatedefaultlangService=async(lang)=>{
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/updatedefaultlang/${lang}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 200) {
      return true;
    } 
    return false;
  } 
  catch (error) 
  {
    console.log(error);
  }
};

export const updateTemplateService=async(lang,userData)=>{
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/updatetemplate/${lang}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (response.status === 200) {
      toast.success('Template Updated');
      return true;
    } 
    toast.error('Login to update Template');
    return false;
  } 
  catch (error) 
  {
    toast.error('Server Error');
    console.log(error);
  }
}

export const getdefaultlangtempService=async()=>{
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/getdeflangandtemplate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (response.status === 200) {
      return data.data;
    } 
    return null;
  } 
  catch (error) 
  {
    console.log(error);
    return null;
  }
}
