import { useState, useRef, useCallback } from "react";
import { FiPlus, FiMic } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

const ChatInput = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(scrollHeight, 200)}px`;
    el.style.overflowY = scrollHeight > 200 ? "scroll" : "hidden";
  }, []);

  const handleSend = useCallback(() => {
    if (!text.trim() || loading) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, loading, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="px-3 md:px-4 pb-3 pt-1 bg-[var(--surface)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end bg-[var(--surface-elevated)] rounded-2xl pl-3 pr-2 py-2 ring-1 ring-[var(--border-subtle)] focus-within:ring-[var(--border-default)] transition-all duration-200">
          <button
            aria-label="Add attachment"
            className="shrink-0 mb-0.5 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] rounded-lg transition-all duration-200"
          >
            <FiPlus size={18} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleInput();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything"
            rows={1}
            aria-label="Message input"
            className="flex-1 bg-transparent resize-none outline-none text-[var(--text-primary)] px-2 py-0.5 max-h-[160px] leading-relaxed text-sm placeholder-[var(--text-tertiary)]"
            style={{ height: "auto" }}
          />

          <AnimatePresence mode="wait">
            {text.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={handleSend}
                disabled={loading}
                aria-label="Send message"
                className="shrink-0 mb-0.5 p-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-90"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-[18px] w-[18px]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <IoSend size={18} />
                )}
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                aria-label="Voice input"
                className="shrink-0 mb-0.5 p-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] rounded-lg transition-all duration-200"
              >
                <FiMic size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-2 select-none">
          Jerry can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
