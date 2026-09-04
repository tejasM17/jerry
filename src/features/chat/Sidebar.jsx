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
import { fetchAllChats } from "../../api/chat";
import { motion, AnimatePresence } from "framer-motion";

/** Functional nav only; disabled items stay visible but non-interactive. */
const navItems = [
  { icon: FiPlus, label: "New chat", action: "newChat" },
  { icon: FiSearch, label: "Search", action: "search" },
  { icon: FiImage, label: "Assets", disabled: true },
  { icon: FiGrid, label: "Extensions", disabled: true },
  { icon: FiCode, label: "Developer", disabled: true },
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
      const data = await fetchAllChats(() => user.getIdToken());
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

  const openChat = (id) => {
    chat.loadChat(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--surface-sidebar)] text-[var(--text-primary)]">
      {/* Header */}
      <div
        className={`flex shrink-0 items-center border-b border-[var(--border-subtle)] p-3 transition-[padding] duration-300 ${
          isCollapsed ? "justify-center" : "justify-between gap-2"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <img src={JerryIcon} alt="" className="h-5 w-5 invert" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="truncate text-[15px] font-semibold tracking-tight"
            >
              Jerry
            </motion.span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-colors duration-150 hover:bg-[#000000] hover:text-zinc-300 md:flex"
        >
          {isCollapsed ? (
            <FiChevronRight size={18} />
          ) : (
            <FiChevronLeft size={18} />
          )}
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-colors duration-150 hover:bg-[#000000] md:hidden"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Nav + history */}
      <div className="no-scrollbar flex-1 overflow-y-auto py-3">
        <div className="mb-4 space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isNewChat = item.action === "newChat";
            const isSearch = item.action === "search";
            const disabled = Boolean(item.disabled);

            return (
              <button
                key={item.label}
                type="button"
                disabled={disabled}
                aria-disabled={disabled || undefined}
                title={disabled ? "Coming soon" : item.label}
                onClick={
                  disabled
                    ? undefined
                    : isNewChat
                      ? handleNewChat
                      : isSearch
                        ? () => setSearchOpen(true)
                        : undefined
                }
                className={`group flex min-h-10 w-full items-center rounded-xl transition-colors duration-150 ${
                  isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
                } ${
                  disabled
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-[#000000]"
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors duration-150 ${
                    disabled
                      ? "text-zinc-600"
                      : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />
                {!isCollapsed && (
                  <span
                    className={`text-[13px] font-medium ${
                      disabled
                        ? "text-zinc-600"
                        : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-0.5 px-2">
          {!isCollapsed && (
            <h3 className="mb-1.5 px-3 text-[13px] font-medium text-zinc-500">
              Chats
            </h3>
          )}
          <div className="space-y-0.5">
            {chats.map((item) => {
              const isActive = chat.activeChatId === item.id;
              return (
                <div
                  key={item.id}
                  className={`group relative flex min-h-10 items-center rounded-xl transition-colors duration-150 ${
                    isActive ? "bg-[#000000]" : "hover:bg-[#000000]/60"
                  } ${isCollapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2"}`}
                >
                  {isCollapsed ? (
                    <div
                      className="relative flex h-8 w-full items-center justify-center"
                      onClick={() => openChat(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openChat(item.id);
                      }}
                    >
                      <FiMessageSquare
                        size={18}
                        className="text-zinc-500 transition-opacity group-hover:opacity-0"
                      />
                      <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(item.id);
                            setEditTitle(item.title || "");
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200"
                          title="Rename"
                          aria-label="Rename chat"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-red-500"
                          title="Delete"
                          aria-label="Delete chat"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {editingChatId === item.id ? (
                        <div className="flex min-w-0 flex-1 items-center gap-1">
                          <input
                            ref={editInputRef}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleRename(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(item.id);
                              if (e.key === "Escape") setEditingChatId(null);
                            }}
                            className="min-w-0 flex-1 border-none bg-transparent p-0 text-[13px] font-medium text-[var(--text-primary)] outline-none"
                            aria-label="Chat title"
                          />
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleRename(item.id)}
                            className="p-1 text-green-500"
                            aria-label="Save title"
                          >
                            <FiCheck size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                          <button
                            type="button"
                            className="min-w-0 flex-1 truncate text-left text-[13px] font-medium text-zinc-400 group-hover:text-zinc-200"
                            onClick={() => openChat(item.id)}
                          >
                            {item.title || "Untitled Chat"}
                          </button>
                          <div className="flex shrink-0 items-center opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChatId(item.id);
                                setEditTitle(item.title || "");
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-zinc-200"
                              aria-label="Rename chat"
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-red-500"
                              aria-label="Delete chat"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile footer */}
      <div className="shrink-0 border-t border-[var(--border-subtle)] p-2">
        <ProfileMenu user={user} isCollapsed={isCollapsed} />
      </div>
    </div>
  );

  return (
    <>
      <SearchChatsModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        chat={chat}
      />

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--border-subtle)] bg-[var(--surface-sidebar)] shadow-2xl md:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop rail — 260px / ~64px */}
      <aside
        className={`hidden h-screen shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-sidebar)] transition-[width] duration-300 ease-in-out md:flex ${
          isCollapsed ? "w-16" : "w-[260px]"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
