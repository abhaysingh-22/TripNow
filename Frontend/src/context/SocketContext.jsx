import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BASE_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected on cleanup");
      }
    };
  }, []);

  const sendMessage = (event, message) => {
    if (socketRef.current) {
      socketRef.current.emit(event, message);
    } else {
      console.error("Socket is not initialized");
    }
  };

  const onMessage = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current.off(event, callback);
    } else {
      console.error("Socket is not initialized");
      return () => {};
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        sendMessage,
        onMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
// export default SocketContext;
