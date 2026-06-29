import { useState, useMemo } from "react";
import { IoCheckmarkCircle, IoCloseCircle, IoPulseOutline } from "react-icons/io5";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import StatusBadge from "../components/StatusBadge";
import { useData } from "../context/DataContext";
import { revenueByPlan } from "../data/mock";

function formatKES(amount) {
  return `KES ${amount.toLocaleString()}`;
}

const CHART_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-gray-800 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? formatKES(p.value) : p.value}</p>
      ))}
    </div>
  );
};

const actionIcons = {
  new_shop: <IoPulseOutline size={14} />,
  payment: "💰",
  approval: "✅",
  flag: "🚩",
  subscription: "🔄",
};

export default function KeelPulse() {
  const { keelShops, keelApprovals, keelActivityLog, approveShop, rejectShop } = useData();
  const [activeTab, setActiveTab] = useState("overview");

  const activeShops = useMemo(() => keelShops.filter((s) => s.status === "active").length, [keelShops]);
  const pendingApprovals = useMemo(() => keelApprovals.filter((a) => a.status === "pending").length, [keelApprovals]);
  const flaggedIssues = useMemo(() => keelActivityLog.filter((l) => l.action === "flag").length, [keelActivityLog]);
  const monthlySubscriptionRevenue = useMemo(() =>
    keelShops.reduce((sum, s) => sum + (s.revenue || 0), 0),
  [keelShops]);

  const statusData = [
    { name: "Active", value: activeShops },
    { name: "Pending", value: pendingApprovals },
  ];

  const pendingList = useMemo(() => keelApprovals.filter((a) => a.status === "pending"), [keelApprovals]);

  return (
    <PageLayout title="Keel Pulse">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-1 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-lg p-0.5 shadow-sm w-fit">
          {["overview", "approvals", "activity"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-xs rounded-md transition-all ${activeTab === tab ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium" : "text-gray-400 dark:text-slate-500 hover:text-gray-600"}`}>
              {tab === "overview" ? "Overview" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Active shops" value={activeShops} color="green" />
              <StatCard label="Pending approvals" value={pendingApprovals} color="amber" />
              <StatCard label="Flagged issues" value={flaggedIssues} color="red" />
              <StatCard label="Monthly subscription" value={formatKES(monthlySubscriptionRevenue)} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Shop status" subtitle="Active vs pending">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                      {statusData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i]} />))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {statusData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                      <span className="text-gray-500 dark:text-slate-400">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="Revenue by plan" subtitle="Subscription tier breakdown">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueByPlan} barSize={48}>
                    <XAxis dataKey="plan" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#d97706" radius={[6, 6, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">All shops</h3>
              </div>
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Shop</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Plan</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keelShops.map((shop) => (
                      <tr key={shop.name} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{shop.name}</td>
                        <td className="px-4 py-3"><StatusBadge status={shop.status === "active" ? "delivered" : "pending"} label={shop.status === "active" ? "Active" : "Pending"} /></td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 capitalize">{shop.plan}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{shop.revenue > 0 ? formatKES(shop.revenue) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-gray-50 dark:divide-white/5">
                {keelShops.map((shop) => (
                  <div key={shop.name} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{shop.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={shop.status === "active" ? "delivered" : "pending"} label={shop.status === "active" ? "Active" : "Pending"} />
                        <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">{shop.plan}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{shop.revenue > 0 ? formatKES(shop.revenue) : "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "approvals" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 dark:text-slate-500">{pendingList.length} pending {pendingList.length !== 1 ? "approvals" : "approval"}</p>
            </div>

            {pendingList.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-8 text-center shadow-sm">
                <IoCheckmarkCircle size={40} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">All caught up! No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingList.map((approval) => (
                  <div key={approval.id} className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{approval.shopName}</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500">Owner: {approval.owner} · {approval.plan} plan</p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Submitted {timeAgo(approval.submittedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => approveShop(approval.id)} className="flex items-center gap-1 text-xs font-medium bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-500 transition-colors">
                          <IoCheckmarkCircle size={12} /> Approve
                        </button>
                        <button onClick={() => rejectShop(approval.id)} className="flex items-center gap-1 text-xs font-medium bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-500 transition-colors">
                          <IoCloseCircle size={12} /> Reject
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-medium">{approval.plan}</span>
                      <span>Waiting review</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {keelApprovals.filter((a) => a.status !== "pending").length > 0 && (
              <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">History</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {keelApprovals.filter((a) => a.status !== "pending").map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{approval.shopName}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{approval.owner} · {approval.plan}</p>
                      </div>
                      <StatusBadge status={approval.status === "approved" ? "paid" : "pending"} label={approval.status === "approved" ? "Approved" : "Rejected"} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "activity" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 dark:text-slate-500">{keelActivityLog.length} events</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {keelActivityLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-lg flex-shrink-0">{actionIcons[log.action] || "•"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-slate-300">
                        <span className="font-medium text-gray-900 dark:text-white">{log.shop}</span>
                        {" — "}{log.detail}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{timeAgo(log.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
