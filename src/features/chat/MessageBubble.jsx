import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { FiCopy } from "react-icons/fi";

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl px-4 py-3 rounded-lg ${
          isUser ? "bg-[#303030] text-white" : "bg-[#212121] text-gray-200"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code({ inline, children }) {
              if (inline) {
                return (
                  <code className="bg-gray-700 px-1 rounded">{children}</code>
                );
              }

              return (
                <div className="relative group">
                  <button
                    onClick={() => navigator.clipboard.writeText(children)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                  >
                    <FiCopy size={16} />
                  </button>
                  <pre className="bg-black p-4 rounded-lg overflow-x-auto">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageBubble;
