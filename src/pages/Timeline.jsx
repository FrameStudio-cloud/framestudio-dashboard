import { useMemo } from "react";
import { IoCalendarOutline, IoCheckmarkCircle, IoEllipseOutline, IoFlag, IoFlagOutline } from "react-icons/io5";
import { FiFileText } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import { useData } from "../context/DataContext";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function daysFromNow(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff}d`;
}

const priorityColors = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-gray-400",
};

export default function Timeline() {
  const { focusItems, invoices } = useData();

  const events = useMemo(() => {
    const items = [];

    focusItems.forEach((t) => {
      if (!t.dueDate) return;
      items.push({
        date: t.dueDate,
        type: "task",
        label: t.content,
        project: t.project,
        priority: t.priority || "medium",
        completed: t.completed,
        status: t.status,
      });
    });

    invoices.forEach((inv) => {
      if (!inv.due) return;
      items.push({
        date: inv.due,
        type: "invoice",
        label: `${inv.clientName} — ${inv.description || "Invoice"}`,
        amount: inv.amount,
        status: inv.status,
      });
    });

    items.sort((a, b) => new Date(a.date) - new Date(b.date));

    return items.filter((e) => {
      const d = new Date(e.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return d >= threeMonthsAgo;
    });
  }, [focusItems, invoices]);

  const grouped = useMemo(() => {
    const groups = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!groups[key]) groups[key] = { label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, items: [] };
      groups[key].items.push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  const today = new Date();

  return (
    <PageLayout title="Timeline">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-2">
          <IoCalendarOutline size={16} className="text-amber-500" />
          <p className="text-sm text-gray-400 dark:text-slate-500">{events.length} upcoming events</p>
        </div>

        {grouped.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <IoCalendarOutline size={24} className="text-amber-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No upcoming events</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Add due dates to tasks or invoices to see them here.</p>
          </div>
        ) : (
          grouped.map(([key, group]) => {
            const isPast = new Date(group.items[0].date) < today;
            return (
              <div key={key}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isPast ? "text-gray-400 dark:text-slate-500" : "text-gray-700 dark:text-slate-300"}`}>
                  {group.label}
                </h3>
                <div className="space-y-1.5">
                  {group.items.map((event, i) => {
                    const d = daysFromNow(event.date);
                    const overdue = d && d.includes("overdue");
                    const isToday = d === "Today";
                    return (
                      <div
                        key={`${event.type}-${i}`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${event.type === "task" ? "bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 shadow-sm" : "bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 shadow-sm"}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${event.type === "task" ? "bg-gray-100 dark:bg-white/5" : "bg-amber-500/10"}`}>
                          {event.type === "task" ? (
                            event.completed ? <IoCheckmarkCircle className="text-green-500" size={16} /> : <IoEllipseOutline className="text-gray-400" size={16} />
                          ) : (
                            <FiFileText size={15} className="text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${event.type === "task" ? "text-gray-800 dark:text-white" : "text-gray-800 dark:text-white font-medium"}`}>
                            {event.label}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {event.type === "task" && (
                              <>
                                {event.project && <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded">{event.project}</span>}
                                <span className={`text-[10px] flex items-center gap-0.5 ${priorityColors[event.priority] || "text-gray-400"}`}>
                                  {event.priority === "high" ? <IoFlag size={9} /> : <IoFlagOutline size={9} />}
                                  {event.priority}
                                </span>
                              </>
                            )}
                            {event.type === "invoice" && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${event.status === "paid" ? "bg-green-500/10 text-green-600" : event.status === "overdue" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>
                                {event.status}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xs font-semibold ${overdue ? "text-red-500" : isToday ? "text-amber-600" : "text-gray-600 dark:text-slate-300"}`}>
                            {formatDate(event.date)}
                          </p>
                          <p className={`text-[11px] ${overdue ? "text-red-500 font-medium" : isToday ? "text-amber-600" : "text-gray-400 dark:text-slate-500"}`}>{d}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageLayout>
  );
}
