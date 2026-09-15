import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import ProfileMenu from "../../const/ProfileMenu";
import JerryIcon from "../../assets/jerry.svg";
import SearchChatsModal from "./SearchChatsModal";
import {
  FiSearch,
  FiMessageSquare,
  FiX,
  FiMoreHorizontal,
  FiExternalLink,
  FiEdit2,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { useAuth } from "../auth/AuthProvider";
import { fetchAllChats } from "../../api/chat";
import { motion, AnimatePresence } from "framer-motion";

const PIN_KEY = "jerry.sidebar.pinnedChatIds";
const COLLAPSE_KEY = "jerry.sidebar.collapsed";
const SIDEBAR_EASE = [0.4, 0, 0.2, 1];

function chatKey(item) {
  return item?.id || item?.sessionId || item?._id || null;
}

function readPinnedIds() {
  try {
    const raw = localStorage.getItem(PIN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writePinnedIds(ids) {
  try {
    localStorage.setItem(PIN_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota */
  }
}

const ContextMenu = ({ x, y, items, onClose }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const pad = 8;
    setPos({
      left: Math.min(x, window.innerWidth - width - pad),
      top: Math.min(y, window.innerHeight - height - pad),
    });
  }, [x, y]);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12, ease: SIDEBAR_EASE }}
      role="menu"
      style={{ left: pos.left, top: pos.top }}
      className="fixed z-[200] min-w-[196px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a1a] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
    >
      {items.map((item) =>
        item.separator ? (
          <div
            key={item.key}
            className="my-1 h-px bg-white/[0.08]"
            role="separator"
          />
        ) : (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onSelect();
              onClose();
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-[7px] text-[13px] transition-colors duration-100 ${item.danger
              ? "text-red-400 hover:bg-white/[0.06]"
              : "text-zinc-200 hover:bg-white/[0.06]"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ),
      )}
    </motion.div>,
    document.body,
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, chat }) => {
  const [chats, setChats] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState(readPinnedIds);
  const [menu, setMenu] = useState(null);
  const { user } = useAuth();
  const editInputRef = useRef(null);

  const persistCollapsed = (next) => {
    setIsCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

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
      setChats(Array.isArray(data) ? data : []);
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
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const handleRename = async (id) => {
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    const success = await chat.renameChat(id, editTitle);
    if (success) {
      setChats((prev) =>
        prev.map((c) => (chatKey(c) === id ? { ...c, title: editTitle } : c)),
      );
    }
    setEditingChatId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this chat?")) return;
    const success = await chat.deleteChat(id);
    if (success) {
      setChats((prev) => prev.filter((c) => chatKey(c) !== id));
      setPinnedIds((prev) => {
        const next = prev.filter((p) => p !== id);
        writePinnedIds(next);
        return next;
      });
    }
  };

  const openChat = (id) => {
    chat.loadChat(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const togglePin = (id) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [id, ...prev];
      writePinnedIds(next);
      return next;
    });
  };

  const startRename = (item) => {
    const id = chatKey(item);
    setEditingChatId(id);
    setEditTitle(item.title || "");
    setMenu(null);
  };

  const openMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const id = chatKey(item);
    const isPinned = pinnedIds.includes(id);
    setMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          key: "tab",
          label: "Open new tab",
          icon: <FiExternalLink size={14} className="shrink-0 opacity-70" />,
          onSelect: () => window.open(`/c/${id}`, "_blank", "noopener,noreferrer"),
        },
        {
          key: "rename",
          label: "Rename",
          icon: <FiEdit2 size={14} className="shrink-0 opacity-70" />,
          onSelect: () => startRename(item),
        },
        {
          key: "pin",
          label: isPinned ? "Unpin" : "Pin",
          icon: <BsPinAngle size={14} className="shrink-0 opacity-70" />,
          onSelect: () => togglePin(id),
        },
        { key: "sep", separator: true },
        {
          key: "delete",
          label: "Delete",
          danger: true,
          icon: <FiTrash2 size={14} className="shrink-0" />,
          onSelect: () => handleDelete(id),
        },
      ],
    });
  };

  const { pinned, unpinned } = useMemo(() => {
    const pinSet = new Set(pinnedIds);
    const p = [];
    const u = [];
    for (const item of chats) {
      const id = chatKey(item);
      if (!id) continue;
      if (pinSet.has(id)) p.push(item);
      else u.push(item);
    }
    p.sort(
      (a, b) =>
        pinnedIds.indexOf(chatKey(a)) - pinnedIds.indexOf(chatKey(b)),
    );
    return { pinned: p, unpinned: u };
  }, [chats, pinnedIds]);

  const renderChatRow = (item) => {
    const id = chatKey(item);
    const isActive = chat.activeChatId === id;
    const isPinned = pinnedIds.includes(id);
    const isEditing = editingChatId === id;

    return (
      <div
        key={id}
        onContextMenu={(e) => openMenu(e, item)}
        className={`group relative flex h-9 items-center rounded-lg transition-colors duration-150 ${isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
          } ${isCollapsed ? "justify-center px-1" : "px-2"}`}
      >
        {isCollapsed ? (
          <button
            type="button"
            title={item.title || "Untitled Chat"}
            onClick={() => openChat(id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg"
          >
            {isPinned ? (
              <BsPinAngle size={15} className="text-zinc-400" />
            ) : (
              <FiMessageSquare size={15} className="text-zinc-500" />
            )}
          </button>
        ) : isEditing ? (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <input
              ref={editInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleRename(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(id);
                if (e.key === "Escape") setEditingChatId(null);
              }}
              className="min-w-0 flex-1 border-none bg-transparent p-0 text-[13px] text-zinc-100 outline-none"
              aria-label="Chat title"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleRename(id)}
              className="p-1 text-zinc-400 hover:text-zinc-100"
              aria-label="Save title"
            >
              <FiCheck size={14} />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => openChat(id)}
            >
              {isPinned && (
                <BsPinAngle
                  size={12}
                  className="shrink-0 text-zinc-500"
                  aria-hidden
                />
              )}
              <span
                className={`min-w-0 flex-1 truncate text-[13px] leading-5 ${isActive ? "text-zinc-100" : "text-zinc-400"
                  }`}
              >
                {item.title || "Untitled Chat"}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => openMenu(e, item)}
              aria-label="Chat actions"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 opacity-100 transition-opacity hover:bg-white/[0.06] hover:text-zinc-200 md:opacity-0 md:group-hover:opacity-100"
            >
              <FiMoreHorizontal size={16} />
            </button>
          </>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="relative flex h-full flex-col bg-[var(--surface-sidebar)] text-[var(--text-primary)]">
      <div
        className={`flex h-12 shrink-0 items-center ${isCollapsed ? "justify-center px-1" : "justify-between px-3"
          }`}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => persistCollapsed(false)}
            aria-label="Expand sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-zinc-100"
          >
            <LuPanelLeftOpen size={16} />
          </button>
        ) : (
          <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <img src={JerryIcon} alt="Jerry" className="h-6 w-6 invert" />
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search chats"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-zinc-100"
              >
                <FiSearch size={16} />
              </button>
              <button
                type="button"
                onClick={() => persistCollapsed(true)}
                aria-label="Collapse sidebar"
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-zinc-100 md:flex"
              >
                <LuPanelLeftClose size={16} />
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-zinc-100 md:hidden"
              >
                <FiX size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="px-2 pb-1">
        <button
          type="button"
          onClick={handleNewChat}
          title="Chat"
          className={`flex h-9 w-full items-center rounded-lg bg-white/[0.08] text-[13px] font-medium text-zinc-100 transition-colors duration-150 hover:bg-white/[0.11] ${isCollapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
            }`}
        >
          <FiMessageSquare size={16} className="shrink-0" />
          {!isCollapsed && <span>Chat</span>}
        </button>
        {isCollapsed && (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title="Search"
            className="mt-0.5 flex h-9 w-full items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/[0.05] hover:text-zinc-100"
          >
            <FiSearch size={16} />
          </button>
        )}
      </div>

      <div className="no-scrollbar mt-1 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {!isCollapsed && pinned.length > 0 && (
          <h3 className="mb-1 mt-2 px-2 text-[11px] font-medium tracking-wide text-zinc-500">
            Pinned
          </h3>
        )}
        {pinned.map(renderChatRow)}

        {!isCollapsed && (
          <h3
            className={`mb-1 px-2 text-[11px] font-medium tracking-wide text-zinc-500 ${pinned.length > 0 ? "mt-3" : "mt-2"
              }`}
          >
            Chats
          </h3>
        )}
        {unpinned.map(renderChatRow)}
      </div>

      <div className="shrink-0 p-2">
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

      <AnimatePresence>
        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            items={menu.items}
            onClose={() => setMenu(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: SIDEBAR_EASE }}
            className="fixed inset-y-0 left-0 z-50 w-[260px] bg-[var(--surface-sidebar)] md:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <aside
        className={`relative hidden h-screen shrink-0 flex-col overflow-hidden bg-[var(--surface-sidebar)] md:flex ${isCollapsed ? "w-[52px]" : "w-[260px]"
          }`}
        style={{
          transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
