import React, { useMemo, useRef, useState } from 'react';
import {
  OrganicAtom,
  OrganicBond,
  OrganicStructureGraph,
  organicGraphToSvg,
} from '../../utils/chemSyntax';
import {
  Check,
  Eraser,
  Hexagon,
  Move,
  Plus,
  Redo2,
  RotateCw,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';

interface OrganicStructure2DEditorProps {
  initialGraph?: OrganicStructureGraph | null;
  initialLabel?: string;
  isEditingExisting?: boolean;
  onConfirm: (label: string, graph: OrganicStructureGraph) => void;
  onCancel: () => void;
}

type ToolMode = 'select' | 'atom' | 'bond1' | 'bond2' | 'bond3' | 'benzene' | 'cyclohexane' | 'erase';

const ATOM_PALETTE = ['C', 'H', 'O', 'N', 'Cl', 'Br', 'S', 'OH', 'CHO', 'COOH', 'NH2', 'CH3'];

const SAMPLE_TEMPLATES: { id: string; label: string; graph: OrganicStructureGraph }[] = [
  {
    id: 'benzene',
    label: 'Benzen (C₆H₆)',
    graph: buildRingGraph(190, 120, 44, true),
  },
  {
    id: 'phenol',
    label: 'Phenol (C₆H₅OH)',
    graph: (() => {
      const g = buildRingGraph(180, 125, 44, true);
      const topAtom = g.atoms[0];
      g.atoms.push({ id: 'a_oh', x: topAtom.x, y: topAtom.y - 46, element: 'OH' });
      g.bonds.push({ id: 'b_oh', from: topAtom.id, to: 'a_oh', order: 1 });
      return g;
    })(),
  },
  {
    id: 'acetic',
    label: 'Acetic acid (CH₃-COOH)',
    graph: {
      atoms: [
        { id: 'c1', x: 110, y: 130, element: 'CH3' },
        { id: 'c2', x: 175, y: 130, element: 'C' },
        { id: 'o1', x: 215, y: 88, element: 'O' },
        { id: 'oh', x: 225, y: 168, element: 'OH' },
      ],
      bonds: [
        { id: 'b1', from: 'c1', to: 'c2', order: 1 },
        { id: 'b2', from: 'c2', to: 'o1', order: 2 },
        { id: 'b3', from: 'c2', to: 'oh', order: 1 },
      ],
    },
  },
  {
    id: 'ethanol',
    label: 'Ethanol (CH₃-CH₂-OH)',
    graph: {
      atoms: [
        { id: 'c1', x: 105, y: 135, element: 'CH3' },
        { id: 'c2', x: 165, y: 105, element: 'C' },
        { id: 'oh', x: 225, y: 135, element: 'OH' },
      ],
      bonds: [
        { id: 'b1', from: 'c1', to: 'c2', order: 1 },
        { id: 'b2', from: 'c2', to: 'oh', order: 1 },
      ],
    },
  },
  {
    id: 'ethylene',
    label: 'Etilen (CH₂=CH₂)',
    graph: {
      atoms: [
        { id: 'c1', x: 135, y: 125, element: 'C' },
        { id: 'c2', x: 205, y: 125, element: 'C' },
      ],
      bonds: [{ id: 'b1', from: 'c1', to: 'c2', order: 2 }],
    },
  },
  {
    id: 'acetylene',
    label: 'Axetilen (CH≡CH)',
    graph: {
      atoms: [
        { id: 'c1', x: 135, y: 125, element: 'C' },
        { id: 'c2', x: 205, y: 125, element: 'C' },
      ],
      bonds: [{ id: 'b1', from: 'c1', to: 'c2', order: 3 }],
    },
  },
];

function buildRingGraph(cx: number, cy: number, r: number, aromatic: boolean): OrganicStructureGraph {
  const ts = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const atoms: OrganicAtom[] = [];
  const bonds: OrganicBond[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    atoms.push({
      id: `r_${ts}_${i}`,
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
      element: 'C',
    });
  }
  for (let i = 0; i < 6; i++) {
    bonds.push({
      id: `rb_${ts}_${i}`,
      from: atoms[i].id,
      to: atoms[(i + 1) % 6].id,
      order: aromatic && i % 2 === 0 ? 2 : 1,
    });
  }
  return { atoms, bonds };
}

export const OrganicStructure2DEditor: React.FC<OrganicStructure2DEditorProps> = ({
  initialGraph,
  initialLabel = 'Cấu tạo hữu cơ 2D',
  isEditingExisting = false,
  onConfirm,
  onCancel,
}) => {
  const defaultGraph: OrganicStructureGraph = initialGraph?.atoms?.length
    ? JSON.parse(JSON.stringify(initialGraph))
    : JSON.parse(JSON.stringify(SAMPLE_TEMPLATES[0].graph));

  const [graph, setGraph] = useState<OrganicStructureGraph>(defaultGraph);
  const [label, setLabel] = useState<string>(initialLabel || 'Cấu tạo hữu cơ 2D');
  const [history, setHistory] = useState<OrganicStructureGraph[]>([defaultGraph]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  const [tool, setTool] = useState<ToolMode>('bond1');
  const [activeElement, setActiveElement] = useState<string>('C');
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [draggingAtomId, setDraggingAtomId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const commitGraph = (next: OrganicStructureGraph) => {
    const snapshot = JSON.parse(JSON.stringify(next)) as OrganicStructureGraph;
    const trimmed = history.slice(0, historyIdx + 1);
    trimmed.push(snapshot);
    setHistory(trimmed);
    setHistoryIdx(trimmed.length - 1);
    setGraph(snapshot);
  };

  const handleUndo = () => {
    if (historyIdx <= 0) return;
    const prevIdx = historyIdx - 1;
    setHistoryIdx(prevIdx);
    setGraph(JSON.parse(JSON.stringify(history[prevIdx])));
    setSelectedAtomId(null);
  };

  const handleRedo = () => {
    if (historyIdx >= history.length - 1) return;
    const nextIdx = historyIdx + 1;
    setHistoryIdx(nextIdx);
    setGraph(JSON.parse(JSON.stringify(history[nextIdx])));
    setSelectedAtomId(null);
  };

  const getSvgPoint = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 180, y: 120 };
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 420);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 240);
    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target !== svgRef.current && (e.target as Element).tagName !== 'rect') {
      // Check if background grid rect
      if ((e.target as Element).getAttribute('data-bg') !== 'true') return;
    }

    const pt = getSvgPoint(e);

    if (tool === 'benzene' || tool === 'cyclohexane') {
      const ring = buildRingGraph(pt.x, pt.y, 42, tool === 'benzene');
      commitGraph({
        atoms: [...graph.atoms, ...ring.atoms],
        bonds: [...graph.bonds, ...ring.bonds],
      });
      setSelectedAtomId(null);
      return;
    }

    if (tool === 'atom' || tool === 'bond1' || tool === 'bond2' || tool === 'bond3') {
      const newAtom: OrganicAtom = {
        id: `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        x: pt.x,
        y: pt.y,
        element: activeElement,
      };
      const nextBonds = [...graph.bonds];
      if (selectedAtomId && tool !== 'atom') {
        const order = tool === 'bond2' ? 2 : tool === 'bond3' ? 3 : 1;
        nextBonds.push({
          id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
          from: selectedAtomId,
          to: newAtom.id,
          order,
        });
      }
      commitGraph({
        atoms: [...graph.atoms, newAtom],
        bonds: nextBonds,
      });
      setSelectedAtomId(newAtom.id);
    } else {
      setSelectedAtomId(null);
    }
  };

  const handleAtomClick = (e: React.MouseEvent, atom: OrganicAtom) => {
    e.stopPropagation();

    if (tool === 'erase') {
      commitGraph({
        atoms: graph.atoms.filter((a) => a.id !== atom.id),
        bonds: graph.bonds.filter((b) => b.from !== atom.id && b.to !== atom.id),
      });
      if (selectedAtomId === atom.id) setSelectedAtomId(null);
      return;
    }

    if (tool === 'atom') {
      commitGraph({
        ...graph,
        atoms: graph.atoms.map((a) => (a.id === atom.id ? { ...a, element: activeElement } : a)),
      });
      setSelectedAtomId(atom.id);
      return;
    }

    if (tool === 'bond1' || tool === 'bond2' || tool === 'bond3') {
      const order: 1 | 2 | 3 = tool === 'bond2' ? 2 : tool === 'bond3' ? 3 : 1;
      if (!selectedAtomId || selectedAtomId === atom.id) {
        setSelectedAtomId(atom.id);
        return;
      }
      const existingIdx = graph.bonds.findIndex(
        (b) =>
          (b.from === selectedAtomId && b.to === atom.id) ||
          (b.from === atom.id && b.to === selectedAtomId)
      );
      if (existingIdx >= 0) {
        const nextBonds = graph.bonds.map((b, idx) =>
          idx === existingIdx ? { ...b, order } : b
        );
        commitGraph({ ...graph, bonds: nextBonds });
      } else {
        commitGraph({
          ...graph,
          bonds: [
            ...graph.bonds,
            {
              id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
              from: selectedAtomId,
              to: atom.id,
              order,
            },
          ],
        });
      }
      setSelectedAtomId(atom.id);
      return;
    }

    setSelectedAtomId(atom.id);
  };

  const handleBondClick = (e: React.MouseEvent, bond: OrganicBond) => {
    e.stopPropagation();
    if (tool === 'erase') {
      commitGraph({
        ...graph,
        bonds: graph.bonds.filter((b) => b.id !== bond.id),
      });
      return;
    }
    // Cycle bond order 1 -> 2 -> 3 -> 1 on click
    const nextOrder = ((bond.order % 3) + 1) as 1 | 2 | 3;
    commitGraph({
      ...graph,
      bonds: graph.bonds.map((b) => (b.id === bond.id ? { ...b, order: nextOrder } : b)),
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingAtomId || tool !== 'select') return;
    const pt = getSvgPoint(e);
    setGraph((prev) => ({
      ...prev,
      atoms: prev.atoms.map((a) => (a.id === draggingAtomId ? { ...a, x: pt.x, y: pt.y } : a)),
    }));
  };

  const handleMouseUp = () => {
    if (draggingAtomId) {
      commitGraph(graph);
      setDraggingAtomId(null);
    }
  };

  const handleRotate30 = () => {
    if (graph.atoms.length === 0) return;
    const cx = graph.atoms.reduce((s, a) => s + a.x, 0) / graph.atoms.length;
    const cy = graph.atoms.reduce((s, a) => s + a.y, 0) / graph.atoms.length;
    const rad = Math.PI / 6;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    commitGraph({
      ...graph,
      atoms: graph.atoms.map((a) => ({
        ...a,
        x: Math.round(cx + (a.x - cx) * cos - (a.y - cy) * sin),
        y: Math.round(cy + (a.x - cx) * sin + (a.y - cy) * cos),
      })),
    });
  };

  const previewSvg = useMemo(() => organicGraphToSvg(graph, { compact: true }), [graph]);

  const atomMap: Record<string, OrganicAtom> = {};
  graph.atoms.forEach((a) => (atomMap[a.id] = a));

  return (
    <div className="bg-slate-50 border border-teal-300 rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div>
          <span className="text-sm font-black text-teal-900 block">
            Trình Vẽ Công Thức Cấu Tạo Hữu Cơ 2D Trực Quan
          </span>
          <span className="text-xs text-slate-600">
            Nhấp lên vùng vẽ để thêm nguyên tử / nối liên kết; nhấp lên liên kết để đổi đơn ⇄ đôi ⇄ ba.
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIdx <= 0}
            className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg disabled:opacity-40 flex items-center gap-1"
            title="Hoàn tác"
          >
            <Undo2 className="w-3.5 h-3.5" /> Hoàn tác
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIdx >= history.length - 1}
            className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg disabled:opacity-40 flex items-center gap-1"
            title="Làm lại"
          >
            <Redo2 className="w-3.5 h-3.5" /> Làm lại
          </button>
          <button
            type="button"
            onClick={handleRotate30}
            className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg flex items-center gap-1"
            title="Xoay 30°"
          >
            <RotateCw className="w-3.5 h-3.5" /> Xoay
          </button>
          <button
            type="button"
            onClick={() => commitGraph({ atoms: [], bonds: [] })}
            className="px-2.5 py-1.5 text-xs font-bold bg-white border border-rose-200 text-rose-700 rounded-lg flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa hết
          </button>
        </div>
      </div>

      {/* Quick Preset Templates */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold text-slate-600 mr-1">Mẫu cấu tạo nhanh:</span>
        {SAMPLE_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => {
              commitGraph(tpl.graph);
              setLabel(tpl.label);
              setSelectedAtomId(null);
            }}
            className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-teal-50 border border-slate-300 text-slate-700 rounded-lg"
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {/* Tools + Atom selector */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
        {[
          { id: 'select' as ToolMode, label: 'Kéo vị trí', icon: <Move className="w-3.5 h-3.5" /> },
          { id: 'atom' as ToolMode, label: 'Đặt/Đổi nguyên tử', icon: <Plus className="w-3.5 h-3.5" /> },
          { id: 'bond1' as ToolMode, label: 'Liên kết đơn (-)' },
          { id: 'bond2' as ToolMode, label: 'Liên kết đôi (=)' },
          { id: 'bond3' as ToolMode, label: 'Liên kết ba (≡)' },
          { id: 'benzene' as ToolMode, label: 'Vòng Benzene', icon: <Hexagon className="w-3.5 h-3.5" /> },
          { id: 'cyclohexane' as ToolMode, label: 'Vòng Cyclohexan', icon: <Hexagon className="w-3.5 h-3.5" /> },
          { id: 'erase' as ToolMode, label: 'Xóa điểm/nét', icon: <Eraser className="w-3.5 h-3.5" /> },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTool(item.id)}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1 whitespace-nowrap ${
              tool === item.id
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold text-slate-600 mr-1">Nguyên tử / Nhóm chức đang chọn:</span>
        {ATOM_PALETTE.map((el) => (
          <button
            key={el}
            type="button"
            onClick={() => {
              setActiveElement(el);
              if (selectedAtomId && tool === 'atom') {
                commitGraph({
                  ...graph,
                  atoms: graph.atoms.map((a) => (a.id === selectedAtomId ? { ...a, element: el } : a)),
                });
              }
            }}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${
              activeElement === el
                ? 'bg-teal-600 text-white border-teal-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {el}
          </button>
        ))}
      </div>

      {/* Canvas + Preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 bg-white border border-slate-300 rounded-xl overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 420 240"
            className="w-full h-56 cursor-crosshair select-none touch-none"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <rect data-bg="true" x="0" y="0" width="420" height="240" fill="#ffffff" />
            {/* Subtle dot grid */}
            <defs>
              <pattern id="chem2d-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="0.8" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect data-bg="true" x="0" y="0" width="420" height="240" fill="url(#chem2d-grid)" />

            {/* Bonds */}
            {graph.bonds.map((b) => {
              const a1 = atomMap[b.from];
              const a2 = atomMap[b.to];
              if (!a1 || !a2) return null;
              const dx = a2.x - a1.x;
              const dy = a2.y - a1.y;
              const len = Math.hypot(dx, dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;
              return (
                <g
                  key={b.id}
                  onClick={(e) => handleBondClick(e, b)}
                  className="cursor-pointer"
                >
                  <line
                    x1={a1.x}
                    y1={a1.y}
                    x2={a2.x}
                    y2={a2.y}
                    stroke="transparent"
                    strokeWidth="12"
                  />
                  {b.order === 1 && (
                    <line
                      x1={a1.x}
                      y1={a1.y}
                      x2={a2.x}
                      y2={a2.y}
                      stroke="#1e293b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}
                  {b.order === 2 && (
                    <>
                      <line
                        x1={a1.x + nx * 3.5}
                        y1={a1.y + ny * 3.5}
                        x2={a2.x + nx * 3.5}
                        y2={a2.y + ny * 3.5}
                        stroke="#1e293b"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <line
                        x1={a1.x - nx * 3.5}
                        y1={a1.y - ny * 3.5}
                        x2={a2.x - nx * 3.5}
                        y2={a2.y - ny * 3.5}
                        stroke="#1e293b"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                  {b.order === 3 && (
                    <>
                      <line
                        x1={a1.x}
                        y1={a1.y}
                        x2={a2.x}
                        y2={a2.y}
                        stroke="#1e293b"
                        strokeWidth="2"
                      />
                      <line
                        x1={a1.x + nx * 4.5}
                        y1={a1.y + ny * 4.5}
                        x2={a2.x + nx * 4.5}
                        y2={a2.y + ny * 4.5}
                        stroke="#1e293b"
                        strokeWidth="2"
                      />
                      <line
                        x1={a1.x - nx * 4.5}
                        y1={a1.y - ny * 4.5}
                        x2={a2.x - nx * 4.5}
                        y2={a2.y - ny * 4.5}
                        stroke="#1e293b"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </g>
              );
            })}

            {/* Atoms */}
            {graph.atoms.map((a) => {
              const isSelected = selectedAtomId === a.id;
              const w = Math.max(22, a.element.length * 9 + 8);
              return (
                <g
                  key={a.id}
                  onClick={(e) => handleAtomClick(e, a)}
                  onMouseDown={() => {
                    if (tool === 'select') setDraggingAtomId(a.id);
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={a.x - w / 2}
                    y={a.y - 12}
                    width={w}
                    height={24}
                    rx={6}
                    fill={isSelected ? '#ccfbf1' : '#ffffff'}
                    stroke={isSelected ? '#0f766e' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={a.x}
                    y={a.y + 5}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fill={
                      a.element.includes('O')
                        ? '#dc2626'
                        : a.element.includes('N')
                        ? '#0284c7'
                        : '#0f172a'
                    }
                  >
                    {a.element}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="md:col-span-4 flex flex-col justify-between gap-2 bg-white border border-slate-200 rounded-xl p-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tên / Công thức đại diện:
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ví dụ: Phenol (C6H5OH)"
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold"
            />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-bold text-slate-500 mb-1">Xem trước chèn vào văn bản:</span>
            <div dangerouslySetInnerHTML={{ __html: previewSvg }} />
          </div>
        </div>
      </div>

      {/* Confirm & Cancel */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl flex items-center gap-1 min-h-[40px]"
        >
          <X className="w-4 h-4" />
          <span>Hủy</span>
        </button>
        <button
          type="button"
          onClick={() => onConfirm(label.trim() || 'Cấu tạo hữu cơ 2D', graph)}
          disabled={graph.atoms.length === 0}
          className="px-4 py-2 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl disabled:opacity-50 flex items-center gap-1.5 min-h-[40px]"
        >
          <Check className="w-4 h-4" />
          <span>{isEditingExisting ? 'Cập nhật cấu tạo 2D' : 'Chèn cấu tạo 2D vào bài'}</span>
        </button>
      </div>
    </div>
  );
};
