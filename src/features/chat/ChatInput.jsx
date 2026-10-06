import { useState, useRef, useCallback, useEffect } from "react";
import { FiImage, FiPaperclip, FiPlus, FiX } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE } from "../../api/base";
import { uploadChatFile } from "../../api/chat";

const EASE_OUT = [0.22, 1, 0.36, 1];
const MAX_TEXTAREA_PX = 144;

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
  imageMode = false,
  setImageMode,
}) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRootRef = useRef(null);

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

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (menuRootRef.current?.contains(event.target)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_PX)}px`;
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
    onSend(text, attachments, { mode: imageMode ? "image" : "text" });
    setText("");
    setAttachments([]);
    setMenuOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, attachments, loading, uploading, onSend, imageMode]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  useEffect(() => {
    handleInput();
  }, [text, handleInput]);

  const canSend = Boolean(text.trim() || attachments.length > 0);
  const showChips = attachments.length > 0 || uploading;

  return (
    <div className="w-full px-3 pt-1 md:px-4">
      <div className="mx-auto max-w-3xl">
        <div
          className={`flex flex-col rounded-pill border bg-surface-1 px-1.5 py-1.5 transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-within:bg-surface-2 ${
            imageMode
              ? "border-strong shadow-[0_0_0_3px_var(--accent-soft)]"
              : "border-subtle focus-within:border-strong"
          }`}
        >
          <AnimatePresence>
            {showChips && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: EASE_OUT }}
                className="flex flex-wrap gap-1.5 px-2 pt-1.5 pb-1"
              >
                {attachments.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-pill border border-subtle bg-surface-3 py-1 pr-1 pl-2.5 text-xs text-secondary"
                  >
                    <span className="max-w-[12rem] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      aria-label={`Remove ${file.name}`}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-pill text-tertiary transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 hover:text-primary"
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
                {uploading && (
                  <span className="inline-flex items-center px-2 py-1 text-xs text-tertiary">
                    Uploading…
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex min-h-[44px] items-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,application/pdf,text/*,.doc,.docx,.txt"
              className="hidden"
            />
            <div ref={menuRootRef} className="relative mb-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Add"
                className={`flex h-9 w-9 items-center justify-center rounded-pill transition-colors duration-[var(--dur-fast)] ${
                  imageMode
                    ? "text-accent"
                    : "text-tertiary hover:text-secondary"
                }`}
              >
                <FiPlus size={18} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: EASE_OUT }}
                    style={{ transformOrigin: "bottom left" }}
                    className="absolute bottom-full left-0 z-30 mb-2 min-w-[11.5rem] overflow-hidden rounded-md border border-subtle bg-surface-2 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setImageMode?.((on) => !on);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-primary transition-colors duration-[var(--dur-fast)] hover:bg-surface-3"
                    >
                      <FiImage
                        size={16}
                        className={imageMode ? "text-accent" : "text-secondary"}
                      />
                      Create image
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={uploading}
                      onClick={() => {
                        fileInputRef.current?.click();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-primary transition-colors duration-[var(--dur-fast)] hover:bg-surface-3 disabled:opacity-40"
                    >
                      <FiPaperclip size={16} className="text-secondary" />
                      Attach file
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {imageMode && (
                <motion.span
                  key="image-chip"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: EASE_OUT }}
                  className="mb-1.5 inline-flex h-6 shrink-0 items-center gap-1.5 rounded-pill bg-accent-soft px-2 text-[11px] font-medium text-accent"
                >
                  Image
                  <span className="font-normal text-secondary">Powered by Ideogram</span>
                </motion.span>
              )}
            </AnimatePresence>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                imageMode
                  ? "Describe the image you want…"
                  : "Ask anything"
              }
              rows={1}
              aria-label="Message input"
              className="no-scrollbar max-h-36 flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] leading-relaxed text-primary outline-none placeholder:text-tertiary"
            />

            <div className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center">
              <AnimatePresence>
                {canSend && (
                  <motion.button
                    key="send"
                    type="button"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15, ease: EASE_OUT }}
                    onClick={handleSend}
                    disabled={loading || uploading}
                    aria-label="Send message"
                    className="flex h-8 w-8 items-center justify-center rounded-pill bg-primary text-bg transition-opacity duration-[var(--dur-fast)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
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
                      <IoSend size={15} />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {showDisclaimer && (
          <p className="mt-2.5 text-center text-[11px] text-tertiary select-none">
            Jerry can make mistakes. Check important info.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
