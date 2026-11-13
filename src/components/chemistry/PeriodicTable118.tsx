import React, { useEffect, useMemo, useState } from 'react';
import {
  ELEMENTS_118,
  CATEGORY_META,
  ChemElement118,
  ElementCategory,
} from '../../data/elements118';
import {
  Search,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Atom,
  Layers,
  BookOpen,
  Info,
} from 'lucide-react';

type TrendMode = 'category' | 'radius' | 'electronegativity' | 'ionization' | 'metallic';

interface PeriodicTable118Props {
  selectedZ?: number;
  onSelectZ?: (z: number) => void;
  onOpenAtom3D?: (z: number, mode?: '3d' | 'config') => void;
  onOpenKnowledge?: (element: ChemElement118) => void;
}

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

const GROUP_LABELS = [
  '1 (IA)', '2 (IIA)', '3 (IIIB)', '4 (IVB)', '5 (VB)', '6 (VIB)',
  '7 (VIIB)', '8 (VIIIB)', '9 (VIIIB)', '10 (VIIIB)', '11 (IB)', '12 (IIB)',
  '13 (IIIA)', '14 (IVA)', '15 (VA)', '16 (VIA)', '17 (VIIA)', '18 (VIIIA)',
];

function getHeatColor(value: number | null, min: number, max: number, palette: 'blue' | 'amber' | 'rose'): {
  bg: string;
  text: string;
  border: string;
} {
  if (value === null) {
    return {
      bg: 'bg-slate-100 hover:bg-slate-200',
      text: 'text-slate-500',
      border: 'border-slate-300',
    };
  }
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));

  if (palette === 'blue') {
    if (t < 0.25) return { bg: 'bg-sky-50 hover:bg-sky-100', text: 'text-sky-950', border: 'border-sky-200' };
    if (t < 0.5) return { bg: 'bg-sky-200 hover:bg-sky-300', text: 'text-sky-950', border: 'border-sky-300' };
    if (t < 0.75) return { bg: 'bg-sky-400 hover:bg-sky-500', text: 'text-white', border: 'border-sky-500' };
    return { bg: 'bg-sky-700 hover:bg-sky-800', text: 'text-white', border: 'border-sky-800' };
  }
  if (palette === 'amber') {
    if (t < 0.25) return { bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-950', border: 'border-amber-200' };
    if (t < 0.5) return { bg: 'bg-amber-200 hover:bg-amber-300', text: 'text-amber-950', border: 'border-amber-300' };
    if (t < 0.75) return { bg: 'bg-orange-400 hover:bg-orange-500', text: 'text-white', border: 'border-orange-500' };
    return { bg: 'bg-rose-600 hover:bg-rose-700', text: 'text-white', border: 'border-rose-700' };
  }
  // rose/teal for ionization
  if (t < 0.25) return { bg: 'bg-teal-50 hover:bg-teal-100', text: 'text-teal-950', border: 'border-teal-200' };
  if (t < 0.5) return { bg: 'bg-teal-200 hover:bg-teal-300', text: 'text-teal-950', border: 'border-teal-300' };
  if (t < 0.75) return { bg: 'bg-teal-500 hover:bg-teal-600', text: 'text-white', border: 'border-teal-600' };
  return { bg: 'bg-teal-800 hover:bg-teal-900', text: 'text-white', border: 'border-teal-900' };
}

function getMetallicStyle(el: ChemElement118): { bg: string; text: string; border: string } {
  if (el.category === 'khi-hiem') return { bg: 'bg-indigo-100 hover:bg-indigo-200', text: 'text-indigo-950', border: 'border-indigo-300' };
  if (el.category === 'halogen' || el.category === 'phi-kim') return { bg: 'bg-sky-500 hover:bg-sky-600', text: 'text-white', border: 'border-sky-600' };
  if (el.category === 'a-kim') return { bg: 'bg-teal-200 hover:bg-teal-300', text: 'text-teal-950', border: 'border-teal-400' };
  if (el.category === 'kim-loai-kiem' || el.category === 'kim-loai-kiem-tho') {
    return { bg: 'bg-rose-500 hover:bg-rose-600', text: 'text-white', border: 'border-rose-600' };
  }
  if (el.metallicCharacter === 'Chưa xác định') {
    return { bg: 'bg-slate-100 hover:bg-slate-200', text: 'text-slate-500', border: 'border-slate-300' };
  }
  return { bg: 'bg-amber-200 hover:bg-amber-300', text: 'text-amber-950', border: 'border-amber-300' };
}

export const PeriodicTable118: React.FC<PeriodicTable118Props> = ({
  selectedZ: controlledZ,
  onSelectZ,
  onOpenAtom3D,
  onOpenKnowledge,
}) => {
  const [internalZ, setInternalZ] = useState<number>(11); // Default Na (Z=11)
  const activeZ = controlledZ ?? internalZ;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<ElementCategory | 'all'>('all');
  const [trendMode, setTrendMode] = useState<TrendMode>('category');
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const selectedElement = useMemo(
    () => ELEMENTS_118.find((e) => e.z === activeZ) || ELEMENTS_118[0],
    [activeZ]
  );

  const selectElement = (z: number) => {
    setInternalZ(z);
    if (onSelectZ) onSelectZ(z);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const matchedZSet = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const set = new Set<number>();
    ELEMENTS_118.forEach((el) => {
      const matchCat = categoryFilter === 'all' || el.category === categoryFilter;
      const matchQuery =
        !q ||
        String(el.z) === q ||
        el.symbol.toLowerCase().includes(q) ||
        el.name.toLowerCase().includes(q) ||
        (el.viName && el.viName.toLowerCase().includes(q));
      if (matchCat && matchQuery) set.add(el.z);
    });
    return set;
  }, [searchTerm, categoryFilter]);

  const hasActiveFilter = searchTerm.trim().length > 0 || categoryFilter !== 'all';

  // Grid mapping: main rows 1..7 (excluding 57-71 & 89-103), lanthanoid row 57-71, actinoid row 89-103
  const mainGridMap = useMemo(() => {
    const map = new Map<string, ChemElement118>();
    ELEMENTS_118.forEach((el) => {
      const isLanthanoid = el.z >= 57 && el.z <= 71;
      const isActinoid = el.z >= 89 && el.z <= 103;
      if (!isLanthanoid && !isActinoid) {
        map.set(`${el.period}-${el.group}`, el);
      }
    });
    return map;
  }, []);

  const lanthanoids = useMemo(() => ELEMENTS_118.filter((e) => e.z >= 57 && e.z <= 71), []);
  const actinoids = useMemo(() => ELEMENTS_118.filter((e) => e.z >= 89 && e.z <= 103), []);

  const getTileStyle = (el: ChemElement118) => {
    if (trendMode === 'radius') {
      return getHeatColor(el.atomicRadius, 32, 265, 'blue');
    }
    if (trendMode === 'electronegativity') {
      return getHeatColor(el.electronegativity, 0.7, 3.98, 'amber');
    }
    if (trendMode === 'ionization') {
      return getHeatColor(el.ionizationEnergy, 376, 2372, 'rose');
    }
    if (trendMode === 'metallic') {
      return getMetallicStyle(el);
    }
    const meta = CATEGORY_META[el.category];
    return { bg: meta.bg, text: meta.text, border: meta.border };
  };

  const getTrendMiniLabel = (el: ChemElement118): string | null => {
    if (trendMode === 'radius') return el.atomicRadius !== null ? `${el.atomicRadius} pm` : 'N/A';
    if (trendMode === 'electronegativity') return el.electronegativity !== null ? `${el.electronegativity}` : 'N/A';
    if (trendMode === 'ionization') return el.ionizationEnergy !== null ? `${el.ionizationEnergy}` : 'N/A';
    return null;
  };

  const renderElementCell = (el: ChemElement118) => {
    const isSelected = el.z === selectedElement.z;
    const isMatched = matchedZSet.has(el.z);
    const style = getTileStyle(el);
    const miniVal = getTrendMiniLabel(el);

    return (
      <button
        key={el.z}
        type="button"
        onClick={() => selectElement(el.z)}
        title={`Z=${el.z} · ${el.name} (${el.symbol})`}
        className={`relative p-1 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[60px] select-none overflow-hidden ${style.bg} ${style.border} ${style.text} ${
          isSelected
            ? 'ring-2 ring-teal-700 ring-offset-1 shadow-md z-10 scale-[1.03]'
            : ''
        } ${hasActiveFilter && !isMatched ? 'opacity-25' : 'opacity-100'}`}
      >
        <div className="flex items-start justify-between gap-0.5 w-full leading-none">
          <span className="text-[10px] font-bold tabular-nums opacity-85">{el.z}</span>
          <span className="text-[9px] font-semibold opacity-75 truncate">
            {miniVal ?? el.atomicMass}
          </span>
        </div>
        <div className="text-[15px] font-black leading-none tracking-tight text-center my-0.5">
          {el.symbol}
        </div>
        <div className="text-[9px] font-semibold leading-tight truncate text-center w-full">
          {el.name}
        </div>
      </button>
    );
  };

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-50 overflow-y-auto p-4 md:p-6 space-y-4'
          : 'space-y-4'
      }
    >
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900">
              Bảng tuần hoàn 118 nguyên tố hóa học
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              18 nhóm, 7 chu kỳ · Đầy đủ họ Lanthanoid & Actinoid · Dữ liệu IUPAC & NIST
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm Z, ký hiệu hoặc tên (Fe, 26, Oxi)..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-56 text-slate-800"
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ElementCategory | 'all')}
              aria-label="Lọc theo nhóm nguyên tố"
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tất cả 118 nguyên tố</option>
              {(Object.keys(CATEGORY_META) as ElementCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_META[cat].label}
                </option>
              ))}
            </select>

            {/* Zoom controls */}
            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
              <button
                type="button"
                onClick={() => setZoomPercent((z) => Math.max(75, z - 10))}
                title="Thu nhỏ bảng"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-l-lg"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-bold tabular-nums text-slate-700">
                {zoomPercent}%
              </span>
              <button
                type="button"
                onClick={() => setZoomPercent((z) => Math.min(130, z + 10))}
                title="Phóng to bảng"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomPercent(100);
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                title="Đặt lại góc nhìn"
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-r-lg border-l border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Thu gọn</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Toàn màn hình</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Periodic Trends Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">Chế độ tô màu / Xu hướng:</span>
            {[
              { id: 'category' as TrendMode, label: 'Nhóm nguyên tố' },
              { id: 'radius' as TrendMode, label: 'Bán kính nguyên tử (pm)' },
              { id: 'electronegativity' as TrendMode, label: 'Độ âm điện (Pauling)' },
              { id: 'ionization' as TrendMode, label: 'Năng lượng ion hóa I₁' },
              { id: 'metallic' as TrendMode, label: 'Tính kim loại & phi kim' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTrendMode(mode.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  trendMode === mode.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {hasActiveFilter && (
            <span className="text-xs font-semibold text-teal-700">
              Khớp {matchedZSet.size}/118 nguyên tố
            </span>
          )}
        </div>

        {/* Legend Bar */}
        {trendMode === 'category' ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-700">
            {(Object.keys(CATEGORY_META) as ElementCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter((prev) => (prev === cat ? 'all' : cat))}
                className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors ${
                  categoryFilter === cat ? 'bg-slate-200 font-bold' : 'hover:bg-slate-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-sm ${CATEGORY_META[cat].dot}`} />
                <span>{CATEGORY_META[cat].label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 inline-block" />
              <span>N/A = Chưa có dữ liệu xác nhận</span>
            </span>
            {trendMode === 'metallic' ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Kim loại mạnh (IA, IIA)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-300 inline-block" /> Kim loại chuyển tiếp / yếu
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-teal-300 inline-block" /> Á kim
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-sky-500 inline-block" /> Phi kim / Halogen
                </span>
              </>
            ) : (
              <span>Màu đậm dần theo giá trị tăng dần · Xem giá trị chi tiết khi nhấp từng nguyên tố</span>
            )}
          </div>
        )}
      </div>

      {/* Main Content Split: 18-Column Table + Side/Bottom Detail Inspector (NO Popup!) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Periodic Table Grid Container */}
        <div className="xl:col-span-8 2xl:col-span-9 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <div
            style={{
              width: `${Math.max(860, 860 * (zoomPercent / 100))}px`,
              transformOrigin: 'top left',
            }}
            className="space-y-2"
          >
            {/* Group Headers (1..18) */}
            <div
              className="grid gap-1 items-center"
              style={{ gridTemplateColumns: '28px repeat(18, minmax(0, 1fr))' }}
            >
              <div className="text-[10px] font-bold text-slate-400 text-center">CK</div>
              {GROUP_LABELS.map((g, idx) => (
                <div
                  key={idx}
                  className="text-[9px] font-bold text-slate-500 text-center truncate px-0.5"
                  title={`Nhóm ${g}`}
                >
                  {g.split(' ')[0]}
                  <span className="block text-[8px] text-slate-400 font-normal">
                    {g.split(' ')[1]}
                  </span>
                </div>
              ))}
            </div>

            {/* Periods 1..7 */}
            {[1, 2, 3, 4, 5, 6, 7].map((period) => (
              <div
                key={period}
                className="grid gap-1 items-stretch"
                style={{ gridTemplateColumns: '28px repeat(18, minmax(0, 1fr))' }}
              >
                <div className="flex items-center justify-center text-xs font-extrabold text-slate-500">
                  {period}
                </div>

                {Array.from({ length: 18 }, (_, i) => i + 1).map((group) => {
                  // Markers for Lanthanoid (Period 6, Group 3) & Actinoid (Period 7, Group 3)
                  if (period === 6 && group === 3) {
                    return (
                      <div
                        key="lanth-marker"
                        className="p-1 rounded-lg border border-dashed border-fuchsia-300 bg-fuchsia-50/70 text-fuchsia-900 flex flex-col items-center justify-center text-center min-h-[60px]"
                      >
                        <span className="text-[10px] font-bold tabular-nums">57–71</span>
                        <span className="text-[9px] font-semibold">La–Lu</span>
                      </div>
                    );
                  }
                  if (period === 7 && group === 3) {
                    return (
                      <div
                        key="act-marker"
                        className="p-1 rounded-lg border border-dashed border-purple-300 bg-purple-50/70 text-purple-900 flex flex-col items-center justify-center text-center min-h-[60px]"
                      >
                        <span className="text-[10px] font-bold tabular-nums">89–103</span>
                        <span className="text-[9px] font-semibold">Ac–Lr</span>
                      </div>
                    );
                  }

                  const el = mainGridMap.get(`${period}-${group}`);
                  if (!el) return <div key={`empty-${period}-${group}`} />;
                  return renderElementCell(el);
                })}
              </div>
            ))}

            {/* f-block rows: Lanthanoids & Actinoids */}
            <div className="pt-3 space-y-1">
              <div
                className="grid gap-1 items-stretch"
                style={{ gridTemplateColumns: '28px repeat(18, minmax(0, 1fr))' }}
              >
                <div />
                <div className="col-span-2 flex items-center justify-end pr-2 text-[10px] font-bold text-fuchsia-800">
                  Lanthanoid (4f)
                </div>
                {lanthanoids.map((el) => renderElementCell(el))}
                <div />
              </div>

              <div
                className="grid gap-1 items-stretch"
                style={{ gridTemplateColumns: '28px repeat(18, minmax(0, 1fr))' }}
              >
                <div />
                <div className="col-span-2 flex items-center justify-end pr-2 text-[10px] font-bold text-purple-800">
                  Actinoid (5f)
                </div>
                {actinoids.map((el) => renderElementCell(el))}
                <div />
              </div>
            </div>
          </div>
        </div>

        {/* Inline Element Inspector Panel (No Popup!) */}
        <div className="xl:col-span-4 2xl:col-span-3 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          {/* Header Tile */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-800 to-slate-900 text-white flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-teal-200 font-semibold">
                Z = {selectedElement.z} · Chu kỳ {selectedElement.period} · Nhóm{' '}
                {GROUP_LABELS[selectedElement.group - 1]} · Khối {selectedElement.block}
              </div>
              <h3 className="text-xl font-black mt-1 truncate">
                {selectedElement.name} ({selectedElement.symbol})
              </h3>
              {selectedElement.viName && selectedElement.viName !== selectedElement.name && (
                <div className="text-xs text-slate-300">Tên tiếng Việt: {selectedElement.viName}</div>
              )}
              <div className="text-[11px] text-amber-200 font-semibold mt-1">
                {CATEGORY_META[selectedElement.category].label}
              </div>
            </div>
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-teal-200">{selectedElement.z}</span>
              <span className="text-2xl font-black leading-none">{selectedElement.symbol}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-2">
            {onOpenAtom3D && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAtom3D(selectedElement.z, '3d')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                >
                  <Atom className="w-4 h-4" />
                  <span>Xem nguyên tử 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAtom3D(selectedElement.z, 'config')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Xem cấu hình electron</span>
                </button>
              </>
            )}
            {onOpenKnowledge && (
              <button
                type="button"
                onClick={() => onOpenKnowledge(selectedElement)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Xem kiến thức liên quan</span>
              </button>
            )}
          </div>

          {/* Scientific Properties Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 gap-2">
              <span className="text-slate-500 font-medium">Nguyên tử khối tương đối:</span>
              <span className="font-bold text-slate-900 tabular-nums">{selectedElement.atomicMass} amu</span>
            </div>

            <div className="py-1.5 border-b border-slate-100 space-y-1">
              <span className="text-slate-500 font-medium block">Cấu hình electron:</span>
              <div className="font-mono font-bold text-teal-800 bg-teal-50/70 px-2.5 py-1.5 rounded-lg border border-teal-100 text-[12px]">
                {selectedElement.electronConfig}
              </div>
              <div className="text-[11px] text-slate-500 font-mono break-words">
                Đầy đủ: {selectedElement.fullConfig}
              </div>
            </div>

            <div className="py-1.5 border-b border-slate-100 space-y-1.5">
              <span className="text-slate-500 font-medium block">Phân bố electron theo lớp:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedElement.shells.map((count, i) => (
                  <div
                    key={i}
                    className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-center min-w-[40px]"
                  >
                    <span className="text-[10px] text-slate-500 font-bold block">{SHELL_NAMES[i]}</span>
                    <span className="text-xs font-black text-slate-900 tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 gap-2">
              <span className="text-slate-500 font-medium">Số oxi hóa thường gặp:</span>
              <span className="font-bold text-slate-900 text-right">{selectedElement.oxidationStates}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 gap-2">
              <span className="text-slate-500 font-medium">Bán kính nguyên tử:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {selectedElement.atomicRadius !== null ? `${selectedElement.atomicRadius} pm` : 'Chưa có dữ liệu'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 gap-2">
              <span className="text-slate-500 font-medium">Độ âm điện (Pauling):</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {selectedElement.electronegativity !== null ? selectedElement.electronegativity : 'Chưa có dữ liệu'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 gap-2">
              <span className="text-slate-500 font-medium">Năng lượng ion hóa I₁:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {selectedElement.ionizationEnergy !== null
                  ? `${selectedElement.ionizationEnergy} kJ/mol`
                  : 'Chưa có dữ liệu'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 gap-2">
              <span className="text-slate-500 font-medium">Tính kim loại / phi kim:</span>
              <span className="font-bold text-slate-900 text-right">{selectedElement.metallicCharacter}</span>
            </div>
          </div>

          {/* Properties & Applications */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>Tính chất & Ứng dụng tiêu biểu</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{selectedElement.summary}</p>
            <p className="text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Ứng dụng:</strong> {selectedElement.applications}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
