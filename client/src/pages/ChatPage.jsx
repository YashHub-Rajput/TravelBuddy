// File: client/src/pages/ChatPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { chatService } from "../services/chatService.js";
import { useAuth } from "../context/AuthContext.jsx";
import ChatList from "../components/chat/ChatList.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import { EmptyState } from "../components/ui/index.jsx";

export default function ChatPage() {
  const { chatId }   = useParams();
  const { user }     = useAuth();
  const [chat, setChat] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    chatService.getMyChats()
      .then((d) => {
        const found = d.chats.find((c) => c._id === chatId);
        setChat(found || null);
      })
      .catch(console.error);
  }, [chatId]);

  const getChatName = () => {
    if (!chat) return "";
    if (chat.type === "group") return chat.name || chat.trip?.destination || "Group Chat";
    const other = chat.participants?.find((p) => p._id !== user?._id);
    return other?.name || "Chat";
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex rounded-3xl overflow-hidden border border-mist shadow-card">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <div className={`${chatId ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-mist bg-white flex-shrink-0`}>
        <div className="px-4 py-4 border-b border-mist">
          <h2 className="font-display font-bold text-xl text-ink">Messages</h2>
          <p className="text-xs text-ink/40 mt-0.5">Your conversations</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatList />
        </div>
      </div>

      {/* ── Chat area ─────────────────────────────────────────── */}
      <div className={`${chatId ? "flex" : "hidden md:flex"} flex-col flex-1 min-w-0`}>
        {chatId ? (
          <ChatWindow
            chatId={chatId}
            chatName={getChatName()}
            chatType={chat?.type}
          />
        ) : (
          <EmptyState
            icon="💬"
            title="Select a conversation"
            subtitle="Choose from your existing chats, or find a match and start a new one!"
          />
        )}
      </div>
    </div>
  );
}
