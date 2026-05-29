import { useState, useRef, useCallback, useEffect } from "react";
import { API_BASE } from "../../api/base";

export const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  const loadChat = async (chatId) => {
    if (!user) return;

    if (!chatId) {
      setMessages([]);
      setActiveChatId(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();

      const res = await fetch(`${API_BASE}/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load chat");
      }

      const data = await res.json();
      setMessages(data);
      setActiveChatId(chatId);
    } catch (err) {
      console.error("Error loading chat:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
  };

  const sendMessage = async (prompt, attachments = []) => {
    if (!user) return;

    setLoading(true);

    const token = await user.getIdToken();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: prompt, attachments },
    ]);

    try {
      const endpoint = activeChatId
        ? `${API_BASE}/chat/${activeChatId}/continue`
        : `${API_BASE}/chat/new`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, attachments }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      // Capture chatId from response headers (ensure case-insensitive check)
      const newChatId = response.headers.get("X-Chat-Id") || 
                       response.headers.get("x-chat-id") || 
                       response.headers.get("Chat-Id");

      if (newChatId && !activeChatId) {
        setActiveChatId(newChatId);
      } else if (!activeChatId) {
        // Fallback: If no header, fetch latest chat after a small delay
        // to allow the backend to finish creating it.
        setTimeout(async () => {
          try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/chat/all`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const chats = await res.json();
              if (chats.length > 0) {
                setActiveChatId(chats[0].id);
              }
            }
          } catch (err) {
            console.error("Fallback fetch error:", err);
          }
        }, 1000);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages((prev) => {
          const withoutStreaming = prev.filter((m) => m.role !== "streaming");
          return [
            ...withoutStreaming,
            { role: "streaming", content: assistantMessage },
          ];
        });
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "streaming"),
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const editMessage = async (messageId, newPrompt) => {
    if (!user || !activeChatId) return;

    setLoading(true);
    const token = await user.getIdToken();

    // Optimistically slice messages
    setMessages((prev) => {
      const index = prev.findIndex(
        (m) => m.id === messageId || m._id === messageId
      );
      if (index === -1) return prev;
      const sliced = prev.slice(0, index);
      return [...sliced, { ...prev[index], content: newPrompt }];
    });

    try {
      const response = await fetch(
        `${API_BASE}/chat/${activeChatId}/edit/${messageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: newPrompt }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit message");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages((prev) => {
          const withoutStreaming = prev.filter((m) => m.role !== "streaming");
          return [
            ...withoutStreaming,
            { role: "streaming", content: assistantMessage },
          ];
        });
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "streaming"),
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      console.error("Error editing message:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renameChat = async (chatId, newTitle) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/chat/${chatId}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to rename chat");
      return true;
    } catch (err) {
      console.error("Error renaming chat:", err);
      return false;
    }
  };

  const deleteChat = async (chatId) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/chat/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete chat");
      if (activeChatId === chatId) {
        createNewChat();
      }
      return true;
    } catch (err) {
      console.error("Error deleting chat:", err);
      return false;
    }
  };

  return {
    messages,
    sendMessage,
    loadChat,
    createNewChat,
    renameChat,
    deleteChat,
    activeChatId,
    setActiveChatId,
    loading,
    error,
  };
};
