import { useState, useMemo, useEffect } from "react";
import { IoPulseOutline, IoReload, IoAdd, IoTrashOutline, IoCreateOutline } from "react-icons/io5";
import { FiInfo, FiAlertTriangle, FiAlertOctagon, FiTag, FiTool, FiCheck, FiLock } from "react-icons/fi";
import { supabaseKeel } from "../lib/supabaseKeel";

const announcementVariants = [
  { key: "info", icon: FiInfo, color: "bg-blue-500", border: "border-l-blue-500", label: "Info" },
  { key: "warning", icon: FiAlertTriangle, color: "bg-amber-500", border: "border-l-amber-500", label: "Warning" },
  { key: "alert", icon: FiAlertOctagon, color: "bg-red-500", border: "border-l-red-500", label: "Alert" },
  { key: "sale", icon: FiTag, color: "bg-green-500", border: "border-l-green-500", label: "Sale" },
  { key: "maintenance", icon: FiTool, color: "bg-slate-500", border: "border-l-slate-500", label: "Maintenance" },
];
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useData } from "../context/DataContext";
import { useToast } from "cite-ui";


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
  const { keelShops, keelActivityLog, announcements, renewShop, deleteShop, lockShop, setShopPlan, addAnnouncement, updateAnnouncement, deleteAnnouncement, revenueByPlan } = useData();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announceForm, setAnnounceForm] = useState({ title: "", message: "", link_url: "", bg_image_url: "", variant: "info", priority: 0, starts_at: "", expires_at: "", no_expiry: true, link_text: "Learn More" });
  const [renewingShop, setRenewingShop] = useState(null);
  const [planStatus, setPlanStatus] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLock, setConfirmLock] = useState(null);
  const { toast } = useToast();
  const [dismissalCounts, setDismissalCounts] = useState({});

  useEffect(() => {
    (async () => {
      const { data } = await supabaseKeel.from("chat_config").select("shop_id, pro_until, groq_api_key, plan_tier");
      if (data) {
        const map = {};
        data.forEach((c) => { map[c.shop_id] = { proUntil: c.pro_until, groqApiKey: c.groq_api_key, planTier: c.plan_tier || "free" }; });
        setPlanStatus(map);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!announcements.length) { if (!cancelled) setDismissalCounts({}); return; }
      const { data } = await supabaseKeel
        .from("announcement_dismissals")
        .select("announcement_id")
        .in("announcement_id", announcements.map((a) => a.id));
      const counts = {};
      (data || []).forEach((d) => { counts[d.announcement_id] = (counts[d.announcement_id] || 0) + 1; });
      if (!cancelled) setDismissalCounts(counts);
    })();
    return () => { cancelled = true; };
  }, [announcements]);

  const [now] = useState(() => Date.now());
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const shopsWithStatus = useMemo(() => keelShops.map((s) => {
    const expiresAt = s.subscriptionExpiresAt ? new Date(s.subscriptionExpiresAt).getTime() : null;
    const isExpired = s.status === "expired" || (expiresAt && expiresAt < now);
    const isExpiringSoon = !isExpired && expiresAt && expiresAt < now + sevenDays;
    return { ...s, expiresAt, isExpired, isExpiringSoon };
  }), [keelShops, now, sevenDays]);

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
    toast.success(`Subscription renewed for ${days} days`);
  }

  const announcementsWithStatus = useMemo(() => announcements.map((a) => {
    const startsTs = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const expiresTs = a.expiresAt ? new Date(a.expiresAt).getTime() : null;
    const isActive = a.active !== false && startsTs <= now && (!expiresTs || expiresTs > now);
    return { ...a, isActive };
  }), [announcements, now]);

  return (
    <PageLayout title="Keel Pulse">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-1 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-lg p-0.5 shadow-sm w-fit">
          {["overview", "activity", "announcements"].map((tab) => (
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

            <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl overflow-x-auto shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">All shops</h3>
              </div>
              <div className="hidden md:block min-w-[640px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Shop</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Tier</th>
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
                        <td className="px-4 py-3">
                          <select
                            value={planStatus[shop.id]?.planTier || shop.plan || "free"}
                            onChange={(e) => { setShopPlan(shop.id, e.target.value); setPlanStatus((prev) => ({ ...prev, [shop.id]: { ...prev[shop.id], planTier: e.target.value } })); }}
                            className="text-xs bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-gray-600 dark:text-slate-400 focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="beta">Beta</option>
                            <option value="pro">Pro</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
                          {shop.expiresAt ? (
                            <span className={shop.isExpired ? "text-red-500 dark:text-red-400 font-medium" : shop.isExpiringSoon ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
                              {formatDate(shop.expiresAt)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{shop.revenue > 0 ? formatKES(shop.revenue) : "—"}</span>
                            {shop.isExpired && (
                              <button onClick={() => setRenewingShop(shop)} className="flex items-center gap-1 text-[11px] font-medium bg-amber-600 text-white rounded-lg px-2.5 py-1.5 hover:bg-amber-500 transition-colors">
                                <IoReload size={11} /> Renew
                              </button>
                            )}
                            {!shop.isExpired && (
                              <button onClick={() => setConfirmLock({ id: shop.id, name: shop.name })} className="p-1.5 text-gray-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all" title="Lock shop">
                                <FiLock size={13} />
                              </button>
                            )}
                            <button onClick={() => setConfirmDelete({ id: shop.id, name: shop.name })} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" title="Delete shop">
                              <IoTrashOutline size={13} />
                            </button>
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
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{shop.revenue > 0 ? formatKES(shop.revenue) : "—"}</p>
                        {!shop.isExpired && (
                          <button onClick={() => setConfirmLock({ id: shop.id, name: shop.name })} className="p-1 text-gray-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all" title="Lock shop">
                            <FiLock size={12} />
                          </button>
                        )}
                        <button onClick={() => setConfirmDelete({ id: shop.id, name: shop.name })} className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" title="Delete shop">
                          <IoTrashOutline size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {shop.isExpired ? (
                        <span className="text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Expired</span>
                      ) : shop.isExpiringSoon ? (
                        <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Expiring soon</span>
                      ) : (
                        <StatusBadge status="delivered" label="Active" />
                      )}
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        (planStatus[shop.id]?.planTier || shop.plan) === "pro" ? "text-purple-600 dark:text-purple-400 bg-purple-500/10" :
                        (planStatus[shop.id]?.planTier || shop.plan) === "beta" ? "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10" :
                        (planStatus[shop.id]?.planTier || shop.plan) === "starter" ? "text-blue-600 dark:text-blue-400 bg-blue-500/10" :
                        "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/5"
                      }`}>{planStatus[shop.id]?.planTier || shop.plan || "free"}</span>
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

      {activeTab === "announcements" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 dark:text-slate-500">{announcements.length} announcements</p>
            <button onClick={() => { setAnnounceForm({ title: "", message: "", link_url: "", bg_image_url: "", variant: "info", priority: 0, starts_at: new Date().toISOString().slice(0, 16), expires_at: "", no_expiry: true, link_text: "Learn More" }); setShowCreateModal(true); }} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors">
              <IoAdd size={13} /> New announcement
            </button>
          </div>
          <div className="space-y-2">
            {announcementsWithStatus.map((a) => {
              const v = announcementVariants.find((x) => x.key === a.variant) || announcementVariants[0];
              const VIcon = v.icon;
              return (
                <div key={a.id} className={`bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-xl shadow-sm ${v.border} border-l-2`}>
                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg ${v.color} bg-opacity-15 dark:bg-opacity-25 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <VIcon size={14} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">{a.title}</p>
                          {a.isActive ? (
                            <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">Active</span>
                          ) : (
                            <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">Inactive</span>
                          )}
                        </div>
                        {a.message && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{a.message}</p>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px]">
                          {a.priority > 0 && (
                            <span className="text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">P{a.priority}</span>
                          )}
                          {a.startsAt && (
                            <span className="text-gray-400 dark:text-slate-500">
                              {new Date(a.startsAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                              {a.expiresAt ? ` → ${new Date(a.expiresAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}` : " → ∞"}
                            </span>
                          )}
                          {dismissalCounts[a.id] > 0 && (
                            <span className="text-amber-600 dark:text-amber-400">{dismissalCounts[a.id]} dismissed</span>
                          )}
                          {a.linkUrl && (
                            <span className="text-amber-600 dark:text-amber-400">{a.linkText || "Learn More"} ↗</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => {
                        const s = a.startsAt ? new Date(a.startsAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
                        const e = a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 16) : "";
                        setEditingAnnouncement(a);
                        setAnnounceForm({
                          title: a.title, message: a.message || "", link_url: a.linkUrl || "", bg_image_url: a.bgImageUrl || "",
                          variant: a.variant || "info", priority: a.priority || 0, starts_at: s, expires_at: e,
                          no_expiry: !a.expiresAt, link_text: a.linkText || "Learn More",
                        });
                      }} className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors" title="Edit">
                        <IoCreateOutline size={14} />
                      </button>
                      <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <IoTrashOutline size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {announcements.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <FiInfo size={20} className="text-gray-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No announcements yet</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Create one to show a banner on all Keel dashboards.</p>
              </div>
            )}
          </div>
        </>
      )}

      <Modal open={showCreateModal || !!editingAnnouncement} onClose={() => { setShowCreateModal(false); setEditingAnnouncement(null); }}>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-5">{editingAnnouncement ? "Edit announcement" : "New announcement"}</h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-2">Variant</label>
            <div className="grid grid-cols-5 gap-2">
              {announcementVariants.map((v) => {
                const VIcon = v.icon;
                const selected = announceForm.variant === v.key;
                return (
                  <button key={v.key} onClick={() => setAnnounceForm((p) => ({ ...p, variant: v.key }))} className={`relative flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${selected ? "border-gray-400 dark:border-white/30 bg-gray-50 dark:bg-white/5 shadow-sm" : "border-transparent text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-white/5"}`}>
                    <div className={`w-8 h-8 rounded-lg ${v.color} flex items-center justify-center ${selected ? "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-[#0f172a] ring-gray-400 dark:ring-white/30" : ""}`}>
                      <VIcon size={14} className="text-white" />
                    </div>
                    <span className="text-[10px] font-medium">{v.label}</span>
                    {selected && <FiCheck size={10} className="text-amber-500 absolute top-1 right-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/10 pt-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-3">Content</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1">Title</label>
                <input value={announceForm.title} onChange={(e) => setAnnounceForm((p) => ({ ...p, title: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white outline-0 focus:border-amber-500/50 transition-colors" placeholder="Announcement title" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1">Message</label>
                <textarea value={announceForm.message} onChange={(e) => setAnnounceForm((p) => ({ ...p, message: e.target.value }))} rows={2} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white outline-0 focus:border-amber-500/50 transition-colors resize-none" placeholder="Announcement message" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/10 pt-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-3">Scheduling</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1">Starts at</label>
                <input type="datetime-local" value={announceForm.starts_at} onChange={(e) => setAnnounceForm((p) => ({ ...p, starts_at: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white outline-0 focus:border-amber-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1">Expires at</label>
                <input type="datetime-local" value={announceForm.expires_at} disabled={announceForm.no_expiry} onChange={(e) => setAnnounceForm((p) => ({ ...p, expires_at: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white outline-0 focus:border-amber-500/50 transition-colors disabled:opacity-40" />
                <label className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-slate-500 cursor-pointer mt-1.5 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                  <input type="checkbox" checked={announceForm.no_expiry} onChange={(e) => setAnnounceForm((p) => ({ ...p, no_expiry: e.target.checked, expires_at: e.target.checked ? "" : p.expires_at }))} className="accent-amber-600" />
                  Never expires
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/10 pt-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-3">Links</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1">Button text</label>
                <input value={announceForm.link_text} onChange={(e) => setAnnounceForm((p) => ({ ...p, link_text: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white outline-0 focus:border-amber-500/50 transition-colors" placeholder="Learn More" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1">Priority</label>
                <input type="number" min="0" value={announceForm.priority} onChange={(e) => setAnnounceForm((p) => ({ ...p, priority: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white outline-0 focus:border-amber-500/50 transition-colors" />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1">Link URL (optional)</label>
              <input value={announceForm.link_url} onChange={(e) => setAnnounceForm((p) => ({ ...p, link_url: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white outline-0 focus:border-amber-500/50 transition-colors" placeholder="https://" />
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1">Background image URL (optional)</label>
              <input value={announceForm.bg_image_url} onChange={(e) => setAnnounceForm((p) => ({ ...p, bg_image_url: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white outline-0 focus:border-amber-500/50 transition-colors" placeholder="https://images.unsplash.com/..." />
            </div>
          </div>

          {announceForm.title && (
            <div className="border-t border-gray-100 dark:border-white/10 pt-4">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-3">Preview</p>
              <div className="relative h-32 rounded-xl overflow-hidden bg-cover bg-center border border-gray-200 dark:border-white/10" style={{
                backgroundImage: announceForm.bg_image_url ? `url(${announceForm.bg_image_url})` : 
                  announceForm.variant === "warning" ? "linear-gradient(135deg, #92400e 0%, #d97706 100%)" :
                  announceForm.variant === "alert" ? "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)" :
                  announceForm.variant === "sale" ? "linear-gradient(135deg, #14532d 0%, #16a34a 100%)" :
                  announceForm.variant === "maintenance" ? "linear-gradient(135deg, #1e293b 0%, #475569 100%)" :
                  "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
              }}>
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col justify-center px-5">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                      {announceForm.variant === "warning" ? <FiAlertTriangle size={13} className="text-white" /> :
                       announceForm.variant === "alert" ? <FiAlertOctagon size={13} className="text-white" /> :
                       announceForm.variant === "sale" ? <FiTag size={13} className="text-white" /> :
                       announceForm.variant === "maintenance" ? <FiTool size={13} className="text-white" /> :
                       <FiInfo size={13} className="text-white" />}
                    </div>
                    <h4 className="text-white font-bold text-sm">{announceForm.title}</h4>
                  </div>
                  {announceForm.message && (
                    <p className="text-white/70 text-xs max-w-lg leading-relaxed line-clamp-1 pl-9">{announceForm.message}</p>
                  )}
                  {announceForm.link_url && (
                    <span className="mt-2 pl-9 inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded w-fit">
                      {announceForm.link_text || "Learn More"} ↗
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
          <button onClick={() => { setShowCreateModal(false); setEditingAnnouncement(null); }} className="text-xs font-medium text-gray-500 dark:text-slate-400 px-3 py-1.5 hover:text-gray-700 dark:hover:text-white transition-colors">Cancel</button>
          <button onClick={async () => {
            try {
              const payload = {
                title: announceForm.title,
                message: announceForm.message || null,
                link_url: announceForm.link_url || null,
                bg_image_url: announceForm.bg_image_url || null,
                variant: announceForm.variant,
                priority: announceForm.priority,
                starts_at: new Date(announceForm.starts_at).toISOString(),
                expires_at: announceForm.no_expiry ? null : (announceForm.expires_at ? new Date(announceForm.expires_at).toISOString() : null),
                link_text: announceForm.link_text || "Learn More",
              };
              if (editingAnnouncement) {
                await updateAnnouncement(editingAnnouncement.id, payload);
                toast.success("Announcement updated");
              } else {
                await addAnnouncement(payload);
                toast.success("Announcement created");
              }
              setShowCreateModal(false);
              setEditingAnnouncement(null);
            } catch (err) { toast.error(err.message); }
          }} className="text-xs font-medium bg-amber-600 text-white rounded-lg px-4 py-1.5 hover:bg-amber-500 transition-colors">
            {editingAnnouncement ? "Save changes" : "Create announcement"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteShop(confirmDelete.id); toast.success("Shop deleted"); }}
        title="Delete shop?"
        message={`Remove "${confirmDelete?.name}" and all associated data permanently?`}
        confirmDanger
      />
      <ConfirmDialog
        open={!!confirmLock}
        onClose={() => setConfirmLock(null)}
        onConfirm={() => { lockShop(confirmLock.id); toast.success("Shop locked"); }}
        title="Lock shop?"
        message={`Expire subscription for "${confirmLock?.name}"? They'll see a lockout screen until renewed.`}
        confirmDanger
      />
    </PageLayout>
  );
}
