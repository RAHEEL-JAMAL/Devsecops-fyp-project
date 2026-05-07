import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});

export default socket;
