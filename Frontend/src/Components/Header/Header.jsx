import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = ({ user }) => {
  return (
    <header className="bg-gray-900 text-white shadow-lg pb-1">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <NavLink to="/" className="flex items-center">
          <img src="/logoicon.png" alt="Logo" className="w-10 h-auto mr-3" />
          <span className="text-2xl font-bold text-yellow-500 underline underline-offset-8">CodeRover</span>
        </NavLink>

        <nav className="flex space-x-8">
          <NavLink to="/" className={({ isActive }) =>`text-xl transition duration-300 ${isActive ? 'text-yellow-500 font-bold underline underline-offset-8' : 'text-gray-300 hover:text-yellow-500'}`}>
            Home
          </NavLink>
          <NavLink to="/problems" className={({ isActive }) => `text-xl transition duration-300 ${isActive ? 'text-yellow-500 font-bold underline underline-offset-8' : 'text-gray-300 hover:text-yellow-500'}` }>
            Problemset
          </NavLink>
          <NavLink to="/discuss" className={({ isActive }) =>`text-xl transition duration-300 ${isActive ? 'text-yellow-500 font-bold underline underline-offset-8' : 'text-gray-300 hover:text-yellow-500'}` }>
            Discuss
          </NavLink>
          <NavLink to="/join-interview" className={({ isActive }) =>`text-xl transition duration-300 ${isActive ? 'text-yellow-500 font-bold underline underline-offset-8' : 'text-gray-300 hover:text-yellow-500'}`}>
            Join Interview
          </NavLink>
          <NavLink to="/host-interview" className={({ isActive }) => `text-xl transition duration-300 ${isActive ? 'text-yellow-500 font-bold underline underline-offset-8' : 'text-gray-300 hover:text-yellow-500'}`}>
            Host Interview
          </NavLink>
        </nav>

        <Link to={'/profile'}>
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <img src={user.avatar || '/public/defaultuser.png'} alt="User" className="w-10 h-10 rounded-full border-2 border-yellow-500"/>
              <span className="text-lg font-semibold text-gray-300">{user.username || 'user'}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <NavLink to="/login" className="text-lg text-white bg-sky-500 hover:bg-yellow-500 transition duration-300 py-2 px-4 rounded-md shadow-md">Login</NavLink>
              <NavLink to="/register" className="text-lg text-white bg-sky-500 hover:bg-yellow-500 transition duration-300 py-2 px-4 rounded-md shadow-md">Register</NavLink>
            </div>
          )}
        </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
