import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCamera } from "react-icons/fi";
import { useUser } from "@clerk/clerk-react";
import { useAuth } from "../auth/AuthProvider";
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  checkUsernameAvailable,
} from "../../api/profile";
import { useDebounce } from "../chat/hooks/useDebounce";

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

/**
 * Phase 2 — Edit profile modal (ChatGPT-style).
 * Loads/saves via jerry-api + Clerk; no hard-coded demo fields.
 */
const EditProfileModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { user: clerkUser } = useUser();
  const fileRef = useRef(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [usernameHint, setUsernameHint] = useState(null);

  const debouncedUsername = useDebounce(username, 400);
  const originalUsername = useRef("");

  const getToken = useCallback(async () => {
    if (!user?.getIdToken) return null;
    return user.getIdToken();
  }, [user]);

  // Prefill from Clerk immediately, then refresh from API when available
  useEffect(() => {
    if (!isOpen || !user) return;

    setError(null);
    setFieldErrors({});
    setUsernameHint(null);
    setPendingFile(null);
    setPreviewUrl(null);
    setDisplayName(user.displayName || "");
    setUsername(user.username || "");
    setPhotoURL(user.photoURL || null);
    originalUsername.current = user.username || "";

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const profile = await fetchProfile(getToken);
        if (cancelled) return;
        const name = profile.fullName || user.displayName || "";
        const uname = profile.username || user.username || "";
        setDisplayName(name);
        setUsername(uname);
        setPhotoURL(profile.photoURL || user.photoURL || null);
        originalUsername.current = uname;
      } catch (err) {
        // Clerk-prefilled fields still usable if API is down
        console.warn("[EditProfile] fetchProfile:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, user, getToken]);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Username availability (only when changed and valid shape)
  useEffect(() => {
    if (!isOpen || !user) return;
    const u = debouncedUsername.trim();
    if (!u || u === originalUsername.current) {
      setUsernameHint(null);
      return;
    }
    if (!USERNAME_RE.test(u)) {
      setUsernameHint({ ok: false, message: "3–30 chars: letters, numbers, _ or -" });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await checkUsernameAvailable(getToken, u);
        if (cancelled) return;
        if (data.available === false) {
          setUsernameHint({ ok: false, message: "Username is already taken" });
        } else {
          setUsernameHint({ ok: true, message: "Username is available" });
        }
      } catch {
        if (!cancelled) setUsernameHint(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedUsername, isOpen, user, getToken]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, saving]);

  const avatarSrc = previewUrl || photoURL;
  const initial = (displayName || username || "U").charAt(0).toUpperCase();

  const handlePickAvatar = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validate = () => {
    const next = {};
    const name = displayName.trim();
    if (!name) next.displayName = "Display name is required";
    const u = username.trim();
    if (u && !USERNAME_RE.test(u)) {
      next.username = "3–30 chars: letters, numbers, _ or -";
    }
    if (usernameHint?.ok === false && u !== originalUsername.current) {
      next.username = usernameHint.message;
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setSaving(true);
    setError(null);
    try {
      if (pendingFile) {
        const av = await uploadAvatar(getToken, pendingFile);
        if (av.photoURL) setPhotoURL(av.photoURL);
      }

      const body = {
        fullName: displayName.trim(),
      };
      if (username.trim()) body.username = username.trim();

      await updateProfile(getToken, body);

      // Refresh Clerk session so sidebar name/avatar update without full reload
      if (clerkUser?.reload) {
        await clerkUser.reload();
      }

      onClose();
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => !saving && onClose()}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#000000] shadow-2xl"
          >
            <div className="px-6 pt-5 pb-6">
              <h2
                id="edit-profile-title"
                className="text-[15px] font-medium text-[var(--text-primary)]"
              >
                Edit profile
              </h2>

              {/* Avatar */}
              <div className="mt-6 flex justify-center">
                <div className="relative">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt=""
                      className="h-24 w-24 rounded-full object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#000000] ring-1 ring-white/10">
                      <span className="text-2xl font-semibold text-zinc-300">
                        {initial}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handlePickAvatar}
                    disabled={saving || loading}
                    aria-label="Change profile photo"
                    className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#000000] text-white shadow-md transition-colors hover:bg-[#000000] disabled:opacity-50"
                  >
                    <FiCamera size={14} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Fields */}
              <div className="mt-6 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[var(--text-secondary)]">
                    Display name
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setFieldErrors((f) => ({ ...f, displayName: undefined }));
                    }}
                    disabled={saving}
                    maxLength={100}
                    className="w-full rounded-lg border border-white/10 bg-[#000000] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-white/20 disabled:opacity-60"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                  {fieldErrors.displayName && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.displayName}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-[var(--text-secondary)]">
                    Username
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.replace(/\s/g, ""));
                      setFieldErrors((f) => ({ ...f, username: undefined }));
                    }}
                    disabled={saving}
                    maxLength={30}
                    className="w-full rounded-lg border border-white/10 bg-[#000000] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-white/20 disabled:opacity-60"
                    placeholder="username"
                    autoComplete="username"
                  />
                  {fieldErrors.username ? (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.username}
                    </p>
                  ) : usernameHint ? (
                    <p
                      className={`mt-1 text-xs ${
                        usernameHint.ok ? "text-emerald-400/90" : "text-red-400"
                      }`}
                    >
                      {usernameHint.message}
                    </p>
                  ) : null}
                </label>
              </div>

              <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">
                Your profile helps people recognize you.
              </p>

              {error && (
                <p className="mt-3 text-center text-xs text-red-400" role="alert">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default EditProfileModal;
