import { useRef, useEffect, useState, useCallback } from "react";
import MessageBubble, {
  AssistantPending,
  ThinkingIndicator,
} from "./MessageBubble";
import ChatInput from "./ChatInput";
import { FiMenu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1];

const EmptyHome = ({
  onSend,
  loading,
  prefill,
  onPrefillConsumed,
  imageMode,
  setImageMode,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: EASE_OUT }}
    className="flex flex-1 flex-col items-center justify-center px-3 pb-8 md:px-6"
  >
    <div className="flex w-full max-w-3xl flex-col items-center">
      <h1 className="mb-8 text-center text-[28px] leading-tight font-semibold tracking-tight text-primary md:text-[32px]">
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
          imageMode={imageMode}
          setImageMode={setImageMode}
        />
      </div>
    </div>
  </motion.div>
);

const ScrollToBottom = ({ onClick, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: EASE_OUT }}
        onClick={onClick}
        aria-label="Scroll to bottom"
        className="absolute bottom-28 left-1/2 z-30 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-pill border border-subtle bg-surface-2 text-secondary transition-colors duration-[var(--dur-fast)] hover:bg-surface-3 hover:text-primary"
      >
        <span className="text-base leading-none" aria-hidden>
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
    retryLastImage,
    editMessage,
    loading,
    activeChatId,
    activeChatTitle,
    imageMode,
    setImageMode,
  } = chat;
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const pinnedRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [prefill, setPrefill] = useState("");

  const hasMessages = Array.isArray(messages) && messages.length > 0;
  const lastUser = [...(messages || [])]
    .reverse()
    .find((m) => m.role === "user");
  const imagePending = lastUser?.mode === "image";

  const retryLastPrompt = useCallback(() => {
    pinnedRef.current = true;
    setShowScrollBtn(false);
    retryLastImage();
  }, [retryLastImage]);

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    pinnedRef.current = isNearBottom;
    setShowScrollBtn(!isNearBottom);
  }, []);

  useEffect(() => {
    if (pinnedRef.current) scrollToBottom(true);
  }, [messages]);

  const clearPrefill = useCallback(() => setPrefill(""), []);

  const handleSend = useCallback(
    (text, attachments, options) => {
      pinnedRef.current = true;
      setShowScrollBtn(false);
      sendMessage(text, attachments, {
        mode: options?.mode === "image" ? "image" : "text",
      });
    },
    [sendMessage],
  );

  const headerTitle =
    hasMessages || activeChatId ? activeChatTitle || "Jerry" : "Jerry";

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-bg">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-subtle px-3 md:h-14 md:px-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-md text-secondary transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 hover:text-primary md:hidden"
        >
          <FiMenu size={20} />
        </button>
        <span className="truncate text-sm font-medium text-primary">
          {headerTitle}
        </span>
      </div>

      {!hasMessages && !loading ? (
        <EmptyHome
          onSend={handleSend}
          loading={loading}
          prefill={prefill}
          onPrefillConsumed={clearPrefill}
          imageMode={imageMode}
          setImageMode={setImageMode}
        />
      ) : (
        <>
          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-full overflow-x-hidden overflow-y-auto"
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-6 px-3 pt-4 pb-8 md:px-6 md:pt-6 md:pb-10">
                {Array.isArray(messages) &&
                  messages.map((msg, index) => (
                    <MessageBubble
                      key={msg.id || msg._id || `${msg.role}-${index}`}
                      message={msg}
                      onEdit={editMessage}
                      onRetry={retryLastPrompt}
                      imagePending={imagePending}
                    />
                  ))}
                {loading &&
                  !messages.some((m) => m.role === "streaming") &&
                  (imagePending ? (
                    <AssistantPending label="Generating image…" />
                  ) : (
                    <ThinkingIndicator />
                  ))}
                <div ref={bottomRef} className="h-4" />
              </div>
            </div>

            <ScrollToBottom
              visible={showScrollBtn && hasMessages}
              onClick={() => {
                pinnedRef.current = true;
                scrollToBottom(true);
                setShowScrollBtn(false);
              }}
            />
          </div>

          <div className="relative shrink-0 pb-3 md:pb-4">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
            <div className="relative z-20">
              <ChatInput
                onSend={handleSend}
                loading={loading}
                prefill={prefill}
                onPrefillConsumed={clearPrefill}
                showDisclaimer
                imageMode={imageMode}
                setImageMode={setImageMode}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
