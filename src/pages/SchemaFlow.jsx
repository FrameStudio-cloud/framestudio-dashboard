import { useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import SchemaHeader from "../components/schema/SchemaHeader";
import SchemaCanvas from "../components/schema/SchemaCanvas";
import SchemaDetailPanel from "../components/schema/SchemaDetailPanel";
import { useData } from "../context/DataContext";

export default function SchemaFlow() {
  const { schemaDiagrams, upsertDiagram } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const canvasRef = useRef(null);
  const [activeId, setActiveId] = useState(() => {
    const fromUrl = searchParams.get("d");
    if (fromUrl && schemaDiagrams.some((d) => d.id === fromUrl)) return fromUrl;
    return schemaDiagrams[0]?.id || null;
  });
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const activeDiagram = schemaDiagrams.find((d) => d.id === activeId);

  const canvasKey = activeDiagram?.id || "empty";

  const initialPositions = useMemo(
    () => activeDiagram
      ? Object.fromEntries(activeDiagram.tables.map((t) => [t.id, { x: t.x, y: t.y }]))
      : {},
    [activeDiagram?.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const initialView = useMemo(
    () => ({ x: 40, y: 40, zoom: activeDiagram?.zoom || 0.75 }),
    [activeDiagram?.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSelectDiagram = useCallback((id) => {
    setActiveId(id);
    setSelectedTableId(null);
    setPanelOpen(false);
    setSearchParams({ d: id }, { replace: true });
  }, [setSearchParams]);

  const handleSelectTable = useCallback((tableId) => {
    setSelectedTableId((prev) => (prev === tableId ? null : tableId));
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    setSelectedTableId(null);
  }, []);

  const handleCenterTable = useCallback(
    (tableId) => {
      const table = activeDiagram?.tables.find((t) => t.id === tableId);
      if (table && canvasRef.current) {
        canvasRef.current.zoomReset();
        setSelectedTableId(tableId);
        setPanelOpen(true);
      }
    },
    [activeDiagram]
  );

  const handleUpdatePosition = useCallback(
    (tableId, x, y) => {
      if (!activeDiagram) return;
      const updated = {
        ...activeDiagram,
        tables: activeDiagram.tables.map((t) =>
          t.id === tableId ? { ...t, x, y } : t
        ),
      };
      upsertDiagram(updated);
    },
    [activeDiagram, upsertDiagram]
  );

  const handleZoomIn = useCallback(() => canvasRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => canvasRef.current?.zoomOut(), []);
  const handleZoomReset = useCallback(
    (mode) => {
      if (mode === "fit") canvasRef.current?.zoomFit();
      else canvasRef.current?.zoomReset();
    },
    []
  );

  return (
    <PageLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="shrink-0 mb-3">
          <SchemaHeader
            diagrams={schemaDiagrams}
            activeDiagramId={activeId}
            onSelectDiagram={handleSelectDiagram}
            zoom={1}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onOpenImport={() => {}}
          />
        </div>

        <div className="flex-1 relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-[#0f172a]">
          <SchemaCanvas
            key={canvasKey}
            ref={canvasRef}
            diagram={activeDiagram}
            initialPositions={initialPositions}
            initialView={initialView}
            selectedTableId={selectedTableId}
            onSelectTable={handleSelectTable}
            onUpdatePosition={handleUpdatePosition}
          />

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
            <span className="text-[11px] text-gray-600 dark:text-gray-500 bg-[#1e293b]/80 px-3 py-1.5 rounded-full border border-white/5">
              Drag to pan · Scroll to zoom · Click a table to explore
            </span>
          </div>
        </div>
      </div>

      {panelOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20"
            onClick={handleClosePanel}
          />
          <SchemaDetailPanel
            diagram={activeDiagram}
            selectedTableId={selectedTableId}
            onClose={handleClosePanel}
            onCenterTable={handleCenterTable}
          />
        </>
      )}
    </PageLayout>
  );
}