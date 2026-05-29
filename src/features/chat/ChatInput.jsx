import { useState, useRef, useCallback, useEffect } from "react";
import { FiPlus, FiMic, FiFile, FiImage, FiX } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { FaGoogleDrive } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE } from "../../api/base";

const AttachmentMenu = ({ isOpen, onClose, onUploadClick }) => {
  const menuItems = [
    {
      icon: <FiFile size={16} />,
      label: "Upload files",
      onClick: () => {
        onUploadClick();
        onClose();
      },
    },
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
            className="absolute bottom-full mb-3 left-0 z-50 w-56 bg-neutral-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1.5"
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                onClick={item.onClick || onClose}
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
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(scrollHeight, 200)}px`;
  }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !user) return;

    setUploading(true);
    const token = await user.getIdToken();

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/chat/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

        const data = await response.json();

        // Ensure the URL is absolute if it's relative
        if (data.url && !data.url.startsWith("http")) {
          // If the URL starts with /api and API_BASE ends with /api, avoid duplication
          const baseUrl = API_BASE.endsWith("/api")
            ? API_BASE.replace(/\/api$/, "")
            : API_BASE;
          data.url = `${baseUrl}${data.url}`;
        }

        return data;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments((prev) => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = useCallback(() => {
    if ((!text.trim() && attachments.length === 0) || loading || uploading)
      return;
    onSend(text, attachments);
    setText("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, attachments, loading, uploading, onSend]);

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
    <div className="px-3 md:px-4 pb-3 md:pb-4 pt-1">
      <div className="max-w-3xl mx-auto">
        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-2 mb-3"
            >
              {attachments.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative group w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/10 shadow-lg"
                >
                  {file.mimeType?.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <FiFile size={20} />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                </motion.div>
              ))}
              {uploading && (
                <div className="w-14 h-14 rounded-xl bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
                  <svg
                    className="animate-spin h-5 w-5 text-zinc-500"
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
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-end bg-[#2f2f2f] rounded-2xl pl-3 pr-2 py-2.5 ring-1 ring-white/10 focus-within:ring-white/20 transition-all duration-200">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,application/pdf,text/*,.doc,.docx,.txt"
            className="hidden"
          />
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
            <AttachmentMenu
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onUploadClick={() => fileInputRef.current?.click()}
            />
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            aria-label="Message input"
            className="flex-1 bg-transparent resize-none outline-none text-[var(--text-primary)] px-3 py-1.5 max-h-[200px] leading-relaxed text-base placeholder-[var(--text-tertiary)] no-scrollbar"
            style={{ height: "auto" }}
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <AnimatePresence mode="wait">
              {text.trim() || attachments.length > 0 ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSend}
                  disabled={loading || uploading}
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
        <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-2.5 select-none font-medium tracking-tight">
          Jerry can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
