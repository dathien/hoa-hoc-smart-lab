import React, { useState } from 'react';
import { ChemFormula } from '../common/ChemFormula';
import { Card3DViewer } from '../flashcard/Card3DViewer';
import { Search, BookOpen, Layers, Flame, Compass, HelpCircle, Box } from 'lucide-react';

interface ElementData {
  z: number;
  symbol: string;
  name: string;
  latinName: string;
  group: string;
  period: number;
  mass: number;
  electronegativity?: number;
  category: 'kim-loai-kiem' | 'kim-loai-kiem-tho' | 'kim-loai-chuyen-tiep' | 'phi-kim' | 'halogen' | 'khi-hiem' | 'a-kim';
  config: string;
}

const SAMPLE_ELEMENTS: ElementData[] = [
  { z: 1, symbol: 'H', name: 'Hiđro', latinName: 'Hydrogen', group: 'IA', period: 1, mass: 1.008, electronegativity: 2.20, category: 'phi-kim', config: '1s¹' },
  { z: 2, symbol: 'He', name: 'Heli', latinName: 'Helium', group: 'VIIIA', period: 1, mass: 4.003, category: 'khi-hiem', config: '1s²' },
  { z: 3, symbol: 'Li', name: 'Liti', latinName: 'Lithium', group: 'IA', period: 2, mass: 6.94, electronegativity: 0.98, category: 'kim-loai-kiem', config: '[He] 2s¹' },
  { z: 4, symbol: 'Be', name: 'Beri', latinName: 'Beryllium', group: 'IIA', period: 2, mass: 9.012, electronegativity: 1.57, category: 'kim-loai-kiem-tho', config: '[He] 2s²' },
  { z: 5, symbol: 'B', name: 'Bo', latinName: 'Boron', group: 'IIIA', period: 2, mass: 10.81, electronegativity: 2.04, category: 'a-kim', config: '[He] 2s² 2p¹' },
  { z: 6, symbol: 'C', name: 'Cacbon', latinName: 'Carbon', group: 'IVA', period: 2, mass: 12.011, electronegativity: 2.55, category: 'phi-kim', config: '[He] 2s² 2p²' },
  { z: 7, symbol: 'N', name: 'Nitơ', latinName: 'Nitrogen', group: 'VA', period: 2, mass: 14.007, electronegativity: 3.04, category: 'phi-kim', config: '[He] 2s² 2p³' },
  { z: 8, symbol: 'O', name: 'Oxi', latinName: 'Oxygen', group: 'VIA', period: 2, mass: 15.999, electronegativity: 3.44, category: 'phi-kim', config: '[He] 2s² 2p⁴' },
  { z: 9, symbol: 'F', name: 'Flo', latinName: 'Fluorine', group: 'VIIA', period: 2, mass: 18.998, electronegativity: 3.98, category: 'halogen', config: '[He] 2s² 2p⁵' },
  { z: 10, symbol: 'Ne', name: 'Neon', latinName: 'Neon', group: 'VIIIA', period: 2, mass: 20.180, category: 'khi-hiem', config: '[He] 2s² 2p⁶' },
  { z: 11, symbol: 'Na', name: 'Natri', latinName: 'Sodium', group: 'IA', period: 3, mass: 22.990, electronegativity: 0.93, category: 'kim-loai-kiem', config: '[Ne] 3s¹' },
  { z: 12, symbol: 'Mg', name: 'Magie', latinName: 'Magnesium', group: 'IIA', period: 3, mass: 24.305, electronegativity: 1.31, category: 'kim-loai-kiem-tho', config: '[Ne] 3s²' },
  { z: 13, symbol: 'Al', name: 'Nhôm', latinName: 'Aluminium', group: 'IIIA', period: 3, mass: 26.982, electronegativity: 1.61, category: 'kim-loai-chuyen-tiep', config: '[Ne] 3s² 3p¹' },
  { z: 14, symbol: 'Si', name: 'Silic', latinName: 'Silicon', group: 'IVA', period: 3, mass: 28.085, electronegativity: 1.90, category: 'a-kim', config: '[Ne] 3s² 3p²' },
  { z: 15, symbol: 'P', name: 'Photpho', latinName: 'Phosphorus', group: 'VA', period: 3, mass: 30.974, electronegativity: 2.19, category: 'phi-kim', config: '[Ne] 3s² 3p³' },
  { z: 16, symbol: 'S', name: 'Lưu huỳnh', latinName: 'Sulfur', group: 'VIA', period: 3, mass: 32.06, electronegativity: 2.58, category: 'phi-kim', config: '[Ne] 3s² 3p⁴' },
  { z: 17, symbol: 'Cl', name: 'Clo', latinName: 'Chlorine', group: 'VIIA', period: 3, mass: 35.45, electronegativity: 3.16, category: 'halogen', config: '[Ne] 3s² 3p⁵' },
  { z: 18, symbol: 'Ar', name: 'Agon', latinName: 'Argon', group: 'VIIIA', period: 3, mass: 39.948, category: 'khi-hiem', config: '[Ne] 3s² 3p⁶' },
  { z: 19, symbol: 'K', name: 'Kali', latinName: 'Potassium', group: 'IA', period: 4, mass: 39.098, electronegativity: 0.82, category: 'kim-loai-kiem', config: '[Ar] 4s¹' },
  { z: 20, symbol: 'Ca', name: 'Canxi', latinName: 'Calcium', group: 'IIA', period: 4, mass: 40.078, electronegativity: 1.00, category: 'kim-loai-kiem-tho', config: '[Ar] 4s²' },
  { z: 26, symbol: 'Fe', name: 'Sắt', latinName: 'Iron', group: 'VIIIB', period: 4, mass: 55.845, electronegativity: 1.83, category: 'kim-loai-chuyen-tiep', config: '[Ar] 3d⁶ 4s²' },
  { z: 29, symbol: 'Cu', name: 'Đồng', latinName: 'Copper', group: 'IB', period: 4, mass: 63.546, electronegativity: 1.90, category: 'kim-loai-chuyen-tiep', config: '[Ar] 3d¹⁰ 4s¹' },
  { z: 30, symbol: 'Zn', name: 'Kẽm', latinName: 'Zinc', group: 'IIB', period: 4, mass: 65.38, electronegativity: 1.65, category: 'kim-loai-chuyen-tiep', config: '[Ar] 3d¹⁰ 4s²' },
  { z: 35, symbol: 'Br', name: 'Brom', latinName: 'Bromine', group: 'VIIA', period: 4, mass: 79.904, electronegativity: 2.96, category: 'halogen', config: '[Ar] 3d¹⁰ 4s² 4p⁵' },
  { z: 47, symbol: 'Ag', name: 'Bạc', latinName: 'Silver', group: 'IB', period: 5, mass: 107.868, electronegativity: 1.93, category: 'kim-loai-chuyen-tiep', config: '[Kr] 4d¹⁰ 5s¹' },
  { z: 53, symbol: 'I', name: 'Iot', latinName: 'Iodine', group: 'VIIA', period: 5, mass: 126.904, electronegativity: 2.66, category: 'halogen', config: '[Kr] 4d¹⁰ 5s² 5p⁵' },
  { z: 56, symbol: 'Ba', name: 'Bari', latinName: 'Barium', group: 'IIA', period: 6, mass: 137.327, electronegativity: 0.89, category: 'kim-loai-kiem-tho', config: '[Xe] 6s²' },
  { z: 79, symbol: 'Au', name: 'Vàng', latinName: 'Gold', group: 'IB', period: 6, mass: 196.967, electronegativity: 2.54, category: 'kim-loai-chuyen-tiep', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹' },
];

export const PeriodicTableHandbook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'periodic' | 'formulas' | 'solubility' | 'nomenclature' | 'models3d'>('periodic');
  const [selectedEl, setSelectedEl] = useState<ElementData>(SAMPLE_ELEMENTS[10]); // Sodium
  const [active3DModel, setActive3DModel] = useState<'H2O' | 'CH4' | 'SO3' | 'H2SO4' | 'CO2' | 'NH3'>('H2O');

  const filteredElements = SAMPLE_ELEMENTS.filter(
    (el) =>
      el.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.latinName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('periodic')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'periodic' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bảng tuần hoàn
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'formulas' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Công thức tính toán
          </button>
          <button
            onClick={() => setActiveTab('solubility')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'solubility' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bảng tính tan
          </button>
          <button
            onClick={() => setActiveTab('nomenclature')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'nomenclature' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh pháp IUPAC
          </button>
          <button
            onClick={() => setActiveTab('models3d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'models3d' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-teal-600" />
            Cấu tạo 3D (Xoay tương tác)
          </button>
        </div>

        {activeTab === 'periodic' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo kí hiệu, tên (Na, Clo, 11)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-56 text-slate-800"
            />
          </div>
        )}
      </div>

      {/* TAB 1: PERIODIC TABLE */}
      {activeTab === 'periodic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Grid of Elements */}
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Danh sách nguyên tố tiêu biểu (Chương trình GDPT 2018)
              </h3>
              <span className="text-[11px] text-slate-400">Bấm vào ô nguyên tố để xem hồ sơ chi tiết</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
              {filteredElements.map((el) => {
                const isSelected = selectedEl.z === el.z;
                let bgBadge = 'bg-slate-50 hover:bg-slate-100 border-slate-200';
                if (el.category === 'kim-loai-kiem') bgBadge = 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900';
                if (el.category === 'kim-loai-kiem-tho') bgBadge = 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900';
                if (el.category === 'halogen') bgBadge = 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900';
                if (el.category === 'khi-hiem') bgBadge = 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900';
                if (el.category === 'phi-kim') bgBadge = 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900';

                return (
                  <button
                    key={el.z}
                    onClick={() => setSelectedEl(el)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-between h-20 transition-all ${bgBadge} ${
                      isSelected ? 'ring-2 ring-teal-600 shadow-md transform scale-105' : ''
                    }`}
                  >
                    <div className="w-full flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>{el.z}</span>
                      <span>{el.mass.toFixed(1)}</span>
                    </div>
                    <span className="text-base font-extrabold">{el.symbol}</span>
                    <span className="text-[9px] font-semibold truncate w-full text-center">{el.latinName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Element Inspector Card */}
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="p-4 bg-gradient-to-br from-teal-700 to-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-300 font-bold block uppercase tracking-wider">
                  Ô số {selectedEl.z} · Chu kì {selectedEl.period} · Nhóm {selectedEl.group}
                </span>
                <h4 className="text-2xl font-black mt-1">{selectedEl.name} ({selectedEl.symbol})</h4>
                <span className="text-xs text-slate-300 font-medium">{selectedEl.latinName}</span>
              </div>
              <div className="text-4xl font-black text-white/30">{selectedEl.symbol}</div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Nguyên tử khối:</span>
                <span className="font-bold text-slate-800">{selectedEl.mass} amu</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Độ âm điện (Pauling):</span>
                <span className="font-bold text-slate-800">{selectedEl.electronegativity ?? 'Không xác định'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Cấu hình electron:</span>
                <span className="font-bold text-teal-700">{selectedEl.config}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Phân loại:</span>
                <span className="font-bold text-slate-800 capitalize">{selectedEl.category.replace(/-/g, ' ')}</span>
              </div>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs space-y-1">
              <span className="font-bold text-teal-900 block">Quy tắc biến đổi tuần hoàn:</span>
              <p className="text-teal-800 text-[11px] leading-relaxed">
                Trong cùng chu kì theo chiều Z tăng: Bán kính nguyên tử giảm, độ âm điện tăng, tính kim loại giảm và tính phi kim tăng.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FORMULAS */}
      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Nồng độ mol (CM)',
              formula: 'C_M = \\frac{n}{V_{dd}}',
              condition: 'V đo bằng lít (L), n đo bằng mol',
              note: 'Quan hệ với khối lượng riêng: C_M = \\frac{10 \\times D \\times C\\%}{M}',
            },
            {
              title: 'Nồng độ phần trăm (C%)',
              formula: 'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%',
              condition: 'm_ct và m_dd cùng đơn vị gam (g)',
              note: 'm_{dd} = m_{ct} + m_{dm} = V \\times D',
            },
            {
              title: 'Hằng số cân bằng (KC)',
              formula: 'K_C = \\frac{[C]^c [D]^d}{[A]^a [B]^b}',
              condition: 'Áp dụng cho chất khí và chất tan trong dung dịch ở trạng thái cân bằng',
              note: 'Chất rắn nguyên chất không xuất hiện trong biểu thức KC.',
            },
            {
              title: 'Tính pH dung dịch',
              formula: 'pH = -\\log[H^+]',
              condition: 'Ở 25°C: pH + pOH = 14',
              note: '[H^+] \\times [OH^-] = 10^{-14}',
            },
            {
              title: 'Định luật bảo toàn khối lượng',
              formula: '\\sum m_{tham\\ gia} = \\sum m_{san\\ pham}',
              condition: 'Hệ kín không thất thoát khí hoặc chất lỏng',
              note: 'Áp dụng mọi phản ứng hóa học thông thường.',
            },
            {
              title: 'Khí lý tưởng ở điều kiện chuẩn (25°C, 1 bar)',
              formula: 'V = n \\times 24,79',
              condition: 'Theo SGK GDPT 2018 (Chuẩn IUPAC 1 bar thay cho 1 atm 22.4L)',
              note: 'n = \\frac{V}{24,79} (mol)',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <h4 className="font-bold text-xs text-slate-800">{item.title}</h4>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <ChemFormula formula={item.formula} isBlock />
              </div>
              <p className="text-[11px] text-slate-600">
                <strong>Điều kiện:</strong> {item.condition}
              </p>
              <div className="text-[11px] text-teal-700 bg-teal-50/50 p-2 rounded border border-teal-100">
                <ChemFormula formula={item.note} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SOLUBILITY TABLE */}
      {activeTab === 'solubility' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Bảng Tính Tan Của Một Số Muối & Hydroxide Thường Gặp</h3>
          <p className="text-xs text-slate-500">T: Tan; K: Không tan (kết tủa); I: Ít tan; B: Bị thủy phân / Không tồn tại.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2 border">Cation / Anion</th>
                  <th className="p-2 border">OH⁻</th>
                  <th className="p-2 border">Cl⁻</th>
                  <th className="p-2 border">SO₄²⁻</th>
                  <th className="p-2 border">CO₃²⁻</th>
                  <th className="p-2 border">NO₃⁻</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { ion: 'Na⁺ / K⁺', oh: 'T', cl: 'T', so4: 'T', co3: 'T', no3: 'T' },
                  { ion: 'Ba²⁺', oh: 'T', cl: 'T', so4: 'K (trắng)', co3: 'K (trắng)', no3: 'T' },
                  { ion: 'Ca²⁺', oh: 'I', cl: 'T', so4: 'I', co3: 'K (trắng)', no3: 'T' },
                  { ion: 'Cu²⁺', oh: 'K (xanh lam)', cl: 'T', so4: 'T', co3: 'B', no3: 'T' },
                  { ion: 'Fe²⁺', oh: 'K (trắng xanh)', cl: 'T', so4: 'T', co3: 'K', no3: 'T' },
                  { ion: 'Fe³⁺', oh: 'K (nâu đỏ)', cl: 'T', so4: 'T', co3: 'B', no3: 'T' },
                  { ion: 'Ag⁺', oh: 'B (tạo Ag₂O)', cl: 'K (trắng)', so4: 'I', co3: 'K', no3: 'T' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 border font-bold text-slate-800 bg-slate-50/50">{row.ion}</td>
                    <td className={`p-2 border font-medium ${row.oh.startsWith('K') ? 'text-rose-600 bg-rose-50/40' : 'text-slate-700'}`}>{row.oh}</td>
                    <td className={`p-2 border font-medium ${row.cl.startsWith('K') ? 'text-rose-600 bg-rose-50/40' : 'text-slate-700'}`}>{row.cl}</td>
                    <td className={`p-2 border font-medium ${row.so4.startsWith('K') ? 'text-rose-600 bg-rose-50/40' : 'text-slate-700'}`}>{row.so4}</td>
                    <td className={`p-2 border font-medium ${row.co3.startsWith('K') ? 'text-rose-600 bg-rose-50/40' : 'text-slate-700'}`}>{row.co3}</td>
                    <td className="p-2 border font-medium text-emerald-700 bg-emerald-50/30">{row.no3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: NOMENCLATURE */}
      {activeTab === 'nomenclature' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Quy Tắc Đọc Tên Tiếng Anh Hóa Học (Chuẩn GDPT 2018)</h3>
          <p className="text-xs text-slate-500">Áp dụng cho sách giáo khoa mới thay thế tên gọi phiên âm tiếng Việt cũ.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-teal-800">1. Đơn chất & Nguyên tố thường gặp</h4>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-700">
                <li><strong>Hydrogen</strong> (trước đây: Hiđro)</li>
                <li><strong>Oxygen</strong> (trước đây: Oxi)</li>
                <li><strong>Nitrogen</strong> (trước đây: Nitơ)</li>
                <li><strong>Sulfur</strong> (trước đây: Lưu huỳnh)</li>
                <li><strong>Chlorine</strong> (trước đây: Clo)</li>
                <li><strong>Sodium</strong> (trước đây: Natri)</li>
                <li><strong>Potassium</strong> (trước đây: Kali)</li>
                <li><strong>Iron</strong> (trước đây: Sắt)</li>
                <li><strong>Copper</strong> (trước đây: Đồng)</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-teal-800">2. Hợp chất Acid và Base</h4>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-700">
                <li><strong>Hydrochloric acid</strong> (HCl - Axit clohidric)</li>
                <li><strong>Sulfuric acid</strong> (H₂SO₄ - Axit sunfuric)</li>
                <li><strong>Nitric acid</strong> (HNO₃ - Axit nitric)</li>
                <li><strong>Acetic acid / Ethanoic acid</strong> (CH₃COOH - Axit axetic)</li>
                <li><strong>Sodium hydroxide</strong> (NaOH - Natri hiđroxit)</li>
                <li><strong>Calcium hydroxide</strong> (Ca(OH)₂ - Canxi hiđroxit / Nước vôi trong)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTERACTIVE 3D MOLECULAR MODELS EXPLORER */}
      {activeTab === 'models3d' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Khám Phá Cấu Trúc Không Gian Phân Tử 3D Tương Tác
              </h3>
              <p className="text-xs text-slate-500">
                Kéo chuột để xoay 360°, quan sát góc liên kết và dạng hình học của các chất tiêu biểu (H₂O, CH₄, SO₃, H₂SO₄...).
              </p>
            </div>

            {/* Molecule Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              {[
                { id: 'H2O' as const, label: 'Nước (H₂O)' },
                { id: 'CH4' as const, label: 'Methane (CH₄)' },
                { id: 'SO3' as const, label: 'SO₃' },
                { id: 'H2SO4' as const, label: 'H₂SO₄' },
                { id: 'CO2' as const, label: 'CO₂' },
                { id: 'NH3' as const, label: 'NH₃' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActive3DModel(m.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    active3DModel === m.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Interactive 3D Canvas */}
            <div className="md:col-span-7 bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center">
              <Card3DViewer
                modelType={active3DModel}
                height={280}
                className="w-full"
                interactive={true}
              />
              <span className="text-[11px] text-slate-400 mt-2 select-none">
                Kéo chuột trên mô hình để xoay không gian 3 chiều tự do
              </span>
            </div>

            {/* Scientific Details */}
            <div className="md:col-span-5 space-y-3 text-xs">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-teal-950">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                  Phân tích hình học phân tử chuẩn GDPT 2018:
                </span>
                <h4 className="text-base font-extrabold text-teal-900">
                  {active3DModel === 'H2O' && 'Phân tử Nước (H₂O) – Dạng gấp khúc'}
                  {active3DModel === 'CH4' && 'Phân tử Methane (CH₄) – Tứ diện đều'}
                  {active3DModel === 'SO3' && 'Lưu huỳnh Trioxide (SO₃) – Tam giác phẳng'}
                  {active3DModel === 'H2SO4' && 'Axit Sulfuric (H₂SO₄) – Tứ diện biến dạng'}
                  {active3DModel === 'CO2' && 'Khí Carbonic (CO₂) – Thẳng hàng'}
                  {active3DModel === 'NH3' && 'Amoniac (NH₃) – Chóp tam giác'}
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {active3DModel === 'H2O' &&
                    'Nguyên tử Oxi ở trạng thái lai hóa sp³ lệch do 2 cặp electron không liên kết đẩy mạnh các cặp electron liên kết, làm góc liên kết H–O–H thu hẹp lại còn 104,5° (thay vì 109,5° chuẩn).'}
                  {active3DModel === 'CH4' &&
                    'Nguyên tử Carbon ở tâm lai hóa sp³ tạo 4 liên kết đơn C–H hướng về 4 đỉnh của tứ diện đều đối xứng hoàn toàn, góc liên kết H–C–H là 109,5°.'}
                  {active3DModel === 'SO3' &&
                    'Nguyên tử Lưu huỳnh lai hóa sp² tạo 3 liên kết với 3 nguyên tử Oxi hướng về 3 đỉnh tam giác đều, góc liên kết O–S–O là 120°, phân tử phẳng hoàn toàn.'}
                  {active3DModel === 'H2SO4' &&
                    'Lưu huỳnh ở tâm tứ diện liên kết với 4 nguyên tử Oxi. Hai nguyên tử Oxi liên kết đôi mang mật độ điện tích âm cao, hai nguyên tử Oxi còn lại gắn với Hidro tạo liên kết phân cực mạnh.'}
                  {active3DModel === 'CO2' &&
                    'Carbon lai hóa sp tạo liên kết đôi với 2 nguyên tử Oxi ở hai phía đối xứng, góc liên kết O=C=O là 180°, phân tử thẳng hàng không phân cực.'}
                  {active3DModel === 'NH3' &&
                    'Nitơ lai hóa sp³ còn 1 cặp electron tự do ở đỉnh chóp, góc liên kết H–N–H là 107°, tạo lưỡng cực phân tử lớn giúp NH₃ tan cực nhiều trong nước.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
                <span className="font-bold text-slate-800 block">Quy chuẩn màu sắc CPK quốc tế:</span>
                <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Oxi (Đỏ)
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-300 inline-block"></span> Hidro (Trắng)
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span> Lưu huỳnh (Vàng)
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span> Carbon (Đen/Xám)
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Nitơ (Xanh lam)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
