import { toast } from 'react-hot-toast';
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const loginUser = async (userData) => {
  try {
    const response = await fetch(`${backendURL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (response?.status === 200) {
      const {accessToken,refreshToken,user}=data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success("Logged in");
      return true;
    } 
    else 
    {
      toast.error(data?.message || 'Server Error');
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

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${backendURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (response?.status === 200) {
      toast.success("Registration Successful");
      return true;
    } 
    else 
    {
      const data = await response.json();
      toast.error(data?.message || "Registration Failed")
      return false;
    }
  } catch (error) {
    toast.error('Server Error');
    console.error(error);
    return false;
  }
};

export const isLoggedIn = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

export const getMyProfile = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/getcurrentuser`, {
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
    else 
    {
      return null;
    }
  } 
  catch (error) 
  {
    toast.error('Failed to Load Profile');
    return null;
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      toast.success("Logged out");
      return true;
    } else {
      toast.error('Failed to log out');
      return false;
    }
  } catch (error) {
    toast.error('Server Error');
    console.log(error);
    return false;
  }
};

export const updateUserAvatar = async (formData) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/updateavatar`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response.status === 200) {
      localStorage.setItem('user', JSON.stringify(data.data));
      toast.success("Avatar updated successfully");
      return true;
    } 
    else 
    {
      toast.error(data?.message || 'Failed to update avatar');
      return false;
    }
  } catch (error) {
    toast.error('Server Error');
    return false;
  }
};

export const refreshTokenService = async () => {
  try {
    const token=localStorage.getItem('refreshToken');
    if(!token)return;
    
    const response=await fetch(`${backendURL}/users/refresh-token`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({refreshToken:token})
    });

    const data = await response.json();
    if (response.status === 200) {
      const {refreshToken,accessToken}=data.data;
      console.log("New RT-",refreshToken);
      console.log("New AT-",accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return true;
    } 
    else 
    {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};