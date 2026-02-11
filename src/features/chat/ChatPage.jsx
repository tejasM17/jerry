import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { useState } from "react";
import { useChat } from "./useChat";
import { useAuth } from "../auth/AuthProvider";
import { Navigate } from "react-router-dom";

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const { user } = useAuth();
  const chat = useChat(user);

  if (user === undefined) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="flex h-screen text-white bg-[#212121]">
      <Sidebar
        refreshSidebar={refreshSidebar}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chat={chat}
      />
      <ChatWindow
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chat={chat}
      />
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;
