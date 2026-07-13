import { useState, useCallback } from "react";
import { IoAdd, IoCheckmarkCircle, IoEllipseOutline, IoTrashOutline, IoFlag, IoFlagOutline } from "react-icons/io5";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageLayout from "../components/layout/PageLayout";
import ChartCard from "../components/ChartCard";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import FocusItemForm from "../components/forms/FocusItemForm";
import { useData } from "../context/DataContext";
import { useToast } from "cite-ui";
import { weeklyCompletion } from "../data/mock";

const CHART_COLORS = ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d"];

const priorityColors = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-gray-400",
};

const priorityLabels = { high: "High", medium: "Medium", low: "Low" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      {payload.map((p, i) => (<p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>))}
    </div>
  );
};

const todayStr = new Date().toISOString().slice(0, 10);

export default function Focus() {
  const { focusItems, clients, addFocusItem, updateFocusItem, toggleFocusItem, deleteFocusItem, reorderFocusItems, tasksByProject } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dragItemId, setDragItemId] = useState(null);

  const projectOptions = [...new Set(clients.map((c) => c.name))];

  const sortTasks = (items) => {
    const sorted = [...items];
    if (sortBy === "priority") sorted.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] || 1) - ({ high: 0, medium: 1, low: 2 }[b.priority] || 1));
    if (sortBy === "priority_desc") sorted.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[b.priority] || 1) - ({ high: 0, medium: 1, low: 2 }[a.priority] || 1));
    if (sortBy === "due_date") sorted.sort((a, b) => new Date(a.dueDate || "9999") - new Date(b.dueDate || "9999"));
    if (sortBy === "name") sorted.sort((a, b) => (a.content || "").localeCompare(b.content || ""));
    return sorted;
  };

  const filtered = focusItems.filter((i) => {
    if (projectFilter && i.project !== projectFilter) return false;
    if (statusFilter === "todo" && i.status !== "todo") return false;
    if (statusFilter === "in_progress" && i.status !== "in_progress") return false;
    if (statusFilter === "done" && i.status !== "done") return false;
    if (priorityFilter !== "all" && i.priority !== priorityFilter) return false;
    return true;
  });

  const todo = sortTasks(focusItems.filter((i) => i.status === "todo" && (!projectFilter || i.project === projectFilter) && (priorityFilter === "all" || i.priority === priorityFilter)));
  const inProgress = sortTasks(focusItems.filter((i) => i.status === "in_progress" && (!projectFilter || i.project === projectFilter) && (priorityFilter === "all" || i.priority === priorityFilter)));
  const done = sortTasks(focusItems.filter((i) => i.status === "done" && (!projectFilter || i.project === projectFilter) && (priorityFilter === "all" || i.priority === priorityFilter)));

  const handleSave = (data) => {
    addFocusItem({ ...data, priority: data.priority || "medium" });
    setModalOpen(false);
    toast.success("Task added");
  };

  const confirmDeleteHandler = (id, content) => {
    setConfirmDelete({ id, content });
  };

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const handleDragStart = (id) => setDragItemId(id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = useCallback((targetStatus) => {
    if (dragItemId) {
      updateFocusItem(dragItemId, { status: targetStatus });
      setDragItemId(null);
    }
  }, [dragItemId, updateFocusItem]);

  const renderTaskCard = (item) => {
    const daysLeft = getDaysLeft(item.dueDate);
    return (
      <div
        key={item.id}
        draggable
        onDragStart={() => handleDragStart(item.id)}
        className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-amber-200 dark:hover:border-amber-500/30 transition-all group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <button onClick={() => toggleFocusItem(item.id)} className="mt-0.5 flex-shrink-0">
              {item.completed ? (
                <IoCheckmarkCircle className="text-green-500" size={16} />
              ) : (
                <IoEllipseOutline className="text-gray-300 dark:text-slate-600 hover:text-amber-500" size={16} />
              )}
            </button>
            <div className="min-w-0">
              <p className={`text-sm ${item.completed ? "text-gray-400 dark:text-slate-500 line-through" : "text-gray-800 dark:text-white"}`}>{item.content}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {item.project && <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded">{item.project}</span>}
                <span className={`text-[10px] flex items-center gap-0.5 ${priorityColors[item.priority] || "text-gray-400"}`}>
                  {item.priority === "high" ? <IoFlag size={10} /> : <IoFlagOutline size={10} />}
                  {priorityLabels[item.priority] || "Medium"}
                </span>
                {item.dueDate && daysLeft !== null && (
                  <span className={`text-[10px] ${daysLeft < 0 ? "text-red-500 font-medium" : daysLeft <= 1 ? "text-red-500" : daysLeft <= 3 ? "text-amber-500" : "text-gray-400 dark:text-slate-500"}`}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => confirmDeleteHandler(item.id, item.content)} className="max-md:opacity-100 opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex-shrink-0" aria-label="Delete"><IoTrashOutline size={13} /></button>
        </div>
      </div>
    );
  };

  return (
    <PageLayout title="Focus Board">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-gray-400 dark:text-slate-500">
            {todo.length + inProgress.length} active · {done.length} done
            {projectFilter && <span> · {projectFilter}</span>}
          </p>
          <div className="flex items-center gap-2">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="text-[11px] border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 bg-white dark:bg-[#0f172a] text-gray-700 dark:text-slate-300 focus:outline-none focus:border-amber-400">
              <option value="all">All priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-[11px] border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 bg-white dark:bg-[#0f172a] text-gray-700 dark:text-slate-300 focus:outline-none focus:border-amber-400">
              <option value="created_at">Newest</option>
              <option value="priority">High first</option>
              <option value="priority_desc">Low first</option>
              <option value="due_date">Due date</option>
              <option value="name">Name</option>
            </select>
            {projectFilter && <button onClick={() => setProjectFilter(null)} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">Clear</button>}
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors"><IoAdd /> Add task</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Weekly completion" subtitle="Completed vs total this week">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyCompletion}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill="#d97706" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Tasks by project" subtitle="Click slice to filter">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={tasksByProject} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" paddingAngle={2} onClick={(entry) => setProjectFilter(entry.project)} style={{ cursor: "pointer" }}>
                  {tasksByProject.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {tasksByProject.map((item, i) => (
                <button key={item.project} onClick={() => setProjectFilter(item.project)} className={`flex items-center gap-1.5 text-xs hover:opacity-75 transition-opacity ${projectFilter === item.project ? "opacity-100" : "opacity-60"}`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-gray-500 dark:text-slate-400">{item.project}: {item.count}</span>
                </button>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: "todo", label: "To Do", color: "border-t-gray-400" },
            { key: "in_progress", label: "In Progress", color: "border-t-amber-500" },
            { key: "done", label: "Done", color: "border-t-green-500" },
          ].map((col) => {
            const items = col.key === "todo" ? todo : col.key === "in_progress" ? inProgress : done;
            return (
              <div
                key={col.key}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.key)}
                className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm border-t-4 overflow-hidden"
                style={{ borderTopColor: col.key === "todo" ? "#9ca3af" : col.key === "in_progress" ? "#d97706" : "#22c55e" }}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{col.label}</h3>
                  <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="p-3 space-y-2 min-h-[200px]">
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-xs text-gray-400 dark:text-slate-500 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl">
                      Drop tasks here
                    </div>
                  ) : (
                    items.map(renderTaskCard)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add task">
        <FocusItemForm projectOptions={projectOptions} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteFocusItem(confirmDelete.id); toast.success("Task deleted"); }}
        title="Delete task?"
        message={`Remove "${confirmDelete?.content}"?`}
        confirmDanger
      />
    </PageLayout>
  );
}
