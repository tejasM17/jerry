import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSearch, FiMessageSquare, FiPlus } from "react-icons/fi";
import { useAuth } from "../auth/AuthProvider";
import { fetchRecentChats, searchChats } from "../../api/chat";
import { useDebounce } from "./hooks/useDebounce";

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-3 py-2.5">
    <div className="shimmer w-4 h-4 rounded shrink-0" />
    <div className="shimmer h-4 flex-1 rounded" />
  </div>
);

const SearchChatsModal = ({ isOpen, onClose, chat }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  const fetchRecent = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecentChats(() => user.getIdToken(), 10);
      setResults(data);
    } catch (err) {
      console.error("Search chats error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSearch = useCallback(
    async (q) => {
      if (!user || !q.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const data = await searchChats(() => user.getIdToken(), q);
        setResults(data);
      } catch (err) {
        console.error("Search chats error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (debouncedQuery.trim()) {
      fetchSearch(debouncedQuery);
    } else {
      fetchRecent();
    }
  }, [debouncedQuery, isOpen, fetchRecent, fetchSearch]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSelect = (chatId) => {
    chat.loadChat(chatId);
    onClose();
  };

  const handleNewChat = () => {
    chat.createNewChat();
    onClose();
  };

  const isSearching = debouncedQuery.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-lg mx-4 bg-[var(--surface-elevated)] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <FiSearch size={18} className="shrink-0 text-[var(--text-tertiary)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats..."
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none border-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto no-scrollbar py-2 px-2">
              {loading ? (
                <div className="space-y-1 px-1 py-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                  Something went wrong. Please try again.
                </div>
              ) : (
                <>
                  {/* New Chat Option */}
                    <button
                      onClick={handleNewChat}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-[#000000]"
                    >
                      <FiPlus size={16} className="shrink-0 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">New chat</span>
                    </button>

                  {/* Section Heading */}
                  {!isSearching && results.length > 0 && (
                    <h4 className="px-3 pt-3 pb-1 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                      Previous 7 Days
                    </h4>
                  )}

                  {/* Result Items */}
                  {results.length > 0 ? (
                    results.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-[#000000]"
                      >
                        <FiMessageSquare size={16} className="shrink-0 text-[var(--text-tertiary)]" />
                        <span className="text-sm text-[var(--text-secondary)] truncate">
                          {item.title || "Untitled Chat"}
                        </span>
                      </button>
                    ))
                  ) : (
                    !loading && (
                      <div className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                        {isSearching ? "No results found." : "No recent chats."}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchChatsModal;
