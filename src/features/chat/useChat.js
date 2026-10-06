import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  fetchChatMessages,
  postChatStream,
  editMessageStream,
  renameChat as apiRenameChat,
  deleteChat as apiDeleteChat,
  readTextStream,
} from "../../api/chat";

/** Keep GridFS image metadata the API already stores on a message. */
function normalizeAttachment(file) {
  if (!file || typeof file !== "object") return null;
  const fileId = file.fileId || file.id || file._id || undefined;
  const url =
    file.url || (fileId ? `/api/chat/files/${fileId}` : undefined);
  return {
    fileId,
    url,
    mimeType: file.mimeType || file.mimetype || file.contentType || "",
    name: file.name || file.filename || "file",
  };
}

function normalizeMessage(message) {
  if (!message || typeof message !== "object") return message;
  const attachments = Array.isArray(message.attachments)
    ? message.attachments.map(normalizeAttachment).filter(Boolean)
    : undefined;
  return {
    ...message,
    id: message.id || message._id,
    content: typeof message.content === "string" ? message.content : "",
    ...(attachments ? { attachments } : {}),
  };
}

function finalizeStreamedAssistant(prev, extra = {}) {
  const streaming = prev.find((m) => m.role === "streaming");
  const content = streaming?.content || "";
  const attachments = Array.isArray(streaming?.attachments)
    ? streaming.attachments
    : undefined;
  return [
    ...prev.filter((m) => m.role !== "streaming"),
    {
      role: "assistant",
      content,
      ...(attachments ? { attachments } : {}),
      ...extra,
    },
  ];
}

/**
 * Chat session hook — Firebase JWT + Mongo-backed jerry-api.
 *
 * URL model (Grok / ChatGPT style):
 *   /              → empty composer (no session yet)
 *   /c/:sessionId  → load / continue that conversation
 *   ?rid=          → optional request turn id (deep-link, non-destructive)
 *
 * sessionId is a public UUID from the API (X-Session-Id), not a Mongo ObjectId.
 */
export const useChat = (user) => {
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageMode, setImageMode] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatTitle, setActiveChatTitle] = useState(null);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const loadSeq = useRef(0);
  /** Skip one URL→load cycle when we just pushed the URL ourselves after /new */
  const skipRouteLoad = useRef(false);
  /**
   * Index of the most recently added optimistic user message — used after
   * the POST /chat/new|continue response arrives to pin the server-issued
   * id onto that local message so the edit-message flow has a real id.
   */
  const pendingUserIndex = useRef(-1);

  const getToken = useCallback(async () => {
    if (!user?.getIdToken) throw new Error("Not signed in");
    return user.getIdToken();
  }, [user]);

  const goToSession = useCallback(
    (sessionId, { replace = true, requestId } = {}) => {
      if (!sessionId) {
        navigate("/", { replace });
        return;
      }
      const path = `/c/${sessionId}`;
      if (requestId) {
        navigate(`${path}?rid=${encodeURIComponent(requestId)}`, { replace });
      } else {
        navigate(path, { replace });
      }
    },
    [navigate],
  );

  const loadChat = useCallback(
    async (chatId, { syncUrl = true } = {}) => {
      if (!user) return;

      pendingUserIndex.current = -1;
      if (!chatId) {
        loadSeq.current += 1;
        setMessages([]);
        setActiveChatId(null);
        setActiveChatTitle(null);
        setActiveRequestId(null);
        setError(null);
        if (syncUrl) {
          skipRouteLoad.current = true;
          goToSession(null);
        }
        return;
      }

      const seq = ++loadSeq.current;
      setLoading(true);
      setError(null);
      setActiveChatId(chatId);

      try {
        const { messages: data, title, sessionId } = await fetchChatMessages(
          getToken,
          chatId,
        );
        if (seq !== loadSeq.current) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.messages)
            ? data.messages
            : [];
        setMessages(list.map(normalizeMessage));
        if (title) setActiveChatTitle(title);
        const publicId = sessionId || chatId;
        setActiveChatId(publicId);
        if (syncUrl) {
          skipRouteLoad.current = true;
          goToSession(publicId, {
            replace: true,
            requestId: searchParams.get("rid") || undefined,
          });
        }
      } catch (err) {
        if (seq !== loadSeq.current) return;
        console.error("Error loading chat:", err);
        setError(err.message);
        setMessages([]);
      } finally {
        if (seq === loadSeq.current) setLoading(false);
      }
    },
    [user, getToken, goToSession, searchParams],
  );

  // Sync route → state when user opens /c/:sessionId (sidebar, refresh, share link)
  useEffect(() => {
    if (!user) return;
    if (skipRouteLoad.current) {
      skipRouteLoad.current = false;
      return;
    }

    const rid = searchParams.get("rid");
    if (rid) setActiveRequestId(rid);

    if (routeSessionId) {
      if (routeSessionId !== activeChatId) {
        loadChat(routeSessionId, { syncUrl: false });
      }
    } else if (activeChatId) {
      // Landed on `/` while a session was active (New chat)
      setMessages([]);
      setActiveChatId(null);
      setActiveChatTitle(null);
      setActiveRequestId(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on route/user
  }, [user, routeSessionId]);

  const createNewChat = useCallback(() => {
    pendingUserIndex.current = -1;
    loadSeq.current += 1;
    setMessages([]);
    setActiveChatId(null);
    setActiveChatTitle(null);
    setActiveRequestId(null);
    setError(null);
    skipRouteLoad.current = true;
    goToSession(null);
  }, [goToSession]);

  const sendMessage = useCallback(
    async (prompt, attachments = [], options = {}) => {
      const files = Array.isArray(attachments) ? attachments : [];
      const mode = options?.mode === "image" ? "image" : "text";
      if (!user || !prompt?.trim()) return;

      // One-shot: image mode applies to this send only.
      setImageMode(false);
      setLoading(true);
      setError(null);

      if (!activeChatId) {
        const words = prompt.trim().split(/\s+/).slice(0, 6);
        setActiveChatTitle(
          words.join(" ") + (prompt.trim().split(/\s+/).length > 6 ? "…" : ""),
        );
      }

      setMessages((prev) => {
        const idx = prev.length;
        pendingUserIndex.current = idx;
        return [
          ...prev,
          normalizeMessage({
            role: "user",
            content: prompt,
            attachments: files,
            mode,
          }),
        ];
      });

      try {
        const {
          chatId: newChatId,
          sessionId,
          requestId,
          userMessageId,
          response,
        } = await postChatStream(getToken, {
          chatId: activeChatId,
          prompt,
          attachments: files,
          mode,
        });

        // Pin the server-issued id onto the optimistic user message so a
        // subsequent edit can address it by real id (otherwise PUT .../edit/:messageId
        // would 404). Skip if the user already navigated / reloaded.
        if (userMessageId && pendingUserIndex.current >= 0) {
          const targetIdx = pendingUserIndex.current;
          pendingUserIndex.current = -1;
          setMessages((prev) => {
            if (targetIdx >= prev.length) return prev;
            const target = prev[targetIdx];
            if (!target || target.role !== "user" || target.id) return prev;
            const next = prev.slice();
            next[targetIdx] = { ...target, id: userMessageId };
            return next;
          });
        }

        const publicId = sessionId || newChatId;
        if (publicId && publicId !== activeChatId) {
          setActiveChatId(publicId);
          skipRouteLoad.current = true;
          goToSession(publicId, { replace: true, requestId: requestId || undefined });
        } else if (publicId && requestId) {
          setActiveRequestId(requestId);
          // Update ?rid= without remount
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.set("rid", requestId);
              return next;
            },
            { replace: true },
          );
        }

        if (requestId) setActiveRequestId(requestId);

        await readTextStream(response, (full) => {
          setMessages((prev) => {
            const withoutStreaming = prev.filter((m) => m.role !== "streaming");
            return [...withoutStreaming, { role: "streaming", content: full }];
          });
        });

        setMessages((prev) =>
          finalizeStreamedAssistant(prev, { requestId: requestId || null }),
        );
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err.message);
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
    },
    [user, getToken, activeChatId, goToSession, setSearchParams],
  );

  const retryLastImage = useCallback(() => {
    const userTurn = [...messages].reverse().find((m) => m.role === "user");
    if (!userTurn?.content?.trim()) return;
    sendMessage(userTurn.content, userTurn.attachments || [], { mode: "image" });
  }, [messages, sendMessage]);

  const editMessage = useCallback(
    async (messageId, newPrompt) => {
      if (!user || !activeChatId) return;

      setLoading(true);
      setError(null);

      setMessages((prev) => {
        const index = prev.findIndex(
          (m) => m.id === messageId || m._id === messageId,
        );
        if (index === -1) return prev;
        const sliced = prev.slice(0, index);
        return [...sliced, { ...prev[index], content: newPrompt }];
      });

      try {
        const response = await editMessageStream(getToken, {
          chatId: activeChatId,
          messageId,
          prompt: newPrompt,
        });

        const requestId = response.headers?.get?.("X-Request-Id") || null;
        if (requestId) {
          setActiveRequestId(requestId);
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.set("rid", requestId);
              return next;
            },
            { replace: true },
          );
        }

        await readTextStream(response, (full) => {
          setMessages((prev) => {
            const withoutStreaming = prev.filter((m) => m.role !== "streaming");
            return [...withoutStreaming, { role: "streaming", content: full }];
          });
        });

        setMessages((prev) =>
          finalizeStreamedAssistant(prev, { requestId }),
        );
      } catch (err) {
        console.error("Error editing message:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user, getToken, activeChatId, setSearchParams],
  );

  const renameChat = useCallback(
    async (chatId, newTitle) => {
      if (!user) return false;
      try {
        await apiRenameChat(getToken, chatId, newTitle);
        if (chatId === activeChatId) setActiveChatTitle(newTitle);
        return true;
      } catch (err) {
        console.error("Error renaming chat:", err);
        return false;
      }
    },
    [user, getToken, activeChatId],
  );

  const deleteChat = useCallback(
    async (chatId) => {
      if (!user) return false;
      try {
        await apiDeleteChat(getToken, chatId);
        if (activeChatId === chatId) createNewChat();
        return true;
      } catch (err) {
        console.error("Error deleting chat:", err);
        return false;
      }
    },
    [user, getToken, activeChatId, createNewChat],
  );

  return {
    messages,
    sendMessage,
    retryLastImage,
    editMessage,
    loadChat,
    createNewChat,
    /** Alias used by Sidebar */
    newChat: createNewChat,
    renameChat,
    deleteChat,
    activeChatId,
    activeChatTitle,
    activeRequestId,
    setActiveChatId,
    loading,
    error,
    imageMode,
    setImageMode,
  };
};
