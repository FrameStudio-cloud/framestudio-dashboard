export default function Tooltip({ label, children }) {
  return (
    <div className="group/tip relative">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 whitespace-nowrap bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg px-2.5 py-1.5 shadow-lg">
        {label}
      </div>
    </div>
  );
}
