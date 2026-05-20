import { useState, useRef, useEffect, useCallback } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { FiLogOut, FiSettings, FiCamera } from "react-icons/fi";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const menuVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.96,
    transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const ProfileMenu = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const handlePhotoUpdate = useCallback(async (file) => {
    if (!file || !auth.currentUser) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "jerry_unsigned");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/djx1pesuh/image/upload",
        { method: "POST", body: formData }
      );
      const data = await response.json();

      if (!data.secure_url) throw new Error("Upload failed");

      await updateProfile(auth.currentUser, { photoURL: data.secure_url });
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { photoURL: data.secure_url, updatedAt: new Date() },
        { merge: true }
      );
      setOpen(false);
    } catch (err) {
      console.error("Photo upload error:", err);
    } finally {
      setUploading(false);
    }
  }, []);

  const displayName = user?.displayName || "User";
  const email = user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-all duration-200"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/[0.06]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] ring-1 ring-white/[0.06] flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {initial}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight">
            {displayName}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] truncate leading-tight">
            {email}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="menu"
            className="absolute bottom-14 left-0 right-0 bg-[var(--surface-overlay)] border border-[var(--border-subtle)] rounded-xl p-2 shadow-2xl origin-bottom"
          >
            {/* Photo upload */}
            <div className="px-2 py-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpdate(file);
                }}
                className="hidden"
                aria-label="Upload profile photo"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all duration-200 disabled:opacity-50"
              >
                <FiCamera size={15} />
                {uploading ? "Uploading..." : "Update photo"}
              </button>
            </div>

            <hr className="mx-2 border-[var(--border-subtle)]" />

            {/* Settings */}
            <div className="px-2 py-1">
              <button
                role="menuitem"
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all duration-200"
              >
                <FiSettings size={15} />
                Settings
              </button>
            </div>

            {/* Logout */}
            <div className="px-2 py-1">
              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
              >
                <FiLogOut size={15} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
