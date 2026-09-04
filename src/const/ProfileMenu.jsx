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
        className={`flex w-full items-center rounded-xl transition-all duration-200 ${
          open
            ? "bg-[#000000] shadow-sm ring-1 ring-white/10"
            : "hover:bg-[#000000]"
        } ${isCollapsed ? "justify-center p-1.5" : "gap-3 px-2.5 py-2.5"}`}
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
            className={`absolute z-[100] origin-bottom rounded-2xl border border-white/10 bg-[#000000] p-1.5 shadow-2xl mb-2.5 ${
              isCollapsed ? "bottom-full left-0 w-56" : "bottom-full left-0 right-0"
            }`}
          >
            <div className="mb-2 border-b border-white/10 px-3 py-3">
              <div className="flex items-center gap-3">
                {avatar}
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[var(--text-primary)]">
                    {displayName}
                  </div>
                  <div className="truncate text-[11px] font-medium text-[var(--text-tertiary)]">
                    {email}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleOpenProfile}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-all duration-200 hover:bg-[#000000] hover:text-[var(--text-primary)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#000000] transition-colors group-hover:bg-[#000000]">
                  <FiUser size={16} />
                </div>
                <span className="font-medium">Profile</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleOpenSettings}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-all duration-200 hover:bg-[#000000] hover:text-[var(--text-primary)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#000000] transition-colors group-hover:bg-[#000000]">
                  <FiSettings size={16} />
                </div>
                <span className="font-medium">Settings</span>
              </button>

              <div className="my-1.5 border-t border-white/10" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-all duration-200 hover:bg-red-500/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 transition-colors group-hover:bg-red-500/20">
                  <FiLogOut size={16} />
                </div>
                <span className="font-medium">Log out</span>
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
