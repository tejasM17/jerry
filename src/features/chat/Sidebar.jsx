import { useEffect, useState, useCallback } from "react";
import ProfileMenu from "../../const/ProfileMenu";
import JerryIcon from "../../assets/jerry.svg";

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
} from "react-icons/fi";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE } from "../../api/base";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { icon: FiPlus, label: "New chat", action: "newChat" },
  { icon: FiSearch, label: "Search chats" },
  { icon: FiImage, label: "Images" },
  { icon: FiGrid, label: "Apps" },
  { icon: FiCode, label: "Codex" },
];

const contentVariants = {
  visible: { opacity: 1, transition: { delay: 0.1, duration: 0.2 } },
  hidden: { opacity: 0, transition: { duration: 0.1 } },
};

const mobileSlideVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { x: "-100%", transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, chat }) => {
  const [chats, setChats] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const handleNewChat = useCallback(() => {
    if (typeof chat.newChat === "function") chat.newChat();
    else if (typeof chat.createNewChat === "function") chat.createNewChat();
    else if (typeof chat.loadChat === "function") chat.loadChat(null);
    setSidebarOpen(false);
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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Mobile close */}
      <div className="md:hidden flex items-center justify-end p-4 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--surface-elevated)]"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Logo + collapse */}
      <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)] min-h-[57px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-white/[0.06] rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/[0.06]">
            <img src={JerryIcon} alt="" className="w-5 h-5" />
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-base font-semibold tracking-tight text-nowrap"
              >
                by Tejas
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex items-center justify-center w-7 h-7 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] rounded-lg transition-all duration-200"
        >
          {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
        <div className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isNewChat = item.action === "newChat";
            return (
              <div
                key={item.label}
                role="button"
                tabIndex={0}
                onClick={isNewChat ? handleNewChat : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isNewChat) handleNewChat();
                }}
                aria-label={item.label}
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "gap-3 px-3"
                } py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] cursor-pointer transition-all duration-200 active:scale-[0.98]`}
              >
                <Icon size={16} className="shrink-0" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 px-2 overflow-hidden"
            >
              <div className="px-3 mb-2 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                Recent
              </div>
              <div className="space-y-0.5">
                {Array.isArray(chats) &&
                  chats.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        chat.loadChat(item.id);
                        setSidebarOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          chat.loadChat(item.id);
                          setSidebarOpen(false);
                        }
                      }}
                      aria-label={`Open chat: ${item.title || "New conversation"}`}
                      className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--surface-elevated)] cursor-pointer text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
                    >
                      <FiMessageSquare
                        size={16}
                        className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] shrink-0 transition-colors"
                      />
                      <span className="truncate">
                        {item.title || "New conversation"}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Profile */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center ring-1 ring-white/[0.06]">
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        ) : (
          <ProfileMenu user={user} />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar (animated slide) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            variants={mobileSlideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-[var(--surface-overlay)] border-r border-[var(--border-subtle)]"
            aria-label="Chat sidebar"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar (always visible, collapsible width) */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 68 : 260 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden md:flex shrink-0 bg-[var(--surface-overlay)] border-r border-[var(--border-subtle)] overflow-hidden"
        aria-label="Chat sidebar"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
};

export default Sidebar;
