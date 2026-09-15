import { useState, useRef, useEffect, useCallback } from "react";
import { useFirebaseAuth } from "../features/auth/FirebaseAuthProvider";
import { FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import EditProfileModal from "../features/profile/EditProfileModal";
import SettingsModal from "../features/profile/SettingsModal";

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

/**
 * Bottom-left account menu.
 * Profile → Edit profile modal (Phase 2)
 * Settings → Settings modal (Phase 3)
 */
const ProfileMenu = ({ user, isCollapsed }) => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef(null);
  const { signOut } = useFirebaseAuth();

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
    await signOut({ redirectUrl: "/sign-in" });
  }, [signOut]);

  const handleOpenProfile = useCallback(() => {
    setOpen(false);
    setSettingsOpen(false);
    setProfileOpen(true);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setOpen(false);
    setSettingsOpen(true);
  }, []);

  const displayName = user?.displayName || "User";
  const email = user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  const avatar = user?.photoURL ? (
    <img
      src={user.photoURL}
      alt=""
      className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
    />
  ) : (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#000000] ring-1 ring-white/10">
      <span className="text-xs font-semibold text-zinc-400">{initial}</span>
    </div>
  );

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex w-full items-center rounded-lg transition-colors duration-150 ${
          open ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
        } ${isCollapsed ? "justify-center p-1" : "gap-2.5 px-2 py-1.5"}`}
      >
        {avatar}
        {!isCollapsed && (
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-sm font-semibold leading-tight text-[var(--text-primary)]">
              {displayName}
            </div>
            <div className="mt-0.5 truncate text-[10px] leading-tight text-[var(--text-tertiary)]">
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
            className={`absolute z-[100] origin-bottom overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a1a] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)] mb-2 ${
              isCollapsed ? "bottom-full left-0 w-56" : "bottom-full left-0 right-0"
            }`}
          >
            <div className="border-b border-white/[0.08] px-3 py-2.5">
              <div className="truncate text-[13px] font-medium text-zinc-100">
                {displayName}
              </div>
              <div className="truncate text-[12px] text-zinc-500">{email}</div>
            </div>

            <div className="py-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleOpenProfile}
                className="flex w-full items-center gap-2.5 px-3 py-[7px] text-[13px] text-zinc-200 transition-colors duration-100 hover:bg-white/[0.06]"
              >
                <FiUser size={14} className="opacity-70" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleOpenSettings}
                className="flex w-full items-center gap-2.5 px-3 py-[7px] text-[13px] text-zinc-200 transition-colors duration-100 hover:bg-white/[0.06]"
              >
                <FiSettings size={14} className="opacity-70" />
                <span>Settings</span>
              </button>
            </div>

            <div className="border-t border-white/[0.08] py-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-[7px] text-[13px] text-red-400 transition-colors duration-100 hover:bg-white/[0.06]"
              >
                <FiLogOut size={14} />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenProfile={handleOpenProfile}
      />
    </div>
  );
};

export default ProfileMenu;
