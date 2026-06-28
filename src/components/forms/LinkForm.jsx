import { useState } from "react";

export default function LinkForm({ clientOptions, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    clientName: "", liveUrl: "", supabaseProject: "",
    vercelDashboard: "", githubRepo: "", notes: "",
    category: "client-sites", tags: [], favourite: false,
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const toggleFav = () => setForm((prev) => ({ ...prev, favourite: !prev.favourite }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="space-y-1 block">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Client</span>
        <select value={form.clientName} onChange={set("clientName")} required className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40">
          <option value="">Select a client</option>
          {clientOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Category</span>
          <select value={form.category} onChange={set("category")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40">
            <option value="client-sites">Client Sites</option>
            <option value="products">Products</option>
            <option value="internal">Internal</option>
          </select>
        </label>
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Tags (comma-separated)</span>
          <input value={form.tags.join(", ")} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="e.g. react, ecommerce" />
        </label>
      </div>
      <label className="space-y-1 block">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Live URL</span>
        <input value={form.liveUrl} onChange={set("liveUrl")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="https://..." />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Supabase project</span>
          <input value={form.supabaseProject} onChange={set("supabaseProject")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="project-name-db" />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Vercel dashboard</span>
          <input value={form.vercelDashboard} onChange={set("vercelDashboard")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="https://vercel.com/..." />
        </label>
      </div>
      <label className="space-y-1 block">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">GitHub repo</span>
        <input value={form.githubRepo} onChange={set("githubRepo")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="https://github.com/..." />
      </label>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.favourite} onChange={toggleFav} className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Mark as favourite</span>
        </label>
      </div>
      <label className="space-y-1 block">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Notes</span>
        <input value={form.notes} onChange={set("notes")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="Optional notes" />
      </label>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">{initial ? "Update" : "Add"} link</button>
      </div>
    </form>
  );
}
