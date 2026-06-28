import { useState } from "react";

export default function FocusItemForm({ projectOptions, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { content: "", project: "", priority: "medium", dueDate: "" });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="space-y-1 block">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Task</span>
        <input value={form.content} onChange={set("content")} required className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="e.g. Finish inventory page" />
      </label>
      <label className="space-y-1 block">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Project (optional)</span>
        <select value={form.project} onChange={set("project")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40">
          <option value="">None</option>
          {projectOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Priority</span>
          <select value={form.priority} onChange={set("priority")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Due date (optional)</span>
          <input type="date" value={form.dueDate} onChange={set("dueDate")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">Add task</button>
      </div>
    </form>
  );
}
