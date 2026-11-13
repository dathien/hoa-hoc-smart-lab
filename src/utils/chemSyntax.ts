import katex from 'katex';
import 'katex/contrib/mhchem';

export type FormulaNodeMode = 'chem' | 'reaction' | 'math' | 'organic' | 'organic2d';

export interface OrganicAtom {
  id: string;
  x: number;
  y: number;
  element: string;
  charge?: number;
}

export interface OrganicBond {
  id: string;
  from: string;
  to: string;
  order: 1 | 2 | 3;
}

export interface OrganicStructureGraph {
  name?: string;
  formula?: string;
  atoms: OrganicAtom[];
  bonds: OrganicBond[];
}

export interface QuickFormulaItem {
  label: string;
  code: string;
  description?: string;
  mode?: FormulaNodeMode;
  insertKind?: 'node' | 'text' | 'sub' | 'sup' | 'exit-sub-sup' | 'charge-sup' | 'open-2d' | 'reaction-cond';
  keywords?: string;
}

export interface SymbolKeyboardGroup {
  id: 'G1' | 'G2' | 'G3' | 'G4' | 'G5';
  title: string;
  shortTitle: string;
  items: QuickFormulaItem[];
}

export interface FormulaCategoryGroup {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  title: string;
  defaultMode: FormulaNodeMode;
  items: QuickFormulaItem[];
}

export const QUICK_SAMPLE_CHEMICALS: QuickFormulaItem[] = [
  { label: 'H₂O', code: 'H2O', description: 'Nước', mode: 'chem' },
  { label: 'H₂SO₄', code: 'H2SO4', description: 'Sulfuric acid', mode: 'chem' },
  { label: 'HNO₃', code: 'HNO3', description: 'Nitric acid', mode: 'chem' },
  { label: 'NH₃', code: 'NH3', description: 'Ammonia', mode: 'chem' },
  { label: 'NH₄⁺', code: 'NH4^+', description: 'Ion ammonium', mode: 'chem' },
  { label: 'SO₄²⁻', code: 'SO4^2-', description: 'Ion sulfate', mode: 'chem' },
  { label: 'NO₃⁻', code: 'NO3^-', description: 'Ion nitrate', mode: 'chem' },
  { label: 'Fe³⁺', code: 'Fe^3+', description: 'Ion sắt(III)', mode: 'chem' },
  { label: 'Cu²⁺', code: 'Cu^2+', description: 'Ion đồng(II)', mode: 'chem' },
  { label: 'CO₂', code: 'CO2', description: 'Carbon dioxide', mode: 'chem' },
  { label: 'CH₄', code: 'CH4', description: 'Methane', mode: 'chem' },
];

export const VERIFIED_SAMPLE_EQUATIONS: QuickFormulaItem[] = [
  { label: 'Tổng hợp NH₃', code: 'N2(k) + 3H2(k) <=> 2NH3(k)', description: 'ΔᵣH°₂₉₈ = −92 kJ', mode: 'reaction' },
  { label: 'Điện li HNO₃', code: 'HNO3 -> H+ + NO3-', description: 'Acid mạnh điện li hoàn toàn', mode: 'reaction' },
  { label: 'Trung hòa acid - base', code: 'H2SO4 + 2NaOH -> Na2SO4 + 2H2O', description: 'Phản ứng trung hòa', mode: 'reaction' },
  { label: 'Điều chế CO₂', code: 'CaCO3(r) + 2HCl(dd) -> CaCl2(dd) + CO2(k)↑ + H2O(l)', description: 'Tác dụng với acid', mode: 'reaction' },
  { label: 'Este hóa', code: 'CH3COOH + C2H5OH <=>[H2SO4 đặc, t°] CH3COOC2H5 + H2O', description: 'Thuận nghịch có xúc tác acid', mode: 'reaction' },
  { label: 'Nhiệt phân Cu(OH)₂', code: 'Cu(OH)2 ->[t°] CuO + H2O', description: 'Nhiệt phân base không tan', mode: 'reaction' },
];

export const SYMBOL_KEYBOARD_GROUPS: SymbolKeyboardGroup[] = [
  {
    id: 'G1',
    title: 'Nhóm 1. Công thức & Chỉ số',
    shortTitle: 'Chỉ số & Ion',
    items: [
      { label: 'X₂ Chỉ số dưới', code: 'SUB', description: 'Bôi đen ký tự rồi bấm để tạo chỉ số dưới (VD: 4 → ₄) hoặc bật chế độ gõ chỉ số dưới', insertKind: 'sub', keywords: 'chi so duoi subscript' },
      { label: 'Xⁿ Chỉ số trên', code: 'SUP', description: 'Bôi đen ký tự rồi bấm để tạo chỉ số trên/điện tích hoặc bật chế độ gõ chỉ số trên', insertKind: 'sup', keywords: 'chi so tren superscript' },
      { label: 'Tₓ Thoát chỉ số', code: 'EXIT_SUBSUP', description: 'Thoát khỏi chế độ chỉ số dưới/trên để gõ chữ bình thường', insertKind: 'exit-sub-sup', keywords: 'thoat dinh dang binh thuong' },
      { label: '+', code: '+', description: 'Điện tích dương ⁺ (chèn ở dạng chỉ số trên)', insertKind: 'charge-sup', keywords: 'dien tich duong cong ion' },
      { label: '−', code: '−', description: 'Điện tích âm ⁻ (chèn ở dạng chỉ số trên)', insertKind: 'charge-sup', keywords: 'dien tich am tru ion' },
      { label: '2+', code: '2+', description: 'Điện tích ²⁺', insertKind: 'charge-sup', keywords: '2+ ion hoa tri 2' },
      { label: '3+', code: '3+', description: 'Điện tích ³⁺', insertKind: 'charge-sup', keywords: '3+ ion hoa tri 3' },
      { label: '2−', code: '2−', description: 'Điện tích ²⁻', insertKind: 'charge-sup', keywords: '2- ion sulfate carbonate' },
      { label: '3−', code: '3−', description: 'Điện tích ³⁻', insertKind: 'charge-sup', keywords: '3- ion phosphate' },
      { label: '· (Ngậm nước)', code: '·', description: 'Dấu chấm tinh thể ngậm nước (VD: CuSO₄·5H₂O)', insertKind: 'text', keywords: 'ngam nuoc hydrate cham' },
      { label: '(r)', code: '(r)', description: 'Trạng thái rắn', insertKind: 'text', keywords: 'ran solid trang thai' },
      { label: '(l)', code: '(l)', description: 'Trạng thái lỏng', insertKind: 'text', keywords: 'long liquid trang thai' },
      { label: '(k)', code: '(k)', description: 'Trạng thái khí', insertKind: 'text', keywords: 'khi gas trang thai' },
      { label: '(dd)', code: '(dd)', description: 'Dung dịch (aqueous)', insertKind: 'text', keywords: 'dung dich aqueous trang thai' },
      { label: 'H', code: 'H', description: 'Hydrogen', insertKind: 'text', keywords: 'hydrogen nguyen to' },
      { label: 'C', code: 'C', description: 'Carbon', insertKind: 'text', keywords: 'carbon nguyen to' },
      { label: 'N', code: 'N', description: 'Nitrogen', insertKind: 'text', keywords: 'nitrogen nito nguyen to' },
      { label: 'O', code: 'O', description: 'Oxygen', insertKind: 'text', keywords: 'oxygen oxi nguyen to' },
      { label: 'Na', code: 'Na', description: 'Sodium (Natri)', insertKind: 'text', keywords: 'natri sodium' },
      { label: 'Mg', code: 'Mg', description: 'Magnesium', insertKind: 'text', keywords: 'magie magnesium' },
      { label: 'Al', code: 'Al', description: 'Aluminium (Nhôm)', insertKind: 'text', keywords: 'nhom aluminium' },
      { label: 'S', code: 'S', description: 'Sulfur (Lưu huỳnh)', insertKind: 'text', keywords: 'luu huynh sulfur' },
      { label: 'Cl', code: 'Cl', description: 'Chlorine (Clo)', insertKind: 'text', keywords: 'clo chlorine' },
      { label: 'K', code: 'K', description: 'Potassium (Kali)', insertKind: 'text', keywords: 'kali potassium' },
      { label: 'Ca', code: 'Ca', description: 'Calcium (Canxi)', insertKind: 'text', keywords: 'canxi calcium' },
      { label: 'Fe', code: 'Fe', description: 'Iron (Sắt)', insertKind: 'text', keywords: 'sat iron' },
      { label: 'Cu', code: 'Cu', description: 'Copper (Đồng)', insertKind: 'text', keywords: 'dong copper' },
      { label: 'Zn', code: 'Zn', description: 'Zinc (Kẽm)', insertKind: 'text', keywords: 'kem zinc' },
      { label: 'Ag', code: 'Ag', description: 'Silver (Bạc)', insertKind: 'text', keywords: 'bac silver' },
      { label: 'Ba', code: 'Ba', description: 'Barium (Bari)', insertKind: 'text', keywords: 'bari barium' },
    ],
  },
  {
    id: 'G2',
    title: 'Nhóm 2. Phương trình phản ứng',
    shortTitle: 'Mũi tên & PT',
    items: [
      { label: '→ (Một chiều)', code: '->', description: 'Mũi tên phản ứng một chiều', mode: 'reaction', insertKind: 'node', keywords: 'mui ten mot chieu phan ung' },
      { label: '⇌ (Thuận nghịch)', code: '<=>', description: 'Mũi tên cân bằng thuận nghịch', mode: 'reaction', insertKind: 'node', keywords: 'thuan nghich can bang' },
      { label: '↑ (Khí bay lên)', code: '↑', description: 'Ký hiệu chất khí thoát ra', insertKind: 'text', keywords: 'khi thoat ra bay len mui ten' },
      { label: '↓ (Kết tủa)', code: '↓', description: 'Ký hiệu chất kết tủa', insertKind: 'text', keywords: 'ket tua mui ten xuong' },
      { label: '+', code: ' + ', description: 'Dấu cộng trong phương trình', insertKind: 'text', keywords: 'dau cong' },
      { label: '=', code: ' = ', description: 'Dấu bằng / phương trình cân bằng', insertKind: 'text', keywords: 'dau bang' },
      { label: '→[t°] Đun nóng', code: '->[t°]', description: 'Điều kiện nhiệt độ phía trên mũi tên', mode: 'reaction', insertKind: 'node', keywords: 'nhiet do dun nong dieu kien' },
      { label: '→[xt, t°]', code: '->[xt, t°]', description: 'Xúc tác và nhiệt độ phía trên mũi tên', mode: 'reaction', insertKind: 'node', keywords: 'xuc tac nhiet do dieu kien' },
      { label: '⇌[xt, t° | p]', code: '<=>[xt, t°|p]', description: 'Thuận nghịch có xúc tác, nhiệt độ (trên) và áp suất (dưới)', mode: 'reaction', insertKind: 'node', keywords: 'ap suat xuc tac nhiet do thuan nghich' },
      { label: '→[as] Ánh sáng', code: '->[as]', description: 'Điều kiện ánh sáng khuếch tán', mode: 'reaction', insertKind: 'node', keywords: 'anh sang dieu kien' },
      { label: '→[đpnc]', code: '->[đpnc]', description: 'Điện phân nóng chảy', mode: 'reaction', insertKind: 'node', keywords: 'dien phan nong chay' },
      { label: '→[đpdd]', code: '->[đpdd]', description: 'Điện phân dung dịch', mode: 'reaction', insertKind: 'node', keywords: 'dien phan dung dich' },
      { label: 'Điều kiện tùy chỉnh...', code: 'OPEN_COND', description: 'Mở bảng đặt điều kiện trên/dưới mũi tên', insertKind: 'reaction-cond', keywords: 'dieu kien phan ung tren duoi mui ten' },
    ],
  },
  {
    id: 'G3',
    title: 'Nhóm 3. Nhiệt hóa học & Tính toán',
    shortTitle: 'Nhiệt hóa học',
    items: [
      { label: 'Δ', code: 'Δ', description: 'Ký hiệu biến thiên Delta', insertKind: 'text', keywords: 'delta bien thien' },
      { label: 'ΔᵣH°₂₉₈', code: '\\Delta_r H^\\circ_{298}', description: 'Biến thiên enthalpy chuẩn ở 298K', mode: 'chem', insertKind: 'node', keywords: 'enthalpy bien thien nhiet phan ung 298' },
      { label: 'ΔfH°₂₉₈', code: '\\Delta_f H^\\circ_{298}', description: 'Enthalpy tạo thành chuẩn ở 298K', mode: 'chem', insertKind: 'node', keywords: 'enthalpy tao thanh chuan 298' },
      { label: 'ΔᵣH°₂₉₈ = −92 kJ', code: '\\Delta_r H^\\circ_{298} = -92 kJ', description: 'Mẫu biểu diễn nhiệt phản ứng', mode: 'chem', insertKind: 'node', keywords: 'enthalpy kj toa nhiet' },
      { label: 'kJ', code: ' kJ', description: 'Đơn vị kilojoule', insertKind: 'text', keywords: 'kj don vi nhiet' },
      { label: 'kJ/mol', code: ' kJ/mol', description: 'Đơn vị kilojoule trên mol', insertKind: 'text', keywords: 'kj mol don vi' },
      { label: '°C', code: '°C', description: 'Độ Celsius', insertKind: 'text', keywords: 'do c nhiet do' },
      { label: '≤', code: '≤', description: 'Nhỏ hơn hoặc bằng', insertKind: 'text', keywords: 'nho hon hoac bang' },
      { label: '≥', code: '≥', description: 'Lớn hơn hoặc bằng', insertKind: 'text', keywords: 'lon hon hoac bang' },
      { label: '≈', code: '≈', description: 'Xấp xỉ', insertKind: 'text', keywords: 'xap xi gan bang' },
      { label: '×', code: '×', description: 'Dấu nhân', insertKind: 'text', keywords: 'dau nhan' },
      { label: 'n = m/M', code: 'n = \\frac{m}{M}', description: 'Công thức tính số mol', mode: 'math', insertKind: 'node', keywords: 'so mol khoi luong' },
      { label: 'C_M = n/V', code: 'C_M = \\frac{n}{V}', description: 'Nồng độ mol dung dịch', mode: 'math', insertKind: 'node', keywords: 'nong do mol' },
      { label: 'K_c', code: 'K_C = \\frac{[C]^c[D]^d}{[A]^a[B]^b}', description: 'Hằng số cân bằng', mode: 'math', insertKind: 'node', keywords: 'hang so can bang kc' },
      { label: 'pH = -log[H⁺]', code: '\\text{pH} = -\\log[\\mathrm{H}^{+}]', description: 'Công thức tính pH', mode: 'math', insertKind: 'node', keywords: 'ph acid base' },
    ],
  },
  {
    id: 'G4',
    title: 'Nhóm 4. Hóa học hữu cơ',
    shortTitle: 'Hữu cơ & 2D',
    items: [
      { label: '– (Liên kết đơn)', code: '–', description: 'Liên kết đơn C–C / C–H', insertKind: 'text', keywords: 'lien ket don huu co' },
      { label: '= (Liên kết đôi)', code: '=', description: 'Liên kết đôi C=C / C=O', insertKind: 'text', keywords: 'lien ket doi anken' },
      { label: '≡ (Liên kết ba)', code: '≡', description: 'Liên kết ba C≡C', insertKind: 'text', keywords: 'lien ket ba ankin' },
      { label: '–OH', code: '-OH', description: 'Nhóm hydroxyl (Alcohol / Phenol)', mode: 'organic', insertKind: 'node', keywords: 'nhom chuc ancol oh' },
      { label: '–COOH', code: '-COOH', description: 'Nhóm carboxyl (Carboxylic acid)', mode: 'organic', insertKind: 'node', keywords: 'nhom chuc axit cacboxylic cooh' },
      { label: '–CHO', code: '-CHO', description: 'Nhóm aldehyde', mode: 'organic', insertKind: 'node', keywords: 'nhom chuc andehit aldehyde cho' },
      { label: '–NH₂', code: '-NH2', description: 'Nhóm amino (Amine / Amino acid)', mode: 'organic', insertKind: 'node', keywords: 'nhom chuc amin nh2' },
      { label: '–COO–', code: '-COO-', description: 'Nhóm chức ester', mode: 'organic', insertKind: 'node', keywords: 'este ester coo' },
      { label: 'CH₃–', code: 'CH3-', description: 'Gốc methyl', mode: 'organic', insertKind: 'node', keywords: 'metyl ch3' },
      { label: '–CH₂–', code: '-CH2-', description: 'Nhóm methylene', mode: 'organic', insertKind: 'node', keywords: 'ch2' },
      { label: 'CH₃–CH(OH)–COOH', code: 'CH3-CH(OH)-COOH', description: 'Lactic acid (CTCT thu gọn)', mode: 'organic', insertKind: 'node', keywords: 'ctct thu gon lactic' },
      { label: 'CH₂=CH₂', code: 'CH2=CH2', description: 'Ethylene (CTCT thu gọn)', mode: 'organic', insertKind: 'node', keywords: 'etilen ethylene' },
      { label: 'CH≡CH', code: 'CH#CH', description: 'Acetylene (CTCT thu gọn)', mode: 'organic', insertKind: 'node', keywords: 'axetilen acetylene' },
      { label: 'Mở trình vẽ cấu tạo 2D', code: 'OPEN_2D', description: 'Mở xưởng vẽ cấu tạo hữu cơ 2D (vòng benzen, nhánh, liên kết đôi/ba)', insertKind: 'open-2d', keywords: 've cau tao 2d benzen huu co' },
    ],
  },
  {
    id: 'G5',
    title: 'Nhóm 5. Công thức nhập nhanh',
    shortTitle: 'Mẫu nhanh',
    items: [
      ...QUICK_SAMPLE_CHEMICALS.map((q) => ({ ...q, insertKind: 'node' as const, keywords: `${q.label} ${q.code} ${q.description || ''}` })),
      ...VERIFIED_SAMPLE_EQUATIONS.map((eq) => ({ ...eq, insertKind: 'node' as const, keywords: `${eq.label} ${eq.code} ${eq.description || ''}` })),
    ],
  },
];

export const FORMULA_CATEGORIES: FormulaCategoryGroup[] = [
  {
    id: 'A',
    title: 'A. Công thức chất',
    defaultMode: 'chem',
    items: [
      { label: 'H₂O', code: 'H2O' },
      { label: 'H₂SO₄', code: 'H2SO4' },
      { label: 'HNO₃', code: 'HNO3' },
      { label: 'HCl', code: 'HCl' },
      { label: 'NaOH', code: 'NaOH' },
      { label: 'Ba(OH)₂', code: 'Ba(OH)2' },
      { label: 'Fe(OH)₃', code: 'Fe(OH)3' },
      { label: 'CuSO₄', code: 'CuSO4' },
      { label: 'CuSO₄·5H₂O', code: 'CuSO4·5H2O' },
      { label: 'CaCO₃', code: 'CaCO3' },
      { label: 'Al₂(SO₄)₃', code: 'Al2(SO4)3' },
      { label: 'Fe₃O₄', code: 'Fe3O4' },
    ],
  },
  {
    id: 'B',
    title: 'B. Ion và điện tích',
    defaultMode: 'chem',
    items: [
      { label: 'H⁺', code: 'H^+' },
      { label: 'OH⁻', code: 'OH^-' },
      { label: 'Na⁺', code: 'Na^+' },
      { label: 'NH₄⁺', code: 'NH4^+' },
      { label: 'Cu²⁺', code: 'Cu^2+' },
      { label: 'Ba²⁺', code: 'Ba^2+' },
      { label: 'Fe²⁺', code: 'Fe^2+' },
      { label: 'Fe³⁺', code: 'Fe^3+' },
      { label: 'Al³⁺', code: 'Al^3+' },
      { label: 'Cl⁻', code: 'Cl^-' },
      { label: 'NO₃⁻', code: 'NO3^-' },
      { label: 'SO₄²⁻', code: 'SO4^2-' },
      { label: 'CO₃²⁻', code: 'CO3^2-' },
      { label: 'PO₄³⁻', code: 'PO4^3-' },
    ],
  },
  {
    id: 'C',
    title: 'C. Trạng thái chất',
    defaultMode: 'chem',
    items: [
      { label: '(r) Rắn', code: '(r)' },
      { label: '(l) Lỏng', code: '(l)' },
      { label: '(k) Khí', code: '(k)' },
      { label: '(dd) Dung dịch', code: '(dd)' },
      { label: '(s) Solid', code: '(s)' },
      { label: '(aq) Aqueous', code: '(aq)' },
      { label: '(g) Gas', code: '(g)' },
      { label: '↑ Khí thoát ra', code: '↑' },
      { label: '↓ Kết tủa', code: '↓' },
    ],
  },
  {
    id: 'D',
    title: 'D. Phương trình phản ứng',
    defaultMode: 'reaction',
    items: [
      { label: 'Mũi tên (→)', code: '->' },
      { label: 'Thuận nghịch (⇌)', code: '<=>' },
      { label: 'Cộng (+)', code: ' + ' },
      { label: 'HNO₃ → H⁺ + NO₃⁻', code: 'HNO3 -> H+ + NO3-' },
      { label: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓', code: 'Ba^2+ + SO4^2- -> BaSO4↓' },
      { label: 'N₂(k) + 3H₂(k) ⇌ 2NH₃(k)', code: 'N2(k) + 3H2(k) <=> 2NH3(k)' },
      { label: '3Cu + 8HNO₃ → ...', code: '3Cu + 8HNO3 -> 3Cu(NO3)2 + 2NO↑ + 4H2O' },
    ],
  },
  {
    id: 'E',
    title: 'E. Điều kiện phản ứng',
    defaultMode: 'reaction',
    items: [
      { label: 'Đun nóng (t°)', code: '->[t°]' },
      { label: 'Xúc tác, t°', code: '->[xt, t°]' },
      { label: 'Xúc tác, t° (trên) | p (dưới)', code: '<=>[xt, t°|p]' },
      { label: 'H₂SO₄ đặc, t°', code: '->[H2SO4 đặc, t°]' },
      { label: 'Ánh sáng (as)', code: '->[as]' },
      { label: 'Điện phân nóng chảy', code: '->[đpnc]' },
      { label: 'Điện phân dung dịch', code: '->[đpdd]' },
      { label: 'Men rượu', code: '->[enzim]' },
    ],
  },
  {
    id: 'F',
    title: 'F. Công thức hữu cơ',
    defaultMode: 'organic',
    items: [
      { label: 'Liên kết đơn (-)', code: '-' },
      { label: 'Liên kết đôi (=)', code: '=' },
      { label: 'Liên kết ba (≡)', code: '#' },
      { label: 'CH₃-', code: 'CH3-' },
      { label: '-CH₂-', code: '-CH2-' },
      { label: '-OH (Alcohol)', code: '-OH' },
      { label: '-CHO (Aldehyde)', code: '-CHO' },
      { label: '-COOH (Carboxylic)', code: '-COOH' },
      { label: '-COO- (Ester)', code: '-COO-' },
      { label: '-NH₂ (Amine)', code: '-NH2' },
      { label: 'CH₃-CH(OH)-COOH', code: 'CH3-CH(OH)-COOH' },
      { label: 'CH₂=CH-COOH', code: 'CH2=CH-COOH' },
      { label: 'CH≡CH', code: 'CH#CH' },
    ],
  },
  {
    id: 'G',
    title: 'G. Nhiệt hóa học & Tính toán',
    defaultMode: 'chem',
    items: [
      { label: 'ΔᵣH°₂₉₈', code: '\\Delta_r H^\\circ_{298}' },
      { label: 'ΔfH°₂₉₈', code: '\\Delta_f H^\\circ_{298}' },
      { label: 'ΔᵣH°₂₉₈ = −92 kJ', code: '\\Delta_r H^\\circ_{298} = -92 kJ' },
      { label: 'n = m / M', code: 'n = \\frac{m}{M}' },
      { label: 'n = V / 24,79', code: 'n = \\frac{V}{24{,}79}' },
      { label: 'C_M = n / V', code: 'C_M = \\frac{n}{V}' },
      { label: 'C% = (m_ct / m_dd)·100%', code: 'C\\% = \\frac{m_{ct}}{m_{dd}} \\cdot 100\\%' },
      { label: 'pH = -log[H⁺]', code: '\\text{pH} = -\\log[\\mathrm{H}^{+}]' },
      { label: 'Hiệu suất H%', code: 'H = \\frac{m_{\\text{tt}}}{m_{\\text{lt}}} \\cdot 100\\%' },
      { label: 'Hằng số K_c', code: 'K_C = \\frac{[C]^c[D]^d}{[A]^a[B]^b}' },
    ],
  },
];

const POLYATOMIC_CHARGED_REGEX =
  /^(NH4|H3O|H2PO4|HPO4|HCO3|HSO4|HSO3|NO3|NO2|MnO4|Cr2O7|CrO4|ClO4|ClO3|ClO2|ClO|CH3COO|HCOO|AlO2|ZnO2|SO4|SO3|CO3|SiO3|PO4|OH|CN|HS|SCN|[A-Z][a-z]?)([+-])$/;

const MONOATOMIC_ION_REGEX = /^([A-Z][a-z]?)([2-4][+-])$/;

const RADICAL_HYPHEN_SET = new Set(['CH3-', 'C2H5-', 'C3H7-', 'C6H5-', 'CH2=CH-', 'CH2-']);

function uprightChemicalBase(rawToken: string): string {
  // Handle leading stoichiometric coeff + state + elements cleanly even if already has _ or ^
  let s = rawToken;
  // Convert trailing state suffix first
  let trailingState = '';
  const stMatch = s.match(/^(.*?)(\((?:r|l|k|dd|s|aq|g)\))$/i);
  if (stMatch && stMatch[1]) {
    s = stMatch[1];
    trailingState = `\\text{${stMatch[2]}}`;
  }

  // Handle H^o_{298} or t^o
  s = s.replace(/\^o(?![A-Za-z])/g, '^\\circ').replace(/\^\{o\}/g, '^{\\circ}');
  // Handle \Delta_r or \Delta_f
  s = s.replace(/\\Delta_([rf])\b/g, '\\Delta_{\\mathrm{$1}}');

  // If token is a pure LaTeX command expression like \Delta_{\mathrm{r}} or H^\circ_{298}
  if (/^\\Delta/.test(s)) {
    return `${s}${trailingState}`;
  }
  if (/^H\^\\circ/.test(s)) {
    return `\\mathrm{H}^\\circ${s.slice(7)}${trailingState}`;
  }

  // Upright chemical elements inside tokens that already contain _ or ^ (e.g. 2NH_3, H_2, SO_4^{2-}, Fe^{3+})
  // Wrap plain element letter sequences outside \mathrm{...} or \text{...} or ^{...} / _{...}
  const coeffMatch = s.match(/^(\d+(?:[.,]\d+)?)(?=[A-Z(\[])(.*)$/);
  const coeff = coeffMatch ? coeffMatch[1] : '';
  let body = coeffMatch ? coeffMatch[2] : s;

  body = body
    .replace(/([A-Za-z)])(\d+)(?![}\d])/g, (m, p1, d, offset, str) => {
      const prev = offset > 0 ? str[offset - 1] : '';
      if (prev === '_' || prev === '^' || prev === '{') return m;
      const before = str.slice(0, offset + p1.length);
      const lastCaret = before.lastIndexOf('^');
      const lastSpace = Math.max(before.lastIndexOf(' '), before.lastIndexOf('('));
      if (lastCaret > lastSpace && !before.slice(lastCaret).includes('}')) {
        return m;
      }
      return `${p1}_{${d}}`;
    })
    .replace(/\^([0-9]*[+-])(?![}])/g, '^{$1}');

  // Upright element symbols outside {..} after ^ or _ and outside existing \commands
  let out = '';
  let i = 0;
  while (i < body.length) {
    if (body[i] === '\\') {
      const cmdMatch = body.slice(i).match(/^\\[A-Za-z]+(?:\{[^}]*\})?/);
      if (cmdMatch) {
        out += cmdMatch[0];
        i += cmdMatch[0].length;
        continue;
      }
    }
    if ((body[i] === '^' || body[i] === '_') && body[i + 1] === '{') {
      // keep exponent/subscript group intact unless single letter state/ion inside
      let depth = 0;
      let j = i + 1;
      while (j < body.length) {
        if (body[j] === '{') depth++;
        else if (body[j] === '}') {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
        j++;
      }
      out += body.slice(i, j);
      i = j;
      continue;
    }
    const wordMatch = body.slice(i).match(/^[A-Za-z]+/);
    if (wordMatch) {
      const word = wordMatch[0];
      // Do not wrap math variable names if single lowercase like m, n, V, pH handled outside
      if (/[A-Z]/.test(word)) {
        out += `\\mathrm{${word}}`;
      } else {
        out += word;
      }
      i += word.length;
      continue;
    }
    out += body[i++];
  }

  return `${coeff}${out}${trailingState}`;
}

function formatChemicalSegment(segment: string): string {
  // Preserve scientific units nicely
  if (/^(?:kJ\/mol|kJ|J\/mol|J|mol|atm|bar|mmHg)$/i.test(segment)) {
    return `\\text{${segment}}`;
  }

  // Handle \Delta_r, H^o_{298}, or tokens with existing _ or ^
  if (segment.includes('_') || segment.includes('^')) {
    return uprightChemicalBase(segment);
  }

  // Handle state suffixes e.g. CaCO3(r), H2O(l), CO2(k), NaOH(dd), HCl(aq)
  const stateMatch = segment.match(/^(.*?)(\((?:r|l|k|dd|s|aq|g)\))$/i);
  if (stateMatch && stateMatch[1]) {
    return `${formatChemicalSegment(stateMatch[1])}\\text{${stateMatch[2]}}`;
  }
  if (/^\((?:r|l|k|dd|s|aq|g)\)$/i.test(segment)) {
    return `\\text{${segment}}`;
  }

  // Handle hydrate dot e.g. CuSO4.5H2O or CuSO4·5H2O
  if (segment.includes('·') || /\.\d/.test(segment)) {
    return segment
      .split(/[·.]/)
      .map((part) => formatChemicalSegment(part))
      .join(' \\cdot ');
  }

  // Condensed organic separated by - / – or =
  const normDash = segment.replace(/–/g, '-');
  if (normDash.includes('-') && !normDash.endsWith('-') && !normDash.startsWith('-')) {
    return normDash
      .split('-')
      .map((part) => formatChemicalSegment(part))
      .join('-');
  }
  if (normDash.includes('=')) {
    return normDash
      .split('=')
      .map((part) => formatChemicalSegment(part))
      .join('=');
  }

  // Leading hyphen (functional group like -OH, -COOH, -NH2)
  if (normDash.startsWith('-') && normDash.length > 1) {
    return `-${formatChemicalSegment(normDash.slice(1))}`;
  }

  // Trailing hyphen (organic radical vs single-charge anion)
  if (normDash.endsWith('-') && normDash.length > 1 && /[A-Za-z0-9)]-$/.test(normDash)) {
    if (RADICAL_HYPHEN_SET.has(normDash.toUpperCase())) {
      return `${formatChemicalSegment(normDash.slice(0, -1))}-`;
    }
  }

  // Multivalent monatomic ion e.g. Fe3+, Cu2+, Al3+, S2-
  const monoIon = segment.match(MONOATOMIC_ION_REGEX);
  if (monoIon) {
    return `\\mathrm{${monoIon[1]}}^{${monoIon[2]}}`;
  }

  // Polyatomic or single-charge ion e.g. NO3-, NH4+, OH-, H+, SO42-
  const polyIon = segment.match(POLYATOMIC_CHARGED_REGEX);
  if (polyIon) {
    const baseSub = polyIon[1].replace(/([A-Za-z)])(\d+)/g, '$1_{$2}');
    return `\\mathrm{${baseSub}}^{${polyIon[2]}}`;
  }

  // Leading stoichiometric coefficient: 2H2O, 3Cu, 8HNO3, 0,5O2
  const coeffMatch = segment.match(/^(\d+(?:[.,]\d+)?)([A-Z([].*)$/);
  if (coeffMatch) {
    return `${coeffMatch[1]}${formatChemicalSegment(coeffMatch[2])}`;
  }

  // Convert element / parenthesis digits into subscripts
  if (/[A-Za-z)]/.test(segment)) {
    const withSubs = segment.replace(/([A-Za-z)])(\d+)/g, '$1_{$2}');
    return withSubs.replace(/([A-Za-z]+)/g, '\\mathrm{$1}');
  }

  return segment;
}

function formatArrowCondition(cond: string): string {
  const trimmed = cond.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/(\s+|,\s*)/)
    .map((part) => {
      if (!part) return '';
      if (/^\s+$/.test(part)) return '\\ ';
      if (/^,\s*$/.test(part)) return ',\\ ';
      if (part === 't°' || part === 't^o' || part === 't^{\\circ}') return 't^\\circ';
      const degC = part.match(/^(\d+(?:[.,]\d+)?)°C$/);
      if (degC) return `${degC[1]}^\\circ\\text{C}`;
      if (part === '°C') return '^\\circ\\text{C}';
      if (/^(?:[A-Z][a-z]?\d*)+$/.test(part) && /\d/.test(part)) {
        return formatChemicalSegment(part);
      }
      return `\\text{${part}}`;
    })
    .join('');
}

/**
 * Convert friendly chemistry or math syntax to KaTeX-ready LaTeX.
 * Never alters stoichiometric coefficients or auto-balances reactions.
 */
export function chemSyntaxToLatex(rawInput: string, mode: FormulaNodeMode = 'chem'): string {
  let input = (rawInput || '').trim();
  if (!input) return '';

  // Strip outer $...$ if pasted
  if (input.startsWith('$$') && input.endsWith('$$') && input.length > 4) {
    input = input.slice(2, -2).trim();
  } else if (input.startsWith('$') && input.endsWith('$') && input.length > 2) {
    input = input.slice(1, -1).trim();
  }

  // Unwrap \ce{...} safely
  const ceMatch = input.match(/^\\ce\{([\s\S]*)\}$/);
  if (ceMatch) {
    input = ceMatch[1].trim();
  }

  // Normalize Unicode arrows/minus/subscripts if user pasted rendered text back into source
  input = input
    .replace(/⇌/g, '<=>')
    .replace(/→/g, '->')
    .replace(/−/g, '-');

  if (mode === 'math') {
    return input
      .replace(/->\[([^|\]]+)\|([^\]]+)\]/g, (_, a, b) => `\\xrightarrow[${formatArrowCondition(b)}]{${formatArrowCondition(a)}}`)
      .replace(/->\[([^\]]+)\]/g, (_, cond) => `\\xrightarrow{${formatArrowCondition(cond)}}`)
      .replace(/<=>\[([^|\]]+)\|([^\]]+)\]/g, (_, a, b) => `\\xrightleftharpoons[${formatArrowCondition(b)}]{${formatArrowCondition(a)}}`)
      .replace(/<=>\[([^\]]+)\]/g, (_, cond) => `\\xrightleftharpoons{${formatArrowCondition(cond)}}`)
      .replace(/<=>/g, '\\rightleftharpoons ')
      .replace(/<->/g, '\\leftrightarrow ')
      .replace(/->/g, '\\rightarrow ')
      .replace(/↑/g, '\\uparrow ')
      .replace(/↓/g, '\\downarrow ');
  }

  // Tokenize preserving existing LaTeX commands (\cmd, \xrightarrow[..]{..}, \xrightleftharpoons[..]{..})
  const tokenRegex =
    /(\\xrightarrow(?:\[[^\]]*\])?\{[^}]*\}|\\xrightleftharpoons(?:\[[^\]]*\])?\{[^}]*\}|\\frac\{[^}]*\}\{[^}]*\}|\\text\{[^}]*\}|\\mathrm\{[^}]*\}|\\Delta_[rf]|\\[A-Za-z]+|<=>\[[^\]]+\]|->\[[^\]]+\]|<=>|<->|->|[↑↓#≡·+]|[^\s+↑↓#≡]+|\s+)/g;

  const tokens = input.match(tokenRegex) || [input];

  return tokens
    .map((tok) => {
      if (/^\s+$/.test(tok)) return ' ';
      if (tok === '->') return '\\rightarrow';
      if (tok === '<=>') return '\\rightleftharpoons';
      if (tok === '<->') return '\\leftrightarrow';
      if (tok === '↑') return '\\uparrow';
      if (tok === '↓') return '\\downarrow';
      if (tok === '·') return '\\cdot';
      if (tok === '#' || tok === '≡') return '\\equiv';
      if (tok === '+') return '+';
      if (tok === 'Δ') return '\\Delta';

      if (tok.startsWith('->[') && tok.endsWith(']')) {
        const inner = tok.slice(3, -1);
        const [above, below] = inner.split('|');
        if (below !== undefined) {
          return `\\xrightarrow[${formatArrowCondition(below)}]{${formatArrowCondition(above)}}`;
        }
        return `\\xrightarrow{${formatArrowCondition(above)}}`;
      }

      if (tok.startsWith('<=>[') && tok.endsWith(']')) {
        const inner = tok.slice(4, -1);
        const [above, below] = inner.split('|');
        if (below !== undefined) {
          return `\\xrightleftharpoons[${formatArrowCondition(below)}]{${formatArrowCondition(above)}}`;
        }
        return `\\xrightleftharpoons{${formatArrowCondition(above)}}`;
      }

      if (tok.startsWith('\\Delta_')) {
        const sub = tok.slice(7);
        return `\\Delta_{\\mathrm{${sub}}}`;
      }

      if (tok.startsWith('\\')) {
        return tok;
      }

      // Handle organic triple bond inside word e.g. CH#CH or CH≡CH
      if (tok.includes('#') || tok.includes('≡')) {
        return tok
          .split(/[#≡]/)
          .map((part) => formatChemicalSegment(part))
          .join('\\equiv ');
      }

      // Handle arrow glued to species e.g. NO↑ or BaSO4↓
      const gluedArrow = tok.match(/^(.*?)([↑↓]+)$/);
      if (gluedArrow && gluedArrow[1]) {
        const arr = gluedArrow[2]
          .split('')
          .map((c) => (c === '↑' ? '\\uparrow' : '\\downarrow'))
          .join('');
        return `${formatChemicalSegment(gluedArrow[1])}${arr}`;
      }

      return formatChemicalSegment(tok);
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Render source formula into KaTeX HTML string.
 */
export function renderFormulaToHtml(
  source: string,
  mode: FormulaNodeMode = 'chem',
  isBlock = false
): string {
  if (!source || !source.trim()) return '';
  if (mode === 'organic2d') {
    return escapeHtml(source);
  }
  const latex = chemSyntaxToLatex(source, mode);
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: isBlock,
      strict: false,
    });
  } catch {
    return escapeHtml(source);
  }
}

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function unescapeAttr(str: string): string {
  return String(str || '')
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

const ELEMENT_COLORS: Record<string, string> = {
  C: '#0f172a',
  H: '#475569',
  O: '#dc2626',
  N: '#0284c7',
  Cl: '#059669',
  Br: '#b45309',
  S: '#ca8a04',
  P: '#9333ea',
  F: '#0d9488',
  OH: '#dc2626',
  COOH: '#dc2626',
  CHO: '#dc2626',
  NH2: '#0284c7',
  CH3: '#0f172a',
  C2H5: '#0f172a',
};

/**
 * Render an OrganicStructureGraph to a crisp inline SVG diagram.
 */
export function organicGraphToSvg(
  graph: OrganicStructureGraph,
  opts: { compact?: boolean; width?: number; height?: number } = {}
): string {
  if (!graph || !graph.atoms || graph.atoms.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="50" viewBox="0 0 120 50"><text x="60" y="30" text-anchor="middle" font-size="12" fill="#64748b">Cấu tạo trống</text></svg>';
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  graph.atoms.forEach((a) => {
    if (a.x < minX) minX = a.x;
    if (a.y < minY) minY = a.y;
    if (a.x > maxX) maxX = a.x;
    if (a.y > maxY) maxY = a.y;
  });

  const pad = opts.compact ? 26 : 32;
  const vbX = Math.floor(minX - pad);
  const vbY = Math.floor(minY - pad);
  const vbW = Math.max(80, Math.ceil(maxX - minX + pad * 2));
  const vbH = Math.max(56, Math.ceil(maxY - minY + pad * 2));

  const scale = opts.compact ? 0.72 : 1;
  const dispW = opts.width || Math.round(vbW * scale);
  const dispH = opts.height || Math.round(vbH * scale);

  const atomMap: Record<string, OrganicAtom> = {};
  graph.atoms.forEach((a) => (atomMap[a.id] = a));

  const bondLines: string[] = [];
  graph.bonds.forEach((b) => {
    const a1 = atomMap[b.from];
    const a2 = atomMap[b.to];
    if (!a1 || !a2) return;
    const dx = a2.x - a1.x;
    const dy = a2.y - a1.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    if (b.order === 1) {
      bondLines.push(
        `<line x1="${a1.x}" y1="${a1.y}" x2="${a2.x}" y2="${a2.y}" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>`
      );
    } else if (b.order === 2) {
      const off = 3.2;
      bondLines.push(
        `<line x1="${a1.x + nx * off}" y1="${a1.y + ny * off}" x2="${a2.x + nx * off}" y2="${a2.y + ny * off}" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>`,
        `<line x1="${a1.x - nx * off}" y1="${a1.y - ny * off}" x2="${a2.x - nx * off}" y2="${a2.y - ny * off}" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>`
      );
    } else {
      const off = 4.2;
      bondLines.push(
        `<line x1="${a1.x}" y1="${a1.y}" x2="${a2.x}" y2="${a2.y}" stroke="#1e293b" stroke-width="1.9" stroke-linecap="round"/>`,
        `<line x1="${a1.x + nx * off}" y1="${a1.y + ny * off}" x2="${a2.x + nx * off}" y2="${a2.y + ny * off}" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round"/>`,
        `<line x1="${a1.x - nx * off}" y1="${a1.y - ny * off}" x2="${a2.x - nx * off}" y2="${a2.y - ny * off}" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round"/>`
      );
    }
  });

  const atomNodes = graph.atoms
    .map((a) => {
      const label = a.element || (a as unknown as { label?: string }).label || 'C';
      const color = ELEMENT_COLORS[label] || '#0f172a';
      const boxW = Math.max(18, label.length * 8.5 + 6);
      return `<rect x="${a.x - boxW / 2}" y="${a.y - 10}" width="${boxW}" height="20" rx="5" fill="#ffffff" fill-opacity="0.92"/><text x="${a.x}" y="${a.y + 4.5}" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700" fill="${color}">${escapeHtml(label)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dispW}" height="${dispH}" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" style="vertical-align:middle;display:inline-block;max-width:100%;height:auto;">${bondLines.join('')}${atomNodes}</svg>`;
}

/**
 * Build an editable structured DOM node HTML string that stores source syntax cleanly.
 */
export function buildChemNodeHtml(
  source: string,
  mode: FormulaNodeMode,
  structureJson?: string
): string {
  const safeSource = escapeHtml(source);
  if (mode === 'organic2d' && structureJson) {
    let svgHtml = '';
    try {
      const graph = JSON.parse(structureJson) as OrganicStructureGraph;
      svgHtml = organicGraphToSvg(graph, { compact: true });
    } catch {
      svgHtml = escapeHtml(source);
    }
    const safeJson = escapeHtml(structureJson);
    return `<span class="chem-formula-node chem-organic-2d" data-chem-node="true" data-mode="organic2d" data-source="${safeSource}" data-structure-json="${safeJson}" contenteditable="false" title="Nhấp để chỉnh sửa công thức cấu tạo 2D">${svgHtml}</span>`;
  }

  const rendered = renderFormulaToHtml(source, mode, false);
  return `<span class="chem-formula-node" data-chem-node="true" data-mode="${mode}" data-source="${safeSource}" contenteditable="false" title="Nhấp để chỉnh sửa công thức">${rendered}</span>`;
}

/**
 * Re-render every structured [data-chem-node="true"] inside a DOM element
 * from its data-source / data-structure-json attributes.
 */
export function hydrateChemNodesInElement(root: HTMLElement): void {
  const nodes = root.querySelectorAll<HTMLElement>('[data-chem-node="true"]');
  nodes.forEach((node) => {
    const mode = (node.getAttribute('data-mode') || 'chem') as FormulaNodeMode;
    const source = node.getAttribute('data-source') || '';
    node.setAttribute('contenteditable', 'false');
    node.classList.add('chem-formula-node');

    if (mode === 'organic2d') {
      const jsonStr = node.getAttribute('data-structure-json');
      if (jsonStr) {
        try {
          const graph = JSON.parse(jsonStr) as OrganicStructureGraph;
          node.innerHTML = organicGraphToSvg(graph, { compact: true });
          node.classList.add('chem-organic-2d');
          return;
        } catch {
          // fallback below
        }
      }
    }
    node.innerHTML = renderFormulaToHtml(source, mode, false);
  });
}

// Comprehensive scanner matching explicit $...$, \ce{...}, reaction equations with state suffixes,
// enthalpy Δ_r H^o_{298} = -92 kJ expressions, and individual LaTeX/chemistry tokens.
const MIXED_FORMULA_SCANNER =
  /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\\ce\{[^}]+\}|(?:\\Delta_[rf]\s*H(?:\^(?:\\circ|o))?(?:_\{?\d+\}?)?(?:\s*[=<>≤≥≈]\s*-?\d+(?:[.,]\d+)?(?:\s*kJ(?:\/mol)?)?)?)|(?:(?:[A-Za-z0-9()[\]]+(?:[_^](?:\{[^}]+\}|[A-Za-z0-9+\-°∘]+))+(?:\((?:r|l|k|dd|s|aq|g)\))?|\\(?:rightarrow|rightleftharpoons|leftrightarrow|xrightarrow(?:\[[^\]]*\])?\{[^}]*\}|xrightleftharpoons(?:\[[^\]]*\])?\{[^}]*\}|uparrow|downarrow|Delta(?:_[rf])?|times|approx|equiv|cdot|frac\{[^}]*\}\{[^}]*\}))(?:\s*(?:[+\-=]|=>|->|<=>|\\rightleftharpoons|\\rightarrow|\\leftrightarrow|\\xrightarrow(?:\[[^\]]*\])?\{[^}]*\}|\\xrightleftharpoons(?:\[[^\]]*\])?\{[^}]*\}|\\cdot|\\times)\s*(?:[A-Za-z0-9()[\]]+(?:[_^](?:\{[^}]+\}|[A-Za-z0-9+\-°∘]+))*(?:\((?:r|l|k|dd|s|aq|g)\))?|\\[A-Za-z]+(?:\{[^}]*\})?|\d+(?:[.,]\d+)?(?:\s*(?:M|mol|g|kJ|kJ\/mol))?))*))/g;

interface MixedSegment {
  isFormula: boolean;
  text: string;
  isBlock?: boolean;
  mode: FormulaNodeMode;
}

export function scanMixedFormulaSegments(raw: string): MixedSegment[] {
  if (!raw) return [];
  const segments: MixedSegment[] = [];
  let lastIdx = 0;
  MIXED_FORMULA_SCANNER.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = MIXED_FORMULA_SCANNER.exec(raw)) !== null) {
    if (m.index > lastIdx) {
      segments.push({ isFormula: false, text: raw.slice(lastIdx, m.index), mode: 'chem' });
    }
    let snippet = m[0];
    let isBlock = false;
    let mode: FormulaNodeMode = 'chem';

    if (snippet.startsWith('$$') && snippet.endsWith('$$') && snippet.length > 4) {
      snippet = snippet.slice(2, -2).trim();
      isBlock = true;
    } else if (snippet.startsWith('$') && snippet.endsWith('$') && snippet.length > 2) {
      snippet = snippet.slice(1, -1).trim();
    } else if (snippet.startsWith('\\ce{') && snippet.endsWith('}')) {
      snippet = snippet.slice(4, -1).trim();
    }

    if (
      /->|<=>|\\rightarrow|\\rightleftharpoons|\\xrightarrow|\\xrightleftharpoons/.test(snippet)
    ) {
      mode = 'reaction';
    } else if (/\\frac|\\log/.test(snippet)) {
      mode = 'math';
    }

    segments.push({ isFormula: true, text: snippet, isBlock, mode });
    lastIdx = MIXED_FORMULA_SCANNER.lastIndex;
  }

  if (lastIdx < raw.length) {
    segments.push({ isFormula: false, text: raw.slice(lastIdx), mode: 'chem' });
  }
  return segments;
}

/**
 * Convert legacy plain text / LaTeX / $...$ / \ce{...} OR partially-upgraded HTML
 * into rich HTML where formulas are wrapped inside editable [data-chem-node="true"] spans
 * so the teacher NEVER sees raw LaTeX in SmartChemEditor!
 */
export function upgradeContentForEditorHtml(raw: string): string {
  if (!raw) return '';

  const hasHtml = /<\/?(?:p|div|span|h[1-6]|strong|b|em|i|u|sub|sup|ul|ol|li|table|thead|tbody|tr|th|td|br|a|img|svg)\b/i.test(
    raw
  );

  const upgradePlainLine = (txt: string): string => {
    const segs = scanMixedFormulaSegments(txt);
    return segs
      .map((seg) =>
        seg.isFormula
          ? buildChemNodeHtml(seg.text, seg.mode)
          : escapeHtml(seg.text)
      )
      .join('');
  };

  if (!hasHtml) {
    const lines = raw.split(/\n/);
    if (lines.length === 1) {
      return upgradePlainLine(raw);
    }
    return lines.map((line) => `<p>${line ? upgradePlainLine(line) : '<br>'}</p>`).join('');
  }

  if (typeof document === 'undefined') return raw;

  const container = document.createElement('div');
  container.innerHTML = raw;

  const walkAndUpgradeText = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.getAttribute('data-chem-node') === 'true') return;
      Array.from(el.childNodes).forEach(walkAndUpgradeText);
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent || '';
      if (
        txt.includes('$') ||
        txt.includes('\\') ||
        /[A-Za-z0-9)][_^](?:\{[^}]+\}|[A-Za-z0-9+\-°]+)/.test(txt)
      ) {
        const segs = scanMixedFormulaSegments(txt);
        if (segs.some((s) => s.isFormula)) {
          const frag = document.createElement('span');
          frag.innerHTML = segs
            .map((seg) =>
              seg.isFormula ? buildChemNodeHtml(seg.text, seg.mode) : escapeHtml(seg.text)
            )
            .join('');
          const parent = node.parentNode;
          if (parent) {
            while (frag.firstChild) {
              parent.insertBefore(frag.firstChild, node);
            }
            parent.removeChild(node);
          }
        }
      }
    }
  };

  Array.from(container.childNodes).forEach(walkAndUpgradeText);
  hydrateChemNodesInElement(container);
  return container.innerHTML;
}

/**
 * Convert legacy mixed Vietnamese prose + inline formulas (e.g. N_2 + 3H_2 \rightleftharpoons 2NH_3 or $H_2SO_4$)
 * OR structured rich HTML containing <span data-chem-node="true"> into safe renderable HTML.
 */
export function renderMixedOrRichHtml(raw: string, isBlock = false): string {
  if (!raw) return '';

  // 1. Check if content is rich HTML (from SmartChemEditor or containing data-chem-node / sub / sup / HTML tags)
  const hasHtmlTags = /<\/?(?:p|div|span|h[1-6]|strong|b|em|i|u|sub|sup|ul|ol|li|table|thead|tbody|tr|th|td|br|a|img|svg)\b/i.test(
    raw
  );

  if (hasHtmlTags && typeof document !== 'undefined') {
    const template = document.createElement('div');
    template.innerHTML = raw;
    template.querySelectorAll('script, iframe, object, embed, style').forEach((el) => el.remove());
    template.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    // Upgrade any stray raw LaTeX in text nodes outside [data-chem-node="true"] too
    const upgradeStray = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.getAttribute('data-chem-node') === 'true') return;
        Array.from(el.childNodes).forEach(upgradeStray);
      } else if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent || '';
        if (
          txt.includes('$') ||
          txt.includes('\\') ||
          /[A-Za-z0-9)][_^](?:\{[^}]+\}|[A-Za-z0-9+\-°]+)/.test(txt)
        ) {
          const segs = scanMixedFormulaSegments(txt);
          if (segs.some((s) => s.isFormula)) {
            const span = document.createElement('span');
            span.innerHTML = segs
              .map((seg) =>
                seg.isFormula
                  ? renderFormulaToHtml(seg.text, seg.mode, Boolean(seg.isBlock))
                  : escapeHtml(seg.text)
              )
              .join('');
            const parent = node.parentNode;
            if (parent) {
              while (span.firstChild) parent.insertBefore(span.firstChild, node);
              parent.removeChild(node);
            }
          }
        }
      }
    };
    Array.from(template.childNodes).forEach(upgradeStray);
    hydrateChemNodesInElement(template);
    return template.innerHTML;
  }

  // 2. Check if content contains explicit $...$ or \ce{...}
  if (raw.includes('$') || raw.includes('\\ce{')) {
    const segs = scanMixedFormulaSegments(raw);
    return segs
      .map((seg) =>
        seg.isFormula
          ? renderFormulaToHtml(seg.text, seg.mode, isBlock || Boolean(seg.isBlock))
          : escapeHtml(seg.text)
      )
      .join('');
  }

  // 3. Determine if string is pure chemical/math formula (no multi-word Vietnamese prose)
  const hasVietnameseProse =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]{2,}|\s[a-zà-ỹ]{3,}\s+[a-zà-ỹ]{3,}/i.test(
      raw
    ) && !/->\[[^\]]*tạo|đặc|loãng|nóng chảy|dung dịch|ánh sáng/.test(raw);

  if (!hasVietnameseProse) {
    return renderFormulaToHtml(raw, 'chem', isBlock);
  }

  // 4. Mixed Vietnamese prose with inline chemistry/thermochemistry/LaTeX fragments
  const segs = scanMixedFormulaSegments(raw);
  return segs
    .map((seg) =>
      seg.isFormula ? renderFormulaToHtml(seg.text, seg.mode, Boolean(seg.isBlock)) : escapeHtml(seg.text)
    )
    .join('');
}

/**
 * Strip rich HTML to plain text (preserving formula source syntax for search/export fallback).
 */
export function richHtmlToPlainText(htmlOrText: string): string {
  if (!htmlOrText) return '';
  if (!/[<>]/.test(htmlOrText)) return htmlOrText;
  if (typeof document === 'undefined') {
    return htmlOrText
      .replace(/<\/?(?:sub|sup|b|strong|i|em|u|span|a)(?:\s[^>]*)?>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const div = document.createElement('div');
  div.innerHTML = htmlOrText;
  div.querySelectorAll('[data-chem-node="true"]').forEach((node) => {
    const src = node.getAttribute('data-source') || node.textContent || '';
    node.replaceWith(document.createTextNode(src));
  });
  return (div.textContent || '').replace(/\s+/g, ' ').trim();
}

export interface VisualReactionSpecies {
  id: string;
  coeff: string;
  formula: string;
  state: string;
  marker: '' | '↑' | '↓';
}

export interface VisualReactionState {
  reactants: VisualReactionSpecies[];
  products: VisualReactionSpecies[];
  arrowType: '->' | '<=>';
  condAbove: string;
  condBelow: string;
  enthalpyValue: string;
  enthalpyUnit: 'kJ' | 'kJ/mol';
}

export function serializeVisualReaction(rx: VisualReactionState): string {
  const formatSide = (list: VisualReactionSpecies[]) =>
    list
      .filter((s) => s.formula.trim())
      .map((s) => {
        const c = s.coeff.trim();
        const st = s.state.trim();
        return `${c}${s.formula.trim()}${st}${s.marker}`;
      })
      .join(' + ');

  const left = formatSide(rx.reactants);
  const right = formatSide(rx.products);
  const above = rx.condAbove.trim();
  const below = rx.condBelow.trim();

  let arrow = rx.arrowType;
  if (above && below) arrow = `${rx.arrowType}[${above}|${below}]` as '->' | '<=>';
  else if (above) arrow = `${rx.arrowType}[${above}]` as '->' | '<=>';
  else if (below) arrow = `${rx.arrowType}[|${below}]` as '->' | '<=>';

  let eq = `${left} ${arrow} ${right}`.trim();
  if (rx.enthalpyValue.trim()) {
    eq += ` (\\Delta_r H^\\circ_{298} = ${rx.enthalpyValue.trim()} ${rx.enthalpyUnit})`;
  }
  return eq;
}

export function tryParseReactionSource(source: string): VisualReactionState | null {
  if (!source) return null;
  let main = source.trim();
  let enthalpyValue = '';
  let enthalpyUnit: 'kJ' | 'kJ/mol' = 'kJ';

  const enthMatch = main.match(/\(\s*\\Delta_[rf]\s*H(?:\^(?:\\circ|o))?(?:_\{?298\}?)?\s*=\s*([^)kJ]+?)\s*(kJ\/mol|kJ)?\s*\)$/i);
  if (enthMatch) {
    enthalpyValue = enthMatch[1].trim();
    if (enthMatch[2] && /kJ\/mol/i.test(enthMatch[2])) enthalpyUnit = 'kJ/mol';
    main = main.slice(0, enthMatch.index).trim();
  }

  // Match arrow with optional [above|below]
  const arrMatch = main.match(/(<=>|->|\\rightleftharpoons|\\rightarrow)(?:\[([^|\]]*)(?:\|([^\]]*))?\])?/);
  if (!arrMatch || arrMatch.index === undefined) return null;

  const arrowType: '->' | '<=>' =
    arrMatch[1] === '<=>' || arrMatch[1] === '\\rightleftharpoons' ? '<=>' : '->';
  const condAbove = (arrMatch[2] || '').trim();
  const condBelow = (arrMatch[3] || '').trim();

  const leftStr = main.slice(0, arrMatch.index).trim();
  const rightStr = main.slice(arrMatch.index + arrMatch[0].length).trim();

  const parseSpeciesList = (sideStr: string): VisualReactionSpecies[] => {
    if (!sideStr) return [{ id: `sp_${Math.random()}`, coeff: '', formula: '', state: '', marker: '' }];
    // Split on ' + ' so ion charges like H+ or Fe3+ don't split!
    return sideStr.split(/\s+\+\s+/).map((raw, idx) => {
      let token = raw.trim();
      let marker: '' | '↑' | '↓' = '';
      if (token.endsWith('↑')) {
        marker = '↑';
        token = token.slice(0, -1).trim();
      } else if (token.endsWith('↓')) {
        marker = '↓';
        token = token.slice(0, -1).trim();
      }
      let state = '';
      const stM = token.match(/^(.*?)(\((?:r|l|k|dd|s|aq|g)\))$/i);
      if (stM) {
        token = stM[1];
        state = stM[2];
      }
      let coeff = '';
      const cM = token.match(/^(\d+(?:[.,]\d+)?)([A-Z([].*)$/);
      if (cM) {
        coeff = cM[1];
        token = cM[2];
      }
      return {
        id: `sp_${Date.now()}_${idx}`,
        coeff,
        formula: token,
        state,
        marker,
      };
    });
  };

  return {
    reactants: parseSpeciesList(leftStr),
    products: parseSpeciesList(rightStr),
    arrowType,
    condAbove,
    condBelow,
    enthalpyValue,
    enthalpyUnit,
  };
}
