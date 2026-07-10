import { useState, useEffect } from "react";
import { IoAdd, IoTrashOutline, IoCreateOutline, IoChevronDown, IoChevronUp, IoCheckmarkCircle, IoEllipseOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { FiExternalLink, FiGitBranch } from "react-icons/fi";
import { SiVercel, SiSupabase } from "react-icons/si";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageLayout from "../components/layout/PageLayout";
import ChartCard from "../components/ChartCard";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ClientForm from "../components/forms/ClientForm";
import { useData } from "../context/DataContext";
import { useToast } from "cite-ui";
import { revenueByClient, invoiceStatusDistribution } from "../data/mock";

function formatKES(amount) {
  return `KES ${(amount || 0).toLocaleString()}`;
}

const CHART_COLORS = ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.name === "Revenue" ? formatKES(p.value) : p.value}</p>
      ))}
    </div>
  );
};

const stages = [
  { key: "discovery", label: "Discovery", icon: "🔍" },
  { key: "design", label: "Design", icon: "🎨" },
  { key: "development", label: "Development", icon: "⚙️" },
  { key: "review", label: "Review", icon: "✅" },
  { key: "delivered", label: "Delivered", icon: "🚀" },
];

const stageOrder = ["discovery", "design", "development", "review", "delivered"];

export default function Clients() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clients, invoices, income, addClient, updateClient, deleteClient, updateInvoice } = useData();
  const actionAdd = searchParams.get("action") === "add";
  const nameFilter = searchParams.get("name");
  const statusFilter = searchParams.get("status");
  const stageFilter = searchParams.get("stage");

  const [modalOpen, setModalOpen] = useState(actionAdd);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notesInput, setNotesInput] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (actionAdd) {
      navigate("/clients", { replace: true });
    }
  }, []);

  const filtered = clients.filter((c) => {
    if (nameFilter && !c.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (statusFilter && c.projectStatus !== statusFilter) return false;
    if (stageFilter && c.stage !== stageFilter) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.business.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (client) => { setEditing(client); setModalOpen(true); };
  const closeModal = () => { setEditing(null); setModalOpen(false); };

  const handleSave = (data) => {
    if (editing) {
      updateClient(editing.id, data);
      toast.success("Client updated");
    } else {
      addClient(data);
      toast.success("Client added");
    }
    closeModal();
  };

  const confirmDeleteHandler = (id, name) => {
    setConfirmDelete({ id, name });
  };

  const updateStage = (clientId, stage) => {
    updateClient(clientId, { stage });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const saveNote = (clientId) => {
    const note = notesInput[clientId]?.trim();
    if (!note) return;
    const client = clients.find((c) => c.id === clientId);
    const existing = client.notes || "";
    updateClient(clientId, { notes: existing ? `${existing}\n${note}` : note });
    setNotesInput((prev) => ({ ...prev, [clientId]: "" }));
  };

  const clientInvoices = (clientName) => invoices.filter((i) => i.clientName === clientName);
  const clientIncome = (clientName) => income.filter((i) => i.clientName === clientName);
  const clientTotalPaid = (clientName) => clientIncome(clientName).reduce((s, i) => s + i.amount, 0);

  return (
    <PageLayout title="Clients">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xs text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
            />
            <div className="hidden md:flex items-center gap-1 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-lg p-0.5">
              {["all", "planning", "building", "delivered"].map((s) => (
                <button key={s} onClick={() => setSearchParams(s === "all" ? {} : { status: s })} className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${(statusFilter === s || (!statusFilter && s === "all")) ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium" : "text-gray-400 dark:text-slate-500 hover:text-gray-600"}`}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors"><IoAdd /> Add client</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Revenue by client" subtitle="Total income per client">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByClient} barSize={36} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#d97706" radius={[0, 6, 6, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Invoice status" subtitle="Paid / Partial / Pending / Draft">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={invoiceStatusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" paddingAngle={2}>
                  {invoiceStatusDistribution.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {invoiceStatusDistribution.map((item, i) => (
                <div key={item.status} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-gray-500 dark:text-slate-400">{item.status}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No clients match this filter.</p>
          )}
          {filtered.map((client) => {
            const isExpanded = expandedId === client.id;
            const cinvoices = clientInvoices(client.name);
            const cincome = clientIncome(client.name);
            const totalPaid = cincome.reduce((s, i) => s + i.amount, 0);
            const owing = client.projectValue - totalPaid;
            const currentStageIdx = stageOrder.indexOf(client.stage || "discovery");

            return (
              <div key={client.id} className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm flex-shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{client.business}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <StatusBadge status={client.projectStatus} />
                          <StatusBadge status={client.invoiceStatus} />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 flex-1">
                            {stages.map((s, i) => (
                              <div key={s.key} className={`h-1.5 flex-1 rounded-full transition-all ${currentStageIdx >= i ? "bg-amber-500" : "bg-gray-200 dark:bg-white/10"} ${currentStageIdx === i ? "ring-1 ring-amber-500/50" : ""}`} title={s.label} />
                            ))}
                          </div>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex-shrink-0">{stages[currentStageIdx]?.label || "Discovery"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(client)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all" aria-label="Edit"><IoCreateOutline size={14} /></button>
                      <button onClick={() => confirmDeleteHandler(client.id, client.name)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" aria-label="Delete"><IoTrashOutline size={14} /></button>
                      <button onClick={() => toggleExpand(client.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all" aria-label="Expand">
                        {isExpanded ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {client.whatsapp && <a href={client.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"><FaWhatsapp size={12} /> WhatsApp</a>}
                    {client.liveUrl && <a href={client.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"><FiExternalLink size={12} /> Site</a>}
                    {client.githubRepo && <a href={client.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"><FiGitBranch size={12} /> Repo</a>}
                    {client.supabaseProject && <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400"><SiSupabase size={12} /> {client.supabaseProject}</span>}
                    {client.vercelDashboard && <a href={client.vercelDashboard} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"><SiVercel size={12} /> Vercel</a>}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-white/5">
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{client.whatWasBuilt}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatKES(client.projectValue)}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-white/10">
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Project Stage</h4>
                        <div className="flex items-center gap-0">
                          {stages.map((s, i) => {
                            const active = currentStageIdx >= i;
                            const isCurrent = currentStageIdx === i;
                            return (
                              <button key={s.key} onClick={() => updateStage(client.id, s.key)} className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 text-center transition-all ${isCurrent ? "bg-amber-500/10 rounded-lg" : ""} hover:bg-gray-50 dark:hover:bg-white/[0.02]`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${active ? "bg-amber-500 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-slate-500"}`}>
                                  {active ? <IoCheckmarkCircle size={16} /> : <IoEllipseOutline size={16} />}
                                </div>
                                <span className={`text-[10px] ${active ? "text-amber-600 dark:text-amber-400 font-medium" : "text-gray-400 dark:text-slate-500"}`}>{s.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Invoices</h4>
                          {cinvoices.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-slate-500">No invoices yet</p>
                          ) : (
                            <div className="space-y-1">
                              {cinvoices.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                                  <div>
                                    <p className="text-xs text-gray-700 dark:text-slate-300">{inv.description}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <StatusBadge status={inv.status} />
                                      <span className="text-[10px] text-gray-400 dark:text-slate-500">Due: {inv.due || "—"}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatKES(inv.amount)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Payment History</h4>
                          {cincome.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-slate-500">No payments recorded</p>
                          ) : (
                            <div className="space-y-1">
                              {cincome.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                                  <div>
                                    <p className="text-xs text-gray-700 dark:text-slate-300">{entry.description}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{entry.date} · {entry.paymentMethod}</p>
                                  </div>
                                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">{formatKES(entry.amount)}</p>
                                </div>
                              ))}
                              {owing > 0 && (
                                <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-red-50 dark:bg-red-500/5">
                                  <p className="text-xs text-red-600 dark:text-red-400">Outstanding</p>
                                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">{formatKES(owing)}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notes</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Add a note..."
                            value={notesInput[client.id] || ""}
                            onChange={(e) => setNotesInput((prev) => ({ ...prev, [client.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && saveNote(client.id)}
                            className="flex-1 text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                          />
                          <button onClick={() => saveNote(client.id)} className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline">Add</button>
                        </div>
                        {client.notes && (
                          <div className="text-sm text-gray-600 dark:text-slate-400 space-y-0.5 max-h-24 overflow-y-auto">
                            {client.notes.split("\n").map((line, i) => (
                              <p key={i} className="py-0.5">{line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit client" : "Add client"}>
        <ClientForm initial={editing} onSave={handleSave} onCancel={closeModal} />
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteClient(confirmDelete.id); toast.success("Client deleted"); }}
        title="Delete client?"
        message={`Remove "${confirmDelete?.name}" and all associated data?`}
        confirmDanger
      />
    </PageLayout>
  );
}
