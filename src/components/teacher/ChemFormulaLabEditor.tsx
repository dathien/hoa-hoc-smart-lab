import React, { useState } from 'react';
import { ChemFormula } from '../common/ChemFormula';
import {
  Sparkles,
  Copy,
  Check,
  Layers,
  FlaskConical,
  Beaker,
  Thermometer,
  Flame,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Eye,
  FileCode,
  Download
} from 'lucide-react';

interface ChemFormulaLabEditorProps {
  initialFormula?: string;
  onInsertToContent?: (snippet: string) => void;
  className?: string;
}

export const ChemFormulaLabEditor: React.FC<ChemFormulaLabEditorProps> = ({
  initialFormula = '2H_2 + O_2 \\xrightarrow{t^o} 2H_2O',
  onInsertToContent,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'formula' | 'apparatus' | 'diagrams'>('formula');
  const [formulaText, setFormulaText] = useState<string>(initialFormula);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedDiagram, setSelectedDiagram] = useState<string>('co2_prep');

  // Insert snippet helper
  const handleInsertSnippet = (snippet: string) => {
    setFormulaText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + snippet);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formulaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">
              Bộ Soạn Thảo Công Thức & Sơ Đồ Thí Nghiệm Hóa Học
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Soạn thảo chỉ số, ion, phương trình nhiệt hóa học, nhóm chức hữu cơ và vector sơ đồ thí nghiệm chuẩn bản in.
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'formula'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Công thức & Phương trình
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apparatus')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'apparatus'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dụng cụ thủy tinh (SVG)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diagrams')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'diagrams'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sơ đồ thí nghiệm lắp ghép
          </button>
        </div>
      </div>

      {/* Content based on Active Tab */}
      <div className="p-5 space-y-5">
        {activeTab === 'formula' && (
          <div className="space-y-4">
            {/* Quick Palette Toolbars */}
            <div className="space-y-3">
              {/* Row 1: Common Notations */}
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                  1. Ký hiệu phổ biến & Trạng thái:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Mũi tên (->)', val: '\\rightarrow ' },
                    { label: 'Thuận nghịch (<=>)', val: '\\rightleftharpoons ' },
                    { label: 'Đun nóng (t°)', val: '\\xrightarrow{t^o} ' },
                    { label: 'Xúc tác (xt, t°)', val: '\\xrightarrow{xt,\\, t^o} ' },
                    { label: 'Khí bay lên (↑)', val: '\\uparrow ' },
                    { label: 'Kết tủa (↓)', val: '\\downarrow ' },
                    { label: 'Rắn (r)', val: '(r)' },
                    { label: 'Lỏng (l)', val: '(l)' },
                    { label: 'Khí (k)', val: '(k)' },
                    { label: 'Dung dịch (dd)', val: '(dd)' },
                    { label: 'Biến thiên Enthalpy', val: '\\Delta_r H^o_{298}' },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertSnippet(btn.val)}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-2xs"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Ions & Subscripts */}
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                  2. Điện tích ion & Hạt nhân:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'H⁺', val: 'H^+' },
                    { label: 'OH⁻', val: 'OH^-' },
                    { label: 'Ba²⁺', val: 'Ba^{2+}' },
                    { label: 'Cu²⁺', val: 'Cu^{2+}' },
                    { label: 'Fe³⁺', val: 'Fe^{3+}' },
                    { label: 'Al³⁺', val: 'Al^{3+}' },
                    { label: 'SO₄²⁻', val: 'SO_4^{2-}' },
                    { label: 'NO₃⁻', val: 'NO_3^-' },
                    { label: 'Cl⁻', val: 'Cl^-' },
                    { label: 'CO₃²⁻', val: 'CO_3^{2-}' },
                    { label: 'PO₄³⁻', val: 'PO_4^{3-}' },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertSnippet(btn.val)}
                      className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-2xs"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Organic Functional Groups & Bonds */}
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                  3. Hóa học hữu cơ (Liên kết & Nhóm chức):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Liên kết đơn (-)', val: '-' },
                    { label: 'Liên kết đôi (=)', val: '=' },
                    { label: 'Liên kết ba (≡)', val: '\\equiv ' },
                    { label: '-OH (Alcohol)', val: '-OH' },
                    { label: '-CHO (Aldehyde)', val: '-CHO' },
                    { label: '-COOH (Acid)', val: '-COOH' },
                    { label: '-NH₂ (Amine)', val: '-NH_2' },
                    { label: '-COO- (Ester)', val: '-COO-' },
                    { label: 'CH₃- (Methyl)', val: 'CH_3-' },
                    { label: 'C₂H₅- (Ethyl)', val: 'C_2H_5-' },
                    { label: 'C₆H₅- (Phenyl)', val: 'C_6H_5-' },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertSnippet(btn.val)}
                      className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-2xs"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Quantitative Calculations */}
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                  4. Biểu thức tính toán & Hằng số:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'pH = -log[H⁺]', val: 'pH = -\\log[H^+]' },
                    { label: 'C_M = n / V', val: 'C_M = \\frac{n}{V}' },
                    { label: 'm = n . M', val: 'm = n \\cdot M' },
                    { label: 'PV = nRT', val: 'PV = nRT' },
                    { label: 'K_c hằng số', val: 'K_c = \\frac{[C]^c [D]^d}{[A]^a [B]^b}' },
                    { label: 'm Faraday', val: 'm = \\frac{A \\cdot I \\cdot t}{n \\cdot F}' },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertSnippet(btn.val)}
                      className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-2xs"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Textarea & Live KaTeX Render Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">
                  Mã công thức KaTeX / LaTeX:
                </label>
                <textarea
                  rows={4}
                  value={formulaText}
                  onChange={(e) => setFormulaText(e.target.value)}
                  placeholder="Nhập hoặc nhấn các nút phía trên để ghép công thức..."
                  className="w-full p-3 font-mono text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-teal-800 flex items-center justify-between">
                  <span>Xem trước hiển thị thực tế:</span>
                  <span className="text-[11px] font-normal text-slate-400">Chuẩn in ấn A4</span>
                </label>
                <div className="min-h-[105px] p-4 bg-teal-50/40 border border-teal-200 rounded-xl flex items-center justify-center text-center overflow-x-auto shadow-2xs">
                  {formulaText ? (
                    <ChemFormula formula={formulaText} isBlock className="text-lg md:text-xl font-bold text-slate-900" />
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa có công thức để hiển thị</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom action buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép mã KaTeX'}</span>
              </button>

              {onInsertToContent && (
                <button
                  type="button"
                  onClick={() => onInsertToContent(`$${formulaText}$`)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Chèn vào nội dung câu hỏi</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Individual Glassware SVG Apparatus */}
        {activeTab === 'apparatus' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Các dụng cụ thủy tinh hóa học được vector hóa sắc nét (SVG), có thể chèn trực tiếp vào đề thi mà không bị vỡ hạt khi in ấn.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* 1. Test Tube */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center space-y-2 hover:border-teal-300 transition-all">
                <svg className="w-16 h-28" viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Rim */}
                  <rect x="18" y="5" width="24" height="4" rx="2" fill="#94a3b8" />
                  {/* Glass Body */}
                  <path d="M20 9V95C20 106.046 24.4772 115 30 115C35.5228 115 40 106.046 40 95V9" stroke="#64748b" strokeWidth="2.5" fill="#f8fafc" />
                  {/* Liquid inside */}
                  <path d="M21 65V95C21 104.941 25.0294 113 30 113C34.9706 113 39 104.941 39 95V65Z" fill="#38bdf8" fillOpacity="0.4" />
                  {/* Liquid surface */}
                  <ellipse cx="30" cy="65" rx="9" ry="2.5" fill="#0284c7" fillOpacity="0.6" />
                </svg>
                <span className="text-xs font-bold text-slate-800">Ống nghiệm (Test tube)</span>
                <span className="text-[11px] text-slate-500">Chứa dung dịch xanh Cu²⁺</span>
              </div>

              {/* 2. Beaker */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center space-y-2 hover:border-teal-300 transition-all">
                <svg className="w-20 h-28" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Spout & Rim */}
                  <path d="M12 15L16 19H64L68 15" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Body */}
                  <path d="M16 19V105C16 110.523 20.4772 115 26 115H54C59.5228 115 64 110.523 64 105V19" stroke="#64748b" strokeWidth="2.5" fill="#f8fafc" />
                  {/* Liquid */}
                  <path d="M18 55V105C18 109 21.5817 113 26 113H54C58.4183 113 62 109 62 105V55Z" fill="#2dd4bf" fillOpacity="0.4" />
                  {/* Graduation marks */}
                  <line x1="20" y1="45" x2="32" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="20" y1="65" x2="28" y2="65" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="20" y1="85" x2="32" y2="85" stroke="#94a3b8" strokeWidth="1.5" />
                </svg>
                <span className="text-xs font-bold text-slate-800">Cốc thủy tinh (Beaker)</span>
                <span className="text-[11px] text-slate-500">Có vạch định mức</span>
              </div>

              {/* 3. Erlenmeyer Flask */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center space-y-2 hover:border-teal-300 transition-all">
                <svg className="w-20 h-28" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Neck */}
                  <rect x="32" y="10" width="16" height="4" rx="1.5" fill="#94a3b8" />
                  <path d="M34 14V35L15 105C13.5 110.5 17.5 115 23 115H57C62.5 115 66.5 110.5 65 105L46 35V14" stroke="#64748b" strokeWidth="2.5" fill="#f8fafc" />
                  {/* Liquid */}
                  <path d="M26 65L17 105C16 109 19 113 23 113H57C61 113 64 109 63 105L54 65Z" fill="#f43f5e" fillOpacity="0.4" />
                </svg>
                <span className="text-xs font-bold text-slate-800">Bình tam giác (Erlenmeyer)</span>
                <span className="text-[11px] text-slate-500">Dùng trong chuẩn độ</span>
              </div>

              {/* 4. Alcohol Burner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center space-y-2 hover:border-teal-300 transition-all">
                <svg className="w-20 h-28" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Flame */}
                  <path d="M40 8C40 8 49 25 46 34C43 43 37 43 34 34C31 25 40 8 40 8Z" fill="#f59e0b" />
                  <path d="M40 18C40 18 45 28 43 34C41 40 38 40 36 34C34 28 40 18 40 18Z" fill="#38bdf8" />
                  {/* Wick collar */}
                  <rect x="36" y="38" width="8" height="8" rx="1" fill="#cbd5e1" />
                  {/* Glass Base */}
                  <path d="M35 46H45L60 70C65 78 63 95 56 100C49 105 31 105 24 100C17 95 15 78 20 70L35 46Z" stroke="#64748b" strokeWidth="2.5" fill="#f1f5f9" />
                </svg>
                <span className="text-xs font-bold text-slate-800">Đèn cồn (Burner)</span>
                <span className="text-[11px] text-slate-500">Ngọn lửa nhiệt độ cao</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Complete Experimental Setup Assemblies */}
        {activeTab === 'diagrams' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Chọn sơ đồ mẫu chuẩn SGK:</span>
              {[
                { id: 'co2_prep', title: '1. Điều chế & Thu khí CO₂' },
                { id: 'titration', title: '2. Chuẩn độ Acid – Base' },
                { id: 'cuoh2_decomp', title: '3. Nhiệt phân Cu(OH)₂' },
              ].map((diag) => (
                <button
                  key={diag.id}
                  type="button"
                  onClick={() => setSelectedDiagram(diag.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    selectedDiagram === diag.id
                      ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {diag.title}
                </button>
              ))}
            </div>

            {/* Selected Setup Diagram Viewer */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-around gap-6">
              {selectedDiagram === 'co2_prep' && (
                <>
                  <div className="w-full max-w-[340px] bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    {/* SVG Assembly for CO2 Preparation */}
                    <svg className="w-full h-56" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Stand & base */}
                      <rect x="20" y="200" width="100" height="8" rx="2" fill="#334155" />
                      <rect x="35" y="40" width="6" height="160" fill="#475569" />
                      <rect x="35" y="90" width="35" height="5" fill="#64748b" />

                      {/* Test Tube with CaCO3 and HCl */}
                      <g transform="translate(65, 60)">
                        <rect x="8" y="2" width="20" height="4" fill="#94a3b8" />
                        <path d="M10 6V90C10 98 14 104 18 104C22 104 26 98 26 90V6" stroke="#475569" strokeWidth="2" fill="#f8fafc" />
                        {/* CaCO3 stones */}
                        <circle cx="16" cy="98" r="3" fill="#cbd5e1" />
                        <circle cx="20" cy="95" r="3" fill="#e2e8f0" />
                        {/* Acid liquid */}
                        <path d="M11 65V90C11 97 14 103 18 103C22 103 25 97 25 90V65Z" fill="#38bdf8" fillOpacity="0.3" />
                        {/* Bubbles */}
                        <circle cx="16" cy="75" r="1.5" fill="#ffffff" />
                        <circle cx="20" cy="70" r="1.5" fill="#ffffff" />
                        <circle cx="17" cy="62" r="1.5" fill="#ffffff" />
                        {/* Rubber stopper */}
                        <rect x="9" y="4" width="18" height="12" rx="2" fill="#78350f" />
                      </g>

                      {/* Delivery Glass Tube */}
                      <path d="M83 68V45C83 40 88 35 95 35H195C202 35 207 40 207 45V165" stroke="#0284c7" strokeWidth="3" fill="none" strokeLinecap="round" />

                      {/* Gas Collector Bottle on the right */}
                      <g transform="translate(185, 110)">
                        <rect x="15" y="10" width="16" height="4" fill="#94a3b8" />
                        <path d="M17 14V80C17 84 20 88 24 88H42C46 88 49 84 49 80V14" stroke="#475569" strokeWidth="2" fill="#f8fafc" />
                        <text x="33" y="60" textAnchor="middle" fill="#0369a1" fontSize="12" fontWeight="bold">CO₂</text>
                      </g>

                      {/* Labels */}
                      <text x="65" y="190" fill="#475569" fontSize="11" fontWeight="bold">CaCO₃ + dd HCl</text>
                      <text x="200" y="210" fill="#475569" fontSize="11" fontWeight="bold">Bình thu khí CO₂</text>
                    </svg>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                      Thí nghiệm điều chế và thu khí Carbon dioxide:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Cho đá vôi (CaCO₃) phản ứng với acid HCl trong ống nghiệm có nút đậy và ống dẫn khí. Thu khí CO₂ bằng phương pháp đẩy không khí (ngửa bình vì d(CO₂/kk) = 44/29 &gt; 1).
                    </p>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800">
                      CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O
                    </div>
                  </div>
                </>
              )}

              {selectedDiagram === 'titration' && (
                <>
                  <div className="w-full max-w-[340px] bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    {/* SVG Assembly for Titration */}
                    <svg className="w-full h-56" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Stand */}
                      <rect x="50" y="200" width="120" height="8" rx="2" fill="#334155" />
                      <rect x="70" y="20" width="6" height="180" fill="#475569" />
                      <rect x="70" y="60" width="55" height="5" fill="#64748b" />

                      {/* Buret Tube */}
                      <g transform="translate(120, 20)">
                        <rect x="4" y="0" width="8" height="130" stroke="#475569" strokeWidth="1.5" fill="#f8fafc" />
                        <rect x="4.5" y="30" width="7" height="99" fill="#38bdf8" fillOpacity="0.4" />
                        {/* Stopcock */}
                        <circle cx="8" cy="133" r="3" fill="#0f172a" />
                        <line x1="8" y1="135" x2="8" y2="148" stroke="#475569" strokeWidth="1.5" />
                      </g>

                      {/* Erlenmeyer Flask below */}
                      <g transform="translate(98, 140)">
                        <rect x="25" y="5" width="12" height="3" fill="#94a3b8" />
                        <path d="M26 8V22L12 60C10 65 14 68 18 68H44C48 68 52 65 50 60L36 22V8" stroke="#475569" strokeWidth="2" fill="#f8fafc" />
                        <path d="M19 40L14 60C13 63 15 67 18 67H44C47 67 49 63 48 60L43 40Z" fill="#f43f5e" fillOpacity="0.5" />
                      </g>

                      {/* Labels */}
                      <text x="145" y="80" fill="#0369a1" fontSize="11" fontWeight="bold">Buret (chứa dd HCl)</text>
                      <text x="165" y="180" fill="#be123c" fontSize="11" fontWeight="bold">Bình tam giác (NaOH + phenolphthalein)</text>
                    </svg>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                      Bộ dụng cụ chuẩn độ trung hòa Acid - Base:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Nhỏ từ từ dung dịch chuẩn HCl từ buret vào bình tam giác chứa NaOH và chỉ thị phenolphthalein. Điểm tương đương đạt được khi màu hồng vừa mất hẳn chuyển sang không màu.
                    </p>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800">
                      H⁺ + OH⁻ → H₂O
                    </div>
                  </div>
                </>
              )}

              {selectedDiagram === 'cuoh2_decomp' && (
                <>
                  <div className="w-full max-w-[340px] bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    {/* SVG Assembly for Cu(OH)2 Decomposition */}
                    <svg className="w-full h-56" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Stand */}
                      <rect x="40" y="200" width="100" height="8" rx="2" fill="#334155" />
                      <rect x="55" y="30" width="6" height="170" fill="#475569" />
                      <rect x="55" y="70" width="45" height="5" fill="#64748b" />

                      {/* Slanted Test Tube */}
                      <g transform="translate(95, 60) rotate(25)">
                        <rect x="8" y="0" width="16" height="3" fill="#94a3b8" />
                        <path d="M9 3V90C9 96 12 101 16 101C20 101 23 96 23 90V3" stroke="#475569" strokeWidth="2" fill="#f8fafc" />
                        {/* Black CuO powder precipitate at bottom */}
                        <path d="M10 75V90C10 95 12 100 16 100C20 100 22 95 22 90V75Z" fill="#0f172a" />
                      </g>

                      {/* Alcohol Burner Flame directly underneath bottom */}
                      <g transform="translate(130, 140)">
                        <path d="M20 5C20 5 28 20 25 28C22 36 17 36 14 28C11 20 20 5 20 5Z" fill="#f59e0b" />
                        <rect x="17" y="30" width="6" height="6" fill="#cbd5e1" />
                        <path d="M15 36H25L35 55C38 60 36 68 32 70H8C4 68 2 60 5 55L15 36Z" fill="#64748b" />
                      </g>

                      {/* Labels */}
                      <text x="140" y="55" fill="#0f172a" fontSize="11" fontWeight="bold">Cu(OH)₂ → CuO (đen) + H₂O</text>
                      <text x="190" y="180" fill="#f59e0b" fontSize="11" fontWeight="bold">Ngọn lửa đèn cồn</text>
                    </svg>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                      Thí nghiệm nhiệt phân kết tủa Cu(OH)₂:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Hơ nóng đều đáy ống nghiệm rồi đun tập trung tại vị trí có kết tủa Cu(OH)₂ màu xanh lam. Kết tủa chuyển dần sang màu đen của CuO và có hơi nước ngưng tụ quanh miệng ống nghiệm.
                    </p>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800">
                      Cu(OH)₂ →(t°) CuO↓(đen) + H₂O
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
