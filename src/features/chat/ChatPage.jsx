import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { useChat } from "./useChat";
import { useAuth } from "../auth/AuthProvider";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const LoadingSkeleton = () => (
  <div className="flex h-screen bg-bg">
    <div className="hidden w-[260px] flex-col gap-4 bg-surface-1 p-4 md:flex">
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

  // ProtectedRoute already enforces sign-in; wait for AuthProvider bridge.
  if (user === undefined) return <LoadingSkeleton />;
  if (!user) return <Navigate to="/sign-in" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-primary">
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
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
