import { useState, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { FiCopy, FiCheck, FiEdit2, FiFile } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../../api/base";

const CopyButton = ({ text, label = "Copy code", size = 14 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : label}
      className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition-all duration-200 hover:bg-white/[0.06] hover:text-[var(--text-primary)] active:scale-90"
    >
      {copied ? <FiCheck size={size} /> : <FiCopy size={size} />}
    </button>
  );
};

/**
 * Floating action toolbar that appears only on hover of the parent
 * user message bubble — Copy + Edit, like ChatGPT.
 * Hidden until the user hovers the message so it doesn't compete
 * with the message content.
 */
const MessageActions = ({ onCopy, onEdit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(onCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [onCopy]);

  return (
    <div className="pointer-events-none absolute top-1 right-full mr-2 flex items-center gap-0.5 rounded-full bg-[#1f1f1f] p-1 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy message"}
        title={copied ? "Copied" : "Copy"}
        className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-all duration-200 hover:bg-white/10 hover:text-zinc-100 active:scale-90"
      >
        {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit message"
        title="Edit message"
        className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-all duration-200 hover:bg-white/10 hover:text-zinc-100 active:scale-90"
      >
        <FiEdit2 size={14} />
      </button>
    </div>
  );
};

/** Format real createdAt only — omit if missing. */
function formatMetaTime(createdAt) {
  if (!createdAt) return null;
  try {
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();
    const time = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    if (sameDay) return time;
    if (isYesterday) return `Yesterday ${time}`;
    return (
      d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }) +
      " " +
      time
    );
  } catch {
    return null;
  }
}

const MessageBubble = ({ message, onEdit }) => {
  const isUser = message.role === "user";
  const isStreaming = message.role === "streaming";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  // Animate enter once — streaming token updates must not remount-animate
  const hasAnimated = useRef(false);
  const shouldAnimate = !hasAnimated.current;
  useEffect(() => {
    hasAnimated.current = true;
  }, []);

  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  const handleEditSubmit = () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    onEdit(message.id || message._id, editContent);
    setIsEditing(false);
  };

  const meta = formatMetaTime(message.createdAt || message.timestamp);

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex w-full flex-col ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      {meta && (
        <span className="mb-1.5 px-1 text-[11px] text-[var(--text-tertiary)]">
          {meta}
        </span>
      )}

      <div
        className={`group relative break-words leading-relaxed ${
          isUser
            ? "ml-8 max-w-[min(100%,36rem)] rounded-3xl bg-[#000000]/50 px-4 py-3 text-[15px] text-[var(--text-primary)] ring-1 ring-white/10 sm:ml-12"
            : "mr-4 w-full max-w-none text-[15px] text-[var(--text-primary)] sm:mr-10"
        }`}
      >
        {isUser && !isEditing && (
          <MessageActions
            onCopy={message.content}
            onEdit={() => setIsEditing(true)}
          />
        )}

        <div className="relative">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex min-w-[min(100%,280px)] flex-col gap-3 sm:min-w-[420px] md:min-w-[560px]"
              >
                <textarea
                  autoFocus
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setIsEditing(false);
                      setEditContent(message.content);
                    }
                    if (
                      e.key === "Enter" &&
                      (e.metaKey || e.ctrlKey)
                    ) {
                      e.preventDefault();
                      handleEditSubmit();
                    }
                  }}
                  className="min-h-[120px] w-full resize-none rounded-2xl bg-[#000000]/70 p-3 text-base text-[var(--text-primary)] outline-none ring-1 ring-white/10 transition-all duration-300 focus:ring-[var(--accent)]/50"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                    className="rounded-full bg-transparent px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 hover:bg-white/5 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditSubmit}
                    className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-all duration-200 hover:bg-white/90 active:scale-95"
                  >
                    Send
                  </button>
                </div>
              </motion.div>
            ) : (
              <div key="content">
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {message.attachments.map((file, idx) => {
                      const fileUrl =
                        file.url && !file.url.startsWith("http")
                          ? `${
                              API_BASE.endsWith("/api")
                                ? API_BASE.replace(/\/api$/, "")
                                : API_BASE
                            }${file.url}`
                          : file.url;

                      return (
                        <div
                          key={idx}
                          className="h-24 w-24 overflow-hidden rounded-xl bg-[#000000] shadow-lg ring-1 ring-white/10 sm:h-32 sm:w-32"
                        >
                          {file.mimeType?.startsWith("image/") ? (
                            <img
                              src={fileUrl}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center">
                              <FiFile size={24} className="text-zinc-500" />
                              <span className="w-full truncate px-1 text-[10px] text-zinc-400">
                                {file.name}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    p({ children }) {
                      return (
                        <p className="mb-3 text-[15px] leading-relaxed last:mb-0 md:text-base">
                          {children}
                        </p>
                      );
                    },
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match && !className;
                      const codeString = String(children).replace(/\n$/, "");

                      if (isInline) {
                        return (
                          <code
                            className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-sm text-[var(--accent)]"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="group relative my-3 overflow-hidden rounded-xl ring-1 ring-white/10">
                          <div className="flex items-center justify-between border-b border-white/10 bg-[#000000] px-3 py-2 sm:px-4">
                            <span className="font-mono text-xs text-zinc-400">
                              {match?.[1] || "code"}
                            </span>
                            <CopyButton text={codeString} />
                          </div>
                          <pre className="no-scrollbar overflow-x-auto bg-black p-3 text-[13px] leading-relaxed sm:p-4 sm:text-sm">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    },
                    ul({ children }) {
                      return (
                        <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[15px] md:pl-6 md:text-base">
                          {children}
                        </ul>
                      );
                    },
                    ol({ children }) {
                      return (
                        <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-[15px] md:pl-6 md:text-base">
                          {children}
                        </ol>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] underline-offset-2 hover:underline"
                        >
                          {children}
                        </a>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="my-3 border-l-2 border-[var(--accent)]/30 pl-4 text-[15px] text-[var(--text-secondary)] italic md:text-base">
                          {children}
                        </blockquote>
                      );
                    },
                    h1({ children }) {
                      return (
                        <h1 className="mt-5 mb-2 text-xl font-semibold text-[var(--text-primary)] md:text-2xl">
                          {children}
                        </h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="mt-4 mb-2 text-lg font-semibold text-[var(--text-primary)] md:text-xl">
                          {children}
                        </h2>
                      );
                    },
                    h3({ children }) {
                      return (
                        <h3 className="mt-3 mb-2 text-base font-semibold text-[var(--text-primary)] md:text-lg">
                          {children}
                        </h3>
                      );
                    },
                    hr() {
                      return <hr className="my-5 border-white/10" />;
                    },
                    table({ children }) {
                      return (
                        <div className="my-3 overflow-x-auto rounded-xl ring-1 ring-white/10">
                          <table className="w-full border-collapse text-sm">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border border-white/10 bg-white/5 px-3 py-2 text-left font-medium text-[var(--text-primary)]">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-white/10 px-3 py-2 text-[var(--text-secondary)]">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </AnimatePresence>

          {isStreaming && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "steps(2)",
              }}
              className="ml-1 inline-block h-4 w-2 align-middle bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
