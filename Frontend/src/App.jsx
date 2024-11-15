import { Outlet } from 'react-router-dom'
import Header from './Components/Header/Header.jsx'
import { useEffect, useState } from 'react'
import axios from 'axios'

axios.defaults.withCredentials=true

function App() {
  return (
    <>
      <Header/>
      <Outlet/>
    </>
  )
}

export default App
