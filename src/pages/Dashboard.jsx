import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowRight, BsPlusLg } from "react-icons/bs";
import { IoPeopleOutline, IoWalletOutline, IoCheckboxOutline, IoPulseOutline } from "react-icons/io5";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { useData } from "../context/DataContext";
import { mockKeelPulse, monthlyRevenue, monthlyComparison, allTimeStats } from "../data/mock";

function formatKES(amount) {
  return `KES ${(amount || 0).toLocaleString()}`;
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const typeColors = {
  payment: "text-green-500 bg-green-500/10",
  client: "text-blue-500 bg-blue-500/10",
  keel: "text-purple-500 bg-purple-500/10",
  task: "text-amber-500 bg-amber-500/10",
  invoice: "text-orange-500 bg-orange-500/10",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-gray-800 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.dataKey === "revenue" || p.dataKey === "collected" || p.dataKey === "outstanding" ? formatKES(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { clients, income, focusItems, activityFeed } = useData();

  const [chartMode, setChartMode] = useState("month");

  const weekData = [
    { day: "Mon", revenue: 4000 },
    { day: "Tue", revenue: 6500 },
    { day: "Wed", revenue: 3000 },
    { day: "Thu", revenue: 7200 },
    { day: "Fri", revenue: 5000 },
    { day: "Sat", revenue: 1200 },
    { day: "Sun", revenue: 800 },
  ];

  const chartData = chartMode === "week" ? weekData : monthlyRevenue;
  const chartDataKey = chartMode === "week" ? "day" : "month";

  const thisMonthIncome = income.filter((i) => i.date.startsWith("2026-06")).reduce((s, i) => s + i.amount, 0);
  const lastMonthIncome = income.filter((i) => i.date.startsWith("2026-05")).reduce((s, i) => s + i.amount, 0);

  const pendingTotal = clients.filter((c) => c.invoiceStatus === "pending" || c.invoiceStatus === "partial").reduce((s, c) => {
    if (c.invoiceStatus === "pending") return s + c.projectValue;
    const paid = income.filter((i) => i.clientName === c.name).reduce((p, i) => p + i.amount, 0);
    return s + (c.projectValue - paid);
  }, 0);

  const activeClients = clients.filter((c) => c.projectStatus !== "planning").length;
  const { activeShops, pendingApprovals } = mockKeelPulse;
  const pendingClients = clients.filter((c) => c.invoiceStatus !== "paid").length;
  const todayFocus = focusItems.filter((f) => !f.completed && f.status !== "done");
  const completedCount = focusItems.filter((f) => f.completed || f.status === "done").length;
  const trend = lastMonthIncome ? Math.round(((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100) : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingDeadlines = focusItems.filter((f) => f.dueDate && !f.completed && f.dueDate >= todayStr).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/clients?action=add")} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors">
              <BsPlusLg size={10} /> Client
            </button>
            <button onClick={() => navigate("/finances?action=add")} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors">
              <BsPlusLg size={10} /> Payment
            </button>
            <button onClick={() => navigate("/focus?action=add")} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors">
              <BsPlusLg size={10} /> Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total revenue" value={formatKES(thisMonthIncome)} trend={trend} trendLabel="vs last month" color="green" linkTo="/finances" timeline={monthlyRevenue.map((m) => ({ label: m.month, value: m.revenue }))} />
          <StatCard label="Pending payments" value={formatKES(pendingTotal)} linkTo="/finances" color="red" trendLabel={`${pendingClients} client${pendingClients !== 1 ? "s" : ""}`} timeline={monthlyComparison.map((m) => ({ label: m.month, value: m.outstanding }))} />
          <StatCard label="Active clients" value={activeClients} linkTo="/clients" color="blue" timeline={allTimeStats.clientAcquisition.map((m) => ({ label: m.month, value: m.newClients * 5 }))} />
          <StatCard label="Keel shops" value={`${activeShops} active`} linkTo="/keel" color="purple" trendLabel={`${pendingApprovals} pending`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Revenue trend" subtitle={`Last 6 months / This week`}>
            <div className="flex items-center gap-1 mb-2">
              {["week", "month"].map((mode) => (
                <button key={mode} onClick={() => setChartMode(mode)} className={`px-2 py-0.5 text-[11px] rounded-md transition-all ${chartMode === mode ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium" : "text-gray-400 dark:text-slate-500 hover:text-gray-600"}`}>
                  {mode === "week" ? "This week" : "Monthly"}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              {chartMode === "month" ? (
                <LineChart data={chartData}>
                  <XAxis dataKey={chartDataKey} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2.5} dot={{ fill: "#d97706", r: 3 }} activeDot={{ r: 5 }} name="Revenue" />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <XAxis dataKey={chartDataKey} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Activity feed" subtitle="Latest across all systems">
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {activityFeed.slice(0, 8).map((item) => (
                <button key={item.id} onClick={() => navigate(item.link)} className="w-full flex items-start gap-2.5 py-1.5 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors text-left">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] ${typeColors[item.type] || "text-gray-500 bg-gray-500/10"}`}>
                    {item.type === "payment" ? "K" : item.type === "client" ? "C" : item.type === "keel" ? "S" : item.type === "task" ? "T" : "I"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-tight truncate">{item.message}</p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{timeAgo(item.timestamp)}</p>
                  </div>
                </button>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Client status" subtitle="Projects by phase — click to view">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {["discovery", "design", "development", "delivered"].map((stage) => {
                const count = clients.filter((c) => c.stage === stage || (stage === "delivered" && (c.stage === "delivered" || c.projectStatus === "delivered" || c.projectStatus === "on_retainer"))).length;
                const labels = { discovery: "Discovery", design: "Design", development: "Dev", delivered: "Delivered" };
                return (
                  <button key={stage} onClick={() => navigate(`/clients?stage=${stage}`)} className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{labels[stage]}</p>
                  </button>
                );
              })}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={clients.filter((c) => c.projectStatus !== "planning").length > 0 ? [
                { status: "Planning", count: clients.filter((c) => c.projectStatus === "planning").length },
                { status: "Building", count: clients.filter((c) => c.projectStatus === "building").length },
                { status: "Delivered", count: clients.filter((c) => c.projectStatus === "delivered" || c.projectStatus === "on_retainer").length },
              ] : []} barSize={48}>
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#d97706" radius={[6, 6, 0, 0]} name="Clients" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Upcoming deadlines</h3>
                <button onClick={() => navigate("/focus")} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">View all</button>
              </div>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500">No upcoming deadlines</p>
              ) : (
                <div className="space-y-1">
                  {upcomingDeadlines.map((item) => {
                    const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={item.id} className="flex items-center gap-3 text-sm py-1">
                        <IoCheckboxOutline className="text-amber-500 flex-shrink-0" size={16} />
                        <span className="flex-1 text-gray-700 dark:text-slate-300 truncate">{item.content}</span>
                        <span className={`text-[11px] flex-shrink-0 ${daysLeft <= 1 ? "text-red-500" : daysLeft <= 3 ? "text-amber-500" : "text-gray-400 dark:text-slate-500"}`}>
                          {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Today's focus</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 mb-2">
                <span>{todayFocus.length} remaining</span>
                <span>·</span>
                <span>{focusItems.length} total</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mb-3">
                <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${focusItems.length > 0 ? (completedCount / focusItems.length) * 100 : 0}%` }} />
              </div>
              <div className="space-y-1">
                {todayFocus.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-slate-500">All done!</p>
                ) : (
                  todayFocus.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm py-1">
                      <BsArrowRight className="text-amber-500 flex-shrink-0" />
                      <span className="flex-1 text-gray-700 dark:text-slate-300 truncate">{item.content}</span>
                      {item.project && <span className="text-[11px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded flex-shrink-0">{item.project}</span>}
                    </div>
                  ))
                )}
                <button onClick={() => navigate("/focus")} className="text-xs text-amber-600 dark:text-amber-400 hover:underline mt-1 inline-block">Manage focus board →</button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Recent transactions" subtitle="Latest income entries">
            <div className="space-y-2">
              {income.slice(0, 5).map((entry) => (
                <button key={entry.id} onClick={() => navigate(`/finances?client=${encodeURIComponent(entry.clientName)}`)} className="w-full flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors text-left">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{entry.clientName}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{entry.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatKES(entry.amount)}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{entry.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </ChartCard>

          <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Quick actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate("/clients?action=add")} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors text-left">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><IoPeopleOutline size={18} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Add client</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">New project</p>
                </div>
              </button>
              <button onClick={() => navigate("/finances?action=add")} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors text-left">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500"><IoWalletOutline size={18} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Log payment</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Record income</p>
                </div>
              </button>
              <button onClick={() => navigate("/focus?action=add")} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors text-left">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500"><IoCheckboxOutline size={18} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Create task</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Add to focus</p>
                </div>
              </button>
              <button onClick={() => navigate("/keel")} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors text-left">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500"><IoPulseOutline size={18} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Keel Pulse</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">{pendingApprovals} approvals pending</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
