import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../features/auth/hooks/useAuth';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Use refs to avoid stale closures in socket event handlers
  const userRef = useRef(user);
  const authRef = useRef(isAuthenticated);

  useEffect(() => {
    userRef.current = user;
    authRef.current = isAuthenticated;
  }, [user, isAuthenticated]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SERVER_URL;

    if (!socketUrl) {
      console.error('VITE_SERVER_URL is not defined in environment variables');
      return;
    }

    console.log('Connecting to Socket.io at:', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');

      // Use ref values to avoid stale closure
      if (authRef.current && userRef.current?.id) {
        newSocket.emit('join', userRef.current.id);
        if (['admin', 'staff', 'super_admin', 'institution_admin'].includes(userRef.current.role)) {
          newSocket.emit('join_admin');
        }
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Effect to join rooms when authentication state changes
  useEffect(() => {
    if (socket && socket.connected && isAuthenticated && user?.id) {
      socket.emit('join', user.id);
      if (['admin', 'staff', 'super_admin', 'institution_admin'].includes(user.role)) {
        socket.emit('join_admin');
      }
    }
  }, [socket, isAuthenticated, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
