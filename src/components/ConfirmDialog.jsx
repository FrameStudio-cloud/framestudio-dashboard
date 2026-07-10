import { IoAlertCircleOutline } from "react-icons/io5";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText, confirmDanger }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-sm w-full p-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${confirmDanger ? "bg-red-500/10" : "bg-amber-500/10"}`}>
            <IoAlertCircleOutline size={20} className={confirmDanger ? "text-red-500" : "text-amber-500"} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title || "Confirm"}</h3>
            {message && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{message}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button onClick={onClose} className="text-xs font-medium text-gray-500 dark:text-slate-400 px-3 py-1.5 hover:text-gray-700 dark:hover:text-white transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`text-xs font-medium text-white rounded-lg px-4 py-1.5 transition-colors ${confirmDanger ? "bg-red-600 hover:bg-red-500" : "bg-amber-600 hover:bg-amber-500"}`}>
            {confirmText || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
