// File: client/src/components/chat/ChatList.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatService } from "../../services/chatService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { fmtRelative, getInitials, truncate } from "../../utils/helpers.js";

export default function ChatList({ onSelect }) {
  const [chats,   setChats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chatId: activeId } = useParams();

  useEffect(() => {
    chatService.getMyChats()
      .then((d) => setChats(d.chats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getDisplayName = (chat) => {
    if (chat.type === "group") return chat.name || chat.trip?.destination || "Group Chat";
    const other = chat.participants?.find((p) => p._id !== user?._id);
    return other?.name || "Unknown";
  };

  const handleClick = (chat) => {
    navigate(`/chat/${chat._id}`);
    onSelect?.();
  };

  if (loading) {
    return (
      <div className="p-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-11 h-11 rounded-2xl bg-mist flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-mist rounded w-3/4" />
              <div className="h-2 bg-mist rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-48">
        <p className="text-3xl mb-2">💬</p>
        <p className="text-sm font-semibold text-ink/60">No conversations yet</p>
        <p className="text-xs text-ink/40 mt-1">Match with someone to start chatting</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {chats.map((chat) => {
        const name   = getDisplayName(chat);
        const active = chat._id === activeId;
        const lastMsg = chat.lastMessage;

        return (
          <button
            key={chat._id}
            onClick={() => handleClick(chat)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left border-b border-mist/50 last:border-0 ${
              active
                ? "bg-coral/8 border-l-2 border-l-coral"
                : "hover:bg-mist/50"
            }`}
          >
            {/* Avatar */}
            <div className="avatar w-11 h-11 text-sm text-coral flex-shrink-0">
              {chat.type === "group"
                ? <span className="text-lg">👥</span>
                : <span>{getInitials(name)}</span>
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-semibold text-sm truncate ${active ? "text-coral" : "text-ink"}`}>
                  {name}
                </span>
                {lastMsg?.createdAt && (
                  <span className="text-[10px] text-ink/35 flex-shrink-0">
                    {fmtRelative(lastMsg.createdAt)}
                  </span>
                )}
              </div>
              {lastMsg?.content && (
                <p className="text-xs text-ink/45 truncate mt-0.5">
                  {lastMsg.sender?.name && chat.type === "group"
                    ? `${lastMsg.sender.name}: `
                    : ""}
                  {truncate(lastMsg.content, 40)}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
