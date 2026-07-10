import { useState, useEffect } from "react";
import { IoAdd, IoTrashOutline, IoClose, IoDownloadOutline } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import IncomeForm from "../components/forms/IncomeForm";
import { useData } from "../context/DataContext";
import { useToast } from "cite-ui";
import { monthlyComparison, monthlyRevenue, revenueByServiceType } from "../data/mock";

function formatKES(amount) {
  return `KES ${amount.toLocaleString()}`;
}

const CHART_COLORS = ["#d97706", "#f59e0b", "#10b981", "#ef4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-gray-800 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {formatKES(p.value)}</p>
      ))}
    </div>
  );
};

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function exportToCSV(data, filename) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map((row) => headers.map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const expenseCategories = ["Hosting", "Domains", "Utilities", "Software", "Contractors"];

export default function Finances() {
  const navigate = useNavigate();
  const { income, expenses, clients, addIncome, deleteIncome, addExpense, deleteExpense, invoices, updateInvoice } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const actionAdd = searchParams.get("action") === "add";
  const clientFilter = searchParams.get("client");
  const filterMonth = searchParams.get("month");

  const [modalOpen, setModalOpen] = useState(actionAdd);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("income");
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteExpense, setConfirmDeleteExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", category: "Hosting", date: "", paymentMethod: "M-Pesa" });

  useEffect(() => {
    if (actionAdd) {
      navigate("/finances", { replace: true });
    }
  }, []);

  const thisMonthIncome = income.filter((i) => i.date.startsWith("2026-06")).reduce((s, i) => s + i.amount, 0);
  const lastMonthIncome = income.filter((i) => i.date.startsWith("2026-05")).reduce((s, i) => s + i.amount, 0);
  const thisMonthExpenses = expenses.filter((e) => e.date.startsWith("2026-06")).reduce((s, e) => s + e.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : 0;

  const thisMonthOutstanding = monthlyComparison.find((m) => m.month === "Jun")?.outstanding || 0;
  const change = lastMonthIncome ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(0) : 0;
  const unpaidClients = clients.filter((c) => c.invoiceStatus !== "paid");
  const clientOptions = clients.map((c) => c.name);

  const cumulativeData = monthlyRevenue.reduce((acc, curr) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({ month: curr.month, cumulative: prev + curr.revenue });
    return acc;
  }, []);

  const filteredIncome = income.filter((entry) => {
    if (clientFilter && entry.clientName !== clientFilter) return false;
    if (filterMonth) {
      const monthNum = MONTHS.indexOf(filterMonth);
      if (monthNum > 0 && !entry.date.startsWith(`2026-${String(monthNum).padStart(2, "0")}`)) return false;
    }
    return true;
  });

  const expensesByCategory = expenseCategories.map((cat) => ({
    category: cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }));

  const handleSave = (data) => { addIncome(data); setModalOpen(false); toast.success("Income added"); };
  const confirmDeleteHandler = (id, desc) => { setConfirmDelete({ id, desc }); };
  const confirmDeleteExpenseHandler = (id, desc) => { setConfirmDeleteExpense({ id, desc }); };
  const clearFilters = () => setSearchParams({});

  const handleAddExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) return;
    addExpense({ ...expenseForm, amount: Number(expenseForm.amount) });
    setExpenseForm({ description: "", amount: "", category: "Hosting", date: "", paymentMethod: "M-Pesa" });
    setExpenseModalOpen(false);
    toast.success("Expense added");
  };

  return (
    <PageLayout title="Finances">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-1 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-lg p-0.5 shadow-sm w-fit">
          {["income", "expenses", "invoices", "overview"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-xs rounded-md transition-all ${activeTab === tab ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium" : "text-gray-400 dark:text-slate-500 hover:text-gray-600"}`}>
              {tab === "overview" ? "Profit" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total income" value={formatKES(totalIncome)} color="green" />
              <StatCard label="Total expenses" value={formatKES(totalExpenses)} color="red" />
              <StatCard label="Net profit" value={formatKES(profit)} color={profit >= 0 ? "green" : "red"} />
              <StatCard label="Profit margin" value={`${profitMargin}%`} color="blue" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Revenue by service type" subtitle="Income breakdown">
                <ResponsiveContainer width="100%" height={220}>
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
              <ChartCard title="Expenses by category" subtitle="Where money goes">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={expensesByCategory} barSize={36} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" fill="#ef4444" radius={[0, 6, 6, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </>
        )}

        {activeTab === "income" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 dark:text-slate-500">{income.length} entries {(clientFilter || filterMonth) ? ` · filtered` : ""}</p>
              <div className="flex items-center gap-2">
                {(clientFilter || filterMonth) && <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"><IoClose size={12} /> Clear</button>}
                <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors"><IoAdd /> Add income</button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="This month" value={formatKES(thisMonthIncome)} trend={Number(change)} trendLabel="vs last month" color="green" linkTo="/analytics" timeline={monthlyRevenue.map((m) => ({ label: m.month, value: m.revenue }))} />
              <StatCard label="Last month" value={formatKES(lastMonthIncome)} trendLabel="May 2026" color="blue" />
              <StatCard label="Outstanding" value={formatKES(thisMonthOutstanding)} trendLabel={`${unpaidClients.length} client${unpaidClients.length !== 1 ? "s" : ""} owe`} color="red" />
              <StatCard label="Collected %" value={`${thisMonthIncome > 0 ? ((thisMonthIncome - thisMonthOutstanding) / thisMonthIncome * 100).toFixed(0) : 0}%`} trendLabel="This month" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Monthly income" subtitle="Collected vs outstanding">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyComparison}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="collected" fill="#d97706" radius={[4, 4, 0, 0]} name="Collected" />
                    <Bar dataKey="outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Outstanding" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Cumulative revenue" subtitle="Running total">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={cumulativeData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="cumulative" stroke="#d97706" strokeWidth={2.5} dot={{ fill: "#d97706", r: 3 }} activeDot={{ r: 5 }} name="Total" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Income ledger">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 dark:text-slate-500">{filteredIncome.length} entries</p>
                <button onClick={() => { exportToCSV(filteredIncome, "income.csv"); toast.success("CSV exported"); }} className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"><IoDownloadOutline size={12} /> CSV</button>
              </div>
              {filteredIncome.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No entries match this filter.</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {filteredIncome.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2.5 group">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{entry.clientName}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{entry.description} · {entry.paymentMethod}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatKES(entry.amount)}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{entry.date}</p>
                        </div>
                        <button onClick={() => confirmDeleteHandler(entry.id, entry.description)} className="max-md:opacity-100 opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"><IoTrashOutline size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            {unpaidClients.length > 0 && !filterMonth && !clientFilter && (
              <ChartCard title="Outstanding payments">
                <div className="space-y-2">
                  {unpaidClients.map((client) => {
                    const paid = income.filter((i) => i.clientName === client.name).reduce((s, i) => s + i.amount, 0);
                    const owing = client.projectValue - paid;
                    return (
                      <div key={client.id} className="flex items-center justify-between py-1.5">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{client.name}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{client.invoiceStatus === "pending" ? "Not yet paid" : "Partially paid"}</p>
                        </div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatKES(owing)}</p>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>
            )}
          </>
        )}

        {activeTab === "expenses" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 dark:text-slate-500">{expenses.length} entries · {formatKES(totalExpenses)} total</p>
              <button onClick={() => setExpenseModalOpen(true)} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors"><IoAdd /> Add expense</button>
            </div>

            <ChartCard title="Expense log">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 dark:text-slate-500">{expenses.length} entries</p>
                <button onClick={() => { exportToCSV(expenses, "expenses.csv"); toast.success("CSV exported"); }} className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"><IoDownloadOutline size={12} /> CSV</button>
              </div>
              {expenses.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No expenses recorded.</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {expenses.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2.5 group">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{entry.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                          <span>{entry.category}</span>
                          <span>·</span>
                          <span>{entry.paymentMethod}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatKES(entry.amount)}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{entry.date}</p>
                        </div>
                        <button onClick={() => confirmDeleteExpenseHandler(entry.id, entry.description)} className="max-md:opacity-100 opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"><IoTrashOutline size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </>
        )}

        {activeTab === "invoices" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 dark:text-slate-500">{invoices.length} invoices · {formatKES(invoices.reduce((s, i) => s + i.amount, 0))} total</p>
              <button onClick={() => {
                const name = prompt("Client name:", "");
                if (!name) return;
                const amount = prompt("Amount (KES):", "");
                if (!amount) return;
                const desc = prompt("Description:", "");
                addInvoice({ clientName: name, amount: Number(amount), status: "draft", issued: new Date().toISOString().slice(0, 10), due: "", paidAt: null, description: desc || "" });
                toast.success("Invoice created");
              }} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors"><IoAdd /> Create invoice</button>
            </div>
            <ChartCard title="All invoices">
              {invoices.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No invoices yet.</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 group">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{inv.clientName}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{inv.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${inv.status === "paid" ? "bg-green-500/10 text-green-600 dark:text-green-400" : inv.status === "partial" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : inv.status === "sent" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-gray-500/10 text-gray-600 dark:text-gray-400"}`}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                          {inv.due && <span className="text-[10px] text-gray-400 dark:text-slate-500">Due: {inv.due}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatKES(inv.amount)}</p>
                          {inv.paidAt && <p className="text-xs text-green-500">Paid {inv.paidAt}</p>}
                        </div>
                        <select
                          value={inv.status}
                          onChange={(e) => { updateInvoice(inv.id, { status: e.target.value, paidAt: e.target.value === "paid" ? new Date().toISOString().slice(0, 10) : inv.paidAt }); toast.success(`Invoice marked as ${e.target.value}`); }}
                          className="text-[11px] border border-gray-200 dark:border-white/10 rounded px-1.5 py-1 bg-white dark:bg-[#0f172a] text-gray-700 dark:text-slate-300 focus:outline-none focus:border-amber-400"
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add income">
        <IncomeForm clientOptions={clientOptions} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add expense">
        <div className="space-y-3">
          <input type="text" placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))} className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" />
          <input type="number" placeholder="Amount (KES)" value={expenseForm.amount} onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))} className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" />
          <select value={expenseForm.category} onChange={(e) => setExpenseForm((p) => ({ ...p, category: e.target.value }))} className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-700 dark:text-slate-300 focus:outline-none focus:border-amber-400">
            {expenseCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
          <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))} className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white focus:outline-none focus:border-amber-400" />
          <select value={expenseForm.paymentMethod} onChange={(e) => setExpenseForm((p) => ({ ...p, paymentMethod: e.target.value }))} className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#0f172a] text-gray-700 dark:text-slate-300 focus:outline-none focus:border-amber-400">
            {["M-Pesa", "Bank", "Cash", "Card"].map((m) => (<option key={m} value={m}>{m}</option>))}
          </select>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setExpenseModalOpen(false)} className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 px-3 py-1.5">Cancel</button>
            <button onClick={handleAddExpense} className="text-xs font-medium bg-amber-600 text-white rounded-lg px-4 py-1.5 hover:bg-amber-500 transition-colors">Save</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteIncome(confirmDelete.id); toast.success("Income deleted"); }}
        title="Delete income entry?"
        message={`Remove "${confirmDelete?.desc}"?`}
        confirmDanger
      />

      <ConfirmDialog
        open={!!confirmDeleteExpense}
        onClose={() => setConfirmDeleteExpense(null)}
        onConfirm={() => { deleteExpense(confirmDeleteExpense.id); toast.success("Expense deleted"); }}
        title="Delete expense?"
        message={`Remove "${confirmDeleteExpense?.desc}"?`}
        confirmDanger
      />
    </PageLayout>
  );
}
