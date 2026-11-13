import React, { useEffect, useMemo, useState } from 'react';
import { Pipette, RotateCcw, Play, Pause, Info } from 'lucide-react';
import { ChemFormula } from '../common/ChemFormula';

type AcidType = 'HCl' | 'CH3COOH' | 'H2SO4';
type IndicatorType = 'phenolphthalein' | 'methyl-orange' | 'litmus';

const ACID_CONFIGS: Record<
  AcidType,
  { label: string; cAcid: number; vAcidMl: number; ka?: number; nH: number; latexEq: string }
> = {
  HCl: {
    label: 'HCl 0,10 M (25 mL) – Acid mạnh',
    cAcid: 0.1,
    vAcidMl: 25,
    nH: 1,
    latexEq: 'HCl + NaOH \\rightarrow NaCl + H_2O',
  },
  CH3COOH: {
    label: 'CH₃COOH 0,10 M (25 mL) – Acid yếu',
    cAcid: 0.1,
    vAcidMl: 25,
    ka: 1.8e-5,
    nH: 1,
    latexEq: 'CH_3COOH + NaOH \\rightleftharpoons CH_3COONa + H_2O',
  },
  H2SO4: {
    label: 'H₂SO₄ 0,05 M (25 mL) – Hai nấc',
    cAcid: 0.05,
    vAcidMl: 25,
    nH: 2,
    latexEq: 'H_2SO_4 + 2NaOH \\rightarrow Na_2SO_4 + 2H_2O',
  },
};

function computeTitrationPH(acidType: AcidType, vBaseMl: number, cBase: number = 0.1): number {
  const cfg = ACID_CONFIGS[acidType];
  const Va = cfg.vAcidMl;
  const nH_total = cfg.cAcid * cfg.nH * (Va / 1000);
  const nOH = cBase * (vBaseMl / 1000);
  const vTotalL = (Va + vBaseMl) / 1000;

  if (acidType === 'HCl' || acidType === 'H2SO4') {
    const diff = nH_total - nOH;
    if (Math.abs(diff) < 1e-7) return 7.0;
    if (diff > 0) {
      const hConc = diff / vTotalL;
      return Math.max(0, -Math.log10(hConc));
    }
    const ohConc = -diff / vTotalL;
    return Math.min(14, 14 + Math.log10(ohConc));
  }

  // Weak acid CH3COOH + strong base NaOH
  const ka = cfg.ka || 1.8e-5;
  const nAcid0 = cfg.cAcid * (Va / 1000);
  if (vBaseMl <= 0.001) {
    const h = Math.sqrt(ka * cfg.cAcid);
    return -Math.log10(h);
  }
  if (nOH < nAcid0 - 1e-7) {
    const nHA = nAcid0 - nOH;
    const nA = nOH;
    return -Math.log10(ka) + Math.log10(nA / nHA);
  }
  if (Math.abs(nOH - nAcid0) < 1e-6) {
    const cSalt = nAcid0 / vTotalL;
    const kb = 1e-14 / ka;
    const oh = Math.sqrt(kb * cSalt);
    return 14 + Math.log10(oh);
  }
  const ohExcess = (nOH - nAcid0) / vTotalL;
  return Math.min(14, 14 + Math.log10(ohExcess));
}

function getIndicatorColor(indicator: IndicatorType, pH: number): { fill: string; label: string } {
  if (indicator === 'phenolphthalein') {
    if (pH < 8.2) return { fill: '#f1f5f9', label: 'Không màu (pH < 8,2)' };
    if (pH <= 10.0) return { fill: '#f472b6', label: 'Hồng nhạt (Khoảng chuyển màu 8,2–10)' };
    return { fill: '#db2777', label: 'Hồng cánh sen đậm (pH > 10)' };
  }
  if (indicator === 'methyl-orange') {
    if (pH < 3.1) return { fill: '#ef4444', label: 'Đỏ (pH < 3,1)' };
    if (pH <= 4.4) return { fill: '#fb923c', label: 'Da cam (3,1–4,4)' };
    return { fill: '#facc15', label: 'Vàng (pH > 4,4)' };
  }
  // Litmus
  if (pH < 5.5) return { fill: '#f43f5e', label: 'Đỏ (Môi trường acid)' };
  if (pH <= 8.0) return { fill: '#a855f7', label: 'Tím (Trung tính ~7)' };
  return { fill: '#2563eb', label: 'Xanh lam (Môi trường kiềm)' };
}

export const TitrationSim: React.FC = () => {
  const [acidType, setAcidType] = useState<AcidType>('HCl');
  const [indicator, setIndicator] = useState<IndicatorType>('phenolphthalein');
  const [vBaseMl, setVBaseMl] = useState<number>(0);
  const [autoDrip, setAutoDrip] = useState<boolean>(false);

  const cBase = 0.1;
  const vEqMl = 25.0; // Because HCl 0.10*25, CH3COOH 0.10*25, H2SO4 0.05*2*25 all equal 25.0 mL NaOH 0.10 M

  useEffect(() => {
    if (!autoDrip) return;
    const id = window.setInterval(() => {
      setVBaseMl((prev) => {
        if (prev >= 45) {
          setAutoDrip(false);
          return 45;
        }
        return Number((prev + 0.5).toFixed(1));
      });
    }, 180);
    return () => window.clearInterval(id);
  }, [autoDrip]);

  const currentPH = useMemo(() => computeTitrationPH(acidType, vBaseMl, cBase), [acidType, vBaseMl]);
  const indColor = useMemo(() => getIndicatorColor(indicator, currentPH), [indicator, currentPH]);

  // Build SVG titration curve points (0..45 mL)
  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let v = 0; v <= 45; v += 0.5) {
      const ph = computeTitrationPH(acidType, v, cBase);
      const x = 40 + (v / 45) * 320;
      const y = 210 - (ph / 14) * 185;
      pts.push(`${v === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [acidType]);

  const markerX = 40 + (vBaseMl / 45) * 320;
  const markerY = 210 - (currentPH / 14) * 185;

  const handleReset = () => {
    setAutoDrip(false);
    setVBaseMl(0);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <Pipette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Chuẩn độ Acid – Base &amp; Đường cong pH
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Nhỏ dung dịch chuẩn NaOH 0,10 M từ burette xuống bình tam giác, quan sát đổi màu chất chỉ thị và xác định điểm tương đương.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Rửa bình &amp; Chuẩn độ lại</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Bench Setup & Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                1. Dung dịch cần chuẩn độ (Bình tam giác)
              </label>
              <select
                value={acidType}
                onChange={(e) => {
                  setAcidType(e.target.value as AcidType);
                  setVBaseMl(0);
                  setAutoDrip(false);
                }}
                className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {Object.entries(ACID_CONFIGS).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                2. Chất chỉ thị màu
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'phenolphthalein' as const, label: 'Phenolphthalein' },
                  { id: 'methyl-orange' as const, label: 'Methyl da cam' },
                  { id: 'litmus' as const, label: 'Quỳ tím' },
                ].map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setIndicator(ind.id)}
                    className={`px-2 py-2 rounded-xl border text-xs font-bold transition-all ${
                      indicator === ind.id
                        ? 'bg-teal-50 border-teal-400 text-teal-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Thể tích NaOH 0,10 M đã nhỏ:</span>
                <span className="font-mono text-teal-800 tabular-nums">{vBaseMl.toFixed(1)} mL</span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                step={0.5}
                value={vBaseMl}
                onChange={(e) => {
                  setAutoDrip(false);
                  setVBaseMl(Number(e.target.value));
                }}
                className="w-full accent-teal-600"
              />
              <div className="flex flex-wrap gap-2">
                {[0.5, 1.0, 5.0].map((step) => (
                  <button
                    key={step}
                    onClick={() => setVBaseMl((v) => Math.min(45, Number((v + step).toFixed(1))))}
                    className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold tabular-nums"
                  >
                    +{step} mL
                  </button>
                ))}
                <button
                  onClick={() => setAutoDrip((a) => !a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    autoDrip ? 'bg-amber-500 text-amber-950' : 'bg-slate-800 text-white'
                  }`}
                >
                  {autoDrip ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{autoDrip ? 'Dừng nhỏ' : 'Nhỏ tự động'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500">Phương trình chuẩn độ:</span>
            <ChemFormula formula={ACID_CONFIGS[acidType].latexEq} isBlock className="text-sm font-bold text-slate-900" />
            <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                Điểm tương đương xảy ra tại <strong>V(NaOH) = {vEqMl.toFixed(1)} mL</strong>. Hãy chú ý bước nhảy pH rõ rệt quanh vùng này.
              </span>
            </div>
          </div>
        </div>

        {/* Center Burette + Erlenmeyer Flask */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-4 text-white flex flex-col items-center justify-between min-h-[430px]">
          <div className="w-full flex items-center justify-between text-xs">
            <span className="font-bold text-teal-400">Bàn chuẩn độ</span>
            <span className="font-mono font-black text-base text-amber-300 tabular-nums">
              pH = {currentPH.toFixed(2)}
            </span>
          </div>

          <svg viewBox="0 0 180 290" className="w-44 h-72">
            {/* Burette Stand */}
            <rect x="24" y="12" width="6" height="265" fill="#475569" />
            <rect x="16" y="272" width="148" height="8" rx="3" fill="#64748b" />
            <rect x="28" y="45" width="54" height="5" fill="#94a3b8" />

            {/* Burette Tube */}
            <rect x="82" y="15" width="16" height="115" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
            {/* NaOH level inside burette */}
            <rect
              x="84"
              y={20 + (vBaseMl / 45) * 95}
              width="12"
              height={Math.max(4, 108 - (vBaseMl / 45) * 95)}
              fill="#bae6fd"
              opacity="0.85"
            />
            {/* Burette Stopcock */}
            <rect x="76" y="132" width="28" height="7" rx="3" fill="#0d9488" />
            <path d="M87,139 L93,139 L91,158 L89,158 Z" fill="#cbd5e1" />

            {/* Erlenmeyer Flask */}
            <defs>
              <clipPath id="flaskClip">
                <path d="M78,175 L102,175 L134,252 Q137,264 124,264 L56,264 Q43,264 46,252 Z" />
              </clipPath>
            </defs>
            <g clipPath="url(#flaskClip)">
              <rect x="40" y="175" width="100" height="95" fill="#0f172a" />
              <rect x="40" y={230 - (vBaseMl / 45) * 20} width="100" height="65" fill={indColor.fill} opacity="0.92" />
            </g>
            <path
              d="M78,166 L78,175 L46,252 Q43,264 56,264 L124,264 Q137,264 134,252 L102,175 L102,166"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.5"
            />
          </svg>

          <div className="w-full text-center px-2 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200">
            Màu chỉ thị: <span className="text-white font-bold">{indColor.label}</span>
          </div>
        </div>

        {/* Right Live Titration Curve */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Đường cong chuẩn độ pH theo V(NaOH)</h3>
              <span className="text-xs text-slate-500">Trục hoành: V NaOH 0,10 M (mL) · Trục tung: pH (0–14)</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold tabular-nums">
              Điểm TĐ: {vEqMl} mL
            </span>
          </div>

          <svg viewBox="0 0 385 245" className="w-full h-auto bg-slate-50 rounded-xl border border-slate-200">
            {/* Grid lines */}
            {[0, 7, 14].map((ph) => {
              const y = 210 - (ph / 14) * 185;
              return (
                <g key={ph}>
                  <line x1="40" y1={y} x2="365" y2={y} stroke={ph === 7 ? '#94a3b8' : '#e2e8f0'} strokeDasharray={ph === 7 ? '4 4' : undefined} />
                  <text x="32" y={y + 4} textAnchor="end" fontSize="10" fill="#475569" fontWeight="bold">
                    {ph}
                  </text>
                </g>
              );
            })}

            {/* Equivalence line at V = 25 mL */}
            <line
              x1={40 + (25 / 45) * 320}
              y1="25"
              x2={40 + (25 / 45) * 320}
              y2="210"
              stroke="#0d9488"
              strokeDasharray="4 3"
              strokeWidth="1.5"
            />
            <text x={40 + (25 / 45) * 320} y="17" textAnchor="middle" fontSize="10" fill="#0f766e" fontWeight="bold">
              V(TĐ) = 25 mL
            </text>

            {/* Axes */}
            <line x1="40" y1="20" x2="40" y2="210" stroke="#334155" strokeWidth="1.5" />
            <line x1="40" y1="210" x2="365" y2="210" stroke="#334155" strokeWidth="1.5" />

            {[0, 10, 20, 25, 30, 40].map((v) => {
              const x = 40 + (v / 45) * 320;
              return (
                <text key={v} x={x} y="228" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">
                  {v}
                </text>
              );
            })}

            {/* Titration Curve */}
            <path d={curvePath} fill="none" stroke="#0f766e" strokeWidth="3" />

            {/* Live Marker */}
            <circle cx={markerX} cy={markerY} r="5.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          </svg>

          <div className="grid grid-cols-3 gap-2 text-center tabular-nums">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Thể tích NaOH</span>
              <strong className="text-base font-black text-slate-900">{vBaseMl.toFixed(1)} mL</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">pH hiện tại</span>
              <strong className="text-base font-black text-teal-800">{currentPH.toFixed(2)}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Trạng thái</span>
              <strong className="text-xs font-black text-slate-900">
                {Math.abs(vBaseMl - vEqMl) <= 0.5
                  ? 'Điểm tương đương'
                  : vBaseMl < vEqMl
                  ? 'Dư acid'
                  : 'Dư kiềm (NaOH)'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
