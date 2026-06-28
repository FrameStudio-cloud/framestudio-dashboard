import { useState } from "react";

const PROJECT_STATUSES = ["building", "delivered", "on_retainer", "planning"];
const INVOICE_STATUSES = ["pending", "partial", "paid"];

export default function ClientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: "", business: "", whatsapp: "", liveUrl: "",
    projectStatus: "building", invoiceStatus: "pending",
    projectValue: "", whatWasBuilt: "",
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const isEditing = !!initial;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, projectValue: Number(form.projectValue) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 col-span-2">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Client name</span>
          <input value={form.name} onChange={set("name")} required className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="e.g. Ancy Luxe" />
        </label>
        <label className="space-y-1 col-span-2">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Business</span>
          <input value={form.business} onChange={set("business")} required className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="e.g. Luxury Hair & Wigs" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">WhatsApp</span>
          <input value={form.whatsapp} onChange={set("whatsapp")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="https://wa.me/254..." />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Live URL</span>
          <input value={form.liveUrl} onChange={set("liveUrl")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="https://..." />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Project status</span>
          <select value={form.projectStatus} onChange={set("projectStatus")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40">
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Invoice status</span>
          <select value={form.invoiceStatus} onChange={set("invoiceStatus")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40">
            {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Project value (KES)</span>
          <input type="number" value={form.projectValue} onChange={set("projectValue")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="0" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">What was built</span>
          <input value={form.whatWasBuilt} onChange={set("whatWasBuilt")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="Brief description" />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">{isEditing ? "Update" : "Add"} client</button>
      </div>
    </form>
  );
}
