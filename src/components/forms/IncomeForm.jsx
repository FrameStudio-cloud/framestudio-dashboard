import { useState } from "react";

export default function IncomeForm({ clientOptions, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    clientName: "", amount: "", description: "", date: new Date().toISOString().slice(0, 10),
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, amount: Number(form.amount) || 0 });
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
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Amount (KES)</span>
          <input type="number" value={form.amount} onChange={set("amount")} required className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="0" />
        </label>
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Date</span>
          <input type="date" value={form.date} onChange={set("date")} required className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
        </label>
      </div>
      <label className="space-y-1 block">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Description</span>
        <input value={form.description} onChange={set("description")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e293b] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40" placeholder="e.g. Full payment — catalogue" />
      </label>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">{initial ? "Update" : "Add"} income</button>
      </div>
    </form>
  );
}
