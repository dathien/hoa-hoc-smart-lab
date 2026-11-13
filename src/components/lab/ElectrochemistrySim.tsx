import React, { useMemo, useState } from 'react';
import { BatteryCharging, Zap, ArrowRightLeft, Power, Info } from 'lucide-react';
import { ChemFormula } from '../common/ChemFormula';

interface HalfCell {
  id: string;
  metal: string;
  ion: string;
  pairLabel: string;
  e0: number;
  n: number;
  metalColor: string;
  solColor: string;
}

const HALF_CELLS: HalfCell[] = [
  { id: 'Mg', metal: 'Mg', ion: 'Mg²⁺', pairLabel: 'Mg²⁺/Mg', e0: -2.37, n: 2, metalColor: '#cbd5e1', solColor: '#e2e8f0' },
  { id: 'Zn', metal: 'Zn', ion: 'Zn²⁺', pairLabel: 'Zn²⁺/Zn', e0: -0.76, n: 2, metalColor: '#94a3b8', solColor: '#e0f2fe' },
  { id: 'Fe', metal: 'Fe', ion: 'Fe²⁺', pairLabel: 'Fe²⁺/Fe', e0: -0.44, n: 2, metalColor: '#64748b', solColor: '#d1fae5' },
  { id: 'Ni', metal: 'Ni', ion: 'Ni²⁺', pairLabel: 'Ni²⁺/Ni', e0: -0.26, n: 2, metalColor: '#a1a1aa', solColor: '#bbf7d0' },
  { id: 'Pb', metal: 'Pb', ion: 'Pb²⁺', pairLabel: 'Pb²⁺/Pb', e0: -0.13, n: 2, metalColor: '#475569', solColor: '#f1f5f9' },
  { id: 'Cu', metal: 'Cu', ion: 'Cu²⁺', pairLabel: 'Cu²⁺/Cu', e0: 0.34, n: 2, metalColor: '#d97706', solColor: '#93c5fd' },
  { id: 'Ag', metal: 'Ag', ion: 'Ag⁺', pairLabel: 'Ag⁺/Ag', e0: 0.80, n: 1, metalColor: '#e2e8f0', solColor: '#f8fafc' },
];

interface ElectrolysisPreset {
  id: string;
  title: string;
  electrolyte: string;
  electrodes: string;
  cathodeReaction: string;
  anodeReaction: string;
  overallEq: string;
  cathodeObs: string;
  anodeObs: string;
  solColor: string;
}

const ELECTROLYSIS_PRESETS: ElectrolysisPreset[] = [
  {
    id: 'CuSO4_inert',
    title: 'Điện phân dung dịch CuSO₄ (điện cực trơ Graphite/Pt)',
    electrolyte: 'CuSO₄ (dd 1 M)',
    electrodes: 'Graphite (trơ)',
    cathodeReaction: 'Cu^{2+} + 2e \\rightarrow Cu\\downarrow',
    anodeReaction: '2H_2O \\rightarrow O_2\\uparrow + 4H^+ + 4e',
    overallEq: '2CuSO_4 + 2H_2O \\xrightarrow{\\text{đpdd}} 2Cu + O_2\\uparrow + 2H_2SO_4',
    cathodeObs: 'Kim loại Đồng (Cu) màu đỏ bám dần lên bề mặt cathode.',
    anodeObs: 'Khí không màu O₂ sủi bọt ở anode; dung dịch acid hóa (pH giảm) và nhạt màu xanh dần.',
    solColor: '#93c5fd',
  },
  {
    id: 'NaCl_dd',
    title: 'Điện phân dung dịch NaCl bão hòa (có màng ngăn)',
    electrolyte: 'NaCl (dd bão hòa)',
    electrodes: 'Graphite / Thép (có màng ngăn)',
    cathodeReaction: '2H_2O + 2e \\rightarrow H_2\\uparrow + 2OH^-',
    anodeReaction: '2Cl^- \\rightarrow Cl_2\\uparrow + 2e',
    overallEq: '2NaCl + 2H_2O \\xrightarrow{\\text{đpdd, cmn}} 2NaOH + H_2\\uparrow + Cl_2\\uparrow',
    cathodeObs: 'Sủi bọt khí không màu H₂; môi trường quanh cathode hóa kiềm (OH⁻).',
    anodeObs: 'Thoát ra khí màu vàng lục Cl₂ có mùi hắc.',
    solColor: '#e2e8f0',
  },
  {
    id: 'NaCl_nc',
    title: 'Điện phân NaCl nóng chảy (Điều chế Sodium)',
    electrolyte: 'NaCl (nóng chảy ~801°C)',
    electrodes: 'Graphite / Thép',
    cathodeReaction: 'Na^+ + e \\rightarrow Na',
    anodeReaction: '2Cl^- \\rightarrow Cl_2\\uparrow + 2e',
    overallEq: '2NaCl \\xrightarrow{\\text{đpnc}} 2Na + Cl_2\\uparrow',
    cathodeObs: 'Kim loại Sodium (Na) lỏng nổi lên tại cathode.',
    anodeObs: 'Khí Chlorine (Cl₂) màu vàng lục thoát ra tại anode.',
    solColor: '#fde68a',
  },
];

export const ElectrochemistrySim: React.FC = () => {
  const [mode, setMode] = useState<'galvanic' | 'electrolysis'>('galvanic');
  const [leftId, setLeftId] = useState<string>('Zn');
  const [rightId, setRightId] = useState<string>('Cu');
  const [electrolysisId, setElectrolysisId] = useState<string>('CuSO4_inert');
  const [powerOn, setPowerOn] = useState<boolean>(true);

  const leftCell = useMemo(() => HALF_CELLS.find((c) => c.id === leftId) || HALF_CELLS[1], [leftId]);
  const rightCell = useMemo(() => HALF_CELLS.find((c) => c.id === rightId) || HALF_CELLS[5], [rightId]);

  const cellAnalysis = useMemo(() => {
    const isSame = leftCell.id === rightCell.id;
    const anode = leftCell.e0 <= rightCell.e0 ? leftCell : rightCell;
    const cathode = leftCell.e0 <= rightCell.e0 ? rightCell : leftCell;
    const emf = Math.max(0, cathode.e0 - anode.e0);
    const electronFlow = leftCell.e0 <= rightCell.e0 ? 'left-to-right' : 'right-to-left';

    let overallEq = '';
    if (isSame) {
      overallEq = '\\text{Hai bán pin giống nhau (E^\\circ_{\\text{pin}} = 0,00 V)}';
    } else if (anode.n === cathode.n) {
      overallEq = `${anode.metal} + ${cathode.ion.replace('²⁺', '^{2+}').replace('⁺', '^+')} \\rightarrow ${anode.ion.replace('²⁺', '^{2+}').replace('⁺', '^+')} + ${cathode.metal}`;
    } else {
      // e.g., n=2 and Ag+ (n=1)
      overallEq = `${anode.metal} + 2Ag^+ \\rightarrow ${anode.ion.replace('²⁺', '^{2+}')} + 2Ag`;
    }

    return { isSame, anode, cathode, emf, electronFlow, overallEq };
  }, [leftCell, rightCell]);

  const activeElectrolysis = useMemo(
    () => ELECTROLYSIS_PRESETS.find((p) => p.id === electrolysisId) || ELECTROLYSIS_PRESETS[0],
    [electrolysisId]
  );

  return (
    <div className="space-y-5">
      {/* Top Mode Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Mô phỏng Điện hóa học: Pin Galvani &amp; Điện phân
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Xác định cực âm (Anode), cực dương (Cathode), chiều dòng electron và tính suất điện động chuẩn E°pin (Hóa học 12 GDPT 2018).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMode('galvanic')}
            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${
              mode === 'galvanic' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pin điện hóa (Galvani)
          </button>
          <button
            onClick={() => setMode('electrolysis')}
            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${
              mode === 'electrolysis' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bình điện phân
          </button>
        </div>
      </div>

      {/* MODE 1: GALVANIC CELL */}
      {mode === 'galvanic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Controls & Visual Diagram */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-500 block mb-1">Bán pin trái (Cốc 1):</label>
                <select
                  value={leftId}
                  onChange={(e) => setLeftId(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  {HALF_CELLS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.pairLabel} (E° = {c.e0 > 0 ? `+${c.e0.toFixed(2)}` : c.e0.toFixed(2)} V)
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-500 block mb-1">Bán pin phải (Cốc 2):</label>
                <select
                  value={rightId}
                  onChange={(e) => setRightId(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  {HALF_CELLS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.pairLabel} (E° = {c.e0 > 0 ? `+${c.e0.toFixed(2)}` : c.e0.toFixed(2)} V)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive SVG Cell Schematic */}
            <div className="bg-slate-900 rounded-2xl p-4">
              <svg viewBox="0 0 520 270" className="w-full h-auto">
                {/* Voltmeter box */}
                <rect x="205" y="12" width="110" height="44" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <text x="260" y="29" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  VÔN KẾ (E°pin)
                </text>
                <text x="260" y="48" textAnchor="middle" fill="#fbbf24" fontSize="15" fontWeight="bold">
                  {cellAnalysis.emf.toFixed(2)} V
                </text>

                {/* External Wire */}
                <path d="M110,120 L110,34 L205,34" fill="none" stroke="#94a3b8" strokeWidth="3" />
                <path d="M410,120 L410,34 L315,34" fill="none" stroke="#94a3b8" strokeWidth="3" />

                {/* Electron Flow Arrow */}
                {!cellAnalysis.isSame && (
                  <g>
                    <text x="260" y="75" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                      {cellAnalysis.electronFlow === 'left-to-right'
                        ? 'Dòng electron (e⁻): Trái ──────▶ Phải'
                        : 'Dòng electron (e⁻): Trái ◀────── Phải'}
                    </text>
                  </g>
                )}

                {/* Left Beaker */}
                <rect x="55" y="130" width="130" height="115" rx="8" fill={leftCell.solColor} opacity="0.28" />
                <path d="M55,115 L55,245 L185,245 L185,115" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                {/* Left Electrode */}
                <rect x="96" y="95" width="28" height="125" rx="3" fill={leftCell.metalColor} stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="110" y="160" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="bold">
                  {leftCell.metal}
                </text>
                <text x="120" y="232" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                  dd {leftCell.ion}
                </text>
                <text
                  x="110"
                  y="90"
                  textAnchor="middle"
                  fill={leftCell.id === cellAnalysis.anode.id && !cellAnalysis.isSame ? '#f87171' : '#34d399'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {cellAnalysis.isSame
                    ? 'Cân bằng'
                    : leftCell.id === cellAnalysis.anode.id
                    ? '(-) Anode'
                    : '(+) Cathode'}
                </text>

                {/* Right Beaker */}
                <rect x="335" y="130" width="130" height="115" rx="8" fill={rightCell.solColor} opacity="0.28" />
                <path d="M335,115 L335,245 L465,245 L465,115" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                {/* Right Electrode */}
                <rect x="396" y="95" width="28" height="125" rx="3" fill={rightCell.metalColor} stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="410" y="160" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="bold">
                  {rightCell.metal}
                </text>
                <text x="400" y="232" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                  dd {rightCell.ion}
                </text>
                <text
                  x="410"
                  y="90"
                  textAnchor="middle"
                  fill={rightCell.id === cellAnalysis.anode.id && !cellAnalysis.isSame ? '#f87171' : '#34d399'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {cellAnalysis.isSame
                    ? 'Cân bằng'
                    : rightCell.id === cellAnalysis.anode.id
                    ? '(-) Anode'
                    : '(+) Cathode'}
                </text>

                {/* Salt Bridge */}
                <path
                  d="M150,185 L150,105 Q150,90 165,90 L355,90 Q370,90 370,105 L370,185"
                  fill="none"
                  stroke="#f8fafc"
                  strokeWidth="16"
                  opacity="0.35"
                />
                <text x="260" y="94" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
                  Cầu muối (KCl / KNO₃)
                </text>
              </svg>
            </div>
          </div>

          {/* Right Analysis */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Kí hiệu pin điện hóa</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  (-) {cellAnalysis.anode.metal} | {cellAnalysis.anode.ion} || {cellAnalysis.cathode.ion} |{' '}
                  {cellAnalysis.cathode.metal} (+)
                </h3>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-xs text-slate-500 block">E°pin chuẩn</span>
                <span className="text-2xl font-black text-amber-600">{cellAnalysis.emf.toFixed(2)} V</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                <span className="text-xs font-extrabold text-rose-800 uppercase">
                  Tại cực âm – Anode ({cellAnalysis.anode.metal}): Quá trình oxi hóa
                </span>
                <ChemFormula
                  formula={`${cellAnalysis.anode.metal} \\rightarrow ${cellAnalysis.anode.ion.replace('²⁺', '^{2+}').replace('⁺', '^+')} + ${cellAnalysis.anode.n}e`}
                  isBlock
                  className="text-sm font-bold text-slate-900"
                />
                <p className="text-xs text-slate-700">
                  Thanh {cellAnalysis.anode.metal} tan dần (khối lượng giảm dần), nhường electron đi qua dây dẫn sang cathode.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-xs font-extrabold text-emerald-800 uppercase">
                  Tại cực dương – Cathode ({cellAnalysis.cathode.metal}): Quá trình khử
                </span>
                <ChemFormula
                  formula={`${cellAnalysis.cathode.ion.replace('²⁺', '^{2+}').replace('⁺', '^+')} + ${cellAnalysis.cathode.n}e \\rightarrow ${cellAnalysis.cathode.metal}`}
                  isBlock
                  className="text-sm font-bold text-slate-900"
                />
                <p className="text-xs text-slate-700">
                  Kim loại {cellAnalysis.cathode.metal} bám thêm lên thanh cathode (khối lượng tăng dần).
                </p>
              </div>

              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                <span className="text-xs font-extrabold text-teal-900 uppercase">Phương trình phản ứng trong pin</span>
                <ChemFormula formula={cellAnalysis.overallEq} isBlock className="text-sm font-black text-teal-950" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: ELECTROLYSIS */}
      {mode === 'electrolysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Chọn hệ điện phân chuẩn SGK
              </span>
              <button
                onClick={() => setPowerOn((p) => !p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  powerOn ? 'bg-amber-500 text-amber-950' : 'bg-slate-200 text-slate-700'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{powerOn ? 'Nguồn DC: ĐANG BẬT' : 'Nguồn DC: ĐANG TẮT'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {ELECTROLYSIS_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setElectrolysisId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    electrolysisId === p.id
                      ? 'bg-teal-50 border-teal-400 text-teal-950 font-bold'
                      : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-800'
                  }`}
                >
                  <div className="text-sm font-bold">{p.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Chất điện li: {p.electrolyte} · Điện cực: {p.electrodes}
                  </div>
                </button>
              ))}
            </div>

            {/* Visual Cell */}
            <div className="bg-slate-900 rounded-2xl p-4">
              <svg viewBox="0 0 420 210" className="w-full h-auto">
                {/* DC Battery */}
                <rect x="155" y="10" width="110" height="32" rx="8" fill="#1e293b" stroke={powerOn ? '#fbbf24' : '#475569'} strokeWidth="2" />
                <text x="210" y="30" textAnchor="middle" fill={powerOn ? '#fbbf24' : '#94a3b8'} fontSize="11" fontWeight="bold">
                  {powerOn ? 'NGUỒN DC BẬT (⚡)' : 'NGUỒN DC TẮT'}
                </text>
                {/* Wires */}
                <path d="M120,75 L120,26 L155,26" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
                <path d="M300,75 L300,26 L265,26" fill="none" stroke="#94a3b8" strokeWidth="2.5" />

                {/* Tank */}
                <rect x="65" y="85" width="290" height="110" rx="10" fill={activeElectrolysis.solColor} opacity="0.28" />
                <path d="M65,70 L65,195 L355,195 L355,70" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />

                {/* Cathode (-) */}
                <rect x="108" y="68" width="24" height="105" rx="3" fill="#475569" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="120" y="60" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
                  (-) Cathode
                </text>
                {/* Anode (+) */}
                <rect x="288" y="68" width="24" height="105" rx="3" fill="#475569" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="300" y="60" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="bold">
                  (+) Anode
                </text>

                {/* Active plating / bubbles */}
                {powerOn && activeElectrolysis.id === 'CuSO4_inert' && (
                  <>
                    <rect x="106" y="100" width="28" height="73" rx="3" fill="#d97706" opacity="0.85" />
                    <circle cx="282" cy="140" r="3" fill="#f8fafc" />
                    <circle cx="316" cy="122" r="3.5" fill="#f8fafc" />
                    <circle cx="284" cy="108" r="2.5" fill="#f8fafc" />
                  </>
                )}
                {powerOn && activeElectrolysis.id !== 'CuSO4_inert' && (
                  <>
                    <circle cx="102" cy="135" r="3" fill="#f8fafc" />
                    <circle cx="136" cy="118" r="3.5" fill="#f8fafc" />
                    <circle cx="282" cy="130" r="3.5" fill="#bef264" />
                    <circle cx="316" cy="112" r="3" fill="#bef264" />
                  </>
                )}
              </svg>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              Cơ chế bán phản ứng điện phân
            </h3>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-extrabold text-emerald-800 uppercase">
                Tại Cathode (Cực âm – Quá trình khử):
              </span>
              <ChemFormula formula={activeElectrolysis.cathodeReaction} isBlock className="text-sm font-bold" />
              <p className="text-xs text-slate-700">{activeElectrolysis.cathodeObs}</p>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
              <span className="text-xs font-extrabold text-rose-800 uppercase">
                Tại Anode (Cực dương – Quá trình oxi hóa):
              </span>
              <ChemFormula formula={activeElectrolysis.anodeReaction} isBlock className="text-sm font-bold" />
              <p className="text-xs text-slate-700">{activeElectrolysis.anodeObs}</p>
            </div>

            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5">
              <span className="text-xs font-extrabold text-teal-900 uppercase flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Phương trình điện phân tổng quát
              </span>
              <ChemFormula formula={activeElectrolysis.overallEq} isBlock className="text-sm font-black text-teal-950" />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                Lưu ý phân biệt: Trong <strong>Pin điện hóa</strong>, Anode là cực âm (−); còn trong{' '}
                <strong>Bình điện phân</strong>, Anode nối với cực dương (+) của nguồn điện một chiều, nhưng ở cả hai hệ,{' '}
                <strong>tại Anode luôn xảy ra sự oxi hóa</strong> và <strong>tại Cathode luôn xảy ra sự khử</strong>.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
