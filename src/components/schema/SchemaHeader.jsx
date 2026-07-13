import { IoAdd, IoDownloadOutline, IoSearchOutline } from "react-icons/io5";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi2";
import { IoMdResize } from "react-icons/io";
import { domainColors } from "../../data/schemaDiagrams";

export default function SchemaHeader({
  diagrams,
  activeDiagramId,
  onSelectDiagram,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenImport,
}) {
  const diagram = diagrams.find((d) => d.id === activeDiagramId);
  const color = diagram ? domainColors[diagram.tables?.[0]?.domain] || domainColors["user-owned"] : domainColors["user-owned"];

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3">
        <select
          value={activeDiagramId}
          onChange={(e) => onSelectDiagram(e.target.value)}
          className="text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 appearance-none cursor-pointer min-w-[200px]"
        >
          {diagrams.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {diagram && (
          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
            {diagram.tables.length} tables · {diagram.relationships.length} relationships
          </span>
        )}
        {diagram?.projectRef && (
          <code className="text-[11px] text-gray-400 dark:text-gray-600 hidden lg:inline font-mono">
            {diagram.projectRef}
          </code>
        )}
      </div>

      <div className="flex items-center gap-2">
        {diagram?.description && (
          <span className="text-xs text-gray-400 dark:text-gray-500 max-w-[240px] truncate hidden md:block">
            {diagram.description}
          </span>
        )}

        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
            title="Zoom out"
          >
            <HiOutlineMinus size={14} />
          </button>
          <button
            onClick={onZoomReset}
            className="px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors min-w-[48px] text-center"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
            title="Zoom in"
          >
            <HiOutlinePlus size={14} />
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />
          <button
            onClick={() => onZoomReset("fit")}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
            title="Fit all"
          >
            <IoMdResize size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
