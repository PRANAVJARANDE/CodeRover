import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { connectAuthenticatedSocket } from './storeslice.js';

export const useSocket = () => {
  const socket = useSelector((state) => state.socket.socket);
  useEffect(() => {
    connectAuthenticatedSocket();
  }, []);

  return socket;
};
