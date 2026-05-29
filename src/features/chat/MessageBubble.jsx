import { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { FiCopy, FiCheck, FiEdit2, FiFile } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../../api/base";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy code"}
      className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all duration-200 active:scale-90"
    >
      {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
    </button>
  );
};

const MessageBubble = ({ message, onEdit }) => {
  const isUser = message.role === "user";
  const isStreaming = message.role === "streaming";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative px-4 py-3 rounded-2xl break-words leading-relaxed text-base ${
          isUser
            ? "bg-zinc-800/50 ring-1 ring-white/5 text-[var(--text-primary)] ml-10 sm:ml-12"
            : "text-[var(--text-primary)] mr-10 sm:mr-12 w-full"
        }`}
      >
        {isUser && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute -left-9 sm:-left-10 top-1 sm:top-2 p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 active:scale-90"
            aria-label="Edit message"
          >
            <FiEdit2 size={16} />
          </button>
        )}

        <div className="relative">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-3 min-w-[280px] sm:min-w-[400px] md:min-w-[500px]"
              >
                <textarea
                  autoFocus
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-neutral-800 text-[var(--text-primary)] rounded-xl p-3 outline-none ring-1 ring-white/10 focus:ring-[var(--accent)]/50 resize-none min-h-[120px] transition-all duration-300 text-lg"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditSubmit}
                    className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all duration-200 active:scale-95"
                  >
                    Save & Submit
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                    className="px-4 py-1.5 rounded-full bg-neutral-800 text-[var(--text-secondary)] text-sm font-medium hover:bg-neutral-700 transition-all duration-200 active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Render Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
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
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/10 shadow-lg"
                        >
                          {file.mimeType?.startsWith("image/") ? (
                            <img
                              src={fileUrl}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
                              <FiFile size={24} className="text-zinc-500" />
                              <span className="text-[10px] text-zinc-400 truncate w-full px-1">
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
                        <p className="mb-4 last:mb-0 leading-relaxed text-lg">
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
                              className="bg-white/10 px-1.5 py-0.5 rounded-md text-sm font-mono text-[var(--accent)] text-base"
                              {...props}
                            >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="relative group my-4 rounded-xl overflow-hidden ring-1 ring-white/10">
                          <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-white/5">
                            <span className="text-xs text-zinc-400 font-mono">
                              {match?.[1] || "code"}
                            </span>
                            <CopyButton text={codeString} />
                          </div>
                          <pre className="bg-black p-4 overflow-x-auto text-sm leading-relaxed no-scrollbar">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    },
                    ul({ children }) {
                      return (
                        <ul className="list-disc pl-6 mb-4 space-y-1.5 text-lg">
                          {children}
                        </ul>
                      );
                    },
                    ol({ children }) {
                      return (
                        <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-lg">
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
                          className="text-[var(--accent)] hover:underline underline-offset-2"
                        >
                          {children}
                        </a>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-2 border-[var(--accent)]/30 pl-4 italic text-[var(--text-secondary)] my-4 text-lg">
                          {children}
                        </blockquote>
                      );
                    },
                    h1({ children }) {
                      return (
                        <h1 className="text-2xl font-semibold mt-6 mb-3 text-[var(--text-primary)]">
                          {children}
                        </h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="text-xl font-semibold mt-5 mb-2 text-[var(--text-primary)]">
                          {children}
                        </h2>
                      );
                    },
                    h3({ children }) {
                      return (
                        <h3 className="text-lg font-semibold mt-4 mb-2 text-[var(--text-primary)]">
                          {children}
                        </h3>
                      );
                    },
                    hr() {
                      return <hr className="border-white/5 my-6" />;
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4 rounded-xl ring-1 ring-white/5">
                          <table className="w-full text-sm border-collapse">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border border-white/5 px-3 py-2 bg-white/5 font-medium text-left text-[var(--text-primary)]">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-white/5 px-3 py-2 text-[var(--text-secondary)]">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </motion.div>
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
              className="inline-block w-2 h-4 ml-1 bg-[var(--accent)] align-middle shadow-[0_0_8px_var(--accent)]"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
