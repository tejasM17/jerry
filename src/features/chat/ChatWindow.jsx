import { useRef, useEffect, useState, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { FiMenu, FiMessageSquare } from "react-icons/fi";
import { motion } from "framer-motion";

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    className="flex-1 flex flex-col items-center justify-center text-center px-6"
  >
    <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/20 flex items-center justify-center mb-5">
      <FiMessageSquare size={28} className="text-[var(--accent)]" />
    </div>
    <h2 className="text-xl font-semibold tracking-tight mb-2">
      Start a conversation
    </h2>
    <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
      Ask anything. Jerry is here to help with answers, ideas, and creative
      solutions.
    </p>
  </motion.div>
);

const ScrollToBottom = ({ onClick, visible }) => {
  if (!visible) return null;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      aria-label="Scroll to bottom"
      className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--surface-elevated)] ring-1 ring-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-all duration-200 shadow-lg"
    >
      ↓ New messages
    </motion.button>
  );
};

const ChatWindow = ({ sidebarOpen, setSidebarOpen, chat }) => {
  const { messages, sendMessage, loading } = chat;
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  }, []);

  useEffect(() => {
    if (!showScrollBtn) scrollToBottom(true);
  }, [messages, showScrollBtn]);

  const hasMessages = Array.isArray(messages) && messages.length > 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--surface)]">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-3 px-4 h-12 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all duration-200"
        >
          <FiMenu size={20} />
        </button>
        <span className="text-sm font-medium">Jerry</span>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 md:px-4 py-4 md:py-6 relative scroll-smooth"
      >
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-5">
          {hasMessages ? (
            messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      <ScrollToBottom
        visible={showScrollBtn && hasMessages}
        onClick={() => {
          scrollToBottom(true);
          setShowScrollBtn(false);
        }}
      />

      {/* Input */}
      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  );
};

export default ChatWindow;
