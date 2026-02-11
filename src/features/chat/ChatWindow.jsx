import { useChat } from "./useChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { FiMenu } from "react-icons/fi";

const ChatWindow = ({ sidebarOpen, setSidebarOpen, chat }) => {
  const { messages, sendMessage, loading } = chat;

  return (
    <div className="flex-1 flex flex-col bg-[#212121]">
      {/* Mobile Header with Toggle */}
      <div className="md:hidden p-4 border-b border-gray-800 flex items-center">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FiMenu size={24} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {Array.isArray(messages) &&
          messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  );
};

export default ChatWindow;
