import { useSelector } from 'react-redux';

export const useSocket = () => {
  const socket = useSelector((state) => state.socket.socket);
  return socket;
};