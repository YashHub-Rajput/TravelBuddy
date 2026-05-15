// File: client/src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token }  = useAuth();
  const socketRef  = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Disconnect any existing socket when token changes (login/logout)
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }

    if (!token) return;

    // In dev, Vite proxies /socket.io → localhost:5000 (see vite.config.js)
    // In production, use the explicit backend URL from env
    const serverUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.DEV ? "/" : window.location.origin);

    const socket = io(serverUrl, {
      auth:       { token },
      transports: ["websocket", "polling"], // fallback to polling if WS fails
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect",         ()    => { setConnected(true);  });
    socket.on("disconnect",      ()    => { setConnected(false); });
    socket.on("connect_error",   (err) => { console.warn("Socket error:", err.message); });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within <SocketProvider>");
  return ctx;
};
