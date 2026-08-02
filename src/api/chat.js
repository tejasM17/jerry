import { API_BASE } from "./base";

/** Read a streaming plain-text response body into an onChunk callback. */
export async function readTextStream(response, onChunk) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) continue;
    full += chunk;
    onChunk?.(full, chunk);
  }

  return full;
}

async function authHeaders(getToken, extra = {}) {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

/** Prefer X-Session-Id; fall back to X-Chat-Id for older servers. */
function sessionIdFromHeaders(res, fallback) {
  return (
    res.headers.get("X-Session-Id") ||
    res.headers.get("X-Chat-Id") ||
    fallback ||
    null
  );
}

export async function fetchAllChats(getToken) {
  const res = await fetch(`${API_BASE}/chat/all`, {
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function fetchRecentChats(getToken, limit = 10) {
  const res = await fetch(`${API_BASE}/chat/recent?limit=${limit}`, {
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error("Failed to fetch recent chats");
  return res.json();
}

export async function searchChats(getToken, q, limit = 20) {
  const res = await fetch(
    `${API_BASE}/chat/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { headers: await authHeaders(getToken) },
  );
  if (!res.ok) throw new Error("Failed to search chats");
  return res.json();
}

/**
 * Mint an empty session (no messages). Returns { id, sessionId, title, ... }.
 * Use for URL-first UX: navigate to /c/:sessionId before first prompt.
 */
export async function createChatSession(getToken, title) {
  const res = await fetch(`${API_BASE}/chat/session`, {
    method: "POST",
    headers: await authHeaders(getToken, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(title ? { title } : {}),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function fetchChatMessages(getToken, chatId) {
  const res = await fetch(`${API_BASE}/chat/${encodeURIComponent(chatId)}`, {
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error("Failed to load chat");
  const messages = await res.json();
  const rawTitle = res.headers.get("X-Chat-Title");
  let title = null;
  if (rawTitle) {
    try {
      title = decodeURIComponent(rawTitle);
    } catch {
      title = rawTitle;
    }
  }
  return {
    messages,
    title,
    sessionId: sessionIdFromHeaders(res, chatId),
  };
}

export async function deleteChat(getToken, chatId) {
  const res = await fetch(`${API_BASE}/chat/${encodeURIComponent(chatId)}`, {
    method: "DELETE",
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error("Failed to delete chat");
  return true;
}

export async function renameChat(getToken, chatId, title) {
  const res = await fetch(
    `${API_BASE}/chat/${encodeURIComponent(chatId)}/rename`,
    {
      method: "PATCH",
      headers: await authHeaders(getToken, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ title }),
    },
  );
  if (!res.ok) throw new Error("Failed to rename chat");
  return res.json();
}

/**
 * Start or continue a chat; returns { chatId, sessionId, requestId, userMessageId, response }.
 * Public ids are UUIDs (sessionId). Prefer sessionId over legacy ObjectId.
 * `userMessageId` is the persisted user-message ObjectId for this turn —
 * pin it onto the SPA's optimistic local copy so the edit-message flow
 * can call PUT /chat/:chatId/edit/:messageId with a real id.
 */
export async function postChatStream(
  getToken,
  { chatId, prompt, attachments },
) {
  const endpoint = chatId
    ? `${API_BASE}/chat/${encodeURIComponent(chatId)}/continue`
    : `${API_BASE}/chat/new`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: await authHeaders(getToken, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ prompt, attachments }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send message: ${res.statusText}`);
  }

  const sessionId = sessionIdFromHeaders(res, chatId);
  return {
    chatId: sessionId,
    sessionId,
    requestId: res.headers.get("X-Request-Id") || null,
    userMessageId: res.headers.get("X-User-Message-Id") || null,
    response: res,
  };
}

export async function editMessageStream(
  getToken,
  { chatId, messageId, prompt, attachments },
) {
  const res = await fetch(
    `${API_BASE}/chat/${encodeURIComponent(chatId)}/edit/${encodeURIComponent(messageId)}`,
    {
      method: "PUT",
      headers: await authHeaders(getToken, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ prompt, attachments }),
    },
  );
  if (!res.ok) throw new Error("Failed to edit message");
  return res;
}

export async function uploadChatFile(getToken, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/chat/upload`, {
    method: "POST",
    headers: await authHeaders(getToken),
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
