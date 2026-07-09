import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
      document.body.style.overflow = "hidden";
    } else {
      el.close();
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      className="fixed inset-0 m-auto w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 backdrop:bg-black/50 backdrop:backdrop-blur-sm p-0 open:flex open:flex-col"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50 dark:border-white/5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all">
          <IoClose size={16} />
        </button>
      </div>
      <div className="px-5 py-4 overflow-y-auto max-h-[70vh]">{children}</div>
    </dialog>
  );
}
