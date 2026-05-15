// File: client/src/components/chat/ChatWindow.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useChat } from "../../hooks/useChat.js";
import { fmtTime, getInitials } from "../../utils/helpers.js";
import { PageLoader } from "../ui/index.jsx";

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} mb-3`}>
      {/* Avatar (only for others) */}
      {!isOwn && (
        <div className="avatar w-7 h-7 text-xs text-coral flex-shrink-0 mb-0.5">
          {message.sender?.avatar
            ? <img src={message.sender.avatar} alt="" className="w-full h-full object-cover" />
            : <span>{getInitials(message.sender?.name)}</span>
          }
        </div>
      )}

      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <span className="text-xs text-ink/40 font-medium mb-1 ml-1">
            {message.sender?.name}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-3xl text-sm leading-relaxed ${
            isOwn
              ? "bg-coral text-white rounded-br-md shadow-glow-coral/30"
              : "bg-white border border-mist text-ink rounded-bl-md shadow-sm"
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-ink/30 mt-1 mx-1">
          {message.createdAt ? fmtTime(message.createdAt) : ""}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="avatar w-7 h-7 text-xs text-ink/30">
        <span>…</span>
      </div>
      <div className="bg-white border border-mist px-4 py-2.5 rounded-3xl rounded-bl-md flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({ chatId, chatName, chatType }) {
  const { user } = useAuth();
  const { messages, loading, isTyping, sendMessage, emitTyping } = useChat(chatId);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-mist shadow-sm flex-shrink-0">
        <div className="avatar w-9 h-9 text-sm text-coral">
          <span>{chatType === "group" ? "👥" : getInitials(chatName)}</span>
        </div>
        <div>
          <h2 className="font-display font-bold text-ink">{chatName || "Chat"}</h2>
          <p className="text-xs text-teal font-medium">
            {chatType === "group" ? "Group Chat" : "Direct Message"}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <PageLoader />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-5xl mb-3 animate-float">💬</div>
            <p className="font-display font-bold text-ink text-lg">Start the conversation!</p>
            <p className="text-ink/40 text-sm mt-1">Say hello to {chatName}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={
                msg.sender?._id?.toString() === user?._id?.toString() ||
                msg.sender?.toString() === user?._id?.toString()
              }
            />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-3 bg-white border-t border-mist flex-shrink-0"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); emitTyping(); }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${chatName || "…"}`}
          className="flex-1 bg-mist/60 rounded-2xl px-4 py-2.5 text-sm text-ink placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 rounded-2xl bg-coral text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-coral-dark transition-all shadow-glow-coral active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
