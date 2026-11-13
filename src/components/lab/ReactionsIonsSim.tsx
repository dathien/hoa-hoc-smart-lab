import React, { useMemo, useState } from 'react';
import { Droplets, FlaskConical, RotateCcw, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { ChemFormula } from '../common/ChemFormula';

interface ReagentOption {
  id: string;
  formula: string;
  name: string;
  color: string;
  ions: string;
}

interface ReactionOutcome {
  occurs: boolean;
  title: string;
  liquidColor: string;
  precipitate?: { color: string; name: string; label: string };
  gas?: { name: string; intensity: 'low' | 'high' };
  molecularEq: string;
  fullIonicEq: string;
  netIonicEq: string;
  phenomenon: string;
  drivingForce: string;
}

const SOLUTIONS_A: ReagentOption[] = [
  { id: 'CuSO4', formula: 'CuSO₄', name: 'Copper(II) sulfate', color: '#bfdbfe', ions: 'Cu²⁺, SO₄²⁻' },
  { id: 'FeCl3', formula: 'FeCl₃', name: 'Iron(III) chloride', color: '#fde68a', ions: 'Fe³⁺, Cl⁻' },
  { id: 'FeSO4', formula: 'FeSO₄', name: 'Iron(II) sulfate', color: '#d1fae5', ions: 'Fe²⁺, SO₄²⁻' },
  { id: 'BaCl2', formula: 'BaCl₂', name: 'Barium chloride', color: '#f1f5f9', ions: 'Ba²⁺, Cl⁻' },
  { id: 'AgNO3', formula: 'AgNO₃', name: 'Silver nitrate', color: '#f8fafc', ions: 'Ag⁺, NO₃⁻' },
  { id: 'Na2CO3', formula: 'Na₂CO₃', name: 'Sodium carbonate', color: '#f1f5f9', ions: 'Na⁺, CO₃²⁻' },
];

const REAGENTS_B: ReagentOption[] = [
  { id: 'NaOH', formula: 'NaOH', name: 'Sodium hydroxide', color: '#f1f5f9', ions: 'Na⁺, OH⁻' },
  { id: 'BaCl2', formula: 'BaCl₂', name: 'Barium chloride', color: '#f1f5f9', ions: 'Ba²⁺, Cl⁻' },
  { id: 'AgNO3', formula: 'AgNO₃', name: 'Silver nitrate', color: '#f8fafc', ions: 'Ag⁺, NO₃⁻' },
  { id: 'HCl', formula: 'HCl', name: 'Hydrochloric acid', color: '#f1f5f9', ions: 'H⁺, Cl⁻' },
  { id: 'H2SO4', formula: 'H₂SO₄', name: 'Sulfuric acid', color: '#f1f5f9', ions: 'H⁺, SO₄²⁻' },
  { id: 'NH3', formula: 'NH₃ (dd)', name: 'Amoniac dư', color: '#f1f5f9', ions: 'NH₃ + H₂O' },
];

function evaluateReaction(aId: string, bId: string): ReactionOutcome {
  const key = `${aId}+${bId}`;
  const table: Record<string, ReactionOutcome> = {
    'CuSO4+NaOH': {
      occurs: true,
      title: 'Tạo kết tủa xanh lam Copper(II) hydroxide',
      liquidColor: '#e2e8f0',
      precipitate: { color: '#2563eb', name: 'Cu(OH)₂', label: 'Kết tủa xanh lam' },
      molecularEq: 'CuSO_4 + 2NaOH \\rightarrow Cu(OH)_2\\downarrow + Na_2SO_4',
      fullIonicEq: 'Cu^{2+} + SO_4^{2-} + 2Na^+ + 2OH^- \\rightarrow Cu(OH)_2\\downarrow + 2Na^+ + SO_4^{2-}',
      netIonicEq: 'Cu^{2+} + 2OH^- \\rightarrow Cu(OH)_2\\downarrow',
      phenomenon: 'Xuất hiện kết tủa keo màu xanh lam không tan trong NaOH dư; màu xanh lam của dung dịch ban đầu nhạt dần.',
      drivingForce: 'Tạo chất kết tủa ít tan Cu(OH)₂ làm giảm nồng độ ion tự do.',
    },
    'CuSO4+BaCl2': {
      occurs: true,
      title: 'Tạo kết tủa trắng Barium sulfate',
      liquidColor: '#bfdbfe',
      precipitate: { color: '#ffffff', name: 'BaSO₄', label: 'Kết tủa trắng bền' },
      molecularEq: 'CuSO_4 + BaCl_2 \\rightarrow BaSO_4\\downarrow + CuCl_2',
      fullIonicEq: 'Cu^{2+} + SO_4^{2-} + Ba^{2+} + 2Cl^- \\rightarrow BaSO_4\\downarrow + Cu^{2+} + 2Cl^-',
      netIonicEq: 'Ba^{2+} + SO_4^{2-} \\rightarrow BaSO_4\\downarrow',
      phenomenon: 'Xuất hiện kết tủa trắng BaSO₄ lắng xuống đáy ống nghiệm, dung dịch phía trên vẫn có màu xanh của ion Cu²⁺.',
      drivingForce: 'Kết tủa BaSO₄ không tan trong nước và trong acid mạnh.',
    },
    'CuSO4+NH3': {
      occurs: true,
      title: 'Tạo kết tủa xanh rồi tan tạo phức đồng – amoniac',
      liquidColor: '#1d4ed8',
      precipitate: { color: '#60a5fa', name: 'Cu(OH)₂ (lúc đầu) → [Cu(NH₃)₄]²⁺', label: 'Tan tạo phức xanh thẫm' },
      molecularEq: 'CuSO_4 + 4NH_3 \\rightarrow [Cu(NH_3)_4]SO_4',
      fullIonicEq: 'Cu^{2+} + 4NH_3 \\rightarrow [Cu(NH_3)_4]^{2+}',
      netIonicEq: 'Cu^{2+} + 4NH_3 \\rightarrow [Cu(NH_3)_4]^{2+}',
      phenomenon: 'Ban đầu xuất hiện kết tủa xanh nhạt Cu(OH)₂, sau đó kết tủa tan nhanh trong NH₃ dư tạo dung dịch phức màu xanh lam thẫm đặc trưng.',
      drivingForce: 'Hình thành ion phức bền [Cu(NH₃)₄]²⁺.',
    },
    'FeCl3+NaOH': {
      occurs: true,
      title: 'Tạo kết tủa nâu đỏ Iron(III) hydroxide',
      liquidColor: '#f1f5f9',
      precipitate: { color: '#9a3412', name: 'Fe(OH)₃', label: 'Kết tủa nâu đỏ' },
      molecularEq: 'FeCl_3 + 3NaOH \\rightarrow Fe(OH)_3\\downarrow + 3NaCl',
      fullIonicEq: 'Fe^{3+} + 3Cl^- + 3Na^+ + 3OH^- \\rightarrow Fe(OH)_3\\downarrow + 3Na^+ + 3Cl^-',
      netIonicEq: 'Fe^{3+} + 3OH^- \\rightarrow Fe(OH)_3\\downarrow',
      phenomenon: 'Xuất hiện kết tủa keo màu nâu đỏ Fe(OH)₃ lắng nhanh trong ống nghiệm.',
      drivingForce: 'Hình thành hydroxide không tan Fe(OH)₃.',
    },
    'FeCl3+AgNO3': {
      occurs: true,
      title: 'Tạo kết tủa trắng Silver chloride',
      liquidColor: '#fef3c7',
      precipitate: { color: '#f8fafc', name: 'AgCl', label: 'Kết tủa trắng' },
      molecularEq: 'FeCl_3 + 3AgNO_3 \\rightarrow 3AgCl\\downarrow + Fe(NO_3)_3',
      fullIonicEq: 'Fe^{3+} + 3Cl^- + 3Ag^+ + 3NO_3^- \\rightarrow 3AgCl\\downarrow + Fe^{3+} + 3NO_3^-',
      netIonicEq: 'Ag^+ + Cl^- \\rightarrow AgCl\\downarrow',
      phenomenon: 'Xuất hiện kết tủa trắng vón cục AgCl (chuyển xám dần ngoài ánh sáng).',
      drivingForce: 'Phản ứng đặc trưng nhận biết ion halide Cl⁻ bằng Ag⁺.',
    },
    'FeSO4+NaOH': {
      occurs: true,
      title: 'Tạo kết tủa trắng xanh Iron(II) hydroxide',
      liquidColor: '#ecfdf5',
      precipitate: { color: '#86efac', name: 'Fe(OH)₂', label: 'Trắng xanh → hóa nâu ngoài KK' },
      molecularEq: 'FeSO_4 + 2NaOH \\rightarrow Fe(OH)_2\\downarrow + Na_2SO_4',
      fullIonicEq: 'Fe^{2+} + SO_4^{2-} + 2Na^+ + 2OH^- \\rightarrow Fe(OH)_2\\downarrow + 2Na^+ + SO_4^{2-}',
      netIonicEq: 'Fe^{2+} + 2OH^- \\rightarrow Fe(OH)_2\\downarrow',
      phenomenon: 'Tạo kết tủa màu trắng hơi xanh Fe(OH)₂, nếu để ngoài không khí sẽ bị O₂ oxi hóa dần chuyển sang màu nâu đỏ Fe(OH)₃.',
      drivingForce: 'Tạo kết tủa Fe(OH)₂ không tan.',
    },
    'FeSO4+BaCl2': {
      occurs: true,
      title: 'Tạo kết tủa trắng BaSO₄',
      liquidColor: '#d1fae5',
      precipitate: { color: '#ffffff', name: 'BaSO₄', label: 'Kết tủa trắng' },
      molecularEq: 'FeSO_4 + BaCl_2 \\rightarrow BaSO_4\\downarrow + FeCl_2',
      fullIonicEq: 'Fe^{2+} + SO_4^{2-} + Ba^{2+} + 2Cl^- \\rightarrow BaSO_4\\downarrow + Fe^{2+} + 2Cl^-',
      netIonicEq: 'Ba^{2+} + SO_4^{2-} \\rightarrow BaSO_4\\downarrow',
      phenomenon: 'Kết tủa trắng mịn BaSO₄ xuất hiện, dung dịch phía trên màu lục nhạt.',
      drivingForce: 'Tạo kết tủa BaSO₄ không tan.',
    },
    'BaCl2+H2SO4': {
      occurs: true,
      title: 'Nhận biết ion SO₄²⁻ tạo kết tủa trắng BaSO₄',
      liquidColor: '#f8fafc',
      precipitate: { color: '#ffffff', name: 'BaSO₄', label: 'Kết tủa trắng' },
      molecularEq: 'BaCl_2 + H_2SO_4 \\rightarrow BaSO_4\\downarrow + 2HCl',
      fullIonicEq: 'Ba^{2+} + 2Cl^- + 2H^+ + SO_4^{2-} \\rightarrow BaSO_4\\downarrow + 2H^+ + 2Cl^-',
      netIonicEq: 'Ba^{2+} + SO_4^{2-} \\rightarrow BaSO_4\\downarrow',
      phenomenon: 'Xuất hiện kết tủa trắng không tan ngay cả khi dư acid.',
      drivingForce: 'Kết tủa BaSO₄ rất bền trong môi trường acid.',
    },
    'BaCl2+AgNO3': {
      occurs: true,
      title: 'Tạo kết tủa trắng Silver chloride',
      liquidColor: '#f8fafc',
      precipitate: { color: '#f8fafc', name: 'AgCl', label: 'Kết tủa trắng' },
      molecularEq: 'BaCl_2 + 2AgNO_3 \\rightarrow 2AgCl\\downarrow + Ba(NO_3)_2',
      fullIonicEq: 'Ba^{2+} + 2Cl^- + 2Ag^+ + 2NO_3^- \\rightarrow 2AgCl\\downarrow + Ba^{2+} + 2NO_3^-',
      netIonicEq: 'Ag^+ + Cl^- \\rightarrow AgCl\\downarrow',
      phenomenon: 'Xuất hiện kết tủa trắng AgCl lắng xuống đáy ống nghiệm.',
      drivingForce: 'Tạo kết tủa AgCl không tan.',
    },
    'AgNO3+HCl': {
      occurs: true,
      title: 'Nhận biết ion Cl⁻ tạo kết tủa trắng AgCl',
      liquidColor: '#f8fafc',
      precipitate: { color: '#f8fafc', name: 'AgCl', label: 'Kết tủa trắng' },
      molecularEq: 'AgNO_3 + HCl \\rightarrow AgCl\\downarrow + HNO_3',
      fullIonicEq: 'Ag^+ + NO_3^- + H^+ + Cl^- \\rightarrow AgCl\\downarrow + H^+ + NO_3^-',
      netIonicEq: 'Ag^+ + Cl^- \\rightarrow AgCl\\downarrow',
      phenomenon: 'Kết tủa trắng AgCl xuất hiện ngay lập tức, không tan trong HNO₃.',
      drivingForce: 'Tạo chất kết tủa AgCl.',
    },
    'AgNO3+NaOH': {
      occurs: true,
      title: 'Tạo kết tủa nâu đen Silver(I) oxide',
      liquidColor: '#f8fafc',
      precipitate: { color: '#451a03', name: 'Ag₂O', label: 'Kết tủa nâu đen' },
      molecularEq: '2AgNO_3 + 2NaOH \\rightarrow Ag_2O\\downarrow + 2NaNO_3 + H_2O',
      fullIonicEq: '2Ag^+ + 2NO_3^- + 2Na^+ + 2OH^- \\rightarrow Ag_2O\\downarrow + 2Na^+ + 2NO_3^- + H_2O',
      netIonicEq: '2Ag^+ + 2OH^- \\rightarrow Ag_2O\\downarrow + H_2O',
      phenomenon: 'AgOH không bền phân hủy ngay thành kết tủa Ag₂O màu nâu đen.',
      drivingForce: 'Tạo kết tủa Ag₂O và nước ít điện li.',
    },
    'Na2CO3+HCl': {
      occurs: true,
      title: 'Sủi bọt khí Carbon dioxide mạnh',
      liquidColor: '#f8fafc',
      gas: { name: 'CO₂ ↑', intensity: 'high' },
      molecularEq: 'Na_2CO_3 + 2HCl \\rightarrow 2NaCl + CO_2\\uparrow + H_2O',
      fullIonicEq: '2Na^+ + CO_3^{2-} + 2H^+ + 2Cl^- \\rightarrow 2Na^+ + 2Cl^- + CO_2\\uparrow + H_2O',
      netIonicEq: 'CO_3^{2-} + 2H^+ \\rightarrow CO_2\\uparrow + H_2O',
      phenomenon: 'Khí không màu CO₂ thoát ra sủi bọt mạnh ngay khi nhỏ acid HCl vào dung dịch Na₂CO₃.',
      drivingForce: 'Tạo chất khí CO₂ bay hơi và chất điện li yếu H₂O.',
    },
    'Na2CO3+H2SO4': {
      occurs: true,
      title: 'Sủi bọt khí Carbon dioxide mạnh',
      liquidColor: '#f8fafc',
      gas: { name: 'CO₂ ↑', intensity: 'high' },
      molecularEq: 'Na_2CO_3 + H_2SO_4 \\rightarrow Na_2SO_4 + CO_2\\uparrow + H_2O',
      fullIonicEq: '2Na^+ + CO_3^{2-} + 2H^+ + SO_4^{2-} \\rightarrow 2Na^+ + SO_4^{2-} + CO_2\\uparrow + H_2O',
      netIonicEq: 'CO_3^{2-} + 2H^+ \\rightarrow CO_2\\uparrow + H_2O',
      phenomenon: 'Bọt khí CO₂ thoát ra mạnh từ dung dịch trong suốt.',
      drivingForce: 'Tạo khí CO₂ và nước.',
    },
    'Na2CO3+BaCl2': {
      occurs: true,
      title: 'Tạo kết tủa trắng Barium carbonate',
      liquidColor: '#f8fafc',
      precipitate: { color: '#ffffff', name: 'BaCO₃', label: 'Kết tủa trắng' },
      molecularEq: 'Na_2CO_3 + BaCl_2 \\rightarrow BaCO_3\\downarrow + 2NaCl',
      fullIonicEq: '2Na^+ + CO_3^{2-} + Ba^{2+} + 2Cl^- \\rightarrow BaCO_3\\downarrow + 2Na^+ + 2Cl^-',
      netIonicEq: 'Ba^{2+} + CO_3^{2-} \\rightarrow BaCO_3\\downarrow',
      phenomenon: 'Xuất hiện kết tủa trắng BaCO₃ (tan được trong dung dịch acid HCl có sủi bọt khí).',
      drivingForce: 'Tạo muối kết tủa BaCO₃.',
    },
  };

  if (table[key]) return table[key];

  return {
    occurs: false,
    title: 'Không xảy ra phản ứng trao đổi ion',
    liquidColor: '#e2e8f0',
    molecularEq: '\\text{Không tạo kết tủa, chất khí hoặc chất điện li yếu}',
    fullIonicEq: '\\text{Các ion tồn tại đồng thời tự do trong dung dịch}',
    netIonicEq: '\\text{Không có phản ứng ion rút gọn}',
    phenomenon: 'Dung dịch đồng nhất, không có kết tủa, không sủi bọt khí hay đổi màu đặc biệt.',
    drivingForce: 'Điều kiện phản ứng trao đổi ion không thỏa mãn (không có ↓, ↑ hay H₂O/acid yếu).',
  };
}

export const ReactionsIonsSim: React.FC = () => {
  const [selectedA, setSelectedA] = useState<string>('CuSO4');
  const [selectedB, setSelectedB] = useState<string>('NaOH');
  const [mixed, setMixed] = useState<boolean>(true);

  const solA = useMemo(() => SOLUTIONS_A.find((s) => s.id === selectedA) || SOLUTIONS_A[0], [selectedA]);
  const solB = useMemo(() => REAGENTS_B.find((s) => s.id === selectedB) || REAGENTS_B[0], [selectedB]);
  const outcome = useMemo(() => evaluateReaction(selectedA, selectedB), [selectedA, selectedB]);

  const handleSelectA = (id: string) => {
    setSelectedA(id);
    setMixed(true);
  };

  const handleSelectB = (id: string) => {
    setSelectedB(id);
    setMixed(true);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Mô phỏng Phản ứng &amp; Phương trình Ion Rút gọn
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Chọn cặp dung dịch chất điện li để quan sát hiện tượng kết tủa, sủi bọt khí và phân tích phương trình ion rút gọn.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedA('CuSO4');
            setSelectedB('NaOH');
            setMixed(true);
          }}
          className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm lại mặc định</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Reagent Selectors */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
              1. Dung dịch mẫu thử (Ống nghiệm A)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SOLUTIONS_A.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectA(s.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedA === s.id
                      ? 'bg-teal-50 border-teal-400 ring-1 ring-teal-400'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="font-black text-sm text-slate-900">{s.formula}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">{s.ions}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
              2. Thuốc thử nhỏ vào (Ống nhỏ giọt B)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {REAGENTS_B.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectB(s.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedB === s.id
                      ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="font-black text-sm text-slate-900">{s.formula}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">{s.ions}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Visual Test Tube Stage */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white flex flex-col items-center justify-between min-h-[400px]">
          <div className="w-full text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
              Ống nghiệm quan sát hiện tượng
            </span>
            <h3 className="text-base font-black mt-1">
              {solA.formula} + {solB.formula}
            </h3>
          </div>

          {/* Interactive SVG Test Tube */}
          <svg viewBox="0 0 180 250" className="w-44 h-60 my-2">
            {/* Dropper at top */}
            <path d="M84,10 L96,10 L94,35 L86,35 Z" fill="#cbd5e1" />
            <circle cx="90" cy="46" r="4.5" fill="#38bdf8" />

            {/* Test Tube Liquid */}
            <defs>
              <clipPath id="tubeClip">
                <path d="M55,60 L125,60 L125,195 A35,35 0 0,1 55,195 Z" />
              </clipPath>
            </defs>

            <g clipPath="url(#tubeClip)">
              {/* Background clear glass */}
              <rect x="55" y="60" width="70" height="175" fill="#1e293b" />
              {/* Mixed liquid */}
              <rect
                x="55"
                y="115"
                width="70"
                height="120"
                fill={mixed ? outcome.liquidColor : solA.color}
                opacity="0.88"
              />
              {/* Precipitate layer */}
              {mixed && outcome.precipitate && (
                <>
                  <path
                    d="M55,196 Q75,188 90,194 Q108,199 125,193 L125,235 L55,235 Z"
                    fill={outcome.precipitate.color}
                  />
                  <circle cx="72" cy="182" r="3" fill={outcome.precipitate.color} opacity="0.8" />
                  <circle cx="102" cy="176" r="2.5" fill={outcome.precipitate.color} opacity="0.8" />
                  <circle cx="88" cy="186" r="3.5" fill={outcome.precipitate.color} opacity="0.9" />
                </>
              )}
              {/* Rising gas bubbles */}
              {mixed && outcome.gas && (
                <g fill="#f8fafc" opacity="0.85">
                  <circle cx="75" cy="170" r="3" />
                  <circle cx="95" cy="155" r="4" />
                  <circle cx="82" cy="138" r="3.5" />
                  <circle cx="104" cy="128" r="2.5" />
                  <circle cx="88" cy="120" r="4" />
                </g>
              )}
            </g>

            {/* Test tube glass outline */}
            <path
              d="M55,60 L125,60 L125,195 A35,35 0 0,1 55,195 Z"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="3"
            />
            <rect x="50" y="55" width="80" height="7" rx="3.5" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
          </svg>

          <div className="w-full text-center space-y-1.5">
            {mixed && outcome.precipitate && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300">
                ↓ {outcome.precipitate.name} ({outcome.precipitate.label})
              </div>
            )}
            {mixed && outcome.gas && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-sky-300">
                ↑ Sủi bọt khí {outcome.gas.name}
              </div>
            )}
            {mixed && !outcome.occurs && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                Dung dịch đồng nhất (không phản ứng)
              </div>
            )}
          </div>
        </div>

        {/* Right: Ionic Equations & Explanation */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Phân tích phản ứng ion trong dung dịch
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">{outcome.title}</h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border ${
                outcome.occurs
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {outcome.occurs ? 'Có phản ứng' : 'Không phản ứng'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500">1. Phương trình phân tử:</span>
              <ChemFormula formula={outcome.molecularEq} isBlock className="text-sm font-bold text-slate-900" />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500">2. Phương trình ion đầy đủ:</span>
              <ChemFormula formula={outcome.fullIonicEq} isBlock className="text-sm text-slate-800" />
            </div>

            <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 space-y-1">
              <span className="text-xs font-extrabold text-teal-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                3. Phương trình ion rút gọn:
              </span>
              <ChemFormula formula={outcome.netIonicEq} isBlock className="text-base font-black text-teal-950" />
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-sm">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 uppercase">
              <Info className="w-4 h-4 text-amber-700" />
              <span>Hiện tượng &amp; Bản chất</span>
            </div>
            <p className="text-slate-800 text-xs md:text-sm leading-relaxed">
              <strong>Hiện tượng:</strong> {outcome.phenomenon}
            </p>
            <p className="text-slate-700 text-xs leading-relaxed">
              <strong>Điều kiện xảy ra:</strong> {outcome.drivingForce}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
