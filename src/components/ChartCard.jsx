export default function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-3 shadow-sm ${className}`}>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
