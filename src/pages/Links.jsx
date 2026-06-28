import { useState } from "react";
import { FiExternalLink, FiGitBranch, FiCopy } from "react-icons/fi";
import { SiVercel, SiSupabase } from "react-icons/si";
import { IoAdd, IoTrashOutline, IoCreateOutline, IoStar, IoStarOutline, IoSearch } from "react-icons/io5";
import PageLayout from "../components/layout/PageLayout";
import Modal from "../components/Modal";
import LinkForm from "../components/forms/LinkForm";
import { useData } from "../context/DataContext";

const categoryLabels = {
  "client-sites": "Client Sites",
  products: "Products",
  internal: "Internal",
};

const typeIcons = {
  liveUrl: <FiExternalLink size={12} />,
  supabaseProject: <SiSupabase size={12} />,
  vercelDashboard: <SiVercel size={12} />,
  githubRepo: <FiGitBranch size={12} />,
};

export default function Links() {
  const { links, clients, addLink, updateLink, deleteLink } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const clientOptions = clients.map((c) => c.name);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (link) => { setEditing(link); setModalOpen(true); };
  const closeModal = () => { setEditing(null); setModalOpen(false); };

  const handleSave = (data) => {
    if (editing) {
      updateLink(editing.id, data);
    } else {
      addLink(data);
    }
    closeModal();
  };

  const confirmDelete = (id, name) => {
    if (window.confirm(`Delete link for ${name}?`)) deleteLink(id);
  };

  const toggleFavourite = (link) => {
    updateLink(link.id, { favourite: !link.favourite });
  };

  const copyUrl = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const filtered = links.filter((link) => {
    if (categoryFilter !== "all" && link.category !== categoryFilter) return false;
    if (searchQuery && !link.clientName.toLowerCase().includes(searchQuery.toLowerCase()) && !(link.notes || "").toLowerCase().includes(searchQuery.toLowerCase()) && !(link.tags || []).some((t) => t.includes(searchQuery.toLowerCase()))) return false;
    return true;
  }).sort((a, b) => {
    if (a.favourite && !b.favourite) return -1;
    if (!a.favourite && b.favourite) return 1;
    return 0;
  });

  const renderLinkCell = (link, field, icon) => {
    if (!link[field]) return <span className="text-gray-300 dark:text-slate-600">—</span>;
    const url = link[field].startsWith("http") ? link[field] : null;
    const label = field === "liveUrl" ? link.liveUrl : field === "supabaseProject" ? link.supabaseProject : field === "vercelDashboard" ? "Open" : field === "githubRepo" ? "Repo" : link[field];

    return (
      <div className="flex items-center gap-1">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline">
            {icon} {label}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
            {icon} {label}
          </span>
        )}
        {link[field] && typeof link[field] === "string" && !link[field].startsWith("http") && (
          <button onClick={() => copyUrl(link[field], `${link.id}-${field}`)} className="text-gray-300 dark:text-slate-600 hover:text-amber-500 transition-colors">
            <FiCopy size={10} />
          </button>
        )}
      </div>
    );
  };

  return (
    <PageLayout title="Links Hub">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400 dark:text-slate-500">{filtered.length} of {links.length} links</p>
          <button onClick={openAdd} className="flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg px-3 py-1.5 hover:bg-amber-500 transition-colors">
            <IoAdd /> Add link
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-lg p-0.5">
            {[{ key: "all", label: "All" }, { key: "client-sites", label: "Clients" }, { key: "products", label: "Products" }, { key: "internal", label: "Internal" }].map((cat) => (
              <button key={cat.key} onClick={() => setCategoryFilter(cat.key)} className={`px-2.5 py-1 text-[11px] rounded-md transition-all whitespace-nowrap ${categoryFilter === cat.key ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium" : "text-gray-400 dark:text-slate-500 hover:text-gray-600"}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10">
                <th className="w-8 px-2 py-3" />
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Client</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Live URL</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Supabase</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Vercel</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">GitHub</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 dark:text-slate-500">Notes</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => (
                <tr key={link.id} className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-2 py-3">
                    <button onClick={() => toggleFavourite(link)} className={`transition-colors ${link.favourite ? "text-amber-500" : "text-gray-300 dark:text-slate-600 hover:text-amber-400"}`}>
                      {link.favourite ? <IoStar size={14} /> : <IoStarOutline size={14} />}
                    </button>
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-800 dark:text-white">{link.clientName}</td>
                  <td className="px-3 py-3">{renderLinkCell(link, "liveUrl", typeIcons.liveUrl)}</td>
                  <td className="px-3 py-3">{renderLinkCell(link, "supabaseProject", typeIcons.supabaseProject)}</td>
                  <td className="px-3 py-3">{renderLinkCell(link, "vercelDashboard", typeIcons.vercelDashboard)}</td>
                  <td className="px-3 py-3">{renderLinkCell(link, "githubRepo", typeIcons.githubRepo)}</td>
                  <td className="px-3 py-3 text-xs text-gray-400 dark:text-slate-500">
                    <div className="flex items-center gap-1 flex-wrap">
                      {link.notes && <span>{link.notes}</span>}
                      {link.tags?.map((tag) => (
                        <span key={tag} className="text-[10px] bg-gray-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded text-gray-400 dark:text-slate-500">#{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {link.liveUrl && (
                        <button onClick={() => copyUrl(link.liveUrl, `copy-${link.id}`)} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all" title="Copy URL">
                          {copiedId === `copy-${link.id}` ? <span className="text-[10px] text-green-500">OK</span> : <FiCopy size={11} />}
                        </button>
                      )}
                      <button onClick={() => openEdit(link)} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all" aria-label="Edit"><IoCreateOutline size={12} /></button>
                      <button onClick={() => confirmDelete(link.id, link.clientName)} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" aria-label="Delete"><IoTrashOutline size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {filtered.map((link) => (
            <div key={link.id} className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleFavourite(link)} className={`transition-colors ${link.favourite ? "text-amber-500" : "text-gray-300 dark:text-slate-600"}`}>
                    {link.favourite ? <IoStar size={14} /> : <IoStarOutline size={14} />}
                  </button>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{link.clientName}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(link)} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all" aria-label="Edit"><IoCreateOutline size={12} /></button>
                  <button onClick={() => confirmDelete(link.id, link.clientName)} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" aria-label="Delete"><IoTrashOutline size={12} /></button>
                </div>
              </div>
              <div className="space-y-1.5">
                {link.liveUrl && <div className="flex items-center gap-2 text-xs">{renderLinkCell(link, "liveUrl", typeIcons.liveUrl)}</div>}
                <div className="flex items-center gap-2 text-xs">{renderLinkCell(link, "supabaseProject", typeIcons.supabaseProject)}</div>
                {link.vercelDashboard && <div className="flex items-center gap-2 text-xs">{renderLinkCell(link, "vercelDashboard", typeIcons.vercelDashboard)}</div>}
                {link.githubRepo && <div className="flex items-center gap-2 text-xs">{renderLinkCell(link, "githubRepo", typeIcons.githubRepo)}</div>}
                {link.notes && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{link.notes}</p>}
                {link.tags?.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {link.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded text-gray-400 dark:text-slate-500">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit link" : "Add link"}>
        <LinkForm clientOptions={clientOptions} initial={editing} onSave={handleSave} onCancel={closeModal} />
      </Modal>
    </PageLayout>
  );
}
