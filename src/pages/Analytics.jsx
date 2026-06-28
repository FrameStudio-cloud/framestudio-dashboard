import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { monthlyRevenue, allTimeStats, revenueByServiceType, monthOverMonthGrowth, revenueByClient } from "../data/mock";

function formatKES(amount) {
  return `KES ${amount.toLocaleString()}`;
}

const CHART_COLORS = ["#d97706", "#f59e0b", "#10b981", "#6366f1"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-gray-800 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? (p.name.includes("Revenue") || p.name.includes("Value") || p.dataKey === "revenue" || p.dataKey === "cumulative" ? formatKES(p.value) : p.dataKey === "growth" ? `${p.value >= 0 ? "+" : ""}${p.value}%` : p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const { totalRevenue, totalClients, totalProjects, avgProjectValue, clientAcquisition, bestMonth, worstMonth } = allTimeStats;

  const cumulativeRevenue = monthlyRevenue.reduce((acc, curr) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({ month: curr.month, cumulative: prev + curr.revenue });
    return acc;
  }, []);

  return (
    <PageLayout title="Analytics">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="All-time revenue" value={formatKES(totalRevenue)} color="green" linkTo="/finances" />
          <StatCard label="Total clients" value={totalClients} color="blue" linkTo="/clients" />
          <StatCard label="Total projects" value={totalProjects} color="purple" />
          <StatCard label="Avg project value" value={formatKES(avgProjectValue)} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Revenue trend" subtitle="Monthly income all-time">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyRevenue} onClick={() => navigate("/finances")}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2.5} dot={{ fill: "#d97706", r: 3 }} activeDot={{ r: 5 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Client acquisition" subtitle="New clients per month">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={clientAcquisition} barSize={40}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="newClients" fill="#d97706" radius={[6, 6, 0, 0]} name="New clients" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Revenue by service type" subtitle="Web / Bot / Dashboard / SaaS">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={revenueByServiceType} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="revenue" paddingAngle={2}>
                  {revenueByServiceType.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {revenueByServiceType.map((item, i) => (
                <div key={item.type} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-gray-500 dark:text-slate-400">{item.type}: {formatKES(item.revenue)}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Month-over-month growth" subtitle="% change vs previous month">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthOverMonthGrowth} barSize={40}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="growth" radius={[6, 6, 0, 0]} name="Growth" onClick={(entry) => navigate(`/finances?month=${entry.month}`)} style={{ cursor: "pointer" }}>
                  {monthOverMonthGrowth.map((entry, i) => (
                    <Cell key={i} fill={entry.growth >= 0 ? "#22c55e" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Performance summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Best month</p>
              <p className="font-medium text-gray-900 dark:text-white">{bestMonth.month}</p>
              <p className="text-xs text-green-500">{formatKES(bestMonth.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Worst month</p>
              <p className="font-medium text-gray-900 dark:text-white">{worstMonth.month}</p>
              <p className="text-xs text-red-500">{formatKES(worstMonth.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Monthly avg</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatKES(Math.round(totalRevenue / 6))}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Projects/client</p>
              <p className="font-medium text-gray-900 dark:text-white">{(totalProjects / totalClients).toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500">Growth rate</p>
              <p className="font-medium text-gray-900 dark:text-white">+33%</p>
              <p className="text-xs text-green-500">Last 3 months</p>
            </div>
          </div>
        </div>

        <ChartCard title="Revenue by client" subtitle="Click to view client">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueByClient} barSize={40} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#d97706" radius={[0, 6, 6, 0]} name="Revenue" onClick={(entry) => navigate(`/clients?name=${encodeURIComponent(entry.name)}`)} style={{ cursor: "pointer" }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </PageLayout>
  );
}
