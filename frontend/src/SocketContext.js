
import React, { createContext, useContext, useEffect, useState } from 'react';

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // You can initialize your WebSocket connection here
    const newSocket = new WebSocket('http://localhost:3001');

    setSocket(newSocket);

    // Cleanup function to close the socket when the component unmounts
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
