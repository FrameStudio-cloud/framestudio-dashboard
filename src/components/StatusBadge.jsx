const schemes = {
  planning: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  building: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  delivered: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  on_retainer: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
  partial: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  pending: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  active: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
};

export default function StatusBadge({ status, label }) {
  const display = label || status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${schemes[status] || "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {display}
    </span>
  );
}
