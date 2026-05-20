import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { useChat } from "./useChat";
import { useAuth } from "../auth/AuthProvider";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const LoadingSkeleton = () => (
  <div className="flex h-screen bg-[var(--surface)]">
    <div className="w-[260px] bg-[var(--surface-overlay)] hidden md:flex flex-col p-4 gap-4">
      <div className="shimmer h-8 w-3/4 rounded-lg" />
      <div className="shimmer h-8 w-full rounded-lg" />
      <div className="shimmer h-8 w-full rounded-lg" />
      <div className="shimmer h-8 w-2/3 rounded-lg" />
      <div className="mt-auto shimmer h-10 w-full rounded-lg" />
    </div>
    <div className="flex-1 flex flex-col p-6 gap-6">
      <div className="shimmer h-6 w-1/3 rounded-lg" />
      <div className="flex-1 shimmer rounded-2xl" />
      <div className="shimmer h-12 w-full rounded-xl" />
    </div>
  </div>
);

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const chat = useChat(user);

  const hasMessages = Array.isArray(chat.messages) && chat.messages.length > 0;

  if (user === undefined) return <LoadingSkeleton />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface)] text-[var(--text-primary)]">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chat={chat}
      />

      <ChatWindow
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chat={chat}
      />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
