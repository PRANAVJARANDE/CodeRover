import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Login from './Components/Login/Login.jsx'
import Register from './Components/Register/Register.jsx'
import Home from './Components/Home/Home.jsx'
import { Toaster } from 'react-hot-toast'
import Profile from './Components/Profile/Profile.jsx'
import EditProfile from './Components/Profile/EditProfile.jsx'
import Discuss from './Components/Discuss/Discuss.jsx'
import AllProblems from './Components/Problemset/AllProblems.jsx'
import Problem from './Components/Problemset/Problem.jsx'
import JoinInterview from './Components/InterviewRooms/JoinInterview.jsx'
import {Provider} from 'react-redux'
import store from './Store/store.js'
import Room from './Components/InterviewRooms/Room.jsx'
import Loading from './Components/Loading/Loading.jsx'


let router=createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/profile' element=<Profile/>/>
      <Route path='' element={<App/>}>
        <Route path='/' element=<Home/>/>
        <Route path='/discuss' element=<Discuss/>/>
        <Route path='/problems' element=<AllProblems/>/>
        <Route path='/join-interview' element=<JoinInterview/>/>
        <Route path='/host-interview' element=<Home/>/>
        <Route path='/editprofile' element=<EditProfile/>/>
        <Route path="/problems/:id" element={<Problem/>}/>
        <Route path='/loading' element={<Loading/>}/>
      </Route>
      <Route path='/room/:roomId' element=<Room/>/>
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <Toaster position='bottom-right' toastOptions={{duration:3000}}/>
      <RouterProvider router={router}/>
    </StrictMode>
  </Provider>
)
