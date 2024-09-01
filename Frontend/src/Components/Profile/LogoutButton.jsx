import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { logoutUser } from '../../Services/Auth.service';

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    const result=logoutUser();
    if(result)
    {
        navigate('/login');
    }
  };

  return (
    <button onClick={handleLogout} className="px-4 m-6 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
      Logout
    </button>
  );
};

export default LogoutButton;
