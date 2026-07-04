import { createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
const backendURL = import.meta.env.VITE_BACKEND_URL_FOR_SOCKET;

const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const socket = io(backendURL, {
  autoConnect: false,
  auth: (callback) => {
    callback({ token: getAccessToken() });
  },
});

export const connectAuthenticatedSocket = () => {
  const token = getAccessToken();
  if (!token) {
    socket.disconnect();
    return;
  }

  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('coderover:auth-changed', connectAuthenticatedSocket);
}

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    socket: socket,
  },
  reducers: {
    setSocket(state, action) {
      state.socket = action.payload;
    },
  },
});

export const { setSocket } = socketSlice.actions;
export default socketSlice.reducer;
