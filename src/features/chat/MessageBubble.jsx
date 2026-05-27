import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { FiCopy, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

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

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const isStreaming = message.role === "streaming";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`px-4 py-3 rounded-2xl break-words leading-relaxed text-[15px] ${
          isUser
            ? "bg-zinc-900 ring-1 ring-white/5 text-zinc-100 ml-12"
            : "text-zinc-200 mr-12 w-full"
        }`}
      >
        <div className="relative">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              p({ children }) {
                return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
              },
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !className;
                const codeString = String(children).replace(/\n$/, "");

                if (isInline) {
                  return (
                    <code
                      className="bg-white/10 px-1.5 py-0.5 rounded-md text-sm font-mono text-[var(--accent)]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative group my-4 rounded-xl overflow-hidden ring-1 ring-white/10">
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-white/5">
                      <span className="text-xs text-zinc-400 font-mono">
                        {match?.[1] || "code"}
                      </span>
                      <CopyButton text={codeString} />
                    </div>
                    <pre className="bg-zinc-950 p-4 overflow-x-auto text-sm leading-relaxed no-scrollbar">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              ul({ children }) {
                return <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>;
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
                  <blockquote className="border-l-2 border-[var(--accent)]/30 pl-4 italic text-zinc-400 my-3">
                    {children}
                  </blockquote>
                );
              },
              h1({ children }) {
                return <h1 className="text-xl font-semibold mt-6 mb-3 text-zinc-100">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-semibold mt-5 mb-2 text-zinc-100">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-semibold mt-4 mb-2 text-zinc-100">{children}</h3>;
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
                  <th className="border border-white/5 px-3 py-2 bg-white/5 font-medium text-left text-zinc-300">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="border border-white/5 px-3 py-2 text-zinc-400">
                    {children}
                  </td>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          
          {isStreaming && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
              className="inline-block w-2 h-4 ml-1 bg-[var(--accent)] align-middle shadow-[0_0_8px_var(--accent)]"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
