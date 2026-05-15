// File: client/src/hooks/useChat.js
import { useState, useEffect, useCallback, useRef } from "react";
import { chatService } from "../services/chatService.js";
import { useSocket } from "../context/SocketContext.jsx";

/**
 * Manages real-time messages for a specific chat room.
 * Joins/leaves the socket room automatically on chatId change.
 */
export function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocket();
  const typingTimer = useRef(null);

  // Load message history from REST API
  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;

    setLoading(true);
    chatService.getMessages(chatId)
      .then((data) => { if (!cancelled) setMessages(data.messages); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [chatId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("join_chat", chatId);

    const onNewMessage  = (msg) => setMessages((prev) => [...prev, msg]);
    const onTyping      = ()    => setIsTyping(true);
    const onStopTyping  = ()    => setIsTyping(false);

    socket.on("new_message",      onNewMessage);
    socket.on("user_typing",      onTyping);
    socket.on("user_stop_typing", onStopTyping);

    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("new_message",      onNewMessage);
      socket.off("user_typing",      onTyping);
      socket.off("user_stop_typing", onStopTyping);
    };
  }, [socket, chatId]);

  const sendMessage = useCallback((content) => {
    if (!socket || !content.trim()) return;
    socket.emit("send_message", { chatId, content: content.trim() });
  }, [socket, chatId]);

  const emitTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("typing", { chatId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId });
    }, 1500);
  }, [socket, chatId]);

  return { messages, loading, isTyping, sendMessage, emitTyping };
}
