import { useEffect, useState, useCallback, useRef } from "react";
import ProfileMenu from "../../const/ProfileMenu";
import JerryIcon from "../../assets/jerry.svg";
import SearchChatsModal from "./SearchChatsModal";
import {
  FiX,
  FiSearch,
  FiPlus,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiGrid,
  FiCode,
  FiEdit2,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE } from "../../api/base";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { icon: FiPlus, label: "New chat", action: "newChat" },
  { icon: FiSearch, label: "Search", action: "search" },
  { icon: FiImage, label: "Assets" },
  { icon: FiGrid, label: "Extensions" },
  { icon: FiCode, label: "Developer" },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, chat }) => {
  const [chats, setChats] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const editInputRef = useRef(null);

  const handleNewChat = useCallback(() => {
    if (typeof chat.newChat === "function") chat.newChat();
    else if (typeof chat.createNewChat === "function") chat.createNewChat();
    else if (typeof chat.loadChat === "function") chat.loadChat(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [chat, setSidebarOpen]);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/chat/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error("Fetch chats error:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user, chat.activeChatId, fetchChats]);

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingChatId]);

  const handleRename = async (chatId) => {
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    const success = await chat.renameChat(chatId, editTitle);
    if (success) {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: editTitle } : c))
      );
    }
    setEditingChatId(null);
  };

  const handleDelete = async (chatId) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      const success = await chat.deleteChat(chatId);
      if (success) {
        setChats((prev) => prev.filter((c) => c.id !== chatId));
      }
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#171717] text-[var(--text-primary)]">
      {/* 1. Header Section */}
      <div className={`p-4 flex items-center shrink-0 border-b border-white/[0.06] transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <img src={JerryIcon} alt="" className="w-5 h-5 invert" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-semibold tracking-tight whitespace-nowrap"
            >
              Jerry AI
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-zinc-500"
        >
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-zinc-500"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* 2. Navigation & History Section */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        {/* Main Nav Items */}
        <div className="px-3 space-y-1 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isNewChat = item.action === "newChat";
            const isSearch = item.action === "search";
            return (
              <button
                key={item.label}
                onClick={isNewChat ? handleNewChat : isSearch ? () => setSearchOpen(true) : undefined}
                className={`group flex items-center w-full rounded-lg transition-all duration-200 hover:bg-neutral-800 ${
                  isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
                }`}
              >
                <Icon size={18} className="shrink-0 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                {!isCollapsed && (
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* History Items */}
        <div className="px-3 space-y-1">
          {!isCollapsed && (
            <h3 className="px-3 mb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Recent Activity
            </h3>
          )}
          <div className="space-y-0.5">
            {chats.map((item) => (
              <div
                key={item.id}
                className={`group relative flex items-center rounded-lg transition-all duration-200 cursor-pointer ${
                  chat.activeChatId === item.id
                    ? "bg-neutral-800"
                    : "hover:bg-neutral-800/60"
                } ${isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}`}
              >
                {isCollapsed ? (
                  <div className="relative flex items-center justify-center w-full h-8" onClick={() => chat.loadChat(item.id)}>
                    <FiMessageSquare size={18} className="text-zinc-500 group-hover:opacity-0 transition-opacity" />
                    <div className="absolute inset-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingChatId(item.id); setEditTitle(item.title || ""); }} 
                        className="p-1 text-zinc-400 hover:text-zinc-200"
                        title="Rename"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                        className="p-1 text-zinc-400 hover:text-red-500"
                        title="Delete"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <FiMessageSquare size={16} className="shrink-0 text-zinc-500" />
                    {editingChatId === item.id ? (
                      <div className="flex-1 flex items-center gap-1 min-w-0">
                        <input
                          ref={editInputRef}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleRename(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(item.id);
                            if (e.key === "Escape") setEditingChatId(null);
                          }}
                          className="flex-1 bg-transparent border-none outline-none text-sm p-0 min-w-0 font-medium text-[var(--text-primary)]"
                        />
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleRename(item.id)} className="text-green-500 p-0.5">
                          <FiCheck size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span
                          className="text-sm truncate font-medium text-zinc-400 group-hover:text-zinc-200"
                          onClick={() => { chat.loadChat(item.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
                        >
                          {item.title || "Untitled Chat"}
                        </span>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingChatId(item.id); setEditTitle(item.title || ""); }}
                            className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Footer Section (Profile) */}
      <div className="p-3 border-t border-white/[0.06] shrink-0">
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="flex-1 min-w-0">
             <ProfileMenu user={user} isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Search Chats Modal */}
      <SearchChatsModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        chat={chat}
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-[#171717] border-r border-white/[0.06] md:hidden shadow-2xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-screen transition-all duration-300 ease-in-out border-r border-white/[0.06] bg-[#171717] ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
