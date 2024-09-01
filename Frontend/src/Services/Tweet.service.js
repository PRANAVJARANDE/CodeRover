import { toast } from 'react-hot-toast';
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const fetchTweets=async () => {
  try {
    const response = await fetch(`${backendURL}/tweet`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' ,
    },
    });

    const data = await response.json();
    if (response?.status === 200) {
      return data.data;
    }
    return false; 
  } 
  catch (error) 
  {
    toast.error('Server Error');
    console.error(error);
    return false;
  }
};

export const createTweetService = async (content, replyOf, imageFile) => {
  try {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('content', content);
    if(replyOf)formData.append('replyOf', replyOf);
    if (imageFile)formData.append('image', imageFile);
    
    const response = await fetch(`${backendURL}/tweet/createtweet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response?.status === 200) {
      return data.data;
    }
    toast.error('Server Error');
    return false; 
  } 
  catch (error) 
  {
    toast.error('Server Error');
    console.error(error);
    return false;
  }
};

export const fetchProblemTweets=async (id) => {
  try {
    const response = await fetch(`${backendURL}/tweet/problem/${id}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json' ,
    },
    });

    const data = await response.json();
    if (response?.status === 200) {
      return data.data;
    }
    return false; 
  } 
  catch (error) 
  {
    toast.error('Server Error');
    console.error(error);
    return false;
  }
};