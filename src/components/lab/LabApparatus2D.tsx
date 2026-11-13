import React, { useState, useRef, useEffect } from 'react';
import {
  ApparatusInstance,
  ChemistryAnalysisResult,
  Reagent,
  hexToColorString
} from './labTypes';
import {
  Flame,
  Droplets,
  RotateCw,
  Trash2,
  Bookmark,
  Sparkles,
  Move,
  Layers,
  Thermometer
} from 'lucide-react';
import { ChemFormula } from '../common/ChemFormula';

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
  isPouring: boolean;
  pouringReagent: Reagent | null;
  analyses: Record<string, ChemistryAnalysisResult>;
}

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
  isPouring,
  pouringReagent,
  analyses,
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shakingId, setShakingId] = useState<string | null>(null);

  // Handle Drag Start
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    onSelectContainer(id);
    const container = containers.find((c) => c.id === id);
    if (!container || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    setDraggingId(id);
    setDragOffset({
      x: clientX - container.x,
      y: clientY - container.y,
    });
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  // Handle Drag Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const newX = Math.max(50, Math.min(rect.width - 100, clientX - dragOffset.x));
    const newY = Math.max(80, Math.min(rect.height - 100, clientY - dragOffset.y));

    onUpdateContainerPosition(draggingId, newX, newY);
  };

  // Handle Drag End
  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      setDraggingId(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Shake trigger animation wrapper
  const triggerShake = (id: string) => {
    setShakingId(id);
    onShakeContainer(id);
    setTimeout(() => {
      setShakingId(null);
    }, 1200);
  };

  return (
    <div className="relative w-full h-[520px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-inner select-none border border-slate-700">
      {/* Background Grid & Laboratory Wall Details */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Lab Benchtop Surface (Bàn thực hành Hóa học) */}
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 border-t-4 border-slate-600/80 shadow-2xl">
        {/* Table Top Surface Highlight */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500/30 via-sky-400/50 to-teal-500/30 shadow-xs" />
        <div className="flex items-center justify-between px-6 py-2 text-slate-400 text-xs font-semibold tracking-wider uppercase">
          <span>Bàn thực hành Hóa học 2D • Kéo thả dụng cụ tự do</span>
          <span>Thước đo thể tích & Bảng kiểm soát trực tiếp</span>
        </div>
      </div>

      {/* SVG Canvas for High-Precision Glassware & Chemical Reactions */}
      <svg
        ref={canvasRef}
        className="w-full h-full cursor-default"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          {/* Glass reflection gradient */}
          <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>

          {/* Meniscus curvature filter */}
          <linearGradient id="meniscusGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
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
          <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
          </filter>

          {/* Glowing ring for active selection */}
          <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.08  0 0 0 0 0.7  0 0 0 0 0.6  0 0 0 0.8 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Empty State Help Guide if no apparatus on bench */}
        {containers.length === 0 && (
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="18"
            fontWeight="bold"
            className="animate-pulse"
          >
            Bàn thí nghiệm đang trống. Chọn dụng cụ từ Khay dụng cụ bên dưới để bắt đầu!
          </text>
        )}

        {/* Render each apparatus on workbench */}
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
              onPointerDown={(e) => handlePointerDown(e, container.id)}
            >
              {/* Active Selection Glow Ring */}
              {isSelected && (
                <ellipse
                  cx="50"
                  cy="200"
                  rx="60"
                  ry="16"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-spin"
                  style={{ transformOrigin: '50px 200px', animationDuration: '8s' }}
                />
              )}

              {/* Shaking Wobble Group */}
              <g className={isCurrentShaking ? 'animate-bounce' : ''}>
                {/* 1. APPARATUS TYPE SPECIFIC SVG GRAPHICS */}
                {container.type === 'test_tube' && (
                  <g filter="url(#shadowFilter)">
                    {/* Shadow on table */}
                    <ellipse cx="40" cy="195" rx="22" ry="7" fill="#000000" opacity="0.4" />

                    {/* Tube Wooden Rack Peg (if standing) */}
                    <rect x="26" y="145" width="28" height="52" rx="3" fill="#b45309" opacity="0.75" />
                    <rect x="18" y="190" width="44" height="8" rx="2" fill="#78350f" />

                    {/* Glass Body (W: 32, H: 170) */}
                    <path
                      d="M 24 20 L 24 165 A 16 16 0 0 0 56 165 L 56 20 Z"
                      fill="#0f172a"
                      fillOpacity="0.25"
                    />

                    {/* Liquid Fill if volume > 0 */}
                    {fillRatio > 0 && (
                      <g>
                        {/* Dynamic Liquid Height */}
                        <clipPath id={`clip_tube_${container.id}`}>
                          <path d="M 24 20 L 24 165 A 16 16 0 0 0 56 165 L 56 20 Z" />
                        </clipPath>
                        <g clipPath={`url(#clip_tube_${container.id})`}>
                          {/* Liquid Rectangle */}
                          <rect
                            x="24"
                            y={180 - fillRatio * 150}
                            width="32"
                            height={fillRatio * 150 + 20}
                            fill={analysis.liquidHex}
                            fillOpacity={analysis.liquidOpacity}
                          />

                          {/* Meniscus Curve at liquid surface */}
                          <ellipse
                            cx="40"
                            cy={180 - fillRatio * 150}
                            rx="16"
                            ry="4"
                            fill="#ffffff"
                            fillOpacity="0.45"
                          />

                          {/* Precipitate at bottom */}
                          {analysis.precipitateHex && (
                            <path
                              d="M 24 162 A 16 16 0 0 0 56 162 Z"
                              fill={analysis.precipitateHex}
                              opacity="0.95"
                            />
                          )}

                          {/* Gas Bubbles Animation */}
                          {analysis.hasGasBubbles && (
                            <g className="animate-pulse">
                              <circle cx="34" cy="160" r="2.5" fill="#ffffff" opacity="0.8">
                                <animate
                                  attributeName="cy"
                                  values="165;60"
                                  dur="1.2s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                              <circle cx="44" cy="155" r="3.2" fill="#ffffff" opacity="0.85">
                                <animate
                                  attributeName="cy"
                                  values="165;60"
                                  dur="1.5s"
                                  begin="0.3s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                              <circle cx="38" cy="162" r="2" fill="#ffffff" opacity="0.75">
                                <animate
                                  attributeName="cy"
                                  values="165;60"
                                  dur="0.9s"
                                  begin="0.6s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            </g>
                          )}
                        </g>
                      </g>
                    )}

                    {/* Thermal Mist rising above mouth */}
                    {analysis.hasThermalMist && (
                      <g className="animate-pulse" opacity="0.8">
                        <path
                          d="M 32 15 Q 26 0 34 -15 T 32 -30"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                        <path
                          d="M 40 15 Q 46 0 38 -15 T 44 -35"
                          stroke="#ffffff"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          opacity="0.8"
                        />
                        <path
                          d="M 48 15 Q 42 0 50 -15 T 46 -30"
                          stroke="#ffffff"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          opacity="0.6"
                        />
                      </g>
                    )}

                    {/* Glass Outline & Highlights */}
                    <path
                      d="M 24 20 L 24 165 A 16 16 0 0 0 56 165 L 56 20"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                    {/* Flanged Lip / Rim */}
                    <ellipse cx="40" cy="20" rx="19" ry="4" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
                    {/* Glass Reflection Highlight */}
                    <path d="M 28 30 L 28 155" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

                    {/* Graduation Marks (5, 10, 15, 20 mL) */}
                    {[50, 80, 110, 140].map((yMark, idx) => (
                      <line
                        key={idx}
                        x1="50"
                        y1={yMark}
                        x2="56"
                        y2={yMark}
                        stroke="#e2e8f0"
                        strokeWidth="1.2"
                        opacity="0.7"
                      />
                    ))}
                  </g>
                )}

                {/* 2. BEAKER 100 mL */}
                {container.type === 'beaker_100' && (
                  <g filter="url(#shadowFilter)">
                    {/* Shadow */}
                    <ellipse cx="50" cy="188" rx="42" ry="10" fill="#000000" opacity="0.4" />

                    {/* Glass Wall Background */}
                    <path
                      d="M 15 50 L 15 175 A 10 10 0 0 0 25 185 L 75 185 A 10 10 0 0 0 85 175 L 85 50 Z"
                      fill="#0f172a"
                      fillOpacity="0.25"
                    />

                    {/* Liquid Fill */}
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
                          {/* Liquid Surface Meniscus */}
                          <ellipse
                            cx="50"
                            cy={185 - fillRatio * 125}
                            rx="35"
                            ry="6"
                            fill="#ffffff"
                            fillOpacity="0.35"
                          />
                          {/* Precipitate layer */}
                          {analysis.precipitateHex && (
                            <rect
                              x="15"
                              y={185 - (analysis.precipitateHeight || 0.15) * 50}
                              width="70"
                              height="25"
                              fill={analysis.precipitateHex}
                              opacity="0.9"
                            />
                          )}
                          {/* Bubbles */}
                          {analysis.hasGasBubbles && (
                            <g className="animate-pulse">
                              <circle cx="35" cy="170" r="3" fill="#ffffff" opacity="0.8">
                                <animate
                                  attributeName="cy"
                                  values="180;90"
                                  dur="1.4s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                              <circle cx="55" cy="165" r="4" fill="#ffffff" opacity="0.85">
                                <animate
                                  attributeName="cy"
                                  values="180;90"
                                  dur="1.1s"
                                  begin="0.4s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                              <circle cx="68" cy="175" r="2.5" fill="#ffffff" opacity="0.75">
                                <animate
                                  attributeName="cy"
                                  values="180;90"
                                  dur="1.6s"
                                  begin="0.2s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            </g>
                          )}
                        </g>
                      </g>
                    )}

                    {/* Thermal Mist */}
                    {analysis.hasThermalMist && (
                      <g className="animate-pulse" opacity="0.8">
                        <path
                          d="M 35 45 Q 25 20 40 -5 T 35 -30"
                          stroke="#ffffff"
                          strokeWidth="3.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 50 45 Q 65 20 45 -10 T 55 -35"
                          stroke="#ffffff"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 65 45 Q 55 20 70 -5 T 60 -30"
                          stroke="#ffffff"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Glass Outline & Spout */}
                    <path
                      d="M 10 46 L 15 50 L 15 175 A 10 10 0 0 0 25 185 L 75 185 A 10 10 0 0 0 85 175 L 85 50 L 88 48"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2.5"
                    />
                    {/* Top Rim Ellipse */}
                    <ellipse cx="50" cy="50" rx="35" ry="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
                    {/* Reflection */}
                    <path d="M 22 65 L 22 170" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

                    {/* Graduations (25, 50, 75, 100 mL) */}
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

                {/* 3. BEAKER 250 mL */}
                {container.type === 'beaker_250' && (
                  <g filter="url(#shadowFilter)">
                    <ellipse cx="60" cy="192" rx="52" ry="12" fill="#000000" opacity="0.4" />
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
                    {/* Outline & Spout */}
                    <path
                      d="M 6 30 L 12 35 L 12 180 A 12 12 0 0 0 24 192 L 96 192 A 12 12 0 0 0 108 180 L 108 35 L 112 33"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="3"
                    />
                    <ellipse cx="60" cy="35" rx="48" ry="7" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
                    <path d="M 20 50 L 20 175" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
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

                {/* 4. ERLENMEYER FLASK (Bình tam giác) */}
                {container.type === 'erlenmeyer' && (
                  <g filter="url(#shadowFilter)">
                    <ellipse cx="55" cy="190" rx="46" ry="11" fill="#000000" opacity="0.4" />
                    {/* Conical Flask Path */}
                    <path
                      d="M 45 25 L 45 60 L 15 175 A 10 10 0 0 0 25 185 L 85 185 A 10 10 0 0 0 95 175 L 65 60 L 65 25 Z"
                      fill="#0f172a"
                      fillOpacity="0.25"
                    />
                    {/* Liquid fill */}
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
                              height="25"
                              fill={analysis.precipitateHex}
                              opacity="0.9"
                            />
                          )}
                        </g>
                      </g>
                    )}
                    {/* Outline */}
                    <path
                      d="M 45 25 L 45 60 L 15 175 A 10 10 0 0 0 25 185 L 85 185 A 10 10 0 0 0 95 175 L 65 60 L 65 25"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2.5"
                    />
                    <ellipse cx="55" cy="25" rx="12" ry="3.5" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
                    <path d="M 28 165 L 48 70" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                  </g>
                )}

                {/* 5. ROUND-BOTTOM FLASK (Bình cầu) */}
                {container.type === 'round_flask' && (
                  <g filter="url(#shadowFilter)">
                    <ellipse cx="55" cy="192" rx="35" ry="9" fill="#000000" opacity="0.4" />
                    {/* Cork ring stand */}
                    <ellipse cx="55" cy="182" rx="26" ry="6" fill="#78350f" />
                    <ellipse cx="55" cy="180" rx="22" ry="5" fill="#451a03" />

                    {/* Spherical Flask */}
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
                        </g>
                      </g>
                    )}
                    <path
                      d="M 47 25 L 47 70 A 42 42 0 1 0 63 70 L 63 25"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2.5"
                    />
                    <ellipse cx="55" cy="25" rx="10" ry="3" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
                  </g>
                )}

                {/* 6. ALCOHOL BURNER (Đèn cồn đun nóng) */}
                {container.type === 'burner' && (
                  <g filter="url(#shadowFilter)">
                    {/* Table Shadow */}
                    <ellipse cx="50" cy="190" rx="38" ry="10" fill="#000000" opacity="0.45" />

                    {/* Glass Burner Reservoir */}
                    <path
                      d="M 32 110 L 22 175 A 8 8 0 0 0 30 185 L 70 185 A 8 8 0 0 0 78 175 L 68 110 Z"
                      fill="#0284c7"
                      fillOpacity="0.35"
                      stroke="#94a3b8"
                      strokeWidth="2.5"
                    />
                    {/* Ethanol fuel inside */}
                    <path
                      d="M 26 145 L 23 175 A 7 7 0 0 0 30 183 L 70 183 A 7 7 0 0 0 77 175 L 74 145 Z"
                      fill="#38bdf8"
                      fillOpacity="0.5"
                    />

                    {/* Brass Wick Collar */}
                    <rect x="42" y="98" width="16" height="12" rx="2" fill="#d97706" stroke="#b45309" strokeWidth="1" />
                    {/* Ceramic Wick */}
                    <line x1="50" y1="98" x2="50" y2="88" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

                    {/* Animated Flame (When Turned On) */}
                    {container.isHeated ? (
                      <g className="animate-pulse">
                        {/* Outer Luminous Flame */}
                        <path
                          d="M 50 25 Q 32 60 50 88 Q 68 60 50 25 Z"
                          fill="url(#flameOuter)"
                          opacity="0.9"
                        />
                        {/* Inner Blue Cone */}
                        <path
                          d="M 50 55 Q 42 75 50 88 Q 58 75 50 55 Z"
                          fill="url(#flameInner)"
                          opacity="0.95"
                        />
                        {/* Heat Shimmer Aura */}
                        <circle cx="50" cy="55" r="30" fill="#f59e0b" opacity="0.15" />
                      </g>
                    ) : (
                      /* Extinguished Wick Cap / Inactive */
                      <path
                        d="M 44 98 L 44 86 Q 50 82 56 86 L 56 98 Z"
                        fill="#0284c7"
                        stroke="#0369a1"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                )}

                {/* Litmus Paper Dipped Indicator */}
                {container.litmusTested && (
                  <g transform="translate(18, 30)">
                    {/* Paper strip dipped */}
                    <rect x="0" y="0" width="8" height="90" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
                    {/* Reactive tip */}
                    <rect
                      x="0"
                      y="50"
                      width="8"
                      height="40"
                      rx="1"
                      fill={container.litmusTested.color}
                    />
                  </g>
                )}
              </g>

              {/* 2. APPARATUS LABELS & REAL-TIME TEMPERATURE BADGE */}
              <g transform="translate(0, 205)">
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="26"
                  rx="6"
                  fill="#0f172a"
                  fillOpacity="0.85"
                  stroke={isSelected ? '#14b8a6' : '#334155'}
                  strokeWidth={isSelected ? '2' : '1'}
                />
                <text
                  x="50"
                  y="17"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {container.name}
                </text>
              </g>

              {/* Real-time Temperature badge */}
              <g transform="translate(68, 15)">
                <rect x="0" y="0" width="46" height="20" rx="10" fill="#1e293b" stroke="#eab308" strokeWidth="1.2" />
                <text x="23" y="14" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  {analysis.temperatureCalc}°C
                </text>
              </g>

              {/* Volume text indicator */}
              {container.type !== 'burner' && (
                <g transform="translate(-10, 15)">
                  <rect x="0" y="0" width="42" height="20" rx="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                  <text x="21" y="14" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="bold">
                    {analysis.totalVolume.toFixed(1)} ml
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 3. DYNAMIC POURING STREAM ANIMATION */}
        {isPouring && pouringReagent && (
          <g transform={`translate(${containers.find((c) => c.id === activeContainerId)?.x || 200}, ${(containers.find((c) => c.id === activeContainerId)?.y || 150) - 80})`}>
            {/* Tilted Reagent Dropper / Bottle */}
            <g transform="rotate(-35, 40, 20)">
              <rect x="25" y="0" width="30" height="50" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="35" y="50" width="10" height="15" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            </g>

            {/* Pouring Liquid Stream */}
            <path
              d="M 50 35 L 50 115"
              stroke={hexToColorString(pouringReagent.defaultColor)}
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
              opacity="0.9"
            />
            {/* Dripping Droplets */}
            <circle cx="50" cy="65" r="3" fill="#ffffff" opacity="0.8" />
            <circle cx="50" cy="95" r="3.5" fill="#ffffff" opacity="0.85" />
            {/* Liquid Surface Splash Rings */}
            <ellipse
              cx="50"
              cy="115"
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

      {/* Floating Action Bar for Selected Apparatus (Gắn liền trên bàn thực hành) */}
      {activeContainerId && containers.some((c) => c.id === activeContainerId) && (
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <span className="text-[15px] font-black text-teal-300">
              Đang chọn: {containers.find((c) => c.id === activeContainerId)?.name}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Shake Button */}
            <button
              onClick={() => triggerShake(activeContainerId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all shadow-xs"
              title="Lắc nhẹ và đảo đều hóa chất"
            >
              <RotateCw className="w-3.5 h-3.5 text-teal-400" />
              <span>Lắc nhẹ</span>
            </button>

            {/* Heat Toggle Button */}
            <button
              onClick={() => onToggleHeater(activeContainerId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shadow-xs ${
                containers.find((c) => c.id === activeContainerId)?.isHeated
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
              }`}
              title="Thắp đèn cồn đun nóng hoặc tắt lửa"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {containers.find((c) => c.id === activeContainerId)?.isHeated ? 'Tắt đun nóng' : 'Đun đèn cồn'}
              </span>
            </button>

            {/* Litmus Dip Button */}
            <button
              onClick={() => onDipLitmus(activeContainerId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all shadow-xs"
              title="Nhúng giấy quỳ tím vào dung dịch"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>Thử quỳ tím</span>
            </button>

            {/* Wash / Clean Button */}
            <button
              onClick={() => onWashContainer(activeContainerId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all shadow-xs"
              title="Rửa sạch hóa chất trong dụng cụ"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Rửa sạch</span>
            </button>

            {/* Remove / Delete Button */}
            <button
              onClick={() => onRemoveContainer(activeContainerId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700 rounded-lg text-xs font-bold transition-all shadow-xs"
              title="Xóa dụng cụ này khỏi bàn thực hành"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Xóa dụng cụ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
