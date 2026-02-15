import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import ProfileMenu from "../../const/ProfileMenu";
import JerryIcon from "../../assets/jerry.svg";

import {
  FiX,
  FiSearch,
  FiPlus,
  FiMessageSquare,
  FiUser,
  FiSettings,
  FiCompass,
  FiGrid,
  FiBookOpen,
  FiImage,
  FiCode,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE } from "../../api/base";

const Sidebar = ({ sidebarOpen, setSidebarOpen, chat }) => {
  const [chats, setChats] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state

  const { user } = useAuth();

  const handleNewChat = () => {
    // Create new chat session
    if (typeof chat.newChat === "function") {
      chat.newChat();
    } else if (typeof chat.createNewChat === "function") {
      chat.createNewChat();
    } else if (typeof chat.loadChat === "function") {
      chat.loadChat(null); // Fallback: reset to new chat
    }
    setSidebarOpen(false); // Close mobile sidebar
  };

  const fetchChats = async () => {
    if (!user) return;

    const token = await user.getIdToken();

    try {
      const res = await fetch(`${API_BASE}/chat/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setChats(data);
      if (!res.ok) {
        throw new Error("Failed to fetch chats");
      }
    } catch (err) {
      console.error("Fetch chats error:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user, chat.activeChatId]);

  return (
    <div
      className={`shrink-0 bg-[#181818] border-r border-[#181818] flex flex-col fixed md:relative z-50 h-full transition-all duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${isCollapsed ? "w-[68px]" : "w-[260px]"}`}
    >
      {/* Mobile Close Button */}
      <div className="md:hidden flex items-center justify-end p-4 border-b border-[#1a1a1a]">
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Logo + Collapse/Expand Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          {/* ChatGPT / OpenAI Logo (replace with real SVG if needed) */}
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <img src={JerryIcon} alt="Jerry Logo" className="w-full h-full" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold">by Tejas</span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white p-1 rounded transition"
        >
          {isCollapsed ? (
            <FiChevronRight size={20} />
          ) : (
            <FiChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Main Navigation List (exact clone of your image) */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="space-y-0.5 px-2">
          <div
            onClick={handleNewChat}
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3 px-3"
            } py-2 rounded-lg hover:bg-[#303030] cursor-pointer text-sm text-gray-300`}
          >
            <FiPlus size={16} />
            {!isCollapsed && <span>New chat</span>}
          </div>

          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3 px-3"
            } py-2 rounded-lg hover:bg-[#303030] cursor-pointer text-sm text-gray-300`}
          >
            <FiSearch size={16} />
            {!isCollapsed && <span>Search chats</span>}
          </div>

          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3 px-3"
            } py-2 rounded-lg hover:bg-[#303030] cursor-pointer text-sm text-gray-300`}
          >
            <FiImage size={16} />
            {!isCollapsed && <span>Images</span>}
          </div>

          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3 px-3"
            } py-2 rounded-lg hover:bg-[#303030] cursor-pointer text-sm text-gray-300`}
          >
            <FiGrid size={16} />
            {!isCollapsed && <span>Apps</span>}
          </div>

          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3 px-3"
            } py-2 rounded-lg hover:bg-[#303030] cursor-pointer text-sm text-gray-300`}
          >
            <FiCode size={16} />
            {!isCollapsed && <span>Codex</span>}
          </div>
        </div>

        {/* Recent Chats (hidden in collapsed mode) */}
        {!isCollapsed && (
          <div className="mt-6 px-2">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Recent
            </div>
            <div className="space-y-0.5">
              {Array.isArray(chats) &&
                chats.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      chat.loadChat(item.id);
                      setSidebarOpen(false);
                    }}
                    className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#303030] cursor-pointer text-sm text-gray-300"
                  >
                    <FiMessageSquare
                      size={16}
                      className="text-gray-500 group-hover:text-gray-300 flex-shrink-0"
                    />
                    <span className="truncate">
                      {item.title || "New conversation"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile */}
      <div className={`p-3 border-t border-[#1a1a1a] hover:bg-[#303030]`}>
        {isCollapsed ? (
          <FiUser size={24} className="mx-auto text-gray-400" />
        ) : (
          <ProfileMenu user={user} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
