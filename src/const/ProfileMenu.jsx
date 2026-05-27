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

const ProfileMenu = ({ user, isCollapsed }) => {
  const [open, setOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
  });
  
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
    
    setUploadStatus({ isUploading: true, progress: 0, error: null, success: false });

    try {
      // Simulate progress for a smoother UI experience as requested
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "jerry_unsigned");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/djx1pesuh/image/upload",
        { method: "POST", body: formData }
      );
      
      clearInterval(progressInterval);
      const data = await response.json();

      if (!data.secure_url) throw new Error("Upload failed");

      setUploadStatus(prev => ({ ...prev, progress: 100 }));

      await updateProfile(auth.currentUser, { photoURL: data.secure_url });
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { photoURL: data.secure_url, updatedAt: new Date() },
        { merge: true }
      );

      setUploadStatus({ isUploading: false, progress: 100, error: null, success: true });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, success: false }));
        setOpen(false);
      }, 2000);

    } catch (err) {
      console.error("Photo upload error:", err);
      setUploadStatus({ isUploading: false, progress: 0, error: "Failed to upload photo", success: false });
    }
  }, []);

  const displayName = user?.displayName || "User";
  const email = user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  const avatar = user?.photoURL ? (
    <img
      src={user.photoURL}
      alt=""
      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center shrink-0 overflow-hidden">
      <span className="text-xs font-semibold text-zinc-400">
        {initial}
      </span>
    </div>
  );

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center w-full rounded-xl transition-all duration-200 ${
          open 
            ? "bg-zinc-200/80 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-sm" 
            : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
        } ${
          isCollapsed ? "justify-center p-1.5" : "gap-3 px-2.5 py-2.5"
        }`}
      >
        {avatar}
        {!isCollapsed && (
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
              {displayName}
            </div>
            <div className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">
              {email}
            </div>
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="menu"
            className={`absolute z-[100] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xl origin-bottom mb-2.5 ${
              isCollapsed ? "bottom-full left-0 w-56" : "bottom-full left-0 right-0"
            }`}
          >
            {/* User Info Header */}
            {!isCollapsed && (
              <div className="px-3 py-3 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                <div className="flex items-center gap-3">
                  {avatar}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{displayName}</div>
                    <div className="text-[11px] text-zinc-500 truncate font-medium">{email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* User Info in Collapsed Mode */}
            {isCollapsed && (
               <div className="px-3 py-2 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-2">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{displayName}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{email}</div>
               </div>
            )}

            {/* Upload Status Overlay */}
            {uploadStatus.isUploading && (
              <div className="px-3 py-2 mb-2 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Uploading</span>
                  <span className="text-[10px] font-black text-indigo-500">{uploadStatus.progress}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-700/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadStatus.progress}%` }}
                    className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  />
                </div>
              </div>
            )}

            {uploadStatus.error && (
              <div className="px-3 py-2 mb-2 bg-red-500/10 text-red-500 text-[10px] font-medium rounded-xl border border-red-500/20">
                {uploadStatus.error}
              </div>
            )}

            {uploadStatus.success && (
              <div className="px-3 py-2 mb-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-medium rounded-xl border border-emerald-500/20">
                Success! Profile updated.
              </div>
            )}

            {/* Menu Items */}
            <div className="space-y-0.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpdate(file);
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus.isUploading}
                className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-200 disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors">
                  <FiCamera size={16} />
                </div>
                <span className="font-medium">Upload Photo</span>
              </button>

              <button
                onClick={() => console.log("Settings clicked")}
                className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors">
                  <FiSettings size={16} />
                </div>
                <span className="font-medium">Settings</span>
              </button>

              <div className="my-1.5 border-t border-zinc-200/50 dark:border-zinc-800/50" />

              <button
                onClick={handleLogout}
                className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <FiLogOut size={16} />
                </div>
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </motion.div>

        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
