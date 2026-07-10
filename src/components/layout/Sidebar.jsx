import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { IoGridOutline, IoPeopleOutline, IoLinkOutline, IoWalletOutline, IoPulseOutline, IoCheckboxOutline, IoCalendarOutline, IoChevronBack, IoChevronForward, IoSunny, IoMoon, IoStatsChartOutline, IoDocumentTextOutline } from "react-icons/io5";
import { HiOutlineSquares2X2 } from "react-icons/hi2";

const groups = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", icon: <IoGridOutline size={18} />, path: "/" },
      { label: "Clients", icon: <IoPeopleOutline size={18} />, path: "/clients" },
    ],
  },
  {
    label: "Projects",
    items: [
      { label: "Links Hub", icon: <IoLinkOutline size={18} />, path: "/links" },
      { label: "Keel Pulse", icon: <IoPulseOutline size={18} />, path: "/keel" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Finances", icon: <IoWalletOutline size={18} />, path: "/finances" },
    ],
  },
  {
    label: "Planning",
    items: [
      { label: "Focus Board", icon: <IoCheckboxOutline size={18} />, path: "/focus" },
      { label: "Timeline", icon: <IoCalendarOutline size={18} />, path: "/timeline" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", icon: <IoStatsChartOutline size={18} />, path: "/analytics" },
      { label: "Reports", icon: <IoDocumentTextOutline size={18} />, path: "/reports" },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("fs-sidebar-collapsed") === "true";
  });
  const [dark, setDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    localStorage.setItem("fs-sidebar-collapsed", collapsed);
  }, [collapsed]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl text-sm transition-all duration-150
    ${collapsed ? "justify-center px-0 py-2.5 mx-auto w-10" : "px-3 py-2"}
    ${
      isActive
        ? "bg-amber-500/10 text-amber-400 font-medium"
        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
    }`;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`
          h-screen bg-[#0f172a] border-r border-white/10
          flex flex-col flex-shrink-0 overflow-hidden
          fixed lg:static z-40 inset-y-0 left-0
          transition-all duration-200
          rounded-r-[28px]
          shadow-[4px_0_24px_-8px_rgba(0,0,0,0.3)]
          ${collapsed ? "w-[60px]" : "w-56"}
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`h-14 flex items-center border-b border-white/10 ${collapsed ? "justify-center px-0" : "gap-3 px-4"}`}>
          <div className="w-7 h-7 bg-amber-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            <HiOutlineSquares2X2 />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white whitespace-nowrap">FrameStudio</p>
              <p className="text-xs text-slate-500 whitespace-nowrap">Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-3 overflow-y-auto overflow-x-hidden">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-slate-500 px-3 pb-1 uppercase tracking-[0.12em]">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={onClose}
                    className={navLinkClass}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-2 border-t border-white/10 flex flex-col gap-0.5">
          <button
            onClick={toggleDark}
            className={`flex items-center gap-3 rounded-xl text-sm transition-all duration-150 text-slate-400 hover:bg-white/[0.05] hover:text-white ${collapsed ? "justify-center px-0 py-2.5 mx-auto w-10" : "px-3 py-2"}`}
          >
            <span className="flex-shrink-0">{dark ? <IoSunny size={18} /> : <IoMoon size={18} />}</span>
            {!collapsed && <span className="truncate">{dark ? "Light mode" : "Dark mode"}</span>}
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`hidden lg:flex items-center gap-3 rounded-xl text-sm transition-all duration-150 text-slate-400 hover:bg-white/[0.05] hover:text-white ${collapsed ? "justify-center px-0 py-2.5 mx-auto w-10" : "px-3 py-2"}`}
          >
            <span className="flex-shrink-0">{collapsed ? <IoChevronForward size={18} /> : <IoChevronBack size={18} />}</span>
            {!collapsed && <span className="truncate">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
