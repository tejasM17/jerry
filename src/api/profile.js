import { API_BASE } from "./base";

async function authHeaders(getToken, extra = {}) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function resolveMediaUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  const base = API_BASE?.endsWith("/api")
    ? API_BASE.replace(/\/api$/, "")
    : API_BASE || "";
  if (url.startsWith("/")) return `${base}${url}`;
  return url;
}

/**
 * Fetch merged profile from jerry-api (Clerk + Mongo).
 * @param {() => Promise<string|null>} getToken
 */
export async function fetchProfile(getToken) {
  const headers = await authHeaders(getToken);
  const res = await fetch(`${API_BASE}/profile`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load profile");
  return {
    ...data,
    photoURL: resolveMediaUrl(data.photoURL),
  };
}

/**
 * Update profile fields via backend (never Clerk Frontend for sensitive updates).
 */
export async function updateProfile(getToken, body) {
  const headers = await authHeaders(getToken, {
    "Content-Type": "application/json",
  });
  const res = await fetch(`${API_BASE}/profile`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to update profile");
  return {
    ...data,
    photoURL: resolveMediaUrl(data.photoURL),
  };
}

/**
 * Upload avatar file (multipart) or remove / set URL.
 * @param {File|null} file
 * @param {{ remove?: boolean, photoURL?: string }} opts
 */
export async function uploadAvatar(getToken, file, opts = {}) {
  const headers = await authHeaders(getToken);
  // Do not set Content-Type for FormData — browser sets boundary
  const form = new FormData();
  if (file) form.append("file", file);
  if (opts.remove) form.append("remove", "true");
  if (opts.photoURL) form.append("photoURL", opts.photoURL);

  const res = await fetch(`${API_BASE}/profile/avatar`, {
    method: "POST",
    headers,
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to update avatar");
  return {
    ...data,
    photoURL: resolveMediaUrl(data.photoURL),
  };
}

export async function checkUsernameAvailable(getToken, username) {
  const headers = await authHeaders(getToken);
  const res = await fetch(
    `${API_BASE}/profile/username-available?username=${encodeURIComponent(username)}`,
    { headers },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Username check failed");
  return data;
}

export async function deleteAccount(getToken, { hard = false } = {}) {
  const headers = await authHeaders(getToken, {
    "Content-Type": "application/json",
  });
  const res = await fetch(`${API_BASE}/profile`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ hard }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to delete account");
  return data;
}

export async function revokeAllSessions(getToken, { keepCurrent = false } = {}) {
  const headers = await authHeaders(getToken, {
    "Content-Type": "application/json",
  });
  const res = await fetch(`${API_BASE}/profile/revoke-sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ keepCurrent }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to revoke sessions");
  return data;
}

export { resolveMediaUrl };
