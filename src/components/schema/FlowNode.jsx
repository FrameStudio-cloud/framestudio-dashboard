const nodeStyles = {
  trigger: { accent: "#10b981", text: "text-emerald-400" },
  decision: { accent: "#8b5cf6", text: "text-violet-400" },
  service: { accent: "#3b82f6", text: "text-blue-400" },
  page: { accent: "#22c55e", text: "text-green-400" },
  gate: { accent: "#ef4444", text: "text-red-400" },
  state: { accent: "#64748b", text: "text-slate-400" },
  action: { accent: "#f59e0b", text: "text-amber-400" },
  database: { accent: "#f97316", text: "text-orange-400" },
  cron: { accent: "#ec4899", text: "text-pink-400" },
};

export default function FlowNode({ node, selected, onSelect }) {
  const s = nodeStyles[node.type] || nodeStyles.service;
  const w = node.width || 180;

  // Compact: header + optional subtitle
  const headerH = 30;
  const pad = 6;
  const subtitleH = node.subtitle ? 20 : 0;
  const totalH = headerH + pad + subtitleH + pad;

  const isDiamond = node.type === "decision";

  return (
    <foreignObject width={w} height={isDiamond ? w : totalH}>
      <div
        data-node-id={node.id}
        className={`rounded-xl border transition-all select-none ${
          selected
            ? "shadow-lg shadow-amber-500/25 border-amber-500/50 ring-1 ring-amber-500/20"
            : "shadow-sm border-white/10"
        }`}
        style={{ background: "#1e293b" }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
      >
        {isDiamond ? (
          <div
            className="flex items-center justify-center"
            style={{ height: w - 40, width: w - 40, margin: "18px auto" }}
          >
            <span className="text-center">
              <span className="text-lg font-bold text-violet-400 block leading-tight">{node.label}</span>
              {node.subtitle && (
                <span className="text-[10px] text-violet-500 mt-0.5 block">{node.subtitle}</span>
              )}
            </span>
          </div>
        ) : (
          <>
            <div className="relative flex items-center px-3" style={{ height: headerH }}>
              <div
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                style={{ background: s.accent }}
              />
              <span className="text-sm font-semibold text-white truncate ml-2.5 mr-auto">{node.label}</span>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${s.text} shrink-0`}>
                {node.type === "trigger" ? "START" : node.type === "gate" ? "GATE" : node.type.toUpperCase()}
              </span>
            </div>
            {node.subtitle && (
              <div className="flex items-center px-3 pb-2" style={{ height: subtitleH }}>
                <span className="text-[11px] text-gray-500 ml-2.5 truncate">{node.subtitle}</span>
              </div>
            )}
          </>
        )}
      </div>
    </foreignObject>
  );
}
