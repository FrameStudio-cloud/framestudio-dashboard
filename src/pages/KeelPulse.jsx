import { useState, useMemo } from "react";
import { IoPulseOutline, IoReload } from "react-icons/io5";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
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

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
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
  expiry: "⏰",
  renewal: "🔄",
};

export default function KeelPulse() {
  const { keelShops, keelActivityLog, renewShop } = useData();
  const [activeTab, setActiveTab] = useState("overview");
  const [renewingShop, setRenewingShop] = useState(null);

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const shopsWithStatus = useMemo(() => keelShops.map((s) => {
    const expiresAt = s.subscriptionExpiresAt ? new Date(s.subscriptionExpiresAt).getTime() : null;
    const isExpired = s.status === "expired" || (expiresAt && expiresAt < now);
    const isExpiringSoon = !isExpired && expiresAt && expiresAt < now + sevenDays;
    return { ...s, expiresAt, isExpired, isExpiringSoon };
  }), [keelShops]);

  const activeShops = useMemo(() => shopsWithStatus.filter((s) => !s.isExpired && !s.isExpiringSoon && s.status === "active").length, [shopsWithStatus]);
  const expiredCount = useMemo(() => shopsWithStatus.filter((s) => s.isExpired).length, [shopsWithStatus]);
  const expiringSoonCount = useMemo(() => shopsWithStatus.filter((s) => s.isExpiringSoon).length, [shopsWithStatus]);

  const statusData = [
    { name: "Active", value: activeShops },
    { name: "Expiring soon", value: expiringSoonCount },
    { name: "Expired", value: expiredCount },
  ];

  function handleRenew(days) {
    if (!renewingShop) return;
    renewShop(renewingShop.id, days);
    setRenewingShop(null);
  }

  return (
    <PageLayout title="Keel Pulse">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-1 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-lg p-0.5 shadow-sm w-fit">
          {["overview", "activity"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-xs rounded-md transition-all ${activeTab === tab ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium" : "text-gray-400 dark:text-slate-500 hover:text-gray-600"}`}>
              {tab === "overview" ? "Overview" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Active shops" value={activeShops} color="green" />
              <StatCard label="Expiring soon" value={expiringSoonCount} color="amber" />
              <StatCard label="Expired" value={expiredCount} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Shop status" subtitle="Active vs expiring vs expired">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                      {statusData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i]} />))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
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
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Expires</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopsWithStatus.map((shop) => (
                      <tr key={shop.name} className={`border-b border-gray-50 dark:border-white/5 last:border-0 ${shop.isExpired ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}>
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{shop.name}</td>
                        <td className="px-4 py-3">
                          {shop.isExpired ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Expired</span>
                          ) : shop.isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Expiring soon</span>
                          ) : (
                            <StatusBadge status="delivered" label="Active" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 capitalize">{shop.plan}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
                          {shop.expiresAt ? (
                            <span className={shop.isExpired ? "text-red-500 dark:text-red-400 font-medium" : shop.isExpiringSoon ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
                              {formatDate(shop.expiresAt)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{shop.revenue > 0 ? formatKES(shop.revenue) : "—"}</span>
                            {shop.isExpired && (
                              <button onClick={() => setRenewingShop(shop)} className="flex items-center gap-1 text-[11px] font-medium bg-amber-600 text-white rounded-lg px-2.5 py-1.5 hover:bg-amber-500 transition-colors">
                                <IoReload size={11} /> Renew
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-gray-50 dark:divide-white/5">
                {shopsWithStatus.map((shop) => (
                  <div key={shop.name} className={`px-4 py-3 ${shop.isExpired ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{shop.name}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{shop.revenue > 0 ? formatKES(shop.revenue) : "—"}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {shop.isExpired ? (
                        <span className="text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Expired</span>
                      ) : shop.isExpiringSoon ? (
                        <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Expiring soon</span>
                      ) : (
                        <StatusBadge status="delivered" label="Active" />
                      )}
                      <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">{shop.plan}</span>
                      {shop.expiresAt && (
                        <span className={`text-[11px] ${shop.isExpired ? "text-red-500" : shop.isExpiringSoon ? "text-amber-600" : "text-gray-400"}`}>
                          {shop.isExpired ? "Expired " : "Expires "}{formatDate(shop.expiresAt)}
                        </span>
                      )}
                    </div>
                    {shop.isExpired && (
                      <button onClick={() => setRenewingShop(shop)} className="mt-2 flex items-center gap-1 text-[11px] font-medium bg-amber-600 text-white rounded-lg px-2.5 py-1.5 hover:bg-amber-500 transition-colors">
                        <IoReload size={11} /> Renew
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
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

      <Modal open={!!renewingShop} onClose={() => setRenewingShop(null)} title={`Renew — ${renewingShop?.name || ""}`}>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Select renewal period. The shop will be reactivated and a new expiry date set.</p>
        <div className="grid grid-cols-3 gap-3">
          {[7, 14, 30].map((days) => (
            <button key={days} onClick={() => handleRenew(days)} className="flex flex-col items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl px-4 py-4 transition-colors border border-amber-500/20 hover:border-amber-500/40">
              <span className="text-lg font-bold">{days}</span>
              <span className="text-[11px]">days</span>
            </button>
          ))}
        </div>
        <button onClick={() => handleRenew(30)} className="w-full mt-4 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors">
          Renew 30 days (default)
        </button>
      </Modal>
    </PageLayout>
  );
}
