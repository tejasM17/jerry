import { useRef, useEffect, useState, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { FiMenu, FiImage, FiEdit3, FiGlobe } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/** Static labels only — click pre-fills real composer text (user sends). */
const SHORTCUTS = [
  {
    icon: FiImage,
    label: "Create an image",
    prefill: "Create an image of ",
  },
  {
    icon: FiEdit3,
    label: "Write or edit",
    prefill: "Help me write or edit: ",
  },
  {
    icon: FiGlobe,
    label: "Search the web",
    prefill: "Search the web for ",
  },
];

const EmptyHome = ({ onSend, loading, prefill, onPrefillConsumed, onShortcut }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    className="flex flex-1 flex-col items-center justify-center px-3 pb-8 md:px-6"
  >
    <div className="flex w-full max-w-3xl flex-col items-center">
      <h1 className="mb-8 text-center text-[28px] leading-tight font-semibold tracking-tight text-[var(--text-primary)] md:text-[32px]">
        What&apos;s on your mind today?
      </h1>

      <div className="w-full">
        <ChatInput
          onSend={onSend}
          loading={loading}
          prefill={prefill}
          onPrefillConsumed={onPrefillConsumed}
          showDisclaimer={false}
          autoFocus
        />
      </div>

      <div className="mt-6 flex flex-col items-start gap-1 sm:items-center">
        {SHORTCUTS.map(({ icon: Icon, label, prefill: text }) => (
          <button
            key={label}
            type="button"
            onClick={() => onShortcut(text)}
            className="flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] text-zinc-400 transition-colors duration-150 hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <Icon size={16} className="shrink-0 text-zinc-500" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  </motion.div>
);

const ScrollToBottom = ({ onClick, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.18 }}
        onClick={onClick}
        aria-label="Scroll to bottom"
        className="absolute bottom-28 left-1/2 z-30 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--surface-elevated)] text-[var(--text-secondary)] shadow-lg ring-1 ring-[var(--border-subtle)] transition-colors duration-150 hover:bg-white/[0.08] hover:text-[var(--text-primary)]"
      >
        <span className="text-lg leading-none" aria-hidden>
          ↓
        </span>
      </motion.button>
    )}
  </AnimatePresence>
);

const ChatWindow = ({ sidebarOpen, setSidebarOpen, chat }) => {
  const {
    messages,
    sendMessage,
    editMessage,
    loading,
    activeChatId,
    activeChatTitle,
  } = chat;
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [prefill, setPrefill] = useState("");

  const hasMessages = Array.isArray(messages) && messages.length > 0;

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBtn(!isNearBottom);
  }, []);

  useEffect(() => {
    if (!showScrollBtn) scrollToBottom(true);
  }, [messages, showScrollBtn]);

  const clearPrefill = useCallback(() => setPrefill(""), []);

  const headerTitle =
    hasMessages || activeChatId ? activeChatTitle || "Jerry" : "Jerry";

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[var(--surface)]">
      {/* Top bar — mobile menu + optional real chat title */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] px-3 md:h-14 md:px-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] md:hidden"
        >
          <FiMenu size={20} />
        </button>
        <span className="truncate text-sm font-medium text-[var(--text-primary)]">
          {headerTitle}
        </span>
      </div>

      {!hasMessages && !loading ? (
        <EmptyHome
          onSend={sendMessage}
          loading={loading}
          prefill={prefill}
          onPrefillConsumed={clearPrefill}
          onShortcut={setPrefill}
        />
      ) : (
        <>
          {/* Transcript */}
          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-full overflow-x-hidden overflow-y-auto"
            >
              <div className="mx-auto max-w-3xl space-y-6 px-3 pt-4 pb-8 md:px-6 md:pt-6 md:pb-10">
                {Array.isArray(messages) &&
                  messages.map((msg, index) => (
                    <MessageBubble
                      key={msg.id || msg._id || `${msg.role}-${index}`}
                      message={msg}
                      onEdit={editMessage}
                    />
                  ))}
                {loading &&
                  !messages.some((m) => m.role === "streaming") && (
                    <div className="flex justify-start">
                      <div className="flex items-center space-x-1.5 rounded-2xl bg-[#000000]/50 px-4 py-3 text-zinc-400 ring-1 ring-white/10">
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"
                          style={{ animationDelay: "0s" }}
                        />
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  )}
                {/* Spacer so docked composer never covers last bubble */}
                <div ref={bottomRef} className="h-4" />
              </div>
            </div>

            <ScrollToBottom
              visible={showScrollBtn && hasMessages}
              onClick={() => {
                scrollToBottom(true);
                setShowScrollBtn(false);
              }}
            />
          </div>

          {/* Docked composer */}
          <div className="relative shrink-0 pb-3 md:pb-4">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/80 to-transparent" />
            <div className="relative z-20">
              <ChatInput
                onSend={sendMessage}
                loading={loading}
                prefill={prefill}
                onPrefillConsumed={clearPrefill}
                showDisclaimer
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
