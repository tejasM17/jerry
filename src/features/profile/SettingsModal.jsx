import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiSettings,
  FiUser,
  FiShield,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";

const LANG_KEY = "jerry-language";

const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
];

/**
 * Phase 3 — compact Settings modal.
 * Only real / local controls: Dark appearance, language (localStorage),
 * Account → Edit profile.
 * No fake intelligence / dictation toggles.
 */
const SettingsModal = ({ isOpen, onClose, onOpenProfile }) => {
  const [section, setSection] = useState("general");
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(LANG_KEY) || "auto";
    } catch {
      return "auto";
    }
  });
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSection("general");
      setLangOpen(false);
      return;
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (langOpen) setLangOpen(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, langOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [langOpen]);

  const setLanguagePersist = useCallback((value) => {
    setLanguage(value);
    try {
      localStorage.setItem(LANG_KEY, value);
    } catch {
      /* ignore */
    }
    setLangOpen(false);
  }, []);

  const handleSecurity = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleAccountProfile = useCallback(() => {
    onClose();
    onOpenProfile?.();
  }, [onClose, onOpenProfile]);

  const langLabel =
    LANGUAGE_OPTIONS.find((o) => o.value === language)?.label || "Auto-detect";

  const navItems = [
    { id: "general", label: "General", icon: FiSettings },
    { id: "account", label: "Account", icon: FiUser },
  ];

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
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[640px] max-h-[min(560px,90vh)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#000000] shadow-2xl sm:flex-row"
          >
            {/* Left nav */}
            <div className="flex shrink-0 flex-col border-b border-white/10 sm:w-[180px] sm:border-b-0 sm:border-r sm:border-white/10">
              <div className="flex items-center gap-1 px-3 pt-3 pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close settings"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Mobile section tabs */}
              <div className="flex gap-1 overflow-x-auto px-3 pb-3 sm:hidden">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSection(id)}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
                      section === id
                        ? "bg-[#000000] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              <nav className="hidden flex-1 space-y-0.5 px-2 pb-4 sm:block" aria-label="Settings">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSection(id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                      section === id
                        ? "bg-[#000000] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Icon size={16} className="shrink-0 opacity-80" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Right content */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
              {section === "general" && (
                <>
                  <h2
                    id="settings-title"
                    className="mb-4 text-base font-medium text-[var(--text-primary)]"
                  >
                    General
                  </h2>

                  <div className="divide-y divide-white/[0.06]">
                    {/* Appearance — dark only (product constraint) */}
                    <div className="flex items-center justify-between gap-4 py-3.5">
                      <span className="text-sm text-[var(--text-primary)]">
                        Appearance
                      </span>
                      <span className="rounded-lg border border-white/10 bg-[#000000] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
                        Dark
                      </span>
                    </div>

                    {/* Language — local only */}
                    <div className="flex items-center justify-between gap-4 py-3.5">
                      <span className="text-sm text-[var(--text-primary)]">
                        Language
                      </span>
                      <div className="relative" ref={langRef}>
                        <button
                          type="button"
                          onClick={() => setLangOpen((o) => !o)}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#000000] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-white/20 hover:text-[var(--text-primary)]"
                          aria-haspopup="listbox"
                          aria-expanded={langOpen}
                        >
                          {langLabel}
                          <FiChevronDown size={14} className="opacity-70" />
                        </button>
                        <AnimatePresence>
                          {langOpen && (
                            <motion.ul
                              role="listbox"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-0 z-10 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-white/10 bg-[#000000] py-1 shadow-xl"
                            >
                              {LANGUAGE_OPTIONS.map((opt) => (
                                <li key={opt.value}>
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={language === opt.value}
                                    onClick={() => setLanguagePersist(opt.value)}
                                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-white/5"
                                  >
                                    {opt.label}
                                    {language === opt.value && (
                                      <FiCheck size={14} className="opacity-80" />
                                    )}
                                  </button>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {section === "account" && (
                <>
                  <h2
                    id="settings-title"
                    className="mb-4 text-base font-medium text-[var(--text-primary)]"
                  >
                    Account
                  </h2>

                  <div className="divide-y divide-white/[0.06]">
                    <button
                      type="button"
                      onClick={handleAccountProfile}
                      className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:opacity-90"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#000000]/80 text-[var(--text-secondary)]">
                        <FiUser size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-[var(--text-primary)]">
                          Edit profile
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          Display name, username, and photo
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleSecurity}
                      className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:opacity-90"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#000000]/80 text-[var(--text-secondary)]">
                        <FiShield size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-[var(--text-primary)]">
                          Security and login
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          Password, sessions, and connected accounts
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default SettingsModal;
