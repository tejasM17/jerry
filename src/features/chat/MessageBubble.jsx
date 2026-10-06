import { useState, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { FiCopy, FiCheck, FiEdit2, FiFile, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ImageCard, { resolveMediaUrl } from "./ImageCard";

export const IMAGE_ERROR_TEXT = "[Error generating image. Please try again.]";

/** Text-mode wait state. Image mode uses AssistantPending instead. */
export function ThinkingIndicator() {
  return (
    <motion.p
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      className="text-sm text-tertiary"
    >
      Thinking…
    </motion.p>
  );
}

export function AssistantPending({ label }) {
  return (
    <div className="flex w-full max-w-[512px] flex-col items-start">
      <div
        aria-hidden
        className="aspect-square w-full animate-shimmer rounded-lg border border-subtle"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 40%, var(--surface-2) 80%)",
          backgroundSize: "200% 100%",
        }}
      />
      <p className="mt-2 text-sm text-tertiary">{label}</p>
    </div>
  );
}

const EASE_OUT = [0.22, 1, 0.36, 1];
const FADE = { duration: 0.15, ease: EASE_OUT };

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
      className="rounded-md p-1.5 text-tertiary transition-colors duration-[var(--dur-fast)] hover:bg-surface-3 hover:text-primary"
    >
      {copied ? <FiCheck size={size} /> : <FiCopy size={size} />}
    </button>
  );
};

const AssistantActions = ({ text, visible }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          className="mt-1 flex items-center"
        >
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy message"}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-tertiary transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 hover:text-secondary"
          >
            {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
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

const markdownComponents = {
  p({ children }) {
    return (
      <p className="mb-3 text-[15px] leading-7 text-secondary last:mb-0">
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
          className="rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-primary"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div className="my-3 overflow-hidden rounded-md border border-subtle bg-surface-1">
        <div className="flex items-center justify-between border-b border-subtle px-3 py-1.5">
          <span className="font-mono text-xs text-tertiary">
            {match?.[1] || "code"}
          </span>
          <CopyButton text={codeString} />
        </div>
        <pre className="no-scrollbar overflow-x-auto p-3 text-[13px] leading-relaxed sm:p-4 sm:text-sm">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },
  ul({ children }) {
    return (
      <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-secondary">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-7 text-secondary">
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
        className="text-accent underline-offset-2 hover:underline"
      >
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    return (
      <ImageCard src={src} alt={alt || "Generated image"} name={alt || "image"} />
    );
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-3 border-l-2 border-strong pl-4 text-[15px] leading-7 text-tertiary italic">
        {children}
      </blockquote>
    );
  },
  h1({ children }) {
    return (
      <h1 className="mt-5 mb-2 text-xl font-semibold text-primary">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="mt-4 mb-2 text-lg font-semibold text-primary">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="mt-3 mb-2 text-base font-semibold text-primary">
        {children}
      </h3>
    );
  },
  hr() {
    return <hr className="my-5 border-subtle" />;
  },
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto rounded-md border border-subtle">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border border-subtle bg-surface-2 px-3 py-2 text-left font-medium text-primary">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="border border-subtle px-3 py-2 text-secondary">
        {children}
      </td>
    );
  },
};

function attachmentUrl(file) {
  return resolveMediaUrl(
    file?.url || (file?.fileId ? `/api/chat/files/${file.fileId}` : ""),
  );
}

/** Drop markdown images already represented by image attachments. */
function contentWithoutAttachmentImages(content, imageAttachments) {
  if (!content || imageAttachments.length === 0) return content || "";
  return content
    .replace(/!\[[^\]]*\]\(([^)\s]+)\)/g, (full, url) => {
      const resolved = resolveMediaUrl(url);
      const covered = imageAttachments.some((file) => {
        const fileUrl = attachmentUrl(file);
        return (
          resolved === fileUrl ||
          (file.fileId && (url.includes(file.fileId) || resolved.includes(file.fileId)))
        );
      });
      return covered ? "" : full;
    })
    .trim();
}

const MessageBubble = ({ message, onEdit, onRetry, imagePending = false }) => {
  const isUser = message.role === "user";
  const isStreaming = message.role === "streaming";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [actionsVisible, setActionsVisible] = useState(false);
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
  const rawContent = message.content || "";
  // Streamed text stays a normal bubble. Classify only finished assistant turns.
  const errorType =
    isUser || isStreaming
      ? null
      : rawContent.includes("blocked by content moderation")
        ? "safety"
        : rawContent.includes("busy")
          ? "busy"
          : rawContent.includes("Error generating image")
            ? "generic"
            : null;
  const imageAttachments = !isUser
    ? (message.attachments || []).filter((file) =>
        String(file.mimeType || "").startsWith("image/"),
      )
    : [];
  const otherAttachments = (message.attachments || []).filter(
    (file) => !imageAttachments.includes(file),
  );
  const markdownSource = isUser
    ? rawContent
    : contentWithoutAttachmentImages(rawContent, imageAttachments);
  const showPending = isStreaming && !rawContent.trim();
  const showAssistantActions =
    !isUser && !isStreaming && !isEditing && !errorType && !showPending;

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className={`flex w-full flex-col ${isUser ? "items-end" : "items-start"}`}
      onMouseEnter={() => setActionsVisible(true)}
      onMouseLeave={() => setActionsVisible(false)}
      onFocus={() => setActionsVisible(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActionsVisible(false);
      }}
    >
      {meta && (
        <span className="mb-1.5 px-1 text-[11px] text-tertiary">{meta}</span>
      )}

      <div
        className={
          isUser
            ? "max-w-[75%] rounded-lg bg-surface-2 px-4 py-2.5 text-[15px] leading-7 text-primary"
            : "w-full max-w-none text-[15px] text-primary"
        }
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="flex min-w-[min(100%,280px)] flex-col gap-3 sm:min-w-[420px]"
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
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleEditSubmit();
                  }
                }}
                className="min-h-[120px] w-full resize-none rounded-lg border border-subtle bg-surface-1 p-3 text-base text-primary outline-none transition-colors duration-[var(--dur-fast)] focus:border-strong focus:bg-surface-2"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="rounded-pill px-4 py-1.5 text-sm text-secondary transition-colors duration-[var(--dur-fast)] hover:bg-surface-3 hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  className="rounded-pill bg-primary px-4 py-1.5 text-sm font-medium text-bg"
                >
                  Send
                </button>
              </div>
            </motion.div>
          ) : (
            <div key="content">
              {isUser && (
                <AnimatePresence>
                  {actionsVisible && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={FADE}
                      className="mb-1 flex justify-end"
                    >
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        aria-label="Edit message"
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-tertiary transition-colors duration-[var(--dur-fast)] hover:text-secondary"
                      >
                        <FiEdit2 size={12} />
                        Edit
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {otherAttachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {otherAttachments.map((file, idx) => {
                    const fileUrl = attachmentUrl(file);
                    const isImage = String(file.mimeType || "").startsWith(
                      "image/",
                    );

                    return (
                      <div
                        key={file.fileId || idx}
                        className="h-24 w-24 overflow-hidden rounded-md border border-subtle bg-surface-1 sm:h-32 sm:w-32"
                      >
                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center">
                            <FiFile size={22} className="text-tertiary" />
                            <span className="w-full truncate px-1 text-[10px] text-secondary">
                              {file.name}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {showPending ? (
                imagePending ? (
                  <AssistantPending label="Generating image…" />
                ) : (
                  <ThinkingIndicator />
                )
              ) : errorType ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={FADE}
                  className={
                    errorType === "busy"
                      ? "max-w-xl rounded-lg border border-subtle bg-surface-2 px-4 py-3"
                      : "max-w-xl rounded-lg border border-subtle border-l-2 border-l-error bg-error-surface px-4 py-3"
                  }
                >
                  <div className="flex items-start gap-2 text-sm text-primary">
                    {errorType !== "busy" && (
                      <FiAlertCircle className="mt-0.5 shrink-0 text-error" size={16} />
                    )}
                    <p>{rawContent}</p>
                  </div>
                  {errorType === "safety" && (
                    <p className="mt-2 text-sm text-secondary">Rephrase your prompt</p>
                  )}
                  {errorType !== "safety" && onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className={`mt-3 rounded-pill px-3 py-1.5 text-sm text-primary transition-colors duration-[var(--dur-fast)] hover:bg-surface-3 ${
                        errorType === "busy" ? "bg-surface-3" : "bg-surface-2"
                      }`}
                    >
                      Retry
                    </button>
                  )}
                </motion.div>
              ) : isUser ? (
                <p className="text-[15px] leading-7 whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : (
                <>
                  {imageAttachments.map((file) => (
                    <ImageCard
                      key={file.fileId || file.url}
                      src={file.url || `/api/chat/files/${file.fileId}`}
                      alt={file.name || "Generated image"}
                      name={file.name || "image"}
                    />
                  ))}
                  {markdownSource ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={markdownComponents}
                    >
                      {markdownSource}
                    </ReactMarkdown>
                  ) : null}
                </>
              )}

              {isStreaming && !showPending && (
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.15, 0.4, 0.15] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 bg-accent align-middle"
                />
              )}
            </div>
          )}
        </AnimatePresence>

        {showAssistantActions && (
          <AssistantActions text={message.content} visible={actionsVisible} />
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
