import React, { useState } from 'react';
import { updateUserAvatar } from '../../Services/Auth.service';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate=useNavigate();
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('avatar', avatar);
    
    try {
      const response = await updateUserAvatar(formData);
      if (response) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center py-8 ">
      <div className="bg-gray-900 p-16 rounded-lg shadow-lg w-full max-w-md ">
        <h2 className="text-3xl font-bold mb-8 text-center">Update Avatar</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-6">
            {preview ? (
              <img src={preview} alt="Avatar Preview" className="h-48 w-64 rounded-lg mb-4 object-cover"/>
            ) : (
              <div className="h-48 w-64 rounded-lg bg-gray-700 flex items-center justify-center mb-4">
                <span className="text-gray-400">No Avatar</span>
              </div>
            )}
            <label htmlFor="avatar" className="bg-blue-500 hover:bg-blue-600 text-white font-bold my-2 py-3 px-4 rounded-lg cursor-pointer">
              Choose Avatar
            </label>
            <input 
              type="file" 
              id="avatar" 
              className="hidden" 
              onChange={handleAvatarChange} 
              required
            />
          </div>
          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition duration-300 ease-in-out">
            Update Avatar
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
