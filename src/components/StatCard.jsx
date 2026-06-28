import { useNavigate } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

export default function StatCard({ label, value, trend, trendLabel, linkTo, timeline, color = "amber" }) {
  const navigate = useNavigate();
  const trendUp = trend > 0;
  const trendColors = {
    green: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    blue: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400",
    red: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
    purple: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
  };

  const timelineColors = {
    green: "bg-emerald-400 dark:bg-emerald-500",
    amber: "bg-amber-400 dark:bg-amber-500",
    blue: "bg-sky-400 dark:bg-sky-500",
    red: "bg-red-400 dark:bg-red-500",
    purple: "bg-violet-400 dark:bg-violet-500",
  };

  const maxTimeline = timeline ? Math.max(...timeline.map((t) => t.value), 1) : 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 shadow-sm p-3.5 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
        {linkTo && (
          <button
            onClick={() => navigate(linkTo)}
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all flex-shrink-0"
            aria-label={`View ${label} details`}
          >
            <FiArrowUpRight size={23} />
          </button>
        )}
      </div>

      <div className="flex items-end gap-2 mt-2">
        <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">{value}</span>
        {trend !== undefined && trend !== null && (
          <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold leading-none ${trendUp ? trendColors.green : trendColors.red}`}>
            <span className="text-xs leading-none">{trendUp ? "↑" : "↓"}</span>
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {trendLabel && (
        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{trendLabel}</p>
      )}

      {timeline && timeline.length > 0 && (
        <div className="mt-auto pt-3">
          <div className="flex items-end gap-[2px] h-7">
            {timeline.map((point, i) => {
              const height = (point.value / maxTimeline) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm ${timelineColors[color]} ${height < 15 ? "min-h-[4px]" : ""}`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
          {timeline.length > 1 && (
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400 dark:text-slate-500">{timeline[0].label}</span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500">{timeline[timeline.length - 1].label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
