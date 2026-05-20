import { useState, useRef, useCallback, useEffect } from "react";
import { API_BASE } from "../../api/base";

export const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  const loadChat = async (chatId) => {
    if (!user) return;

    const token = await user.getIdToken();

    const res = await fetch(`${API_BASE}/chat/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setMessages(data);
    setActiveChatId(chatId);
  };

  const sendMessage = async (prompt) => {
    if (!user) return;

    setLoading(true);

    const token = await user.getIdToken();

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

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
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      // NEW: get chatId from response header
      const newChatId = response.headers.get("X-Chat-Id");

      if (newChatId) {
        setActiveChatId(newChatId);
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
