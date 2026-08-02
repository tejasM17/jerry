import { useState, useRef, useCallback, useEffect } from "react";
import { FiPlus, FiMic, FiFile, FiImage, FiX } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { FaGoogleDrive } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE } from "../../api/base";
import { uploadChatFile } from "../../api/chat";

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
            className="absolute bottom-full left-0 z-50 mb-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#000000]/95 py-1.5 shadow-2xl backdrop-blur-xl"
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
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

/**
 * Shared composer pill.
 * @param {string} [prefill] — when set, fills the textarea (shortcut chips).
 * @param {() => void} [onPrefillConsumed] — clear parent prefill after apply.
 * @param {boolean} [showDisclaimer] — footer hint under bar (default true when docked).
 * @param {boolean} [autoFocus]
 */
const ChatInput = ({
  onSend,
  loading,
  prefill = "",
  onPrefillConsumed,
  showDisclaimer = true,
  autoFocus = false,
}) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!prefill) return;
    setText(prefill);
    onPrefillConsumed?.();
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }, [prefill, onPrefillConsumed]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

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
    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const data = await uploadChatFile(() => user.getIdToken(), file);
          if (data.url && !data.url.startsWith("http")) {
            const baseUrl = API_BASE.endsWith("/api")
              ? API_BASE.replace(/\/api$/, "")
              : API_BASE;
            data.url = `${baseUrl}${data.url}`;
          }
          return data;
        }),
      );
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

  const canSend = Boolean(text.trim() || attachments.length > 0);

  return (
    <div className="w-full px-3 pt-1 md:px-4">
      <div className="mx-auto max-w-3xl">
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 flex flex-wrap gap-2"
            >
              {attachments.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="group relative h-14 w-14 overflow-hidden rounded-xl bg-[#000000] shadow-lg ring-1 ring-white/10"
                >
                  {file.mimeType?.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-500">
                      <FiFile size={20} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Remove attachment"
                  >
                    <FiX size={12} />
                  </button>
                </motion.div>
              ))}
              {uploading && (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#000000]/50 ring-1 ring-white/10">
                  <svg
                    className="h-5 w-5 animate-spin text-zinc-500"
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

        {/* ~52px single-line pill; grows with textarea */}
        <div className="relative flex min-h-[52px] items-end rounded-[26px] bg-[var(--surface-input)] py-1.5 pr-1.5 pl-2 ring-1 ring-white/10 transition-all duration-200 focus-within:ring-white/20">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,application/pdf,text/*,.doc,.docx,.txt"
            className="hidden"
          />
          <div className="relative flex shrink-0 items-center self-center">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Add attachment"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                menuOpen
                  ? "rotate-45 bg-[#000000] text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
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
            className="no-scrollbar max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
            style={{ height: "auto" }}
          />

          <div className="flex shrink-0 items-center gap-0.5 self-center">
            {/* Mic — no STT backend; visible but disabled */}
            {!canSend && (
              <button
                type="button"
                disabled
                aria-disabled="true"
                aria-label="Voice input unavailable"
                title="Voice input coming soon"
                className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full text-zinc-500 opacity-50"
              >
                <FiMic size={18} />
              </button>
            )}

            <AnimatePresence mode="wait">
              {canSend ? (
                <motion.button
                  key="send"
                  type="button"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSend}
                  disabled={loading || uploading}
                  aria-label="Send message"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-all duration-200 hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <svg
                      className="h-[16px] w-[16px] animate-spin"
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
                    <IoSend size={16} />
                  )}
                </motion.button>
              ) : (
                <motion.button
                  key="idle"
                  type="button"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  disabled
                  aria-label="Send"
                  className="flex h-9 w-9 cursor-default items-center justify-center rounded-full bg-white text-black"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <rect x="4" y="4" width="4" height="16" rx="1" />
                    <rect x="10" y="8" width="4" height="12" rx="1" />
                    <rect x="16" y="2" width="4" height="18" rx="1" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {showDisclaimer && (
          <p className="mt-2.5 select-none text-center text-[11px] font-medium tracking-tight text-[var(--text-tertiary)]">
            Jerry can make mistakes. Check important info.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
