import { useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { domainColors } from "../../data/schemaDiagrams";

const flowTypeColors = {
  trigger: { bg: "#10b981", text: "text-emerald-400", bgLight: "bg-emerald-500/10", hex: "#10b981" },
  decision: { bg: "#8b5cf6", text: "text-violet-400", bgLight: "bg-violet-500/10", hex: "#8b5cf6" },
  service: { bg: "#3b82f6", text: "text-blue-400", bgLight: "bg-blue-500/10", hex: "#3b82f6" },
  page: { bg: "#22c55e", text: "text-green-400", bgLight: "bg-green-500/10", hex: "#22c55e" },
  gate: { bg: "#ef4444", text: "text-red-400", bgLight: "bg-red-500/10", hex: "#ef4444" },
  state: { bg: "#64748b", text: "text-slate-400", bgLight: "bg-slate-500/10", hex: "#64748b" },
  action: { bg: "#f59e0b", text: "text-amber-400", bgLight: "bg-amber-500/10", hex: "#f59e0b" },
  database: { bg: "#f97316", text: "text-orange-400", bgLight: "bg-orange-500/10", hex: "#f97316" },
  cron: { bg: "#ec4899", text: "text-pink-400", bgLight: "bg-pink-500/10", hex: "#ec4899" },
};

export default function SchemaDetailPanel({
  diagram,
  selectedTableId,
  onClose,
  onCenterTable,
}) {
  const isFlow = diagram?.diagramType === "flow";

  const table = useMemo(
    () => diagram?.tables.find((t) => t.id === selectedTableId),
    [diagram, selectedTableId]
  );

  const relationships = useMemo(() => {
    if (!diagram || !table) return [];
    return (diagram.relationships || []).filter(
      (r) => r.fromTable === table.id || r.toTable === table.id
    );
  }, [diagram, table]);

  if (!table) return null;

  const color = isFlow
    ? flowTypeColors[table.type] || { bg: "#64748b", text: "text-slate-400", bgLight: "bg-slate-500/10", hex: "#64748b" }
    : domainColors[table.domain] || domainColors["user-owned"];

  return (
    <div
      className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-[#0f172a] border-l border-gray-200 dark:border-white/10 shadow-2xl z-40 overflow-y-auto transition-transform duration-300"
      style={{ transform: "translateX(0)" }}
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: color.bg }}
          />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{table.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 shrink-0"
        >
          <IoClose size={16} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${color.bgLight} ${color.text}`}>
            {isFlow ? table.type : table.domain}
          </span>
          {table.subtitle && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
              {table.subtitle}
            </span>
          )}
          {!isFlow && table.columns && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
              {table.columns.length} columns
            </span>
          )}
        </div>

        <button
          onClick={() => onCenterTable?.(table.id)}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
        >
          Center on canvas
        </button>

        {isFlow && table.subtitle && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Description
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{table.subtitle}</p>
          </div>
        )}

        {!isFlow && table.columns && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Columns
            </h4>
            <div className="space-y-1">
              {table.columns.map((col) => (
                <div
                  key={col.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1e293b] text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {col.pk && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                          PK
                        </span>
                      )}
                      {col.fk && !col.pk && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">
                          FK
                        </span>
                      )}
                      <span className="font-mono text-gray-800 dark:text-gray-200 truncate">
                        {col.name}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {relationships.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              {isFlow ? "Connections" : "Relationships"}
            </h4>
            <div className="space-y-1.5">
              {relationships.map((r) => {
                const source = diagram.tables.find((t) => t.id === r.fromTable);
                const target = diagram.tables.find((t) => t.id === r.toTable);
                const isOutgoing = r.fromTable === table.id;
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1e293b] text-xs"
                  >
                    <span className={isOutgoing ? "text-amber-500" : "text-blue-500"}>
                      {isOutgoing ? "→" : "←"}
                    </span>
                    <span className="font-mono text-gray-600 dark:text-gray-400 truncate">
                      {isOutgoing
                        ? (r.label ? `${r.label} → ` : "") + (target?.label || r.toTable)
                        : (source?.label || r.fromTable) + (r.label ? ` → ${r.label}` : "")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isFlow && table.columns && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Raw SQL
            </h4>
            <pre className="text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1e293b] p-3 rounded-lg overflow-x-auto leading-relaxed">
{`CREATE TABLE ${table.label} (
  ${table.columns.map((c) => `${c.name} ${c.type}${c.pk ? " PRIMARY KEY" : ""}${c.fk ? ` REFERENCES ${c.fk.table}(${c.fk.column})` : ""}${c.nullable ? "" : " NOT NULL"}`).join(",\n  ")}
);`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
