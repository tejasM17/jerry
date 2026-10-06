import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiExternalLink, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { API_BASE } from "../../api/base";

const EASE_OUT = [0.22, 1, 0.36, 1];
const FADE = { duration: 0.15, ease: EASE_OUT };

/** Turn a GridFS path (`/api/chat/files/:id`) into a fetchable URL. */
export function resolveMediaUrl(url) {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const origin = API_BASE.endsWith("/api")
    ? API_BASE.replace(/\/api$/, "")
    : API_BASE;
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

const ToolbarButton = ({ label, onClick, href, download, children }) => {
  const className =
    "inline-flex items-center gap-1.5 rounded-md bg-bg/80 px-2.5 py-1.5 text-xs text-primary backdrop-blur-sm transition-colors duration-[var(--dur-fast)] hover:bg-surface-3";

  if (href) {
    return (
      <a
        href={href}
        download={download}
        target={download ? undefined : "_blank"}
        rel="noopener noreferrer"
        className={className}
        aria-label={label}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      {children}
    </button>
  );
};

const Lightbox = ({ src, alt, downloadName, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image viewer"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/70 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="absolute top-4 right-4 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={src}
          download={downloadName || "image"}
          className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-3 py-1.5 text-sm text-primary transition-colors duration-[var(--dur-fast)] hover:bg-surface-3"
        >
          <FiDownload size={14} />
          Download
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="flex h-9 w-9 items-center justify-center rounded-pill bg-surface-2 text-primary transition-colors duration-[var(--dur-fast)] hover:bg-surface-3"
        >
          <FiX size={16} />
        </button>
      </div>
      <motion.img
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        src={src}
        alt={alt || "Generated image"}
        className="max-h-[85vh] max-w-[min(100%,1100px)] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>,
    document.body,
  );
};

/**
 * Grok-style generated-image block.
 * `src` may be relative (`/api/chat/files/:id`) or absolute.
 */
const ImageCard = ({ src, alt = "Generated image", name }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const resolved = resolveMediaUrl(src);
  const downloadName = name || alt || "image";

  const close = useCallback(() => setOpen(false), []);

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(resolved);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [resolved]);

  const openFull = useCallback(() => {
    window.open(resolved, "_blank", "noopener,noreferrer");
  }, [resolved]);

  if (!resolved) return null;

  return (
    <>
      <div className="group relative my-2 w-full max-w-[512px] overflow-hidden rounded-lg border border-subtle bg-surface-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in"
          aria-label="Open image"
        >
          <img
            src={resolved}
            alt={alt}
            className="block max-h-[512px] w-full object-contain"
          />
        </button>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-2 opacity-0 transition-opacity duration-[var(--dur-fast)] group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="pointer-events-auto flex items-center gap-1">
            <ToolbarButton
              label="Download"
              href={resolved}
              download={downloadName}
            >
              <FiDownload size={13} />
              Download
            </ToolbarButton>
            <ToolbarButton label="Open full size" onClick={openFull}>
              <FiExternalLink size={13} />
              Open
            </ToolbarButton>
            <ToolbarButton label={copied ? "Copied" : "Copy URL"} onClick={copyUrl}>
              {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
              {copied ? "Copied" : "Copy URL"}
            </ToolbarButton>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <Lightbox
            src={resolved}
            alt={alt}
            downloadName={downloadName}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageCard;
