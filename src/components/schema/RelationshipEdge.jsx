import { useMemo } from "react";

function nodeCenter(table, edge, side, isFlow) {
  const w = table.width || 180;
  const h = isFlow
    ? (table.type === "decision" ? w : (table.subtitle ? 62 : 42))
    : (table.columns?.length || 1) * 26 + 52;

  if (isFlow) {
    if (side === "source") return { x: table.x + w / 2, y: table.y + h };
    return { x: table.x + w / 2, y: table.y };
  }

  const headerHeight = 36, pad = 8, colH = 26;
  const colName = side === "source" ? edge.fromColumn : edge.toColumn;
  const idx = table.columns?.findIndex((c) => c.name === colName) ?? -1;
  const rowY = idx >= 0
    ? headerHeight + pad + idx * colH + colH / 2
    : headerHeight + pad + ((table.columns?.length || 1) * colH) / 2;
  if (side === "source") return { x: table.x + w, y: table.y + rowY };
  return { x: table.x, y: table.y + rowY };
}

export default function RelationshipEdge({
  edge,
  sourceTable,
  targetTable,
  hovered,
  onHover,
  onClick,
  isFlow,
}) {
  const path = useMemo(() => {
    if (!sourceTable || !targetTable) return null;
    const src = nodeCenter(sourceTable, edge, "source", isFlow);
    const tgt = nodeCenter(targetTable, edge, "target", isFlow);
    const dx = isFlow ? 30 : Math.max(Math.abs(tgt.x - src.x) * 0.5, 60);
    return {
      d: isFlow
        ? `M ${src.x} ${src.y} C ${src.x} ${src.y + dx}, ${tgt.x} ${tgt.y - dx}, ${tgt.x} ${tgt.y}`
        : `M ${src.x} ${src.y} C ${src.x + dx} ${src.y}, ${tgt.x - dx} ${tgt.y}, ${tgt.x} ${tgt.y}`,
      ...src, ...tgt,
    };
  }, [edge, sourceTable, targetTable, isFlow]);

  if (!path) return null;

  const labelColor = edge.label === "NO" ? "#ef4444" : edge.label === "YES" ? "#22c55e" : "#f59e0b";
  const strokeColor = hovered ? labelColor : `${labelColor}55`;

  return (
    <g
      onMouseEnter={() => onHover?.(edge.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={(e) => { e.stopPropagation(); onClick?.(edge); }}
      style={{ cursor: "pointer" }}
    >
      <path
        d={path.d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={hovered ? 2.5 : 1.5}
        strokeDasharray={edge.dash ? "6,4" : "none"}
        markerEnd={isFlow ? "url(#flow-arrow)" : "url(#db-arrow)"}
        className="transition-all duration-200"
        style={{ filter: hovered ? `drop-shadow(0 0 4px ${labelColor}66)` : "none" }}
      />

      {!isFlow && (
        <>
          <circle cx={path.tx} cy={path.ty} r={3} fill="#f59e0b" opacity={hovered ? 1 : 0.4} />
          <circle cx={path.sx} cy={path.sy} r={2} fill="#f59e0b" opacity={hovered ? 0.6 : 0.3} />
        </>
      )}

      {(edge.label || (!isFlow && hovered)) && (
        <g>
          <rect
            x={isFlow ? (path.sx + path.tx) / 2 - (edge.label ? 24 : 70) : Math.min(path.sx, path.tx) - 60}
            y={isFlow ? (path.sy + path.ty) / 2 - 12 : Math.min(path.sy, path.ty) - 22}
            width={isFlow ? (edge.label ? 48 : 140) : 140}
            height={18}
            rx={9}
            fill={
              isFlow
                ? edge.label === "NO" ? "#450a0a"
                : edge.label === "YES" ? "#052e16"
                : "#1e293b"
                : "#1e293b"
            }
            stroke={isFlow ? `${labelColor}44` : "#334155"}
            strokeWidth={1}
          />
          <text
            x={isFlow ? (path.sx + path.tx) / 2 : Math.min(path.sx, path.tx) + 10}
            y={isFlow ? (path.sy + path.ty) / 2 + 2 : Math.min(path.sy, path.ty) - 9}
            fill={labelColor}
            fontSize={edge.label ? 9 : 10}
            fontFamily="monospace"
            fontWeight={edge.label ? 700 : 400}
            textAnchor={isFlow ? "middle" : "start"}
          >
            {edge.label || `${edge.fromColumn || ""} → ${edge.toColumn || ""}`}
          </text>
        </g>
      )}
    </g>
  );
}
