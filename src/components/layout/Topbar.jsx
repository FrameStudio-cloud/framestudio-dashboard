import { useContext, useState, useRef, useEffect } from "react";
import { IoNotificationsOutline, IoSearchOutline, IoClose } from "react-icons/io5";
import { CiLogout, CiMenuBurger } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const { clients, focusItems, links, income, notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, []);

  const handleCloseSearch = () => { setSearchOpen(false); setSearchQuery(""); };

  const searchResults = searchQuery.trim() ? {
    clients: clients.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.business.toLowerCase().includes(searchQuery.toLowerCase())),
    tasks: focusItems.filter((f) => f.content.toLowerCase().includes(searchQuery.toLowerCase())),
    links: links.filter((l) => l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || (l.notes || "").toLowerCase().includes(searchQuery.toLowerCase())),
    payments: income.filter((i) => i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || (i.description || "").toLowerCase().includes(searchQuery.toLowerCase())),
  } : null;

  const totalResults = searchResults ? searchResults.clients.length + searchResults.tasks.length + searchResults.links.length + searchResults.payments.length : 0;

  const handleSelect = (path) => {
    handleCloseSearch();
    navigate(path);
  };

  return (
    <header className="h-14 bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-white/10 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onToggleSidebar} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all flex-shrink-0" aria-label="Open menu">
          <CiMenuBurger />
        </button>
        <div className="hidden sm:block min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
            {getGreeting()}{user ? `, ${user.email?.split("@")[0]}` : ""}.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => setSearchOpen(true)} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] text-xs text-gray-400 dark:text-slate-500 hover:border-amber-400 dark:hover:border-amber-500 transition-all">
          <IoSearchOutline size={14} />
          <span>Search...</span>
          <span className="text-[10px] text-gray-300 dark:text-slate-600 ml-4">Ctrl+K</span>
        </button>

        <button onClick={() => setSearchOpen(true)} className="md:hidden w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-all">
          <IoSearchOutline size={16} />
        </button>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((v) => !v)} className="relative w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-all" aria-label="Notifications">
            <IoNotificationsOutline size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button key={n.id} onClick={() => { markNotificationRead(n.id); navigate(n.link); setNotifOpen(false); }} className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${!n.read ? "bg-amber-50/50 dark:bg-amber-500/5" : ""}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? "bg-amber-500" : "bg-transparent"}`} />
                        <div>
                          <p className="text-sm text-gray-700 dark:text-slate-300">{n.message}</p>
                          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {user && (
          <button onClick={logout} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all" aria-label="Sign out">
            <CiLogout />
          </button>
        )}
      </div>

      {searchOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={handleCloseSearch} />
          <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/10">
              <IoSearchOutline className="text-gray-400 dark:text-slate-500 flex-shrink-0" size={16} />
              <input
                type="text"
                placeholder="Search clients, tasks, links, payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none"
              />
              <button onClick={handleCloseSearch} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <IoClose size={18} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {!searchQuery.trim() ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">Type to search across all data</p>
              ) : totalResults === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No results for "{searchQuery}"</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {searchResults.clients.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-4 py-2 bg-gray-50 dark:bg-white/[0.02]">Clients ({searchResults.clients.length})</p>
                      {searchResults.clients.map((c) => (
                        <button key={c.id} onClick={() => handleSelect(`/clients?name=${encodeURIComponent(c.name)}`)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-bold">{c.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm text-gray-800 dark:text-white">{c.name}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{c.business}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-4 py-2 bg-gray-50 dark:bg-white/[0.02]">Tasks ({searchResults.tasks.length})</p>
                      {searchResults.tasks.map((t) => (
                        <button key={t.id} onClick={() => handleSelect("/focus")} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${t.completed ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}`}>{t.completed ? "✓" : "○"}</div>
                          <div>
                            <p className="text-sm text-gray-800 dark:text-white">{t.content}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{t.project || "Personal"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.links.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-4 py-2 bg-gray-50 dark:bg-white/[0.02]">Links ({searchResults.links.length})</p>
                      {searchResults.links.map((l) => (
                        <button key={l.id} onClick={() => handleSelect("/links")} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 text-xs">🔗</div>
                          <div>
                            <p className="text-sm text-gray-800 dark:text-white">{l.clientName}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{l.liveUrl || l.notes || l.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.payments.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-4 py-2 bg-gray-50 dark:bg-white/[0.02]">Payments ({searchResults.payments.length})</p>
                      {searchResults.payments.map((p) => (
                        <button key={p.id} onClick={() => handleSelect(`/finances?client=${encodeURIComponent(p.clientName)}`)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 text-xs">K</div>
                          <div>
                            <p className="text-sm text-gray-800 dark:text-white">{p.clientName}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">KES {p.amount.toLocaleString()} · {p.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
