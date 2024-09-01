import { Outlet } from 'react-router-dom'
import Header from './Components/Header/Header.jsx'
import { useEffect, useState } from 'react'
import axios from 'axios'

axios.defaults.withCredentials=true

function App() {

  const [user,setuser]=useState(null);
  useEffect(()=>{
    const localuser=localStorage.getItem('user');
    if(localuser)setuser(JSON.parse(localuser));
  },[])

  return (
    <>
      <Header user={user}/>
      <Outlet/>
    </>
  )
}

export default App
