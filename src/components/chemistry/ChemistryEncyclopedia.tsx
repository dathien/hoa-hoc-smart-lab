import React, { useMemo, useState } from 'react';
import { BookMarked, Search, Atom, Grid3X3, FlaskConical, Languages, Zap, ArrowRight } from 'lucide-react';
import { ChemFormula } from '../common/ChemFormula';
import { CATEGORY_META, ELEMENTS_118, getElementByZ } from '../../data/elements118';

interface ChemistryEncyclopediaProps {
  selectedElementZ?: number;
  onSelectElementZ?: (z: number) => void;
  onInspectAtom?: (z: number) => void;
  onOpenPeriodic?: () => void;
}

type EncyclopediaSection = 'element-guide' | 'formulas' | 'solubility' | 'nomenclature' | 'activity-series';

const ELEMENT_REACTIONS_SAMPLE: Record<
  number,
  { oxide: string; hydroxide: string; notes: string; equations: string[] }
> = {
  1: {
    oxide: 'H_2O',
    hydroxide: 'Không áp dụng (nước trung tính)',
    notes: 'Phi kim nhẹ nhất, vừa có tính khử vừa có tính oxi hóa (tạo hydride ion H⁻ với kim loại kiềm).',
    equations: ['2H_2 + O_2 \\xrightarrow{t^\\circ} 2H_2O', 'H_2 + CuO \\xrightarrow{t^\\circ} Cu + H_2O'],
  },
  6: {
    oxide: 'CO_2 (acidic oxide)',
    hydroxide: 'H_2CO_3 (acid yếu)',
    notes: 'Tạo vô số hợp chất hữu cơ nhờ khả năng liên kết thành mạch dài và vòng bền.',
    equations: ['C + O_2 \\xrightarrow{t^\\circ} CO_2', 'CO_2 + Ca(OH)_2 \\rightarrow CaCO_3\\downarrow + H_2O'],
  },
  7: {
    oxide: 'N_2O_5',
    hydroxide: 'HNO_3 (acid mạnh)',
    notes: 'Đơn chất N₂ trơ ở nhiệt độ thường do liên kết ba N≡N có năng lượng liên kết rất lớn (945 kJ/mol).',
    equations: ['N_2 + 3H_2 \\xrightleftharpoons[Fe]{t^\\circ, p} 2NH_3', '4NH_3 + 5O_2 \\xrightarrow{Pt, t^\\circ} 4NO + 6H_2O'],
  },
  8: {
    oxide: 'O_2, O_3',
    hydroxide: 'Không có (chất oxi hóa chuẩn)',
    notes: 'Phi kim hoạt động mạnh, độ âm điện 3,44 (chỉ đứng sau Fluorine), số oxi hóa phổ biến -2.',
    equations: ['2Mg + O_2 \\xrightarrow{t^\\circ} 2MgO', '4Fe + 3O_2 \\xrightarrow{t^\\circ} 2Fe_2O_3'],
  },
  11: {
    oxide: 'Na_2O (basic oxide)',
    hydroxide: 'NaOH (base mạnh)',
    notes: 'Kim loại kiềm điển hình, tính khử rất mạnh, bảo quản trong dầu hỏa khan.',
    equations: ['2Na + 2H_2O \\rightarrow 2NaOH + H_2\\uparrow', '2Na + Cl_2 \\xrightarrow{t^\\circ} 2NaCl'],
  },
  12: {
    oxide: 'MgO (basic oxide)',
    hydroxide: 'Mg(OH)_2 (base yếu, ít tan)',
    notes: 'Cháy sáng chói trong không khí và tác dụng mạnh với acid giải phóng khí H₂.',
    equations: ['Mg + 2HCl \\rightarrow MgCl_2 + H_2\\uparrow', '2Mg + O_2 \\xrightarrow{t^\\circ} 2MgO'],
  },
  13: {
    oxide: 'Al_2O_3 (lưỡng tính)',
    hydroxide: 'Al(OH)_3 (hydroxide lưỡng tính)',
    notes: 'Kim loại nhẹ, bền nhờ màng Al₂O₃ bảo vệ; Al₂O₃ và Al(OH)₃ vừa tan trong acid vừa tan trong kiềm mạnh.',
    equations: ['2Al + 2NaOH + 2H_2O \\rightarrow 2NaAlO_2 + 3H_2\\uparrow', 'Al_2O_3 + 6HCl \\rightarrow 2AlCl_3 + 3H_2O'],
  },
  16: {
    oxide: 'SO_2, SO_3',
    hydroxide: 'H_2SO_4 (acid rất mạnh)',
    notes: 'Lưu huỳnh có các số oxi hóa -2, 0, +4, +6; H₂SO₄ đặc nóng có tính oxi hóa mạnh và tính háo nước.',
    equations: ['S + O_2 \\xrightarrow{t^\\circ} SO_2', 'Cu + 2H_2SO_4(\\text{đặc}) \\xrightarrow{t^\\circ} CuSO_4 + SO_2\\uparrow + 2H_2O'],
  },
  17: {
    oxide: 'Cl_2O_7',
    hydroxide: 'HClO_4 (acid mạnh nhất trong các acid vô cơ)',
    notes: 'Halogen phổ biến có số oxi hóa -1 trong muối chloride và từ +1 đến +7 trong các oxoacid.',
    equations: ['Cl_2 + 2NaOH \\rightarrow NaCl + NaClO + H_2O', '2Fe + 3Cl_2 \\xrightarrow{t^\\circ} 2FeCl_3'],
  },
  20: {
    oxide: 'CaO (vôi sống)',
    hydroxide: 'Ca(OH)_2 (nước vôi trong)',
    notes: 'Kim loại kiềm thổ hoạt động mạnh, phản ứng với nước ở nhiệt độ thường.',
    equations: ['Ca + 2H_2O \\rightarrow Ca(OH)_2 + H_2\\uparrow', 'CaO + H_2O \\rightarrow Ca(OH)_2'],
  },
  26: {
    oxide: 'FeO, Fe_2O_3, Fe_3O_4',
    hydroxide: 'Fe(OH)_2, Fe(OH)_3',
    notes: 'Kim loại chuyển tiếp có hai số oxi hóa đặc trưng +2 và +3; bị thụ động hóa trong HNO₃ đặc nguội và H₂SO₄ đặc nguội.',
    equations: ['Fe + CuSO_4 \\rightarrow FeSO_4 + Cu', 'Fe + 2HCl \\rightarrow FeCl_2 + H_2\\uparrow'],
  },
  29: {
    oxide: 'CuO (màu đen)',
    hydroxide: 'Cu(OH)_2 (kết tủa xanh lam)',
    notes: 'Kim loại kém hoạt động (đứng sau H), không tan trong HCl/H₂SO₄ loãng nhưng tan trong HNO₃ và H₂SO₄ đặc nóng.',
    equations: ['Cu + 4HNO_3(\\text{đặc}) \\rightarrow Cu(NO_3)_2 + 2NO_2\\uparrow + 2H_2O', 'Cu(OH)_2 + 2HCl \\rightarrow CuCl_2 + 2H_2O'],
  },
};

export const ChemistryEncyclopedia: React.FC<ChemistryEncyclopediaProps> = ({
  selectedElementZ = 11,
  onSelectElementZ,
  onInspectAtom,
  onOpenPeriodic,
}) => {
  const [section, setSection] = useState<EncyclopediaSection>('element-guide');
  const [searchQuery, setSearchQuery] = useState('');

  const el = useMemo(() => getElementByZ(selectedElementZ), [selectedElementZ]);
  const elMeta = CATEGORY_META[el.category];
  const quickReaction = ELEMENT_REACTIONS_SAMPLE[el.z];

  const formulas = [
    {
      title: 'Nồng độ mol (CM)',
      formula: 'C_M = \\frac{n}{V_{dd}}',
      condition: 'V đo bằng lít (L), n đo bằng mol',
      note: 'C_M = \\frac{10 \\cdot D \\cdot C\\%}{M}',
    },
    {
      title: 'Nồng độ phần trăm (C%)',
      formula: 'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%',
      condition: 'm_ct, m_dd cùng đơn vị gam (g)',
      note: 'm_{dd} = m_{ct} + m_{\\text{dung môi}} = V \\cdot D',
    },
    {
      title: 'Thể tích khí ở ĐKC (25°C, 1 bar)',
      formula: 'V = n \\times 24,79',
      condition: 'Chuẩn IUPAC GDPT 2018 (1 bar, 298 K)',
      note: 'n = \\frac{V}{24,79}\\ (\\text{mol})',
    },
    {
      title: 'Hằng số cân bằng (KC)',
      formula: 'K_C = \\frac{[C]^c [D]^d}{[A]^a [B]^b}',
      condition: 'Chỉ gồm chất khí và chất tan trong dung dịch',
      note: 'Chất rắn nguyên chất không xuất hiện trong KC.',
    },
    {
      title: 'Độ pH dung dịch',
      formula: 'pH = -\\log[H^+]',
      condition: 'Ở 25°C: pH + pOH = 14',
      note: '[H^+] \\cdot [OH^-] = 10^{-14}',
    },
    {
      title: 'Biến thiên Enthalpy chuẩn phản ứng',
      formula: '\\Delta_r H^\\circ_{298} = \\sum \\Delta_f H^\\circ_{298}(\\text{sp}) - \\sum \\Delta_f H^\\circ_{298}(\\text{cđ})',
      condition: 'Hoặc tính theo năng lượng liên kết Eb',
      note: '\\Delta_r H^\\circ < 0: \\text{tỏa nhiệt};\\ \\Delta_r H^\\circ > 0: \\text{thu nhiệt}',
    },
    {
      title: 'Suất điện động chuẩn của pin điện hóa',
      formula: 'E^\\circ_{\\text{pin}} = E^\\circ_{\\text{cathode (+)}} - E^\\circ_{\\text{anode (-)}}',
      condition: 'Ở điều kiện chuẩn [ion] = 1 M, 25°C',
      note: 'Anode có thế khử nhỏ hơn (kim loại mạnh hơn).',
    },
    {
      title: 'Định luật bảo toàn electron',
      formula: '\\sum n_e\\ (\\text{cho}) = \\sum n_e\\ (\\text{nhận})',
      condition: 'Áp dụng cho mọi phản ứng oxi hóa – khử',
      note: 'Giúp giải nhanh bài toán nhiều giai đoạn.',
    },
  ];

  const filteredFormulas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return formulas;
    return formulas.filter(
      (f) => f.title.toLowerCase().includes(q) || f.condition.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const solubilityRows = [
    { ion: 'Na⁺, K⁺, NH₄⁺', oh: 'T', cl: 'T', br: 'T', so4: 'T', co3: 'T', po4: 'T', no3: 'T' },
    { ion: 'Ba²⁺', oh: 'T', cl: 'T', br: 'T', so4: 'K (trắng)', co3: 'K (trắng)', po4: 'K (trắng)', no3: 'T' },
    { ion: 'Ca²⁺', oh: 'I', cl: 'T', br: 'T', so4: 'I', co3: 'K (trắng)', po4: 'K (trắng)', no3: 'T' },
    { ion: 'Mg²⁺', oh: 'K (trắng)', cl: 'T', br: 'T', so4: 'T', co3: 'K (trắng)', po4: 'K (trắng)', no3: 'T' },
    { ion: 'Al³⁺', oh: 'K (keo trắng)', cl: 'T', br: 'T', so4: 'T', co3: 'B', po4: 'K (trắng)', no3: 'T' },
    { ion: 'Zn²⁺', oh: 'K (keo trắng)', cl: 'T', br: 'T', so4: 'T', co3: 'K (trắng)', po4: 'K (trắng)', no3: 'T' },
    { ion: 'Fe²⁺', oh: 'K (trắng xanh)', cl: 'T', br: 'T', so4: 'T', co3: 'K', po4: 'K', no3: 'T' },
    { ion: 'Fe³⁺', oh: 'K (nâu đỏ)', cl: 'T', br: 'T', so4: 'T', co3: 'B', po4: 'K (vàng nhạt)', no3: 'T' },
    { ion: 'Cu²⁺', oh: 'K (xanh lam)', cl: 'T', br: 'T', so4: 'T', co3: 'B', po4: 'K', no3: 'T' },
    { ion: 'Ag⁺', oh: 'B (→ Ag₂O đen)', cl: 'K (trắng)', br: 'K (vàng nhạt)', so4: 'I', co3: 'K (vàng)', po4: 'K (vàng)', no3: 'T' },
  ];

  const activitySeries = [
    { symbol: 'K', pair: 'K⁺/K', e0: -2.93 },
    { symbol: 'Ba', pair: 'Ba²⁺/Ba', e0: -2.91 },
    { symbol: 'Ca', pair: 'Ca²⁺/Ca', e0: -2.87 },
    { symbol: 'Na', pair: 'Na⁺/Na', e0: -2.71 },
    { symbol: 'Mg', pair: 'Mg²⁺/Mg', e0: -2.37 },
    { symbol: 'Al', pair: 'Al³⁺/Al', e0: -1.66 },
    { symbol: 'Zn', pair: 'Zn²⁺/Zn', e0: -0.76 },
    { symbol: 'Fe', pair: 'Fe²⁺/Fe', e0: -0.44 },
    { symbol: 'Ni', pair: 'Ni²⁺/Ni', e0: -0.26 },
    { symbol: 'Sn', pair: 'Sn²⁺/Sn', e0: -0.14 },
    { symbol: 'Pb', pair: 'Pb²⁺/Pb', e0: -0.13 },
    { symbol: 'H₂', pair: '2H⁺/H₂', e0: 0.0 },
    { symbol: 'Cu', pair: 'Cu²⁺/Cu', e0: 0.34 },
    { symbol: 'Fe³⁺/Fe²⁺', pair: 'Fe³⁺/Fe²⁺', e0: 0.77 },
    { symbol: 'Ag', pair: 'Ag⁺/Ag', e0: 0.8 },
    { symbol: 'Hg', pair: 'Hg²⁺/Hg', e0: 0.85 },
    { symbol: 'Pt', pair: 'Pt²⁺/Pt', e0: 1.19 },
    { symbol: 'Au', pair: 'Au³⁺/Au', e0: 1.5 },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Section Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">Bách khoa Hóa học THPT</h2>
              <p className="text-sm text-slate-600 font-medium">
                Tra cứu kiến thức nguyên tố, công thức GDPT 2018, bảng tính tan, danh pháp IUPAC và thế điện cực chuẩn.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm công thức, quy tắc..."
              className="pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-56 text-slate-800"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'element-guide' as const, label: `Kiến thức nguyên tố (${el.symbol})`, icon: Atom },
            { id: 'formulas' as const, label: 'Công thức trọng tâm', icon: FlaskConical },
            { id: 'solubility' as const, label: 'Bảng tính tan đầy đủ', icon: Grid3X3 },
            { id: 'nomenclature' as const, label: 'Danh pháp IUPAC 2018', icon: Languages },
            { id: 'activity-series' as const, label: 'Dãy hoạt động & Thế E°', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = section === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSection(tab.id)}
                className={`px-3.5 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  active ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: ELEMENT KNOWLEDGE LINKED WITH PERIODIC TABLE */}
      {section === 'element-guide' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${elMeta.bg} ${elMeta.border} ${elMeta.text}`}
              >
                <span className="text-[11px] font-bold">Z = {el.z}</span>
                <span className="text-2xl leading-none">{el.symbol}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {el.name}{el.viName ? ` (${el.viName})` : ''}
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  Chu kì {el.period} · Nhóm {el.group} · Khối {el.block.toUpperCase()} · {elMeta.label}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={el.z}
                onChange={(e) => onSelectElementZ?.(Number(e.target.value))}
                className="px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {ELEMENTS_118.map((item) => (
                  <option key={item.z} value={item.z}>
                    Z={item.z} · {item.symbol} ({item.name})
                  </option>
                ))}
              </select>

              {onInspectAtom && (
                <button
                  onClick={() => onInspectAtom(el.z)}
                  className="px-3.5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-600 text-white rounded-xl flex items-center gap-1.5"
                >
                  <span>Xem nguyên tử 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onOpenPeriodic && (
                <button
                  onClick={onOpenPeriodic}
                  className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl"
                >
                  Về Bảng tuần hoàn
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-slate-900">Vị trí – Cấu tạo – Tính chất cơ bản</h4>
              <ul className="text-sm text-slate-700 space-y-1.5">
                <li>
                  <strong>Cấu hình electron:</strong>{' '}
                  <span className="font-mono font-bold text-teal-800">{el.electronConfig}</span>
                </li>
                <li>
                  <strong>Phân bố lớp:</strong>{' '}
                  <span className="font-mono tabular-nums">{el.shells.join(' – ')}</span>
                </li>
                <li>
                  <strong>Số oxi hóa tiêu biểu:</strong> {el.oxidationStates}
                </li>
                <li>
                  <strong>Tính chất &amp; Ứng dụng:</strong> {el.summary}
                </li>
              </ul>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2.5">
              <h4 className="font-bold text-sm text-teal-950">Hợp chất &amp; Phản ứng tiêu biểu</h4>
              {quickReaction ? (
                <>
                  <div className="text-sm text-slate-800 space-y-1">
                    <div>
                      <strong>Oxide cao nhất / đặc trưng:</strong>{' '}
                      <ChemFormula formula={quickReaction.oxide} className="font-bold text-teal-900" />
                    </div>
                    <div>
                      <strong>Hydroxide / Acid tương ứng:</strong>{' '}
                      <ChemFormula formula={quickReaction.hydroxide} className="font-bold text-teal-900" />
                    </div>
                    <p className="text-xs text-slate-700 pt-1">{quickReaction.notes}</p>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {quickReaction.equations.map((eq, i) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-teal-100 text-sm">
                        <ChemFormula formula={eq} />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-700 space-y-1.5">
                  <p>
                    Nguyên tố <strong>{el.name}</strong> thuộc khối <strong>{el.block.toUpperCase()}</strong>,{' '}
                    nhóm <strong>{el.group}</strong> ({elMeta.label}).
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Trong cùng một chu kì từ trái sang phải (khi Z tăng), bán kính nguyên tử có xu hướng giảm dần, độ âm điện và tính phi kim tăng dần, tính kim loại giảm dần.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: FORMULAS */}
      {section === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFormulas.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <ChemFormula formula={item.formula} isBlock />
              </div>
              <p className="text-xs text-slate-600">
                <strong>Điều kiện:</strong> {item.condition}
              </p>
              <div className="text-xs text-teal-800 bg-teal-50/60 p-2.5 rounded-lg border border-teal-100">
                <ChemFormula formula={item.note} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: SOLUBILITY TABLE */}
      {section === 'solubility' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Bảng Tính Tan Của Hydroxide &amp; Muối Vô Cơ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                T: Tan · I: Ít tan · K: Không tan (kết tủa) · B: Bị thủy phân hoặc không tồn tại trong nước.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-2.5 border border-slate-200 text-left">Cation / Anion</th>
                  <th className="p-2.5 border border-slate-200">OH⁻</th>
                  <th className="p-2.5 border border-slate-200">Cl⁻</th>
                  <th className="p-2.5 border border-slate-200">Br⁻</th>
                  <th className="p-2.5 border border-slate-200">SO₄²⁻</th>
                  <th className="p-2.5 border border-slate-200">CO₃²⁻</th>
                  <th className="p-2.5 border border-slate-200">PO₄³⁻</th>
                  <th className="p-2.5 border border-slate-200">NO₃⁻</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solubilityRows.map((row, idx) => {
                  const cells = [row.oh, row.cl, row.br, row.so4, row.co3, row.po4, row.no3];
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 border border-slate-200 font-bold text-slate-900 bg-slate-50/70 text-left">
                        {row.ion}
                      </td>
                      {cells.map((val, cIdx) => {
                        const isK = val.startsWith('K');
                        const isT = val === 'T';
                        const isB = val.startsWith('B');
                        return (
                          <td
                            key={cIdx}
                            className={`p-2.5 border border-slate-200 font-semibold ${
                              isK
                                ? 'text-rose-700 bg-rose-50/50'
                                : isB
                                ? 'text-amber-700 bg-amber-50/50'
                                : isT
                                ? 'text-emerald-700 bg-emerald-50/30'
                                : 'text-slate-700'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: NOMENCLATURE */}
      {section === 'nomenclature' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-black text-slate-900 text-base">
            Danh pháp Hóa học Tiếng Anh (Chuẩn Chương trình GDPT 2018)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-teal-800">1. Nguyên tố phổ biến</h4>
              <ul className="space-y-1 text-slate-700 text-xs">
                <li><strong>Hydrogen (H)</strong> · Helium (He)</li>
                <li><strong>Carbon (C)</strong> · Nitrogen (N) · Oxygen (O)</li>
                <li><strong>Fluorine (F)</strong> · Chlorine (Cl) · Bromine (Br) · Iodine (I)</li>
                <li><strong>Sulfur (S)</strong> · Phosphorus (P)</li>
                <li><strong>Sodium (Na)</strong> · Potassium (K) · Calcium (Ca)</li>
                <li><strong>Aluminium (Al)</strong> · Iron (Fe) · Copper (Cu) · Zinc (Zn)</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-teal-800">2. Acid, Base &amp; Muối vô cơ</h4>
              <ul className="space-y-1 text-slate-700 text-xs">
                <li><strong>HCl:</strong> Hydrochloric acid</li>
                <li><strong>H₂SO₄:</strong> Sulfuric acid</li>
                <li><strong>HNO₃:</strong> Nitric acid</li>
                <li><strong>NaOH:</strong> Sodium hydroxide</li>
                <li><strong>Fe(OH)₃:</strong> Iron(III) hydroxide</li>
                <li><strong>CuSO₄:</strong> Copper(II) sulfate</li>
                <li><strong>Ba(NO₃)₂:</strong> Barium nitrate</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-teal-800">3. Hợp chất hữu cơ</h4>
              <ul className="space-y-1 text-slate-700 text-xs">
                <li><strong>Alkane (–ane):</strong> Methane, Ethane, Propane, Butane</li>
                <li><strong>Alkene (–ene):</strong> Ethene, Propene, But-1-ene</li>
                <li><strong>Alkyne (–yne):</strong> Ethyne, Propyne</li>
                <li><strong>Alcohol (–ol):</strong> Methanol, Ethanol</li>
                <li><strong>Carboxylic acid:</strong> Methanoic acid, Ethanoic acid</li>
                <li><strong>Ester (–oate):</strong> Ethyl ethanoate (CH₃COOC₂H₅)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: ACTIVITY SERIES & STANDARD POTENTIALS */}
      {section === 'activity-series' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Dãy Hoạt Động Hóa Học &amp; Thế Điện Cực Chuẩn (25°C, 1 M)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Từ trái sang phải: tính khử của kim loại giảm dần, tính oxi hóa của ion kim loại tăng dần.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activitySeries.map((item) => {
              const isH = item.symbol === 'H₂';
              return (
                <div
                  key={item.symbol}
                  className={`px-3 py-2 rounded-xl border text-center min-w-[78px] ${
                    isH
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : item.e0 < 0
                      ? 'bg-teal-50/70 border-teal-200 text-teal-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500">{item.pair}</div>
                  <div className="text-base font-black">{item.symbol}</div>
                  <div className="text-[11px] font-mono font-bold tabular-nums">
                    {item.e0 > 0 ? `+${item.e0.toFixed(2)}` : item.e0.toFixed(2)} V
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 space-y-1.5">
            <div>
              <strong>Quy tắc alpha (α):</strong> Chất oxi hóa mạnh hơn oxi hóa chất khử mạnh hơn để tạo thành chất oxi hóa yếu hơn và chất khử yếu hơn.
            </div>
            <div>
              <strong>Ví dụ:</strong>{' '}
              <ChemFormula formula="Cu^{2+} + Fe \rightarrow Fe^{2+} + Cu" className="font-bold text-teal-800" />{' '}
              (vì <span className="font-mono tabular-nums">E°(Cu²⁺/Cu) = +0,34 V &gt; E°(Fe²⁺/Fe) = -0,44 V</span>).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
