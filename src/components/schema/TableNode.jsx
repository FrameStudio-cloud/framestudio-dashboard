import { useMemo } from "react";
import { domainColors } from "../../data/schemaDiagrams";

const badge =
  "inline-flex items-center justify-center w-5 h-4 rounded text-[10px] font-bold leading-none mr-1.5";

export default function TableNode({ table, selected, onSelect }) {
  const color = domainColors[table.domain] || domainColors["user-owned"];

  const columnHeight = 26;
  const headerHeight = 36;
  const pad = 8;
  const totalHeight = headerHeight + pad + table.columns.length * columnHeight + pad;

  const pkCount = useMemo(() => table.columns.filter((c) => c.pk).length, [table.columns]);
  const fkCount = useMemo(() => table.columns.filter((c) => c.fk).length, [table.columns]);

  const columnY = useMemo(() => {
    return table.columns.map((_, i) => headerHeight + pad + i * columnHeight + columnHeight / 2);
  }, [table.columns]);

  return (
    <g>
      <foreignObject width={table.width} height={totalHeight}>
        <div
          data-node-id={table.id}
          className={`select-none rounded-xl border transition-shadow ${
            selected
              ? "shadow-lg shadow-amber-500/20 border-amber-500/50"
              : "shadow-sm border-gray-200 dark:border-white/10"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(table.id);
          }}
        >
          <div
            className="rounded-t-xl px-3 flex items-center justify-between"
            style={{ height: headerHeight, background: color.bg }}
          >
            <span className="text-sm font-semibold text-white truncate mr-2">{table.label}</span>
            <span className="text-[11px] text-white/70 whitespace-nowrap">
              {table.columns.length} col{pkCount > 0 ? ` · ${pkCount} PK` : ""}
              {fkCount > 0 ? ` · ${fkCount} FK` : ""}
            </span>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-b-xl divide-y divide-gray-100 dark:divide-white/5">
            {table.columns.map((col) => (
              <div
                key={col.name}
                className="flex items-center gap-1.5 px-3 text-xs"
                style={{ height: columnHeight }}
              >
                {col.pk && <span className={`${badge} bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300`}>PK</span>}
                {col.fk && !col.pk && <span className={`${badge} bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300`}>FK</span>}
                {!col.pk && !col.fk && <span className="w-5" />}
                <span className="font-mono text-gray-800 dark:text-gray-200 truncate">{col.name}</span>
                <span className="ml-auto font-mono text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[100px] text-right">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
      {table.columns.map((col, i) =>
        col.fk ? (
          <line
            key={`port-${col.name}`}
            x1={table.width}
            y1={columnY[i]}
            x2={table.width + 8}
            y2={columnY[i]}
            stroke="transparent"
            strokeWidth={6}
            data-port-from={`${table.id}:${col.name}`}
            style={{ cursor: "pointer", pointerEvents: "stroke" }}
          />
        ) : null
      )}
    </g>
  );
}
