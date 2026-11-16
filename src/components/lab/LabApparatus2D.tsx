import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ApparatusInstance,
  ChemistryAnalysisResult,
  Reagent,
  hexToColorString,
  LAB2D_WORLD,
  VESSEL_BOUNDS,
  clamp2DPosition,
} from './labTypes';
import {
  Flame,
  Droplets,
  RotateCw,
  Trash2,
  Bookmark,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Move,
} from 'lucide-react';

interface ViewBoxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LabApparatus2DProps {
  containers: ApparatusInstance[];
  activeContainerId: string;
  onSelectContainer: (id: string) => void;
  onUpdateContainerPosition: (id: string, x: number, y: number) => void;
  onRemoveContainer: (id: string) => void;
  onWashContainer: (id: string) => void;
  onToggleHeater: (id: string) => void;
  onShakeContainer: (id: string) => void;
  onDipLitmus: (id: string) => void;
  onResetLayout?: () => void;
  isPouring: boolean;
  pouringReagent: Reagent | null;
  analyses: Record<string, ChemistryAnalysisResult>;
  isFullscreen?: boolean;
}

const computeAspectMatchedViewBox = (
  targetX: number,
  targetY: number,
  targetW: number,
  targetH: number,
  aspect: number
): ViewBoxRect => {
  const safeAspect = Number.isFinite(aspect) && aspect > 0.2 ? aspect : LAB2D_WORLD.WIDTH / LAB2D_WORLD.HEIGHT;
  const cx = targetX + targetW / 2;
  const cy = targetY + targetH / 2;

  let finalW = targetW;
  let finalH = targetH;

  if (targetW / targetH > safeAspect) {
    finalW = targetW;
    finalH = targetW / safeAspect;
  } else {
    finalH = targetH;
    finalW = targetH * safeAspect;
  }

  return {
    x: cx - finalW / 2,
    y: cy - finalH / 2,
    w: finalW,
    h: finalH,
  };
};

export const LabApparatus2D: React.FC<LabApparatus2DProps> = ({
  containers,
  activeContainerId,
  onSelectContainer,
  onUpdateContainerPosition,
  onRemoveContainer,
  onWashContainer,
  onToggleHeater,
  onShakeContainer,
  onDipLitmus,
  onResetLayout,
  isPouring,
  pouringReagent,
  analyses,
  isFullscreen = false,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: LAB2D_WORLD.WIDTH,
    height: LAB2D_WORLD.HEIGHT,
  });

  const [viewBox, setViewBox] = useState<ViewBoxRect>({
    x: 0,
    y: 0,
    w: LAB2D_WORLD.WIDTH,
    h: LAB2D_WORLD.HEIGHT,
  });

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; vbX: number; vbY: number } | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);

  const getAspect = useCallback(() => {
    if (viewportSize.width > 0 && viewportSize.height > 0) {
      return viewportSize.width / viewportSize.height;
    }
    return LAB2D_WORLD.WIDTH / LAB2D_WORLD.HEIGHT;
  }, [viewportSize]);

  const computeFitViewBox = useCallback(
    (items: ApparatusInstance[], aspectOverride?: number): ViewBoxRect => {
      const aspect = aspectOverride ?? getAspect();
      if (items.length === 0) {
        return computeAspectMatchedViewBox(0, 0, LAB2D_WORLD.WIDTH, LAB2D_WORLD.HEIGHT, aspect);
      }

      const minX = Math.min(...items.map((c) => c.x + VESSEL_BOUNDS.MIN_X)) - 34;
      const maxX = Math.max(...items.map((c) => c.x + VESSEL_BOUNDS.MAX_X)) + 34;
      const minY = Math.min(...items.map((c) => c.y + VESSEL_BOUNDS.MIN_Y)) - 26;
      const maxY = Math.max(...items.map((c) => c.y + VESSEL_BOUNDS.MAX_Y)) + 26;

      const rawW = maxX - minX;
      const rawH = maxY - minY;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      const targetW = Math.max(460, rawW);
      const targetH = Math.max(340, rawH);

      return computeAspectMatchedViewBox(
        cx - targetW / 2,
        cy - targetH / 2,
        targetW,
        targetH,
        aspect
      );
    },
    [getAspect]
  );

  // Measure actual simulation viewport dimensions dynamically
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateSize = () => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      if (nw > 0 && nh > 0) {
        setViewportSize((prev) => {
          if (prev.width === nw && prev.height === nh) return prev;
          return { width: nw, height: nh };
        });
      }
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        updateSize();
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Re-fit smoothly on container layout changes, viewport resizes, or fullscreen toggles
  const containerLayoutSignature = containers.map((c) => c.id).join('|');
  useEffect(() => {
    if (viewportSize.width <= 0 || viewportSize.height <= 0) return;
    const aspect = viewportSize.width / viewportSize.height;
    setViewBox(computeFitViewBox(containers, aspect));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerLayoutSignature, viewportSize.width, viewportSize.height, isFullscreen]);

  // Exact SVG coordinate conversion using getScreenCTM().inverse()
  const clientToWorldPoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };

      const ctm = svg.getScreenCTM();
      if (ctm) {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const transformed = pt.matrixTransform(ctm.inverse());
        return { x: transformed.x, y: transformed.y };
      }

      const rect = svg.getBoundingClientRect();
      return {
        x: viewBox.x + ((clientX - rect.left) / Math.max(1, rect.width)) * viewBox.w,
        y: viewBox.y + ((clientY - rect.top) / Math.max(1, rect.height)) * viewBox.h,
      };
    },
    [viewBox]
  );

  // Zoom helpers
  const applyZoom = useCallback((factor: number) => {
    setViewBox((prev) => {
      const minW = 280;
      const maxW = 1400;
      const nextW = Math.max(minW, Math.min(maxW, prev.w * factor));
      const scale = nextW / prev.w;
      const nextH = prev.h * scale;
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      return {
        x: cx - nextW / 2,
        y: cy - nextH / 2,
        w: nextW,
        h: nextH,
      };
    });
  }, []);

  const handleZoomIn = () => applyZoom(1 / 1.2);
  const handleZoomOut = () => applyZoom(1.2);

  const handleFitToFrame = () => {
    setViewBox(computeFitViewBox(containers));
  };

  const handleResetView = () => {
    if (onResetLayout) {
      onResetLayout();
    }
    setViewBox(
      computeAspectMatchedViewBox(0, 0, LAB2D_WORLD.WIDTH, LAB2D_WORLD.HEIGHT, getAspect())
    );
  };

  // Drag Vessel Start
  const handleVesselPointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    onSelectContainer(id);
    const container = containers.find((c) => c.id === id);
    if (!container || !svgRef.current) return;

    const worldPt = clientToWorldPoint(e.clientX, e.clientY);
    setDraggingId(id);
    setDragOffset({
      x: worldPt.x - container.x,
      y: worldPt.y - container.y,
    });

    try {
      svgRef.current.setPointerCapture(e.pointerId);
    } catch {
      // ignore if synthetic event
    }
  };

  // Pan Canvas Start (background)
  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    setIsPanning(true);
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      vbX: viewBox.x,
      vbY: viewBox.y,
    };
    try {
      svgRef.current.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Pointer Move (vessel drag or background pan)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId) {
      const worldPt = clientToWorldPoint(e.clientX, e.clientY);
      const clamped = clamp2DPosition(worldPt.x - dragOffset.x, worldPt.y - dragOffset.y);
      onUpdateContainerPosition(draggingId, clamped.x, clamped.y);
      return;
    }

    if (isPanning && panStartRef.current && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const dxPx = e.clientX - panStartRef.current.clientX;
      const dyPx = e.clientY - panStartRef.current.clientY;
      const dxWorld = (dxPx / Math.max(1, rect.width)) * viewBox.w;
      const dyWorld = (dyPx / Math.max(1, rect.height)) * viewBox.h;

      const maxPanX = 320;
      const minPanX = -320;
      const maxPanY = 220;
      const minPanY = -220;

      setViewBox((prev) => ({
        ...prev,
        x: Math.max(minPanX, Math.min(maxPanX, panStartRef.current!.vbX - dxWorld)),
        y: Math.max(minPanY, Math.min(maxPanY, panStartRef.current!.vbY - dyWorld)),
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      setDraggingId(null);
    }
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Wheel Zoom inside simulation viewport
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    applyZoom(e.deltaY < 0 ? 1 / 1.12 : 1.12);
  };

  const triggerShake = (id: string) => {
    setShakingId(id);
    onShakeContainer(id);
    setTimeout(() => {
      setShakingId(null);
    }, 1200);
  };

  const activeContainer = containers.find((c) => c.id === activeContainerId);
  const activeAnalysis = activeContainer ? analyses[activeContainer.id] : null;
  const zoomPercent = Math.round((LAB2D_WORLD.WIDTH / Math.max(1, viewBox.w)) * 100);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col select-none shadow-inner">
      {/* ZONE 1: DEDICATED NON-OVERLAPPING TOP ACTION & OBSERVATION TOOLBAR */}
      <div className="shrink-0 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Selected Vessel Actions */}
        {activeContainer ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 pr-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="text-sm font-black text-teal-300 truncate max-w-[180px]">
                {activeContainer.name}
              </span>
            </div>

            <button
              onClick={() => triggerShake(activeContainer.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all"
              title="Lắc nhẹ và đảo đều hóa chất"
            >
              <RotateCw className="w-3.5 h-3.5 text-teal-400" />
              <span>Lắc nhẹ</span>
            </button>

            <button
              onClick={() => onToggleHeater(activeContainer.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                activeContainer.isHeated
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
              title="Thắp đèn cồn đun nóng hoặc tắt lửa"
            >
              <Flame className={`w-3.5 h-3.5 ${activeContainer.isHeated ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{activeContainer.isHeated ? 'Tắt đun nóng' : 'Đun đèn cồn'}</span>
            </button>

            <button
              onClick={() => onDipLitmus(activeContainer.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all"
              title="Nhúng giấy quỳ tím vào dung dịch"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>Thử quỳ tím</span>
            </button>

            <button
              onClick={() => onWashContainer(activeContainer.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all"
              title="Rửa sạch hóa chất trong dụng cụ"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Rửa sạch</span>
            </button>

            <button
              onClick={() => onRemoveContainer(activeContainer.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700 rounded-lg text-xs font-bold transition-all"
              title="Xóa dụng cụ này khỏi bàn thực hành"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Xóa dụng cụ</span>
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-400">
            Chưa có dụng cụ nào được chọn trên bàn thí nghiệm
          </span>
        )}

        {/* Viewport Observation Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-700/80 ml-auto">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="Phóng to vùng thí nghiệm"
            aria-label="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="Thu nhỏ vùng thí nghiệm"
            aria-label="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-1.5 text-[11px] font-mono font-bold text-slate-300 min-w-[44px] text-center">
            {zoomPercent}%
          </span>
          <button
            onClick={handleFitToFrame}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-sky-300 hover:text-white hover:bg-sky-900/50 rounded-lg transition-all"
            title="Tự động thu phóng vừa khít toàn bộ dụng cụ"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Vừa khung hình</span>
          </button>
          <button
            onClick={handleResetView}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-teal-300 hover:text-white hover:bg-teal-900/50 rounded-lg transition-all"
            title="Đặt lại vị trí dụng cụ & góc nhìn chuẩn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại góc nhìn</span>
          </button>
        </div>
      </div>

      {/* ZONE 2: SIMULATION CANVAS (Responsive flexible height, zero clipped vessels) */}
      <div
        ref={viewportRef}
        className={`relative w-full overflow-hidden bg-slate-900 ${
          isFullscreen
            ? 'h-[clamp(440px,64vh,720px)]'
            : 'h-[360px] sm:h-[430px] lg:h-[clamp(440px,56vh,570px)]'
        }`}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          preserveAspectRatio="xMidYMid meet"
          className={`w-full h-full block touch-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
          onPointerDown={handleBackgroundPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <defs>
            {/* Background Lab Wall & Dot Pattern inside SVG World */}
            <linearGradient id="labWallBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="65%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <pattern id="labDotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#ffffff" fillOpacity="0.12" />
            </pattern>

            <linearGradient id="benchSurfaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="35%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="benchEdgeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.25" />
            </linearGradient>

            {/* Glass reflection gradient */}
            <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="80%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
            </linearGradient>

            {/* Burner Flame Gradients */}
            <radialGradient id="flameInner" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="flameOuter" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            {/* Drop shadow for glassware */}
            <filter id="shadowFilter" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#000000" floodOpacity="0.42" />
            </filter>
          </defs>

          {/* Infinite Lab Wall Backdrop */}
          <rect x="-800" y="-600" width="2500" height="1600" fill="url(#labWallBg)" />
          <rect x="-800" y="-600" width="2500" height="1600" fill="url(#labDotGrid)" />

          {/* Lab Workbench Tabletop Inside SVG World (Zooms & Pans Cohesively) */}
          <rect
            x="-800"
            y={LAB2D_WORLD.BENCH_SURFACE_Y - 18}
            width="2500"
            height="700"
            fill="url(#benchSurfaceGrad)"
          />
          <line
            x1="-800"
            y1={LAB2D_WORLD.BENCH_SURFACE_Y - 18}
            x2="1700"
            y2={LAB2D_WORLD.BENCH_SURFACE_Y - 18}
            stroke="#475569"
            strokeWidth="3.5"
          />
          <rect
            x="-800"
            y={LAB2D_WORLD.BENCH_SURFACE_Y - 16}
            width="2500"
            height="4"
            fill="url(#benchEdgeHighlight)"
          />

          {/* Subtle Workbench Bounds Ruler Guide */}
          <line
            x1="36"
            y1={LAB2D_WORLD.BENCH_SURFACE_Y - 6}
            x2={LAB2D_WORLD.WIDTH - 36}
            y2={LAB2D_WORLD.BENCH_SURFACE_Y - 6}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="6 6"
            opacity="0.7"
          />

          {/* Empty State Help Guide */}
          {containers.length === 0 && (
            <text
              x={LAB2D_WORLD.WIDTH / 2}
              y={210}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="18"
              fontWeight="bold"
            >
              Bàn thí nghiệm đang trống. Chọn dụng cụ từ Khay dụng cụ ở trên để bắt đầu!
            </text>
          )}

          {/* Render Each Apparatus */}
          {containers.map((container) => {
            const isSelected = container.id === activeContainerId;
            const isCurrentShaking = shakingId === container.id;
            const analysis = analyses[container.id] || {
              liquidHex: '#e2e8f0',
              liquidOpacity: 0.35,
              totalVolume: 0,
              precipitateHex: null,
              precipitateHeight: 0,
              hasGasBubbles: false,
              hasThermalMist: false,
              temperatureCalc: container.temperature,
            };

            const fillRatio = Math.min(0.9, Math.max(0, analysis.totalVolume / container.capacity));

            return (
              <g
                key={container.id}
                transform={`translate(${container.x}, ${container.y})`}
                className="cursor-move"
                onPointerDown={(e) => handleVesselPointerDown(e, container.id)}
              >
                {/* Active Selection Glow Ring Around Base */}
                {isSelected && (
                  <ellipse
                    cx="55"
                    cy="198"
                    rx="56"
                    ry="13"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="2.8"
                    strokeDasharray="6 4"
                    className="animate-spin"
                    style={{ transformOrigin: '55px 198px', animationDuration: '9s' }}
                  />
                )}

                {/* Shaking Wobble Group */}
                <g className={isCurrentShaking ? 'animate-bounce' : ''}>
                  {/* 1. TEST TUBE (Centered at localX = 55) */}
                  {container.type === 'test_tube' && (
                    <g transform="translate(15, 0)" filter="url(#shadowFilter)">
                      {/* Shadow on table */}
                      <ellipse cx="40" cy="196" rx="22" ry="6.5" fill="#000000" opacity="0.45" />

                      {/* Tube Wooden Rack Support */}
                      <rect x="26" y="145" width="28" height="51" rx="3" fill="#b45309" opacity="0.8" />
                      <rect x="18" y="190" width="44" height="8" rx="2" fill="#78350f" />

                      {/* Glass Body */}
                      <path
                        d="M 24 20 L 24 165 A 16 16 0 0 0 56 165 L 56 20 Z"
                        fill="#0f172a"
                        fillOpacity="0.25"
                      />

                      {/* Liquid Fill */}
                      {fillRatio > 0 && (
                        <g>
                          <clipPath id={`clip_tube_${container.id}`}>
                            <path d="M 24 20 L 24 165 A 16 16 0 0 0 56 165 L 56 20 Z" />
                          </clipPath>
                          <g clipPath={`url(#clip_tube_${container.id})`}>
                            <rect
                              x="24"
                              y={180 - fillRatio * 150}
                              width="32"
                              height={fillRatio * 150 + 20}
                              fill={analysis.liquidHex}
                              fillOpacity={analysis.liquidOpacity}
                            />
                            <ellipse
                              cx="40"
                              cy={180 - fillRatio * 150}
                              rx="16"
                              ry="4"
                              fill="#ffffff"
                              fillOpacity="0.45"
                            />
                            {analysis.precipitateHex && (
                              <path
                                d="M 24 160 L 56 160 L 56 165 A 16 16 0 0 1 24 165 Z"
                                fill={analysis.precipitateHex}
                                opacity="0.95"
                              />
                            )}
                            {analysis.hasGasBubbles && (
                              <g className="animate-pulse">
                                <circle cx="34" cy="160" r="2.5" fill="#ffffff" opacity="0.85">
                                  <animate attributeName="cy" values="165;55" dur="1.2s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="44" cy="155" r="3" fill="#ffffff" opacity="0.85">
                                  <animate attributeName="cy" values="165;55" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="38" cy="162" r="2" fill="#ffffff" opacity="0.75">
                                  <animate attributeName="cy" values="165;55" dur="0.9s" begin="0.6s" repeatCount="indefinite" />
                                </circle>
                              </g>
                            )}
                          </g>
                        </g>
                      )}

                      {/* Thermal Mist (stays cleanly above mouth/badges) */}
                      {analysis.hasThermalMist && (
                        <g className="animate-pulse" opacity="0.7">
                          <path d="M 33 14 Q 27 4 35 -4" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                          <path d="M 40 -31 Q 46 -40 38 -50" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 47 14 Q 42 4 49 -4" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </g>
                      )}

                      {/* Glass Outline & Flanged Lip */}
                      <path
                        d="M 24 20 L 24 165 A 16 16 0 0 0 56 165 L 56 20"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2.2"
                      />
                      <ellipse cx="40" cy="20" rx="18" ry="4" fill="none" stroke="#94a3b8" strokeWidth="2.2" />
                      <path d="M 28 30 L 28 155" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />

                      {/* Graduation Marks */}
                      {[50, 80, 110, 140].map((yMark, idx) => (
                        <line
                          key={idx}
                          x1="50"
                          y1={yMark}
                          x2="56"
                          y2={yMark}
                          stroke="#e2e8f0"
                          strokeWidth="1.2"
                          opacity="0.75"
                        />
                      ))}
                    </g>
                  )}

                  {/* 2. BEAKER 100 mL (Centered at localX = 55, bottom at 196) */}
                  {container.type === 'beaker_100' && (
                    <g transform="translate(5, 8)" filter="url(#shadowFilter)">
                      <ellipse cx="50" cy="188" rx="40" ry="8.5" fill="#000000" opacity="0.45" />
                      <path
                        d="M 15 50 L 15 175 A 10 10 0 0 0 25 185 L 75 185 A 10 10 0 0 0 85 175 L 85 50 Z"
                        fill="#0f172a"
                        fillOpacity="0.25"
                      />
                      {fillRatio > 0 && (
                        <g>
                          <clipPath id={`clip_beaker_${container.id}`}>
                            <path d="M 15 50 L 15 175 A 10 10 0 0 0 25 185 L 75 185 A 10 10 0 0 0 85 175 L 85 50 Z" />
                          </clipPath>
                          <g clipPath={`url(#clip_beaker_${container.id})`}>
                            <rect
                              x="15"
                              y={185 - fillRatio * 125}
                              width="70"
                              height={fillRatio * 125 + 10}
                              fill={analysis.liquidHex}
                              fillOpacity={analysis.liquidOpacity}
                            />
                            <ellipse
                              cx="50"
                              cy={185 - fillRatio * 125}
                              rx="35"
                              ry="6"
                              fill="#ffffff"
                              fillOpacity="0.35"
                            />
                            {analysis.precipitateHex && (
                              <rect
                                x="15"
                                y={185 - (analysis.precipitateHeight || 0.15) * 50}
                                width="70"
                                height="28"
                                fill={analysis.precipitateHex}
                                opacity="0.9"
                              />
                            )}
                            {analysis.hasGasBubbles && (
                              <g className="animate-pulse">
                                <circle cx="35" cy="170" r="3" fill="#ffffff" opacity="0.8">
                                  <animate attributeName="cy" values="180;85" dur="1.4s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="55" cy="165" r="4" fill="#ffffff" opacity="0.85">
                                  <animate attributeName="cy" values="180;85" dur="1.1s" begin="0.4s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="68" cy="175" r="2.5" fill="#ffffff" opacity="0.75">
                                  <animate attributeName="cy" values="180;85" dur="1.6s" begin="0.2s" repeatCount="indefinite" />
                                </circle>
                              </g>
                            )}
                          </g>
                        </g>
                      )}
                      {analysis.hasThermalMist && (
                        <g className="animate-pulse" opacity="0.75">
                          <path d="M 35 42 Q 26 24 38 6" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
                          <path d="M 50 42 Q 62 20 46 2" stroke="#ffffff" strokeWidth="3.2" fill="none" strokeLinecap="round" />
                          <path d="M 65 42 Q 56 24 68 6" stroke="#ffffff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                        </g>
                      )}
                      <path
                        d="M 10 46 L 15 50 L 15 175 A 10 10 0 0 0 25 185 L 75 185 A 10 10 0 0 0 85 175 L 85 50 L 88 48"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      />
                      <ellipse cx="50" cy="50" rx="35" ry="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
                      <path d="M 22 65 L 22 170" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                      {[75, 105, 135, 165].map((yMark, idx) => (
                        <g key={idx}>
                          <line x1="72" y1={yMark} x2="84" y2={yMark} stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
                          <text x="68" y={yMark + 3} textAnchor="end" fill="#ffffff" fontSize="8" fontWeight="bold" opacity="0.75">
                            {(4 - idx) * 25}
                          </text>
                        </g>
                      ))}
                    </g>
                  )}

                  {/* 3. BEAKER 250 mL (Centered at localX = 55, bottom at 196) */}
                  {container.type === 'beaker_250' && (
                    <g transform="translate(-5, 4)" filter="url(#shadowFilter)">
                      <ellipse cx="60" cy="192" rx="48" ry="9" fill="#000000" opacity="0.45" />
                      <path
                        d="M 12 35 L 12 180 A 12 12 0 0 0 24 192 L 96 192 A 12 12 0 0 0 108 180 L 108 35 Z"
                        fill="#0f172a"
                        fillOpacity="0.25"
                      />
                      {fillRatio > 0 && (
                        <g>
                          <clipPath id={`clip_beaker250_${container.id}`}>
                            <path d="M 12 35 L 12 180 A 12 12 0 0 0 24 192 L 96 192 A 12 12 0 0 0 108 180 L 108 35 Z" />
                          </clipPath>
                          <g clipPath={`url(#clip_beaker250_${container.id})`}>
                            <rect
                              x="12"
                              y={192 - fillRatio * 145}
                              width="96"
                              height={fillRatio * 145 + 10}
                              fill={analysis.liquidHex}
                              fillOpacity={analysis.liquidOpacity}
                            />
                            <ellipse
                              cx="60"
                              cy={192 - fillRatio * 145}
                              rx="48"
                              ry="8"
                              fill="#ffffff"
                              fillOpacity="0.4"
                            />
                            {analysis.precipitateHex && (
                              <rect
                                x="12"
                                y={192 - (analysis.precipitateHeight || 0.15) * 55}
                                width="96"
                                height="30"
                                fill={analysis.precipitateHex}
                                opacity="0.9"
                              />
                            )}
                            {analysis.hasGasBubbles && (
                              <g className="animate-pulse">
                                <circle cx="45" cy="175" r="3.5" fill="#ffffff" opacity="0.8">
                                  <animate attributeName="cy" values="185;70" dur="1.3s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="70" cy="170" r="4.5" fill="#ffffff" opacity="0.85">
                                  <animate attributeName="cy" values="185;70" dur="1.0s" begin="0.3s" repeatCount="indefinite" />
                                </circle>
                              </g>
                            )}
                          </g>
                        </g>
                      )}
                      {analysis.hasThermalMist && (
                        <g className="animate-pulse" opacity="0.75">
                          <path d="M 42 28 Q 34 14 44 0" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
                          <path d="M 60 28 Q 70 12 58 -2" stroke="#ffffff" strokeWidth="3.2" fill="none" strokeLinecap="round" />
                          <path d="M 78 28 Q 70 14 80 0" stroke="#ffffff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                        </g>
                      )}
                      <path
                        d="M 6 30 L 12 35 L 12 180 A 12 12 0 0 0 24 192 L 96 192 A 12 12 0 0 0 108 180 L 108 35 L 112 33"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2.8"
                      />
                      <ellipse cx="60" cy="35" rx="48" ry="7" fill="none" stroke="#94a3b8" strokeWidth="2.2" />
                      <path d="M 20 50 L 20 175" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" opacity="0.5" />
                      {[65, 95, 125, 155].map((yMark, idx) => (
                        <g key={idx}>
                          <line x1="94" y1={yMark} x2="106" y2={yMark} stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
                          <text x="90" y={yMark + 3} textAnchor="end" fill="#ffffff" fontSize="8" fontWeight="bold" opacity="0.75">
                            {(4 - idx) * 50}
                          </text>
                        </g>
                      ))}
                    </g>
                  )}

                  {/* 4. ERLENMEYER FLASK (Centered at localX = 55, bottom at 196) */}
                  {container.type === 'erlenmeyer' && (
                    <g transform="translate(0, 8)" filter="url(#shadowFilter)">
                      <ellipse cx="55" cy="188" rx="43" ry="8.5" fill="#000000" opacity="0.45" />
                      <path
                        d="M 45 25 L 45 60 L 15 175 A 10 10 0 0 0 25 185 L 85 185 A 10 10 0 0 0 95 175 L 65 60 L 65 25 Z"
                        fill="#0f172a"
                        fillOpacity="0.25"
                      />
                      {fillRatio > 0 && (
                        <g>
                          <clipPath id={`clip_erlen_${container.id}`}>
                            <path d="M 45 25 L 45 60 L 15 175 A 10 10 0 0 0 25 185 L 85 185 A 10 10 0 0 0 95 175 L 65 60 L 65 25 Z" />
                          </clipPath>
                          <g clipPath={`url(#clip_erlen_${container.id})`}>
                            <rect
                              x="10"
                              y={185 - fillRatio * 120}
                              width="90"
                              height={fillRatio * 120 + 20}
                              fill={analysis.liquidHex}
                              fillOpacity={analysis.liquidOpacity}
                            />
                            <ellipse
                              cx="55"
                              cy={185 - fillRatio * 120}
                              rx={25 + fillRatio * 18}
                              ry="6"
                              fill="#ffffff"
                              fillOpacity="0.35"
                            />
                            {analysis.precipitateHex && (
                              <rect
                                x="15"
                                y={185 - (analysis.precipitateHeight || 0.15) * 45}
                                width="80"
                                height="28"
                                fill={analysis.precipitateHex}
                                opacity="0.9"
                              />
                            )}
                            {analysis.hasGasBubbles && (
                              <g className="animate-pulse">
                                <circle cx="45" cy="170" r="3" fill="#ffffff" opacity="0.8">
                                  <animate attributeName="cy" values="180;75" dur="1.3s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="62" cy="165" r="3.5" fill="#ffffff" opacity="0.85">
                                  <animate attributeName="cy" values="180;75" dur="1.0s" begin="0.3s" repeatCount="indefinite" />
                                </circle>
                              </g>
                            )}
                          </g>
                        </g>
                      )}
                      {analysis.hasThermalMist && (
                        <g className="animate-pulse" opacity="0.75">
                          <path d="M 50 18 Q 45 6 54 -4" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 59 -30 Q 64 -40 56 -50" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </g>
                      )}
                      <path
                        d="M 45 25 L 45 60 L 15 175 A 10 10 0 0 0 25 185 L 85 185 A 10 10 0 0 0 95 175 L 65 60 L 65 25"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      />
                      <ellipse cx="55" cy="25" rx="12" ry="3.5" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 28 165 L 48 70" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                      {[105, 135, 162].map((yMark, idx) => (
                        <g key={idx}>
                          <line x1={68 + idx * 5} y1={yMark} x2={75 + idx * 6} y2={yMark} stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />
                        </g>
                      ))}
                    </g>
                  )}

                  {/* 5. ROUND-BOTTOM FLASK (Centered at localX = 55, bottom at 196) */}
                  {container.type === 'round_flask' && (
                    <g transform="translate(0, 6)" filter="url(#shadowFilter)">
                      <ellipse cx="55" cy="190" rx="35" ry="8" fill="#000000" opacity="0.45" />
                      <ellipse cx="55" cy="182" rx="26" ry="6" fill="#78350f" />
                      <ellipse cx="55" cy="180" rx="22" ry="5" fill="#451a03" />

                      <path
                        d="M 47 25 L 47 70 A 42 42 0 1 0 63 70 L 63 25 Z"
                        fill="#0f172a"
                        fillOpacity="0.25"
                      />
                      {fillRatio > 0 && (
                        <g>
                          <clipPath id={`clip_round_${container.id}`}>
                            <path d="M 47 25 L 47 70 A 42 42 0 1 0 63 70 L 63 25 Z" />
                          </clipPath>
                          <g clipPath={`url(#clip_round_${container.id})`}>
                            <rect
                              x="10"
                              y={180 - fillRatio * 110}
                              width="90"
                              height={fillRatio * 110 + 20}
                              fill={analysis.liquidHex}
                              fillOpacity={analysis.liquidOpacity}
                            />
                            {analysis.precipitateHex && (
                              <rect
                                x="15"
                                y={175 - (analysis.precipitateHeight || 0.15) * 40}
                                width="80"
                                height="28"
                                fill={analysis.precipitateHex}
                                opacity="0.9"
                              />
                            )}
                            {analysis.hasGasBubbles && (
                              <g className="animate-pulse">
                                <circle cx="48" cy="155" r="3" fill="#ffffff" opacity="0.8">
                                  <animate attributeName="cy" values="170;85" dur="1.3s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="62" cy="150" r="3.5" fill="#ffffff" opacity="0.85">
                                  <animate attributeName="cy" values="170;85" dur="1.1s" begin="0.4s" repeatCount="indefinite" />
                                </circle>
                              </g>
                            )}
                          </g>
                        </g>
                      )}
                      {analysis.hasThermalMist && (
                        <g className="animate-pulse" opacity="0.75">
                          <path d="M 51 18 Q 46 6 54 -4" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 59 -30 Q 64 -40 56 -50" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </g>
                      )}
                      <path
                        d="M 47 25 L 47 70 A 42 42 0 1 0 63 70 L 63 25"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      />
                      <ellipse cx="55" cy="25" rx="10" ry="3" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
                      <path d="M 26 115 Q 22 142 35 162" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
                    </g>
                  )}

                  {/* 6. ALCOHOL BURNER (Centered at localX = 55, bottom at 196) */}
                  {container.type === 'burner' && (
                    <g transform="translate(5, 8)" filter="url(#shadowFilter)">
                      <ellipse cx="50" cy="188" rx="38" ry="8.5" fill="#000000" opacity="0.45" />
                      <path
                        d="M 32 110 L 22 175 A 8 8 0 0 0 30 185 L 70 185 A 8 8 0 0 0 78 175 L 68 110 Z"
                        fill="#0284c7"
                        fillOpacity="0.35"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 26 145 L 23 175 A 7 7 0 0 0 30 183 L 70 183 A 7 7 0 0 0 77 175 L 74 145 Z"
                        fill="#38bdf8"
                        fillOpacity="0.5"
                      />
                      <rect x="42" y="98" width="16" height="12" rx="2" fill="#d97706" stroke="#b45309" strokeWidth="1" />
                      <line x1="50" y1="98" x2="50" y2="88" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

                      {container.isHeated ? (
                        <g className="animate-pulse">
                          <path d="M 50 25 Q 32 60 50 88 Q 68 60 50 25 Z" fill="url(#flameOuter)" opacity="0.9" />
                          <path d="M 50 55 Q 42 75 50 88 Q 58 75 50 55 Z" fill="url(#flameInner)" opacity="0.95" />
                          <circle cx="50" cy="55" r="28" fill="#f59e0b" opacity="0.16" />
                        </g>
                      ) : (
                        <path
                          d="M 44 98 L 44 86 Q 50 82 56 86 L 56 98 Z"
                          fill="#0284c7"
                          stroke="#0369a1"
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  )}

                  {/* Litmus Paper Strip Dipped Cleanly Through Vessel Mouth */}
                  {container.litmusTested && (
                    <g transform="translate(51, 26)">
                      <rect x="0" y="0" width="8" height="90" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
                      <rect x="0" y="50" width="8" height="40" rx="1" fill={container.litmusTested.color} />
                    </g>
                  )}
                </g>

                {/* TOP NON-OCCLUDING PARAMETER BADGES (Positioned cleanly ABOVE vessel rim) */}
                {container.type !== 'burner' ? (
                  <g transform="translate(0, -28)">
                    <rect
                      x="-2"
                      y="0"
                      width="54"
                      height="20"
                      rx="10"
                      fill="#0f172a"
                      fillOpacity="0.92"
                      stroke="#38bdf8"
                      strokeWidth="1.1"
                    />
                    <text
                      x="25"
                      y="13.5"
                      textAnchor="middle"
                      fill="#7dd3fc"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {analysis.totalVolume.toFixed(1)} mL
                    </text>

                    <rect
                      x="58"
                      y="0"
                      width="54"
                      height="20"
                      rx="10"
                      fill="#0f172a"
                      fillOpacity="0.92"
                      stroke="#eab308"
                      strokeWidth="1.1"
                    />
                    <text
                      x="85"
                      y="13.5"
                      textAnchor="middle"
                      fill="#fde047"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {analysis.temperatureCalc}°C
                    </text>
                  </g>
                ) : (
                  <g transform="translate(28, -28)">
                    <rect
                      x="0"
                      y="0"
                      width="54"
                      height="20"
                      rx="10"
                      fill="#0f172a"
                      fillOpacity="0.92"
                      stroke="#eab308"
                      strokeWidth="1.1"
                    />
                    <text
                      x="27"
                      y="13.5"
                      textAnchor="middle"
                      fill="#fde047"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {analysis.temperatureCalc}°C
                    </text>
                  </g>
                )}

                {/* BOTTOM NAMEPLATE BADGE (Centered below base on tabletop apron) */}
                <g transform="translate(-11, 214)">
                  <rect
                    x="0"
                    y="0"
                    width="132"
                    height="26"
                    rx="7"
                    fill="#0f172a"
                    fillOpacity="0.92"
                    stroke={isSelected ? '#14b8a6' : '#334155'}
                    strokeWidth={isSelected ? '2' : '1'}
                  />
                  <text
                    x="66"
                    y="17"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={container.name.length > 16 ? '10' : '11.5'}
                    fontWeight="bold"
                  >
                    {container.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Dynamic Pouring Stream Animation Centered on Active Apparatus Mouth (localX = 55) */}
          {isPouring && pouringReagent && activeContainer && (
            <g transform={`translate(${activeContainer.x}, ${activeContainer.y})`}>
              <g transform="translate(15, -86) rotate(-35, 40, 20)">
                <rect x="25" y="0" width="30" height="48" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="35" y="48" width="10" height="14" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
              </g>
              <path
                d="M 55 -30 L 55 120"
                stroke={hexToColorString(pouringReagent.defaultColor)}
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-pulse"
                opacity="0.9"
              />
              <circle cx="55" cy="18" r="3" fill="#ffffff" opacity="0.85" />
              <circle cx="55" cy="68" r="3.5" fill="#ffffff" opacity="0.85" />
              <ellipse
                cx="55"
                cy="120"
                rx="12"
                ry="3"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                className="animate-ping"
              />
            </g>
          )}
        </svg>
      </div>

      {/* ZONE 3: BOTTOM BENCH LEGEND & STATUS STRIP (Outside Canvas) */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Kéo thả dụng cụ trên bàn • Kéo nền hoặc cuộn chuột để di chuyển &amp; thu phóng</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
          {activeContainer && activeAnalysis ? (
            <span>
              V = {activeAnalysis.totalVolume.toFixed(1)}/{activeContainer.capacity} mL • T = {activeAnalysis.temperatureCalc}°C
            </span>
          ) : (
            <span>{containers.length} dụng cụ trên bàn</span>
          )}
        </div>
      </div>
    </div>
  );
};
