import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.config";
import ProfileMenu from "../../const/ProfileMenu";

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
} from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE } from "../../api/base";

const Sidebar = ({ sidebarOpen, setSidebarOpen, chat }) => {
  const [chats, setChats] = useState([]);

  const { user } = useAuth();

  const fetchChats = async () => {
    if (!user) return;

    const token = await user.getIdToken();

    const res = await fetch(`${API_BASE}/chat/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setChats(data);
    console.log("API response:", data);
  };
  console.log("Chats state:", chats);

  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user, chat.activeChatId]);

  return (
    <div
      className={`w-[260px] bg-[#0f0f0f] border-r border-[#1a1a1a] flex flex-col fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
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

      {/* Top Controls - New Chat + Search */}
      <div className="p-3 space-y-3 border-b border-[#1a1a1a]">
        {/* New Chat Button */}
        <button className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg text-sm font-medium text-gray-200 transition-colors">
          <div className="flex items-center gap-3">
            <FiPlus size={18} />
            <span>New Chat</span>
          </div>
          <span className="text-xs text-gray-500 hidden md:inline">
            Ctrl + N
          </span>
        </button>

        {/* Search */}
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search chats"
            className="w-full bg-[#1a1a1a] text-gray-200 placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-lg text-sm border border-[#252525] focus:border-gray-600 outline-none"
          />
        </div>
      </div>

      {/* GPTs / Explore Section */}
      <div>
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          GPTs
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer text-sm text-gray-300">
            <FiCompass size={16} className="text-gray-500" />
            <span>Explore GPTs</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer text-sm text-gray-300">
            <FiGrid size={16} className="text-gray-500" />
            <span>My GPTs</span>
          </div>
        </div>
      </div>

      {/* Other Navigation Items */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer text-sm text-gray-300">
          <FiBookOpen size={16} className="text-gray-500" />
          <span>Projects</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer text-sm text-gray-300">
          <FiSettings size={16} className="text-gray-500" />
          <span>Settings</span>
        </div>
      </div>

      {/* Navigation / Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6">
        {/* Recent Chats / Your Chats */}
        <div>
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
                  className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer text-sm text-gray-300"
                >
                  <div className="flex items-center gap-3 truncate">
                    <FiMessageSquare
                      size={16}
                      className="text-gray-500 group-hover:text-gray-300"
                    />
                    <span className="truncate">
                      {item.title || "New conversation"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom User Profile */}
      <div className="p-3 border-t border-[#1a1a1a]">
        <ProfileMenu user={user} />
      </div>
    </div>
  );
};

export default Sidebar;
