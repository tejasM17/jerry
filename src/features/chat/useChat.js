import { useState, useRef, useCallback, useEffect } from "react";
import { API_BASE } from "../../api/base";

export const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.cancel();
      }
    };
  }, []);

  const loadChat = useCallback(
    async (chatId) => {
      if (!user) return;
      setError(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE}/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load chat");
        const data = await res.json();
        setMessages(data);
        setActiveChatId(chatId);
      } catch (err) {
        setError(err.message);
      }
    },
    [user]
  );

  const sendMessage = useCallback(
    async (prompt) => {
      if (!user) return;
      setError(null);
      setLoading(true);

      const token = await user.getIdToken();

      const userMessage = { role: "user", content: prompt };
      setMessages((prev) => [...prev, userMessage]);

      const endpoint = activeChatId
        ? `${API_BASE}/chat/${activeChatId}/continue`
        : `${API_BASE}/chat/new`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) throw new Error("Failed to send message");

        const newChatId = response.headers.get("X-Chat-Id");
        if (newChatId) setActiveChatId(newChatId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let assistantMessage = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;

          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "streaming") {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "streaming",
                content: assistantMessage,
              };
              return updated;
            }
            return [
              ...prev,
              { role: "streaming", content: assistantMessage },
            ];
          });
        }

        setMessages((prev) => {
          const filtered = prev.filter((m) => m.role !== "streaming");
          return [...filtered, { role: "assistant", content: assistantMessage }];
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user, activeChatId]
  );

  return {
    messages,
    sendMessage,
    loadChat,
    activeChatId,
    setActiveChatId,
    loading,
    error,
  };
};
