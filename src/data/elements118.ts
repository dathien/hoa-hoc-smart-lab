export type ElementCategory =
  | 'kim-loai-kiem'
  | 'kim-loai-kiem-tho'
  | 'kim-loai-chuyen-tiep'
  | 'kim-loai-yeu'
  | 'a-kim'
  | 'phi-kim'
  | 'halogen'
  | 'khi-hiem'
  | 'lanthanoid'
  | 'actinoid';

export type ElementBlock = 's' | 'p' | 'd' | 'f';

export interface ChemElement118 {
  z: number;
  symbol: string;
  name: string; // IUPAC English name (GDPT 2018)
  viName?: string; // Traditional Vietnamese reference if distinct
  atomicMass: string; // IUPAC standard or [mass number]
  period: number; // 1..7
  group: number; // 1..18 (3 for Lanthanoids/Actinoids)
  block: ElementBlock;
  category: ElementCategory;
  shells: number[]; // K, L, M, N, O, P, Q
  electronConfig: string; // Full condensed/readable config
  fullConfig: string; // Complete 1s2 2s2 ...
  oxidationStates: string;
  atomicRadius: number | null; // Empirical/calculated atomic radius (pm); null => "Chưa có dữ liệu"
  electronegativity: number | null; // Pauling scale; null => "Chưa có dữ liệu"
  ionizationEnergy: number | null; // 1st ionization energy (kJ/mol); null => "Chưa có dữ liệu"
  metallicCharacter: string;
  summary: string;
  applications: string;
}

export const CATEGORY_META: Record<
  ElementCategory,
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
  'kim-loai-kiem': {
    label: 'Kim loại kiềm',
    bg: 'bg-rose-50 hover:bg-rose-100',
    border: 'border-rose-300',
    text: 'text-rose-950',
    dot: 'bg-rose-500',
  },
  'kim-loai-kiem-tho': {
    label: 'Kim loại kiềm thổ',
    bg: 'bg-orange-50 hover:bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-950',
    dot: 'bg-orange-500',
  },
  'kim-loai-chuyen-tiep': {
    label: 'Kim loại chuyển tiếp',
    bg: 'bg-amber-50 hover:bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-950',
    dot: 'bg-amber-500',
  },
  'kim-loai-yeu': {
    label: 'Kim loại sau chuyển tiếp',
    bg: 'bg-lime-50 hover:bg-lime-100',
    border: 'border-lime-300',
    text: 'text-lime-950',
    dot: 'bg-lime-600',
  },
  'a-kim': {
    label: 'Á kim',
    bg: 'bg-teal-50 hover:bg-teal-100',
    border: 'border-teal-300',
    text: 'text-teal-950',
    dot: 'bg-teal-600',
  },
  'phi-kim': {
    label: 'Phi kim',
    bg: 'bg-sky-50 hover:bg-sky-100',
    border: 'border-sky-300',
    text: 'text-sky-950',
    dot: 'bg-sky-500',
  },
  halogen: {
    label: 'Halogen',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    border: 'border-emerald-300',
    text: 'text-emerald-950',
    dot: 'bg-emerald-600',
  },
  'khi-hiem': {
    label: 'Khí hiếm',
    bg: 'bg-indigo-50 hover:bg-indigo-100',
    border: 'border-indigo-300',
    text: 'text-indigo-950',
    dot: 'bg-indigo-500',
  },
  lanthanoid: {
    label: 'Lanthanoid (4f)',
    bg: 'bg-fuchsia-50 hover:bg-fuchsia-100',
    border: 'border-fuchsia-300',
    text: 'text-fuchsia-950',
    dot: 'bg-fuchsia-500',
  },
  actinoid: {
    label: 'Actinoid (5f)',
    bg: 'bg-purple-50 hover:bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-950',
    dot: 'bg-purple-600',
  },
};

// Aufbau subshell order for Z = 1..118
const SUBSHELL_ORDER: { name: string; shell: number; max: number }[] = [
  { name: '1s', shell: 1, max: 2 },
  { name: '2s', shell: 2, max: 2 },
  { name: '2p', shell: 2, max: 6 },
  { name: '3s', shell: 3, max: 2 },
  { name: '3p', shell: 3, max: 6 },
  { name: '4s', shell: 4, max: 2 },
  { name: '3d', shell: 3, max: 10 },
  { name: '4p', shell: 4, max: 6 },
  { name: '5s', shell: 5, max: 2 },
  { name: '4d', shell: 4, max: 10 },
  { name: '5p', shell: 5, max: 6 },
  { name: '6s', shell: 6, max: 2 },
  { name: '4f', shell: 4, max: 14 },
  { name: '5d', shell: 5, max: 10 },
  { name: '6p', shell: 6, max: 6 },
  { name: '7s', shell: 7, max: 2 },
  { name: '5f', shell: 5, max: 14 },
  { name: '6d', shell: 6, max: 10 },
  { name: '7p', shell: 7, max: 6 },
];

// Ground-state exceptions (IUPAC / NIST experimental configurations)
const CONFIG_EXCEPTIONS: Record<number, Record<string, number>> = {
  24: { '3d': 5, '4s': 1 }, // Cr
  29: { '3d': 10, '4s': 1 }, // Cu
  41: { '4d': 4, '5s': 1 }, // Nb
  42: { '4d': 5, '5s': 1 }, // Mo
  44: { '4d': 7, '5s': 1 }, // Ru
  45: { '4d': 8, '5s': 1 }, // Rh
  46: { '4d': 10, '5s': 0 }, // Pd
  47: { '4d': 10, '5s': 1 }, // Ag
  57: { '4f': 0, '5d': 1, '6s': 2 }, // La
  58: { '4f': 1, '5d': 1, '6s': 2 }, // Ce
  64: { '4f': 7, '5d': 1, '6s': 2 }, // Gd
  78: { '4f': 14, '5d': 9, '6s': 1 }, // Pt
  79: { '4f': 14, '5d': 10, '6s': 1 }, // Au
  89: { '5f': 0, '6d': 1, '7s': 2 }, // Ac
  90: { '5f': 0, '6d': 2, '7s': 2 }, // Th
  91: { '5f': 2, '6d': 1, '7s': 2 }, // Pa
  92: { '5f': 3, '6d': 1, '7s': 2 }, // U
  93: { '5f': 4, '6d': 1, '7s': 2 }, // Np
  96: { '5f': 7, '6d': 1, '7s': 2 }, // Cm
  103: { '5f': 14, '6d': 0, '7s': 2, '7p': 1 }, // Lr
};

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export function toSup(num: number): string {
  return String(num)
    .split('')
    .map((c) => SUPERSCRIPTS[c] || c)
    .join('');
}

export interface SubshellOccupancy {
  name: string; // e.g. '3d'
  n: number; // principal shell 1..7
  lType: 's' | 'p' | 'd' | 'f';
  electrons: number;
  capacity: number; // 2, 6, 10, 14
}

export function getElementSubshells(z: number): SubshellOccupancy[] {
  const map: Record<string, number> = {};
  let remaining = z;
  for (const sub of SUBSHELL_ORDER) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, sub.max);
    map[sub.name] = take;
    remaining -= take;
  }

  const exc = CONFIG_EXCEPTIONS[z];
  if (exc) {
    for (const [k, v] of Object.entries(exc)) {
      map[k] = v;
    }
  }

  // Sort in shell-first spectroscopic order (1s, 2s, 2p, 3s, 3p, 3d, 4s, ...)
  const SPECTRO_ORDER = [
    '1s', '2s', '2p', '3s', '3p', '3d', '4s', '4p', '4d', '4f',
    '5s', '5p', '5d', '5f', '6s', '6p', '6d', '7s', '7p',
  ];

  const result: SubshellOccupancy[] = [];
  for (const name of SPECTRO_ORDER) {
    const count = map[name] || 0;
    if (count > 0) {
      const n = Number(name[0]);
      const lType = name[1] as 's' | 'p' | 'd' | 'f';
      const cap = lType === 's' ? 2 : lType === 'p' ? 6 : lType === 'd' ? 10 : 14;
      result.push({ name, n, lType, electrons: count, capacity: cap });
    }
  }
  return result;
}

function buildConfigStrings(z: number): {
  shells: number[];
  fullConfig: string;
  electronConfig: string;
} {
  const subs = getElementSubshells(z);
  const maxShell = Math.max(...subs.map((s) => s.n));
  const shells = Array.from({ length: maxShell }, () => 0);
  for (const s of subs) {
    shells[s.n - 1] += s.electrons;
  }

  const fullConfig = subs.map((s) => `${s.name}${toSup(s.electrons)}`).join(' ');

  const nobleGases: { z: number; label: string }[] = [
    { z: 86, label: '[Rn]' },
    { z: 54, label: '[Xe]' },
    { z: 36, label: '[Kr]' },
    { z: 18, label: '[Ar]' },
    { z: 10, label: '[Ne]' },
    { z: 2, label: '[He]' },
  ];

  const ng = nobleGases.find((g) => z > g.z);
  let electronConfig = fullConfig;
  if (ng) {
    const ngSubs = new Set(getElementSubshells(ng.z).map((s) => `${s.name}:${s.electrons}`));
    const tail = subs
      .filter((s) => !ngSubs.has(`${s.name}:${s.electrons}`))
      .map((s) => `${s.name}${toSup(s.electrons)}`)
      .join(' ');
    electronConfig = `${ng.label} ${tail}`;
  }

  return { shells, fullConfig, electronConfig };
}

type RawTuple = [
  z: number,
  symbol: string,
  name: string,
  viName: string,
  atomicMass: string,
  period: number,
  group: number,
  block: ElementBlock,
  category: ElementCategory,
  oxidationStates: string,
  atomicRadius: number | null, // empirical / covalent pm (CRC / IUPAC)
  electronegativity: number | null, // Pauling
  ionizationEnergy: number | null, // kJ/mol (NIST 1st IE)
  metallicCharacter: string,
  summary: string,
  applications: string
];

// Complete 118-element IUPAC / NIST dataset.
// Where experimental atomic radius, electronegativity, or 1st ionization energy is not reliably confirmed,
// values are strictly `null` so the UI explicitly displays "Chưa có dữ liệu".
const RAW_ELEMENTS: RawTuple[] = [
  [1, 'H', 'Hydrogen', 'Hiđro', '1.008', 1, 1, 's', 'phi-kim', '+1, -1', 37, 2.20, 1312, 'Phi kim', 'Nguyên tố nhẹ nhất vũ trụ; khí H₂ không màu, dễ cháy, là mốc điện cực chuẩn E° = 0 V.', 'Sản xuất NH₃, tổng hợp methanol, nhiên liệu tên lửa, pin nhiên liệu hydro.'],
  [2, 'He', 'Helium', 'Heli', '4.0026', 1, 18, 's', 'khi-hiem', '0', 32, null, 2372, 'Khí hiếm', 'Khí hiếm nhẹ thứ hai, lớp vỏ 1s² bão hòa hoàn toàn nên trơ về mặt hóa học.', 'Bơm khí cầu, làm lạnh nam châm siêu dẫn MRI, khí bảo vệ hàn hồ quang.'],
  [3, 'Li', 'Lithium', 'Liti', '6.94', 2, 1, 's', 'kim-loai-kiem', '+1', 152, 0.98, 520, 'Kim loại kiềm mạnh', 'Kim loại nhẹ nhất (d = 0,534 g/cm³), tính khử rất mạnh, phản ứng với nước.', 'Pin Lithium-ion xe điện & điện thoại, hợp kim nhẹ hàng không, gốm thủy tinh.'],
  [4, 'Be', 'Beryllium', 'Beri', '9.0122', 2, 2, 's', 'kim-loai-kiem-tho', '+2', 112, 1.57, 900, 'Kim loại kiềm thổ (lưỡng tính)', 'Kim loại nhẹ, cứng, nhiệt độ nóng chảy cao; hợp chất và bụi Be độc.', 'Cửa sổ tia X, hợp kim đồng-beryllium không phát tia lửa, phản xạ neutron.'],
  [5, 'B', 'Boron', 'Bo', '10.81', 2, 13, 'p', 'a-kim', '+3', 85, 2.04, 801, 'Á kim', 'Á kim cứng, dẫn điện kém ở nhiệt độ thường, tạo hợp chất thiếu electron như BF₃.', 'Thủy tinh borosilicate chịu nhiệt (Pyrex), sợi gia cường, chất hấp thụ neutron.'],
  [6, 'C', 'Carbon', 'Cacbon', '12.011', 2, 14, 'p', 'phi-kim', '-4, +2, +4', 77, 2.55, 1086, 'Phi kim', 'Nguyên tố nền tảng của hóa học hữu cơ; các dạng thù hình: kim cương, than chì, graphene.', 'Thép và hợp kim, vật liệu composite sợi carbon, pin, hóa dầu và sự sống.'],
  [7, 'N', 'Nitrogen', 'Nitơ', '14.007', 2, 15, 'p', 'phi-kim', '-3 đến +5', 71, 3.04, 1402, 'Phi kim mạnh', 'Chiếm ~78% thể tích không khí; phân tử N₂ có liên kết ba bền vững ở nhiệt độ thường.', 'Tổng hợp NH₃ và HNO₃, sản xuất phân đạm, khí trơ bảo quản thực phẩm, làm lạnh sâu.'],
  [8, 'O', 'Oxygen', 'Oxi', '15.999', 2, 16, 'p', 'phi-kim', '-2, -1', 66, 3.44, 1314, 'Phi kim mạnh', 'Nguyên tố phổ biến nhất trong vỏ Trái Đất; chất oxi hóa mạnh duy trì sự sống và sự cháy.', 'Y tế hô hấp, luyện thép lò thổi, hàn cắt kim loại, chất oxi hóa nhiên liệu đẩy.'],
  [9, 'F', 'Fluorine', 'Flo', '18.998', 2, 17, 'p', 'halogen', '-1', 64, 3.98, 1681, 'Phi kim mạnh nhất', 'Nguyên tố có độ âm điện lớn nhất (3,98) và tính phi kim mạnh nhất bảng tuần hoàn.', 'Sản xuất nhựa PTFE (Teflon), kem đánh răng ngừa sâu răng (NaF), làm giàu uranium.'],
  [10, 'Ne', 'Neon', 'Neon', '20.180', 2, 18, 'p', 'khi-hiem', '0', 69, null, 2081, 'Khí hiếm', 'Khí hiếm đơn nguyên tử có lớp vỏ 2s²2p⁶ bền vững, phát ánh sáng đỏ cam khi phóng điện.', 'Đèn quảng cáo neon cao áp, laser He-Ne, chất làm lạnh cryogenic.'],
  [11, 'Na', 'Sodium', 'Natri', '22.990', 3, 1, 's', 'kim-loai-kiem', '+1', 186, 0.93, 496, 'Kim loại kiềm mạnh', 'Kim loại kiềm mềm, trắng bạc, phản ứng mãnh liệt với nước tạo NaOH và khí H₂.', 'Sản xuất xút NaOH, muối ăn NaCl, đèn hơi natri, chất trao đổi nhiệt lò hạt nhân.'],
  [12, 'Mg', 'Magnesium', 'Magie', '24.305', 3, 2, 's', 'kim-loai-kiem-tho', '+2', 160, 1.31, 738, 'Kim loại kiềm thổ', 'Kim loại nhẹ, cháy sáng chói trong không khí và CO₂ tạo MgO; ion thiết yếu của diệp lục.', 'Hợp kim nhẹ hàng không – ô tô, pháo sáng, thuốc kháng acid dạ dày Mg(OH)₂.'],
  [13, 'Al', 'Aluminium', 'Nhôm', '26.982', 3, 13, 'p', 'kim-loai-yeu', '+3', 143, 1.61, 578, 'Kim loại (lưỡng tính)', 'Kim loại phổ biến nhất vỏ Trái Đất; nhẹ, dẫn điện tốt, thụ động trong HNO₃/H₂SO₄ đặc nguội.', 'Vỏ máy bay, dây dẫn điện, bao bì thực phẩm, phản ứng nhiệt nhôm hàn đường ray.'],
  [14, 'Si', 'Silicon', 'Silic', '28.085', 3, 14, 'p', 'a-kim', '-4, +4', 117, 1.90, 787, 'Á kim bán dẫn', 'Á kim phổ biến thứ hai vỏ Trái Đất (trong cát SiO₂, đất sét); vật liệu bán dẫn nền tảng.', 'Chip vi xử lý bán dẫn, pin mặt trời quang điện, thủy tinh, gốm sứ, silicone.'],
  [15, 'P', 'Phosphorus', 'Photpho', '30.974', 3, 15, 'p', 'phi-kim', '-3, +3, +5', 110, 2.19, 1012, 'Phi kim', 'Có hai dạng thù hình chính: P trắng (rất độc, tự bốc cháy) và P đỏ (bền hơn).', 'Sản xuất acid H₃PO₄, phân bón lân (supephotphat), diêm an toàn, ATP sinh học.'],
  [16, 'S', 'Sulfur', 'Lưu huỳnh', '32.06', 3, 16, 'p', 'phi-kim', '-2, +4, +6', 104, 2.58, 1000, 'Phi kim', 'Chất rắn màu vàng chanh; thể hiện cả tính khử và tính oxi hóa tùy chất tác dụng.', 'Sản xuất acid sulfuric H₂SO₄, lưu hóa cao su, thuốc trừ sâu nấm, diêm và pháo hoa.'],
  [17, 'Cl', 'Chlorine', 'Clo', '35.45', 3, 17, 'p', 'halogen', '-1, +1, +5, +7', 99, 3.16, 1251, 'Phi kim mạnh', 'Khí màu vàng lục, mùi hắc độc; halogen có tính oxi hóa rất mạnh và khả năng tẩy màu.', 'Khử trùng nước sinh hoạt, sản xuất nhựa PVC, nước Javel, acid HCl, chất tẩy trắng.'],
  [18, 'Ar', 'Argon', 'Agon', '39.948', 3, 18, 'p', 'khi-hiem', '0', 97, null, 1521, 'Khí hiếm', 'Khí hiếm phong phú nhất trong khí quyển (~0,93% thể tích), hoàn toàn trơ hóa học.', 'Khí bảo vệ khi hàn TIG/MIG, bơm bóng đèn sợi đốt, cửa kính cách nhiệt.'],
  [19, 'K', 'Potassium', 'Kali', '39.098', 4, 1, 's', 'kim-loai-kiem', '+1', 227, 0.82, 419, 'Kim loại kiềm rất mạnh', 'Kim loại kiềm hoạt động hóa học mạnh hơn Na, phản ứng bốc cháy khi tiếp xúc với nước.', 'Sản xuất phân bón kali (KCl, KNO₃), xà phòng mềm KOH, cân bằng điện giải cơ thể.'],
  [20, 'Ca', 'Calcium', 'Canxi', '40.078', 4, 2, 's', 'kim-loai-kiem-tho', '+2', 197, 1.00, 590, 'Kim loại kiềm thổ', 'Kim loại kiềm thổ màu trắng bạc, phản ứng với nước ở nhiệt độ thường; cấu tạo xương và đá vôi.', 'Sản xuất xi măng, vôi sống CaO, thạch cao xây dựng, luyện thép khử lưu huỳnh.'],
  [21, 'Sc', 'Scandium', 'Scanđi', '44.956', 4, 3, 'd', 'kim-loai-chuyen-tiep', '+3', 162, 1.36, 633, 'Kim loại chuyển tiếp', 'Kim loại chuyển tiếp đầu tiên của dãy 3d, nhẹ màu trắng bạc.', 'Hợp kim nhôm-scandi siêu nhẹ trong ngành hàng không và thiết bị thể thao.'],
  [22, 'Ti', 'Titanium', 'Titan', '47.867', 4, 4, 'd', 'kim-loai-chuyen-tiep', '+2, +3, +4', 147, 1.54, 659, 'Kim loại chuyển tiếp', 'Tỉ trọng nhẹ, độ bền cơ học rất cao, chống ăn mòn vượt trội nhờ lớp màng TiO₂.', 'Vỏ tên lửa, thân máy bay, khớp xương nhân tạo cấy ghép, bột màu trắng TiO₂.'],
  [23, 'V', 'Vanadium', 'Vanađi', '50.942', 4, 5, 'd', 'kim-loai-chuyen-tiep', '+2, +3, +4, +5', 134, 1.63, 651, 'Kim loại chuyển tiếp', 'Kim loại cứng, hợp chất nhiều màu sắc đẹp theo các số oxi hóa từ +2 đến +5.', 'Xúc tác V₂O₅ sản xuất H₂SO₄ tiếp xúc, phụ gia thép chịu lực cao, pin dòng chảy.'],
  [24, 'Cr', 'Chromium', 'Crom', '51.996', 4, 6, 'd', 'kim-loai-chuyen-tiep', '+2, +3, +6', 128, 1.66, 653, 'Kim loại chuyển tiếp', 'Kim loại cứng nhất trong các kim loại; cấu hình đặc biệt [Ar] 3d⁵ 4s¹ bán bão hòa bền.', 'Sản xuất thép không gỉ (inox), mạ crom chống gỉ sáng bóng, chất tạo màu gốm.'],
  [25, 'Mn', 'Manganese', 'Mangan', '54.938', 4, 7, 'd', 'kim-loai-chuyen-tiep', '+2, +4, +7', 127, 1.55, 717, 'Kim loại chuyển tiếp', 'Kim loại cứng giòn giống sắt; hợp chất KMnO₄ (+7) là chất oxi hóa cực mạnh.', 'Luyện thép hợp kim chịu mài mòn, pin kiềm MnO₂, thuốc tím sát khuẩn KMnO₄.'],
  [26, 'Fe', 'Iron', 'Sắt', '55.845', 4, 8, 'd', 'kim-loai-chuyen-tiep', '+2, +3', 126, 1.83, 762, 'Kim loại chuyển tiếp', 'Kim loại quan trọng nhất công nghiệp nặng; tính nhiễm từ mạnh; tạo hợp chất Fe(II) và Fe(III).', 'Sản xuất gang, thép xây dựng, máy móc cơ khí, xúc tác tổng hợp NH₃, hemoglobin máu.'],
  [27, 'Co', 'Cobalt', 'Coban', '58.933', 4, 9, 'd', 'kim-loai-chuyen-tiep', '+2, +3', 125, 1.88, 760, 'Kim loại chuyển tiếp', 'Kim loại có tính từ tính cao, tạo màu xanh coban đặc trưng cho thủy tinh và gốm sứ.', 'Cực dương pin Li-ion, siêu hợp kim tua-bin phản lực, vitamin B12, đồng vị Co-60 y học.'],
  [28, 'Ni', 'Nickel', 'Niken', '58.693', 4, 10, 'd', 'kim-loai-chuyen-tiep', '+2', 124, 1.91, 737, 'Kim loại chuyển tiếp', 'Kim loại màu trắng bạc ánh vàng, bền với kiềm và ăn mòn, đứng trước H trong dãy hoạt động.', 'Thép không gỉ, mạ bảo vệ chống gỉ, pin NiMH, xúc tác phản ứng cộng H₂ thực phẩm.'],
  [29, 'Cu', 'Copper', 'Đồng', '63.546', 4, 11, 'd', 'kim-loai-chuyen-tiep', '+1, +2', 128, 1.90, 745, 'Kim loại chuyển tiếp yếu', 'Kim loại màu đỏ cam, dẫn điện và dẫn nhiệt đứng thứ 2 chỉ sau bạc; cấu hình [Ar] 3d¹⁰ 4s¹.', 'Dây cáp dẫn điện, bo mạch điện tử, hợp kim đồng thau (Cu-Zn), đồng thanh, thuốc diệt nấm CuSO₄.'],
  [30, 'Zn', 'Zinc', 'Kẽm', '65.38', 4, 12, 'd', 'kim-loai-chuyen-tiep', '+2', 134, 1.65, 906, 'Kim loại (lưỡng tính)', 'Kim loại màu trắng xanh, hoạt động mạnh hơn Fe; tan được cả trong dung dịch acid và kiềm.', 'Mạ kẽm bảo vệ tôn thép (chống ăn mòn điện hóa), pin khô Zn-MnO₂, hợp kim đồng thau.'],
  [31, 'Ga', 'Gallium', 'Gali', '69.723', 4, 13, 'p', 'kim-loai-yeu', '+3', 135, 1.81, 579, 'Kim loại sau chuyển tiếp', 'Kim loại màu trắng bạc, nhiệt độ nóng chảy cực thấp (29,76°C — tan chảy trên lòng bàn tay).', 'Bán dẫn GaAs, đèn LED xanh GaN, nhiệt kế nhiệt độ cao, hợp kim Galinstan.'],
  [32, 'Ge', 'Germanium', 'Gecmani', '72.630', 4, 14, 'p', 'a-kim', '+2, +4', 122, 2.01, 762, 'Á kim bán dẫn', 'Á kim giòn màu xám trắng, có tính chất bán dẫn quan trọng gần tương tự silic.', 'Cáp quang truyền dẫn, ống kính hồng ngoại nhìn đêm, transistor tốc độ cao.'],
  [33, 'As', 'Arsenic', 'Asen', '74.922', 4, 15, 'p', 'a-kim', '-3, +3, +5', 120, 2.18, 947, 'Á kim', 'Á kim độc hại (thạch tín), tồn tại nhiều dạng thù hình với độc tính cao với sinh vật.', 'Chất bán dẫn GaAs trong vi điện tử, hợp kim chì trong ắc quy, laser hồng ngoại.'],
  [34, 'Se', 'Selenium', 'Selen', '78.971', 4, 16, 'p', 'phi-kim', '-2, +4, +6', 117, 2.55, 941, 'Phi kim', 'Phi kim có độ dẫn điện tăng mạnh khi được chiếu sáng (quang dẫn); vi lượng thiết yếu.', 'Pin mặt trời CIGS, tế bào quang điện, chất khử màu xanh của thủy tinh, dầu gội trị gàu.'],
  [35, 'Br', 'Bromine', 'Brom', '79.904', 4, 17, 'p', 'halogen', '-1, +1, +5', 114, 2.96, 1140, 'Phi kim mạnh', 'Phi kim DUY NHẤT ở trạng thái lỏng màu nâu đỏ ở điều kiện thường, dễ bay hơi và gây bỏng nặng.', 'Thuốc thử nhận biết liên kết đôi C=C, chất chống cháy, tổng hợp dược phẩm và thuốc nhuộm.'],
  [36, 'Kr', 'Krypton', 'Kripton', '83.798', 4, 18, 'p', 'khi-hiem', '0, +2', 110, 3.00, 1351, 'Khí hiếm', 'Khí hiếm nặng hơn không khí, có thể tạo một số hợp chất với flo ở điều kiện đặc biệt (KrF₂).', 'Đèn flash nhiếp ảnh tốc độ cao, laser UV công nghiệp, bóng đèn halogen krypton.'],
  [37, 'Rb', 'Rubidium', 'Rubiđi', '85.468', 5, 1, 's', 'kim-loai-kiem', '+1', 248, 0.82, 403, 'Kim loại kiềm cực mạnh', 'Kim loại kiềm mềm, nóng chảy ở 39,3°C, tự bốc cháy trong không khí ẩm.', 'Đồng hồ nguyên tử độ chính xác cao, tế bào quang điện, nghiên cứu ngưng tụ Bose-Einstein.'],
  [38, 'Sr', 'Strontium', 'Stronti', '87.62', 5, 2, 's', 'kim-loai-kiem-tho', '+2', 215, 0.95, 550, 'Kim loại kiềm thổ', 'Kim loại kiềm thổ hoạt động mạnh, hợp chất cháy cho ngọn lửa màu đỏ son rực rỡ.', 'Pháo hoa và pháo hiệu màu đỏ thẫm, nam châm ferrite, đồng hồ nguyên tử quang học.'],
  [39, 'Y', 'Yttrium', 'Ytri', '88.906', 5, 3, 'd', 'kim-loai-chuyen-tiep', '+3', 180, 1.22, 600, 'Kim loại đất hiếm', 'Kim loại chuyển tiếp thuộc nhóm nguyên tố đất hiếm nhẹ, màu trắng bạc.', 'Laser rắn Nd:YAG, chất phát quang màn hình LED/TV, siêu dẫn nhiệt độ cao YBCO.'],
  [40, 'Zr', 'Zirconium', 'Zirconi', '91.224', 5, 4, 'd', 'kim-loai-chuyen-tiep', '+4', 160, 1.33, 640, 'Kim loại chuyển tiếp', 'Kim loại chống ăn mòn hóa chất rất tốt, tiết diện hấp thụ neutron nhiệt cực thấp.', 'Vỏ thanh nhiên liệu lò phản ứng hạt nhân, gốm zirconia ZrO₂ làm răng sứ, đá nhân tạo CZ.'],
  [41, 'Nb', 'Niobium', 'Niobi', '92.906', 5, 5, 'd', 'kim-loai-chuyen-tiep', '+5', 146, 1.60, 652, 'Kim loại chuyển tiếp', 'Kim loại chịu nhiệt siêu dẫn; cấu hình ngoại lệ [Kr] 4d⁴ 5s¹.', 'Dây nam châm siêu dẫn máy MRI và LHC, hợp kim thép kết cấu đường ống dẫn dầu, động cơ tên lửa.'],
  [42, 'Mo', 'Molybdenum', 'Molipđen', '95.95', 5, 6, 'd', 'kim-loai-chuyen-tiep', '+4, +6', 139, 2.16, 684, 'Kim loại chuyển tiếp', 'Kim loại có nhiệt độ nóng chảy rất cao (2623°C); cấu hình bền [Kr] 4d⁵ 5s¹.', 'Hợp kim thép chịu nhiệt cao, chất bôi trơn rắn MoS₂, enzyme cố định đạm thực vật.'],
  [43, 'Tc', 'Technetium', 'Tecneti', '[98]', 5, 7, 'd', 'kim-loai-chuyen-tiep', '+4, +7', 136, 1.90, 702, 'Kim loại chuyển tiếp phóng xạ', 'Nguyên tố NHẸ NHẤT không có đồng vị bền nào (tất cả đều phóng xạ).', 'Đồng vị Tc-99m dùng rộng rãi nhất trong y học hạt nhân chẩn đoán hình ảnh.'],
  [44, 'Ru', 'Ruthenium', 'Ruteni', '101.07', 5, 8, 'd', 'kim-loai-chuyen-tiep', '+3, +4, +8', 134, 2.20, 710, 'Kim loại nhóm bạch kim', 'Kim loại quý hiếm màu trắng bạc cứng, trơ với hầu hết acid.', 'Xúc tác tổng hợp hữu cơ (giải Nobel), điện cực pin mặt trời và chip điện trở chính xác.'],
  [45, 'Rh', 'Rhodium', 'Rođi', '102.91', 5, 9, 'd', 'kim-loai-chuyen-tiep', '+3', 134, 2.28, 720, 'Kim loại nhóm bạch kim', 'Kim loại quý phản chiếu ánh sáng cực tốt, chống ăn mòn hoàn hảo; cấu hình [Kr] 4d⁸ 5s¹.', 'Bộ chuyển đổi xúc tác khí thải ô tô, mạ trang sức vàng trắng chống trầy xước.'],
  [46, 'Pd', 'Palladium', 'Palađi', '106.42', 5, 10, 'd', 'kim-loai-chuyen-tiep', '+2, +4', 137, 2.20, 804, 'Kim loại nhóm bạch kim', 'Kim loại quý hấp thụ lượng khí H₂ gấp 900 lần thể tích của chính nó; cấu hình [Kr] 4d¹⁰.', 'Xúc tác lọc khí thải, màng tinh chế hydro siêu sạch, tiếp điểm điện tử và nha khoa.'],
  [47, 'Ag', 'Silver', 'Bạc', '107.87', 5, 11, 'd', 'kim-loai-chuyen-tiep', '+1', 144, 1.93, 731, 'Kim loại quý', 'Kim loại dẫn điện và dẫn nhiệt TỐT NHẤT trong tất cả các kim loại; không phản ứng với HCl.', 'Trang sức, gương phản xạ cao, linh kiện điện tử cao cấp, muối AgNO₃, nano bạc kháng khuẩn.'],
  [48, 'Cd', 'Cadmium', 'Cađimi', '112.41', 5, 12, 'd', 'kim-loai-chuyen-tiep', '+2', 151, 1.69, 868, 'Kim loại chuyển tiếp', 'Kim loại mềm màu trắng xanh, độc hại tích lũy sinh học.', 'Pin sạc Ni-Cd (nay đang hạn chế), chấm lượng tử CdSe màn hình QLED, thanh điều khiển lò hạt nhân.'],
  [49, 'In', 'Indium', 'Inđi', '114.82', 5, 13, 'p', 'kim-loai-yeu', '+3', 167, 1.78, 558, 'Kim loại sau chuyển tiếp', 'Kim loại rất mềm (cắt được bằng dao), phát tiếng kêu lách tách đặc trưng khi uốn.', 'Lớp phủ dẫn điện trong suốt ITO cho màn hình cảm ứng điện thoại và LCD, hợp kim hàn nhiệt độ thấp.'],
  [50, 'Sn', 'Tin', 'Thiếc', '118.71', 5, 14, 'p', 'kim-loai-yeu', '+2, +4', 140, 1.96, 709, 'Kim loại sau chuyển tiếp', 'Kim loại màu trắng bạc dễ dát mỏng, đứng trước H trong dãy hoạt động hóa học.', 'Hợp kim hàn mạch điện tử (thiếc-bạc-đồng), tráng sắt tây làm hộp đồ ăn, hợp kim đồng thanh.'],
  [51, 'Sb', 'Antimony', 'Antimon', '121.76', 5, 15, 'p', 'a-kim', '-3, +3, +5', 140, 2.05, 834, 'Á kim', 'Á kim giòn màu trắng bạc ánh xanh; hợp chất Sb₂O₃ chống cháy tốt.', 'Phụ gia làm cứng bản cực chì ắc quy, chất chống cháy trong nhựa và vải, vật liệu bán dẫn.'],
  [52, 'Te', 'Tellurium', 'Telu', '127.60', 5, 16, 'p', 'a-kim', '-2, +4, +6', 143, 2.10, 869, 'Á kim', 'Á kim hiếm màu trắng bạc, có tính bán dẫn và nhiệt điện nổi bật.', 'Tấm pin mặt trời CdTe, thiết bị làm lạnh nhiệt điện Peltier, phụ gia thép dễ gia công.'],
  [53, 'I', 'Iodine', 'Iot', '126.90', 5, 17, 'p', 'halogen', '-1, +1, +5, +7', 133, 2.66, 1008, 'Phi kim', 'Tinh thể rắn màu đen tím có ánh kim nhẹ, dễ thăng hoa; làm hồ tinh bột chuyển xanh tím.', 'Muối ăn bổ sung iod ngừa bướu cổ, cồn iod sát trùng vết thương, nhận biết tinh bột.'],
  [54, 'Xe', 'Xenon', 'Xenon', '131.29', 5, 18, 'p', 'khi-hiem', '0, +2, +4, +6', 130, 2.60, 1170, 'Khí hiếm', 'Khí hiếm nặng đầu tiên được tổng hợp hợp chất hóa học (XePtF₆ năm 1962).', 'Đèn pha ô tô cường độ cao, động cơ đẩy ion cho tàu vũ trụ, chất gây mê y học.'],
  [55, 'Cs', 'Cesium', 'Xesi', '132.91', 6, 1, 's', 'kim-loai-kiem', '+1', 265, 0.79, 376, 'Kim loại kiềm mạnh nhất', 'Kim loại có bán kính nguyên tử rất lớn, năng lượng ion hóa rất nhỏ và độ âm điện thấp (0,79).', 'Chuẩn định nghĩa đơn vị giây (đồng hồ nguyên tử Cs-133), tế bào quang điện, dung dịch khoan dầu.'],
  [56, 'Ba', 'Barium', 'Bari', '137.33', 6, 2, 's', 'kim-loai-kiem-tho', '+2', 222, 0.89, 503, 'Kim loại kiềm thổ mạnh', 'Kim loại kiềm thổ nặng, phản ứng mạnh với nước; ion Ba²⁺ tạo kết tủa trắng BaSO₄ không tan.', 'Thuốc thử BaCl₂/Ba(OH)₂ nhận biết ion SO₄²⁻, chất cản quang đường tiêu hóa BaSO₄, pháo hoa xanh lá.'],
  [57, 'La', 'Lanthanum', 'Lantan', '138.91', 6, 3, 'f', 'lanthanoid', '+3', 187, 1.10, 538, 'Kim loại đất hiếm', 'Nguyên tố mở đầu họ Lanthanoid (Z = 57–71), kim loại dẻo màu trắng bạc dễ bị oxi hóa.', 'Ống kính máy ảnh độ chiết suất cao, điện cực pin xe hybrid NiMH, xúc tác crackinh dầu mỏ.'],
  [58, 'Ce', 'Cerium', 'Xeri', '140.12', 6, 3, 'f', 'lanthanoid', '+3, +4', 181, 1.12, 534, 'Kim loại đất hiếm', 'Nguyên tố đất hiếm phong phú nhất vỏ Trái Đất; hợp kim với sắt phát tia lửa khi cọ xát.', 'Đá lửa bật lửa, bột đánh bóng kính quang học CeO₂, bộ xúc tác khí thải ô tô.'],
  [59, 'Pr', 'Praseodymium', 'Prazeođim', '140.91', 6, 3, 'f', 'lanthanoid', '+3', 182, 1.13, 527, 'Kim loại đất hiếm', 'Kim loại đất hiếm màu trắng bạc, muối có màu xanh lục đặc trưng.', 'Kính bảo hộ thợ hàn lọc ánh sáng natri, nam châm vĩnh cửu mạnh, màu gốm thủy tinh.'],
  [60, 'Nd', 'Neodymium', 'Neođim', '144.24', 6, 3, 'f', 'lanthanoid', '+3', 181, 1.14, 533, 'Kim loại đất hiếm', 'Nổi tiếng nhờ tạo ra loại nam châm vĩnh cửu mạnh nhất thế giới hiện nay (Nd₂Fe₁₄B).', 'Động cơ xe điện, tua-bin gió, tai nghe chất lượng cao, ổ cứng máy tính, laser công nghiệp.'],
  [61, 'Pm', 'Promethium', 'Prometi', '[145]', 6, 3, 'f', 'lanthanoid', '+3', 183, 1.13, 540, 'Kim loại đất hiếm phóng xạ', 'Nguyên tố duy nhất thuộc họ Lanthanoid không có đồng vị bền nào trong tự nhiên.', 'Pin hạt nhân kích thước siêu nhỏ cho thiết bị thăm dò vũ trụ và cảm biến y tế chuyên dụng.'],
  [62, 'Sm', 'Samarium', 'Samari', '150.36', 6, 3, 'f', 'lanthanoid', '+2, +3', 180, 1.17, 545, 'Kim loại đất hiếm', 'Kim loại đất hiếm cứng màu trắng bạc, bền từ tính ở nhiệt độ cao.', 'Nam châm Samarium-Cobalt chịu nhiệt cao trong hàng không quân sự, thanh hấp thụ neutron.'],
  [63, 'Eu', 'Europium', 'Europi', '151.96', 6, 3, 'f', 'lanthanoid', '+2, +3', 199, 1.20, 547, 'Kim loại đất hiếm', 'Kim loại hoạt động hóa học mạnh nhất trong họ Lanthanoid, phát huỳnh quang đỏ/xanh rực rỡ.', 'Chất phát quang đèn huỳnh quang/LED, mực chống giả tiền Euro, màn hình TV độ nét cao.'],
  [64, 'Gd', 'Gadolinium', 'Gađolini', '157.25', 6, 3, 'f', 'lanthanoid', '+3', 180, 1.20, 593, 'Kim loại đất hiếm', 'Có 7 electron độc thân ở phân lớp 4f⁷ tạo tính thuận từ cực mạnh.', 'Chất tương phản tiêm tĩnh mạch trong chụp cộng hưởng từ MRI, làm lạnh từ trường.'],
  [65, 'Tb', 'Terbium', 'Tecbi', '158.93', 6, 3, 'f', 'lanthanoid', '+3', 178, 1.20, 566, 'Kim loại đất hiếm', 'Kim loại đất hiếm mềm dẻo, phát ánh sáng huỳnh quang xanh lục tinh khiết.', 'Chất phát quang xanh lục trong màn hình và đèn tiết kiệm điện, vật liệu từ giảo Terfenol-D.'],
  [66, 'Dy', 'Dysprosium', 'Đisprozi', '162.50', 6, 3, 'f', 'lanthanoid', '+3', 177, 1.22, 573, 'Kim loại đất hiếm', 'Có tính cảm từ rất cao, giúp nam châm không bị mất từ tính khi nóng lên.', 'Phụ gia không thể thiếu trong nam châm động cơ xe điện và tua-bin điện gió.'],
  [67, 'Ho', 'Holmium', 'Honmi', '164.93', 6, 3, 'f', 'lanthanoid', '+3', 176, 1.23, 581, 'Kim loại đất hiếm', 'Sở hữu mô-men từ tự nhiên lớn nhất trong tất cả các nguyên tố hóa học.', 'Lõi tập trung từ trường cực mạnh, laser y khoa tán sỏi thận và phẫu thuật mắt.'],
  [68, 'Er', 'Erbium', 'Ecbi', '167.26', 6, 3, 'f', 'lanthanoid', '+3', 176, 1.24, 589, 'Kim loại đất hiếm', 'Ion Er³⁺ cho màu hồng đặc trưng và khuếch đại tín hiệu ánh sáng cực hiệu quả.', 'Bộ khuếch đại cáp quang internet toàn cầu (EDFA), laser thẩm mỹ nha khoa, thủy tinh màu hồng.'],
  [69, 'Tm', 'Thulium', 'Tuli', '168.93', 6, 3, 'f', 'lanthanoid', '+3', 176, 1.25, 597, 'Kim loại đất hiếm', 'Nguyên tố đất hiếm ít phổ biến nhất (trừ promethium phóng xạ).', 'Nguồn phát tia X di động cho chụp ảnh y tế dã chiến, laser phẫu thuật mô mềm.'],
  [70, 'Yb', 'Ytterbium', 'Ytecbi', '173.05', 6, 3, 'f', 'lanthanoid', '+2, +3', 176, 1.10, 603, 'Kim loại đất hiếm', 'Kim loại đất hiếm có phân lớp 4f¹⁴ bão hòa hoàn toàn.', 'Laser sợi quang công suất lớn cắt kim loại, đồng hồ mạng quang học siêu chính xác.'],
  [71, 'Lu', 'Lutetium', 'Luteti', '174.97', 6, 3, 'f', 'lanthanoid', '+3', 174, 1.27, 524, 'Kim loại đất hiếm', 'Nguyên tố cuối cùng và nặng nhất, đặc nhất của họ Lanthanoid.', 'Tinh thể nhấp nháy LSO trong máy quét y học PET, xúc tác công nghiệp hóa dầu.'],
  [72, 'Hf', 'Hafnium', 'Hafni', '178.49', 6, 4, 'd', 'kim-loai-chuyen-tiep', '+4', 159, 1.30, 659, 'Kim loại chuyển tiếp', 'Có tính chất hóa học rất giống Zirconium nhưng lại hấp thụ neutron cực mạnh.', 'Thanh điều khiển lò phản ứng hạt nhân, lớp cách điện cổng transitor HfO₂ trong CPU hiện đại.'],
  [73, 'Ta', 'Tantalum', 'Tantan', '180.95', 6, 5, 'd', 'kim-loai-chuyen-tiep', '+5', 146, 1.50, 761, 'Kim loại chuyển tiếp', 'Kim loại chịu nhiệt cực cao, hầu như không bị ăn mòn bởi acid ở nhiệt độ dưới 150°C.', 'Tụ điện tantalum siêu nhỏ trong điện thoại/laptop, thiết bị cấy ghép phẫu thuật và dụng cụ hóa chất.'],
  [74, 'W', 'Tungsten', 'Vonfram', '183.84', 6, 6, 'd', 'kim-loai-chuyen-tiep', '+4, +6', 139, 2.36, 770, 'Kim loại chuyển tiếp', 'Kim loại có nhiệt độ nóng chảy CAO NHẤT bảng tuần hoàn (3422°C).', 'Dây tóc bóng đèn, mũi khoan siêu cứng WC (tungsten carbide), điện cực hàn TIG.'],
  [75, 'Re', 'Rhenium', 'Reni', '186.21', 6, 7, 'd', 'kim-loai-chuyen-tiep', '+4, +7', 137, 1.90, 760, 'Kim loại chuyển tiếp', 'Một trong những kim loại hiếm nhất vỏ Trái Đất với nhiệt độ nóng chảy đứng thứ 3.', 'Siêu hợp kim cánh tua-bin động cơ máy bay phản lực, xúc tác chế biến xăng không chì.'],
  [76, 'Os', 'Osmium', 'Osimi', '190.23', 6, 8, 'd', 'kim-loai-chuyen-tiep', '+4, +8', 135, 2.20, 840, 'Kim loại nặng nhất', 'Nguyên tố tự nhiên có khối lượng riêng LỚN NHẤT (22,59 g/cm³); oxit OsO₄ rất độc.', 'Ngòi bút máy cao cấp chống mài mòn, tiếp điểm điện công nghiệp và nhuộm mẫu kính hiển vi.'],
  [77, 'Ir', 'Iridium', 'Iriđi', '192.22', 6, 9, 'd', 'kim-loai-chuyen-tiep', '+3, +4', 136, 2.20, 880, 'Kim loại chống ăn mòn nhất', 'Kim loại chống ăn mòn hóa học tốt nhất được biết đến, không tan cả trong nước cường toan.', 'Bugi đánh lửa siêu bền, chuẩn kilogam quốc tế cũ (hợp kim Pt-Ir), chén nung đơn tinh thể.'],
  [78, 'Pt', 'Platinum', 'Platin (Bạch kim)', '195.08', 6, 10, 'd', 'kim-loai-chuyen-tiep', '+2, +4', 139, 2.28, 870, 'Kim loại quý', 'Kim loại quý màu trắng xám, rất trơ hóa học; đứng gần cuối dãy hoạt động hóa học.', 'Xúc tác tổng hợp HNO₃, bộ lọc khí thải, pin nhiên liệu hydro, trang sức và thuốc trị ung thư Cisplatin.'],
  [79, 'Au', 'Gold', 'Vàng', '196.97', 6, 11, 'd', 'kim-loai-chuyen-tiep', '+1, +3', 144, 2.54, 890, 'Kim loại quý kém hoạt động nhất', 'Kim loại màu vàng óng ánh, dễ dát mỏng nhất, cực bền trong không khí và acid thông thường.', 'Dự trữ tài chính, trang sức, chân tiếp xúc vi mạch điện tử không bị oxi hóa, y sinh nano vàng.'],
  [80, 'Hg', 'Mercury', 'Thủy ngân', '200.59', 6, 12, 'd', 'kim-loai-chuyen-tiep', '+1, +2', 151, 2.00, 1007, 'Kim loại lỏng', 'Kim loại DUY NHẤT ở trạng thái lỏng ở điều kiện thường (-38,8°C đến 356,7°C); hơi rất độc.', 'Nhiệt kế cổ điển, đèn huỳnh quang, hỗn hống nha khoa và tách vàng (đang giảm dần vì độc tính).'],
  [81, 'Tl', 'Thallium', 'Tali', '204.38', 6, 13, 'p', 'kim-loai-yeu', '+1, +3', 170, 1.62, 589, 'Kim loại sau chuyển tiếp', 'Kim loại mềm màu xám, rất độc do ion Tl⁺ bắt chước ion K⁺ trong tế bào thần kinh.', 'Ống kính quang học hồng ngoại, đầu dò bức xạ gamma NaI(Tl), siêu dẫn nhiệt độ cao.'],
  [82, 'Pb', 'Lead', 'Chì', '207.2', 6, 14, 'p', 'kim-loai-yeu', '+2, +4', 175, 2.33, 716, 'Kim loại sau chuyển tiếp', 'Kim loại nặng mềm, tỉ trọng cao (11,34 g/cm³); sản phẩm cuối cùng của chuỗi phân rã phóng xạ.', 'Bản cực ắc quy chì-acid ô tô, tấm chắn tia X và bức xạ hạt nhân, kính pha lê chì.'],
  [83, 'Bi', 'Bismuth', 'Bitmut', '208.98', 6, 15, 'p', 'kim-loai-yeu', '+3, +5', 155, 2.02, 703, 'Kim loại sau chuyển tiếp', 'Kim loại nặng không độc, tinh thể bậc thang óng ánh sắc cầu vồng đẹp mắt.', 'Thuốc trị loét dạ dày Pepto-Bismol (bismuth subsalicylate), hợp kim hàn không chì thay thế chì.'],
  [84, 'Po', 'Polonium', 'Poloni', '[209]', 6, 16, 'p', 'a-kim', '+2, +4', 168, 2.00, 812, 'Nguyên tố phóng xạ mạnh', 'Nguyên tố phóng xạ α cực mạnh do Marie và Pierre Curie phát hiện năm 1898.', 'Nguồn nhiệt đồng vị trên vệ tinh không gian, chổi khử tĩnh điện công nghiệp chính xác.'],
  [85, 'At', 'Astatine', 'Atatin', '[210]', 6, 17, 'p', 'halogen', '-1, +1', null, 2.20, 890, 'Halogen phóng xạ', 'Nguyên tố tự nhiên HIẾM NHẤT trong vỏ Trái Đất với chu kỳ bán rã chỉ vài giờ.', 'Nghiên cứu liệu pháp xạ trị alpha nhắm trúng đích tế bào ung thư (At-211).'],
  [86, 'Rn', 'Radon', 'Rađon', '[222]', 6, 18, 'p', 'khi-hiem', '0, +2', null, 2.20, 1037, 'Khí hiếm phóng xạ', 'Khí hiếm nặng phóng xạ sinh ra từ sự phân rã của radium trong đất đá tự nhiên.', 'Theo dõi địa chất dự báo động đất; cần thông gió tầng hầm để tránh tích tụ gây hại phổi.'],
  [87, 'Fr', 'Francium', 'Franxi', '[223]', 7, 1, 's', 'kim-loai-kiem', '+1', null, 0.70, 380, 'Kim loại kiềm phóng xạ', 'Kim loại kiềm phóng xạ cực kỳ không bền (chu kỳ bán rã 22 phút), cực hiếm trên Trái Đất.', 'Chỉ tổng hợp lượng vi mô phục vụ nghiên cứu vật lý nguyên tử và phổ học cơ bản.'],
  [88, 'Ra', 'Radium', 'Rađi', '[226]', 7, 2, 's', 'kim-loai-kiem-tho', '+2', 215, 0.90, 509, 'Kim loại kiềm thổ phóng xạ', 'Kim loại kiềm thổ phát sáng xanh mờ trong bóng tối do bức xạ ion hóa không khí.', 'Lịch sử y học xạ trị ung thư; tiền chất điều chế các đồng vị y học hiện đại (Ac-225).'],
  [89, 'Ac', 'Actinium', 'Actini', '[227]', 7, 3, 'f', 'actinoid', '+3', 195, 1.10, 499, 'Actinoid phóng xạ', 'Nguyên tố mở đầu họ Actinoid (Z = 89–103), phát ánh sáng xanh lam nhạt trong bóng tối.', 'Liệu pháp miễn dịch phóng xạ α (Ac-225), nguồn neutron nghiên cứu.'],
  [90, 'Th', 'Thorium', 'Thori', '232.04', 7, 3, 'f', 'actinoid', '+4', 180, 1.30, 587, 'Actinoid phóng xạ yếu', 'Kim loại phóng xạ có trữ lượng gấp 3–4 lần Uranium trong vỏ Trái Đất.', 'Nhiên liệu tiềm năng cho lò phản ứng hạt nhân muối nóng chảy sạch, lớp phủ điện cực hàn TIG.'],
  [91, 'Pa', 'Protactinium', 'Protactini', '231.04', 7, 3, 'f', 'actinoid', '+4, +5', 180, 1.50, 568, 'Actinoid phóng xạ', 'Kim loại actinoid sáng bạc cực hiếm và độc tính phóng xạ cao.', 'Chỉ phục vụ nghiên cứu khoa học cơ bản và định tuổi trầm tích đại dương.'],
  [92, 'U', 'Uranium', 'Urani', '238.03', 7, 3, 'f', 'actinoid', '+4, +6', 175, 1.38, 598, 'Actinoid phóng xạ', 'Nguyên tố nặng tự nhiên cuối cùng có trữ lượng đáng kể; đồng vị U-235 phân hạch mạnh.', 'Nhiên liệu cho các nhà máy điện hạt nhân toàn cầu, định tuổi địa chất Trái Đất (U-Pb).'],
  [93, 'Np', 'Neptunium', 'Neptuni', '[237]', 7, 3, 'f', 'actinoid', '+3 đến +7', 175, 1.36, 605, 'Actinoid nhân tạo', 'Nguyên tố siêu urani đầu tiên được tổng hợp nhân tạo (năm 1940).', 'Nguyên liệu sản xuất đồng vị Pu-238 cấp nguồn cho tàu thăm dò không gian sâu.'],
  [94, 'Pu', 'Plutonium', 'Plutoni', '[244]', 7, 3, 'f', 'actinoid', '+3 đến +6', 175, 1.28, 585, 'Actinoid phóng xạ', 'Có tới 6 dạng thù hình tinh thể phức tạp; đồng vị Pu-239 phân hạch và Pu-238 tỏa nhiệt bền bỉ.', 'Pin nhiệt điện đồng vị phóng xạ RTG trên tàu Voyager và xe tự hành sao Hỏa Perseverance.'],
  [95, 'Am', 'Americium', 'Amerixi', '[243]', 7, 3, 'f', 'actinoid', '+3', 175, 1.13, 578, 'Actinoid nhân tạo', 'Nguyên tố siêu urani ứng dụng phổ biến ngay trong đời sống dân dụng.', 'Nguồn ion hóa trong thiết bị báo khói gia đình (Am-241) và cảm biến đo độ dày công nghiệp.'],
  [96, 'Cm', 'Curium', 'Curi', '[247]', 7, 3, 'f', 'actinoid', '+3', 176, 1.28, 581, 'Actinoid nhân tạo', 'Mang tên vợ chồng nhà bác học Marie và Pierre Curie; phát sáng đỏ mờ do phóng xạ.', 'Nguồn phát tia alpha APXS phân tích thành phần đất đá trên sao Hỏa.'],
  [97, 'Bk', 'Berkelium', 'Beckeli', '[247]', 7, 3, 'f', 'actinoid', '+3, +4', 176, 1.30, 601, 'Actinoid nhân tạo', 'Tổng hợp lần đầu tại Phòng thí nghiệm Berkeley năm 1949.', 'Bia bắn phá để tổng hợp các nguyên tố siêu nặng như Tennessine (Z = 117).'],
  [98, 'Cf', 'Californium', 'Califoni', '[251]', 7, 3, 'f', 'actinoid', '+3', 176, 1.30, 608, 'Actinoid nhân tạo', 'Đồng vị Cf-252 là nguồn phát neutron tự phát cực mạnh.', 'Khởi động lò phản ứng hạt nhân, dò tìm mạch nước ngầm/dầu khí, điều trị ung thư não đặc biệt.'],
  [99, 'Es', 'Einsteinium', 'Ensteni', '[252]', 7, 3, 'f', 'actinoid', '+3', null, 1.30, 619, 'Actinoid nhân tạo', 'Được phát hiện trong mảnh vụn thử nghiệm nhiệt hạch năm 1952, mang tên Albert Einstein.', 'Nghiên cứu hóa học phóng xạ nguyên tố nặng và tổng hợp nguyên tố Mendelevium (Z = 101).'],
  [100, 'Fm', 'Fermium', 'Fecmi', '[257]', 7, 3, 'f', 'actinoid', '+3', null, 1.30, 627, 'Actinoid nhân tạo', 'Nguyên tố nặng nhất có thể điều chế bằng cách bắn phá neutron lên nguyên tố nhẹ hơn.', 'Nghiên cứu vật lý hạt nhân cơ bản trong phòng thí nghiệm chuyên sâu.'],
  [101, 'Md', 'Mendelevium', 'Menđelevi', '[258]', 7, 3, 'f', 'actinoid', '+2, +3', null, 1.30, 635, 'Actinoid nhân tạo', 'Đặt theo tên Dmitri Mendeleev — cha đẻ Bảng tuần hoàn các nguyên tố hóa học.', 'Nghiên cứu tính chất hóa học lượng siêu vi trong dung dịch nước.'],
  [102, 'No', 'Nobelium', 'Nobeli', '[259]', 7, 3, 'f', 'actinoid', '+2, +3', null, 1.30, 642, 'Actinoid nhân tạo', 'Trạng thái oxi hóa +2 bền hơn +3 trong dung dịch nước do hiệu ứng 5f¹⁴ bão hòa.', 'Nghiên cứu cấu trúc hạt nhân siêu nặng (chỉ tồn tại thời gian ngắn).'],
  [103, 'Lr', 'Lawrencium', 'Lorenxi', '[266]', 7, 3, 'd', 'actinoid', '+3', null, 1.30, 470, 'Actinoid nhân tạo', 'Nguyên tố cuối cùng của dãy Actinoid; năng lượng ion hóa thứ nhất đo được rất thấp (~470 kJ/mol).', 'Nghiên cứu hiệu ứng tương đối tính lên lớp vỏ electron ngoài cùng (7p¹).'],
  [104, 'Rf', 'Rutherfordium', 'Rơdơfođi', '[267]', 7, 4, 'd', 'kim-loai-chuyen-tiep', '+4', null, null, 580, 'Kim loại siêu nặng', 'Nguyên tố siêu actinoid đầu tiên (nhóm IVB, tương đồng với Hf); chu kỳ bán rã vài chục giây.', 'Chỉ phục vụ nghiên cứu tổng hợp hạt nhân siêu nặng và kiểm chứng quy luật tuần hoàn.'],
  [105, 'Db', 'Dubnium', 'Đubni', '[268]', 7, 5, 'd', 'kim-loai-chuyen-tiep', '+5', null, null, null, 'Kim loại siêu nặng', 'Đặt theo tên Viện Nghiên cứu Hạt nhân Dubna; chu kỳ bán rã từ vài giây đến vài giờ.', 'Nghiên cứu vật lý hạt nhân và hóa học nguyên tử đơn lẻ.'],
  [106, 'Sg', 'Seaborgium', 'Siboogi', '[269]', 7, 6, 'd', 'kim-loai-chuyen-tiep', '+6', null, null, null, 'Kim loại siêu nặng', 'Mang tên nhà hóa học Glenn T. Seaborg; tạo được hợp chất carbonyl Sg(CO)₆ tương tự W(CO)₆.', 'Nghiên cứu hóa học pha khí các nguyên tố siêu nặng nhóm VIB.'],
  [107, 'Bh', 'Bohrium', 'Bori', '[270]', 7, 7, 'd', 'kim-loai-chuyen-tiep', '+7', null, null, null, 'Kim loại siêu nặng', 'Đặt theo tên nhà vật lý lượng tử Niels Bohr; đồng vị bền nhất sống khoảng vài chục giây.', 'Nghiên cứu cấu trúc hạt nhân và độ bền của nguyên tố siêu nặng.'],
  [108, 'Hs', 'Hassium', 'Hasi', '[277]', 7, 8, 'd', 'kim-loai-chuyen-tiep', '+8', null, null, null, 'Kim loại siêu nặng', 'Tạo oxit dễ bay hơi HsO₄ tương tự OsO₄, khẳng định vị trí nhóm VIIIB.', 'Nghiên cứu tính chất hóa học pha khí bằng từng nguyên tử riêng lẻ.'],
  [109, 'Mt', 'Meitnerium', 'Meitneri', '[278]', 7, 9, 'd', 'kim-loai-chuyen-tiep', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Đặt theo tên nhà vật lý hạt nhân Lise Meitner; phân rã rất nhanh (vài mili-giây đến vài giây).', 'Chỉ tổng hợp phục vụ nghiên cứu vật lý hạt nhân cơ bản.'],
  [110, 'Ds', 'Darmstadtium', 'Đamstati', '[281]', 7, 10, 'd', 'kim-loai-chuyen-tiep', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Tổng hợp tại trung tâm GSI Darmstadt (Đức), thuộc nhóm bạch kim trên bảng tuần hoàn.', 'Nghiên cứu giới hạn bền của hạt nhân nguyên tử nặng.'],
  [111, 'Rg', 'Roentgenium', 'Rơntơgheni', '[282]', 7, 11, 'd', 'kim-loai-chuyen-tiep', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Đặt theo tên Wilhelm Röntgen (người phát hiện tia X); nằm dưới Au trong nhóm IB.', 'Nghiên cứu hiệu ứng tương đối tính và chu kỳ bán rã hạt nhân siêu nặng.'],
  [112, 'Cn', 'Copernicium', 'Copecnixi', '[285]', 7, 12, 'd', 'kim-loai-chuyen-tiep', '+2 (dự đoán)', null, null, null, 'Chưa xác định', 'Mang tên nhà thiên văn Nicolaus Copernicus; thể hiện tính dễ bay hơi giống thủy ngân/khí hiếm.', 'Nghiên cứu cấu trúc vỏ electron chịu tác động tương đối tính mạnh.'],
  [113, 'Nh', 'Nihonium', 'Nihoni', '[286]', 7, 13, 'p', 'kim-loai-yeu', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Nguyên tố đầu tiên được phát hiện tại châu Á (viện RIKEN, Nhật Bản, năm 2004).', 'Nghiên cứu vật lý hạt nhân cơ bản trong máy gia tốc ion nặng.'],
  [114, 'Fl', 'Flerovium', 'Flerovi', '[289]', 7, 14, 'p', 'kim-loai-yeu', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Đặt theo tên phòng thí nghiệm Flerov; nằm gần "đảo bền" hạt nhân siêu nặng.', 'Nghiên cứu tương tác hạt nhân và tính dễ bay hơi nguyên tử đơn lẻ.'],
  [115, 'Mc', 'Moscovium', 'Moscovi', '[290]', 7, 15, 'p', 'kim-loai-yeu', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Phát hiện qua hợp tác viện Dubna (Nga) và LLNL (Mỹ); phân rã alpha thành Nihonium.', 'Nghiên cứu vật lý hạt nhân siêu nặng trong phòng thí nghiệm gia tốc.'],
  [116, 'Lv', 'Livermorium', 'Livơmori', '[293]', 7, 16, 'p', 'kim-loai-yeu', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Tổng hợp bằng phản ứng hạt nhân bắn phá bia Curium-248 với ion Calcium-48.', 'Nghiên cứu cơ bản về độ bền hạt nhân siêu nặng.'],
  [117, 'Ts', 'Tennessine', 'Tenesin', '[294]', 7, 17, 'p', 'halogen', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Nằm ở nhóm VIIA nhưng được dự đoán mang nhiều tính chất á kim do hiệu ứng tương đối tính.', 'Nghiên cứu tổng hợp và phân rã hạt nhân siêu nặng.'],
  [118, 'Og', 'Oganesson', 'Oganeson', '[294]', 7, 18, 'p', 'khi-hiem', 'Chưa xác định', null, null, null, 'Chưa xác định', 'Nguyên tố nặng nhất được IUPAC công nhận (Z = 118), đặt theo tên Yuri Oganessian.', 'Nghiên cứu giới hạn cuối cùng của chu kỳ 7 trong bảng tuần hoàn hiện đại.'],
];

export const ELEMENTS_118: ChemElement118[] = RAW_ELEMENTS.map((item) => {
  const [
    z,
    symbol,
    name,
    viName,
    atomicMass,
    period,
    group,
    block,
    category,
    oxidationStates,
    atomicRadius,
    electronegativity,
    ionizationEnergy,
    metallicCharacter,
    summary,
    applications,
  ] = item;

  const { shells, fullConfig, electronConfig } = buildConfigStrings(z);

  return {
    z,
    symbol,
    name,
    viName,
    atomicMass,
    period,
    group,
    block,
    category,
    shells,
    electronConfig,
    fullConfig,
    oxidationStates,
    atomicRadius,
    electronegativity,
    ionizationEnergy,
    metallicCharacter,
    summary,
    applications,
  };
});

export function getElementByZ(z: number): ChemElement118 {
  return ELEMENTS_118.find((el) => el.z === z) || ELEMENTS_118[0];
}
