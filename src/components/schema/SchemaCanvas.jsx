import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import RelationshipEdge from "./RelationshipEdge";
import TableNode from "./TableNode";
import FlowNode from "./FlowNode";

const SchemaCanvas = forwardRef(function SchemaCanvas(
  { diagram, initialPositions, initialView, selectedTableId, onSelectTable, onUpdatePosition },
  ref
) {
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const [view, setView] = useState(() => initialView);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [localPositions, setLocalPositions] = useState(() => initialPositions);

  const getPos = useCallback(
    (tableId) => {
      const p = localPositions?.[tableId];
      if (p) return p;
      const t = diagram?.tables.find((t) => t.id === tableId);
      return t ? { x: t.x, y: t.y } : { x: 0, y: 0 };
    },
    [localPositions, diagram?.tables]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (!diagram) return;
      const nodeEl = e.target.closest("[data-node-id]");
      if (nodeEl) {
        const nodeId = nodeEl.getAttribute("data-node-id");
        const pos = getPos(nodeId);
        dragRef.current = {
          type: "node",
          nodeId,
          startX: e.clientX,
          startY: e.clientY,
          startNodeX: pos.x,
          startNodeY: pos.y,
        };
        return;
      }
      const portEl = e.target.closest("[data-port-from]");
      if (portEl) return;
      dragRef.current = {
        type: "pan",
        startX: e.clientX,
        startY: e.clientY,
        startViewX: view.x,
        startViewY: view.y,
      };
    },
    [diagram, view, getPos]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      if (dragRef.current.type === "pan") {
        const startViewX = dragRef.current.startViewX;
        const startViewY = dragRef.current.startViewY;
        setView((v) => ({
          x: startViewX + dx,
          y: startViewY + dy,
          zoom: v.zoom,
        }));
      } else if (dragRef.current.type === "node") {
        const nodeId = dragRef.current.nodeId;
        const newX = Math.round(dragRef.current.startNodeX + dx / view.zoom);
        const newY = Math.round(dragRef.current.startNodeY + dy / view.zoom);
        setLocalPositions((prev) => ({
          ...prev,
          [nodeId]: { x: newX, y: newY },
        }));
      }
    },
    [view.zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (dragRef.current?.type === "node") {
      const { nodeId } = dragRef.current;
      const pos = localPositions?.[nodeId];
      if (pos && onUpdatePosition) {
        onUpdatePosition(nodeId, pos.x, pos.y);
      }
    }
    dragRef.current = null;
  }, [localPositions, onUpdatePosition]);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = -e.deltaY * 0.001;
      const newZoom = Math.max(0.15, Math.min(3, view.zoom * (1 + delta)));
      const newX = mouseX - (mouseX - view.x) * (newZoom / view.zoom);
      const newY = mouseY - (mouseY - view.y) * (newZoom / view.zoom);

      setView({ x: newX, y: newY, zoom: newZoom });
    },
    [view]
  );

  const zoomIn = useCallback(() => {
    setView((v) => {
      const newZoom = Math.min(3, v.zoom * 1.25);
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2 - 100;
      return {
        x: cx - (cx - v.x) * (newZoom / v.zoom),
        y: cy - (cy - v.y) * (newZoom / v.zoom),
        zoom: newZoom,
      };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setView((v) => {
      const newZoom = Math.max(0.15, v.zoom / 1.25);
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2 - 100;
      return {
        x: cx - (cx - v.x) * (newZoom / v.zoom),
        y: cy - (cy - v.y) * (newZoom / v.zoom),
        zoom: newZoom,
      };
    });
  }, []);

  const zoomReset = useCallback(() => {
    setView((v) => ({ ...v, zoom: 1, x: 40, y: 40 }));
  }, []);

  const zoomFit = useCallback(() => {
    if (!diagram?.tables?.length || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const padding = 60;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const isFlow = diagram.diagramType === "flow";
    diagram.tables.forEach((t) => {
      const pos = getPos(t.id);
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + t.width);
      const nodeHeight = isFlow ? 70 : 80 + (t.columns?.length || 0) * 26;
      maxY = Math.max(maxY, pos.y + nodeHeight);
    });
    const bw = maxX - minX + padding * 2;
    const bh = maxY - minY + padding * 2;
    const scale = Math.min(rect.width / bw, rect.height / bh, 1.5);
    const cx = rect.width / 2 - (minX + (maxX - minX) / 2) * scale;
    const cy = rect.height / 2 - (minY + (maxY - minY) / 2) * scale;
    setView({ x: cx, y: cy, zoom: scale });
  }, [diagram, getPos]);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn,
      zoomOut,
      zoomReset,
      zoomFit,
      getZoom: () => view.zoom,
    }),
    [zoomIn, zoomOut, zoomReset, zoomFit, view.zoom]
  );

  if (!diagram) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-400">
        Select a diagram to view
      </div>
    );
  }

  const isPanning = dragRef.current?.type === "pan";

  return (
    <svg
      ref={svgRef}
      className={`w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <defs>
        <pattern
          id="schema-grid"
          width={24}
          height={24}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${view.x % 24}, ${view.y % 24})`}
        >
          <circle cx={12} cy={12} r={0.8} fill="#334155" />
        </pattern>
        <pattern
          id="schema-grid-lg"
          width={96}
          height={96}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${view.x % 96}, ${view.y % 96})`}
        >
          <circle cx={48} cy={48} r={1.2} fill="#2a3a55" />
        </pattern>
        <marker id="db-arrow" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" opacity={0.6} />
        </marker>
        <marker id="flow-arrow" markerWidth={10} markerHeight={7} refX={9} refY={3.5} orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
      </defs>

      <rect width="100%" height="100%" fill="#0f172a" />
      <rect width="100%" height="100%" fill="url(#schema-grid)" />
      <rect width="100%" height="100%" fill="url(#schema-grid-lg)" />

      <g transform={`translate(${view.x}, ${view.y}) scale(${view.zoom})`}>
        {diagram.relationships.map((edge) => {
          const source = diagram.tables.find((t) => t.id === edge.fromTable);
          const target = diagram.tables.find((t) => t.id === edge.toTable);
          if (!source || !target) return null;
          return (
            <RelationshipEdge
              key={edge.id}
              edge={edge}
              sourceTable={{ ...source, ...(localPositions?.[source.id] || {}) }}
              targetTable={{ ...target, ...(localPositions?.[target.id] || {}) }}
              hovered={hoveredEdge === edge.id}
              onHover={setHoveredEdge}
              onClick={(e) => {}}
              isFlow={diagram.diagramType === "flow"}
            />
          );
        })}

        {diagram.tables.map((table) => {
          const pos = localPositions?.[table.id] || table;
          const isFlow = diagram.diagramType === "flow";
          return (
            <g key={table.id} transform={`translate(${pos.x}, ${pos.y})`}>
              {isFlow ? (
                <FlowNode
                  node={table}
                  selected={selectedTableId === table.id}
                  onSelect={onSelectTable}
                />
              ) : (
                <TableNode
                  table={table}
                  selected={selectedTableId === table.id}
                  onSelect={onSelectTable}
                />
              )}
            </g>
          );
        })}
      </g>

      {diagram.tables.length === 0 && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          fill="#64748b"
          fontSize={14}
          fontFamily="system-ui, sans-serif"
        >
          {diagram.diagramType === "flow" ? "No nodes in this diagram" : "No tables in this diagram"}
        </text>
      )}
    </svg>
  );
});

export default SchemaCanvas;
