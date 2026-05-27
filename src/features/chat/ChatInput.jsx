import { useState, useRef, useCallback, useEffect } from "react";
import { FiPlus, FiMic, FiFile, FiImage } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { FaGoogleDrive } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AttachmentMenu = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: <FiFile size={16} />, label: "Upload files" },
    { icon: <FaGoogleDrive size={18} />, label: "Add from Drive" },
    { icon: <FiImage size={16} />, label: "Create image" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full mb-3 left-0 z-50 w-56 bg-zinc-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1.5"
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                onClick={onClose}
              >
                <span className="text-zinc-400">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ChatInput = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(scrollHeight, 200)}px`;
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

  useEffect(() => {
    handleInput();
  }, [text, handleInput]);

  return (
    <div className="px-3 md:px-4 pb-4 pt-1 bg-[var(--surface)]">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end bg-zinc-800/50 rounded-[28px] pl-2.5 pr-2 py-2.5 ring-1 ring-white/5 focus-within:ring-white/10 transition-all duration-300">
          <div className="relative shrink-0 flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Add attachment"
              className={`p-2 rounded-full transition-all duration-200 ${
                menuOpen 
                  ? "bg-zinc-700 text-white rotate-45" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <FiPlus size={20} />
            </button>
            <AttachmentMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            aria-label="Message input"
            className="flex-1 bg-transparent resize-none outline-none text-zinc-100 px-3 py-1.5 max-h-[200px] leading-relaxed text-[15px] placeholder-zinc-500 no-scrollbar"
            style={{ height: "auto" }}
          />

          <div className="flex items-center gap-1.5 shrink-0">
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
                  className="p-2 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
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
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-full transition-all duration-200"
                >
                  <FiMic size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-center text-[11px] text-zinc-500 mt-2.5 select-none font-medium tracking-tight">
          Jerry can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
