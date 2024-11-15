import { Outlet } from 'react-router-dom'
import Header from './Components/Header/Header.jsx'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { refreshTokenService } from './Services/Auth.service.js'

axios.defaults.withCredentials=true

function App() {

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await refreshTokenService();
      } catch (error) {
        console.error("Error in refresh token service:", error);
      }
    }, 20 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Header/>
      <Outlet/>
    </>
  )
}

export default App
