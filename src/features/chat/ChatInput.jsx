import { useState, useRef } from "react";
import { FiPlus, FiMic } from "react-icons/fi";
import { IoSend } from "react-icons/io5";

const ChatInput = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || loading) return;

    onSend(text);
    setText("");
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200; // Approximately 10 lines, adjust as needed
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textareaRef.current.style.overflowY =
        scrollHeight > maxHeight ? "scroll" : "hidden";
    }
  };

  return (
    <div className="px-2 pb-5 pt-3 bg-[#212121] ">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center bg-[#303030] rounded-2xl p-3 shadow-md">
          <button className="px-2 text-gray-400 hover:text-white">
            <FiPlus size={20} />
          </button>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleInput();
            }}
            placeholder="Ask anything"
            className="flex-1 bg-transparent resize-none outline-none text-white mx-2 max-h-[200px] overflow-y-hidden"
            rows={1}
            style={{ height: "auto" }}
          />
          {text.trim() ? (
            <button
              onClick={handleSend}
              disabled={loading}
              className={`px-2 ${loading ? "text-gray-600" : "text-gray-400 hover:text-white"}`}
            >
              <IoSend size={20} />
            </button>
          ) : (
            <button className="px-2 text-gray-400 hover:text-white">
              <FiMic size={20} />
            </button>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 mt-2 max-w-4xl mx-auto">
        Jerry can make mistakes.
      </p>
    </div>
  );
};

export default ChatInput;
