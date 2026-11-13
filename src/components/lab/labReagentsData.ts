import { Reagent, LabPreset, ChemistryAnalysisResult, ApparatusInstance } from './labTypes';

export const REAGENTS_DATA: Reagent[] = [
  {
    id: 'bacl2',
    name: 'Bari clorua',
    iupacName: 'Barium chloride',
    formula: 'BaCl_2',
    state: 'solution',
    defaultColor: 0xe0f2fe,
    opacity: 0.35,
    category: 'salt',
    defaultConcentration: 0.5,
    defaultVolume: 5,
    description: 'Dung dịch muối trong suốt không màu, thuốc thử đặc trưng nhận biết ion sulfate (SO₄²⁻)',
  },
  {
    id: 'h2so4_dilute',
    name: 'Axit sunfuric loãng',
    iupacName: 'Dilute sulfuric acid',
    formula: 'H_2SO_4',
    state: 'solution',
    defaultColor: 0xe0f2fe,
    opacity: 0.35,
    category: 'acid',
    defaultConcentration: 1.0,
    defaultVolume: 5,
    description: 'Dung dịch acid vô cơ mạnh không màu, cung cấp ion SO₄²⁻ và H⁺',
  },
  {
    id: 'naoh',
    name: 'Natri hiđroxit',
    iupacName: 'Sodium hydroxide',
    formula: 'NaOH',
    state: 'solution',
    defaultColor: 0xe2e8f0,
    opacity: 0.35,
    category: 'base',
    defaultConcentration: 1.0,
    defaultVolume: 5,
    description: 'Dung dịch kiềm mạnh không màu, cung cấp lượng lớn ion OH⁻',
  },
  {
    id: 'cuso4',
    name: 'Đồng(II) sunfat',
    iupacName: 'Copper(II) sulfate',
    formula: 'CuSO_4',
    state: 'solution',
    defaultColor: 0x0284c7, // Vivid cyan blue
    opacity: 0.8,
    category: 'salt',
    defaultConcentration: 1.0,
    defaultVolume: 5,
    description: 'Dung dịch muối Cu²⁺ có màu xanh lam đặc trưng',
  },
  {
    id: 'hcl',
    name: 'Axit clohiđric',
    iupacName: 'Hydrochloric acid',
    formula: 'HCl',
    state: 'solution',
    defaultColor: 0xe2e8f0,
    opacity: 0.3,
    category: 'acid',
    defaultConcentration: 1.0,
    defaultVolume: 5,
    description: 'Dung dịch acid mạnh không màu, có tính acid mạnh và tính khử',
  },
  {
    id: 'caco3',
    name: 'Đá vôi / Canxi cacbonat',
    iupacName: 'Calcium carbonate',
    formula: 'CaCO_3',
    state: 'solid',
    defaultColor: 0xf8fafc,
    opacity: 0.95,
    category: 'salt',
    mass: 2.0,
    description: 'Chất rắn màu trắng, không tan trong nước, tan có sủi bọt khí CO₂ trong acid',
  },
  {
    id: 'fe_metal',
    name: 'Đinh sắt / Mạt sắt',
    iupacName: 'Iron metal',
    formula: 'Fe',
    state: 'solid',
    defaultColor: 0x475569,
    opacity: 1.0,
    category: 'metal',
    mass: 3.5,
    description: 'Đinh sắt màu xám sáng kim loại, có tính khử trung bình',
  },
  {
    id: 'zn_metal',
    name: 'Kẽm viên / Hạt kẽm',
    iupacName: 'Zinc granules',
    formula: 'Zn',
    state: 'solid',
    defaultColor: 0x64748b,
    opacity: 1.0,
    category: 'metal',
    mass: 2.5,
    description: 'Hạt kẽm màu xám bạc, hoạt động hóa học mạnh, giải phóng H₂ nhanh với acid',
  },
  {
    id: 'so3',
    name: 'Lưu huỳnh trioxit',
    iupacName: 'Sulfur trioxide',
    formula: 'SO_3',
    state: 'gas',
    defaultColor: 0xf1f5f9,
    opacity: 0.5,
    category: 'oxide',
    defaultVolume: 5,
    description: 'Chất khí / hơi oxide acid, phản ứng mãnh liệt với nước tỏa nhiệt cực lớn',
  },
  {
    id: 'water',
    name: 'Nước cất tinh khiết',
    iupacName: 'Distilled water',
    formula: 'H_2O',
    state: 'solution',
    defaultColor: 0xf0fdfa,
    opacity: 0.3,
    category: 'oxide',
    defaultVolume: 10,
    description: 'Dung môi tinh khiết trung tính pH = 7 cho các phản ứng dung dịch',
  },
  {
    id: 'phenolphthalein',
    name: 'Chỉ thị Phenolphthalein',
    iupacName: 'Phenolphthalein indicator',
    formula: 'C_{20}H_{14}O_4',
    state: 'indicator',
    defaultColor: 0xffffff,
    opacity: 0.25,
    category: 'indicator',
    defaultVolume: 1,
    description: 'Chất chỉ thị không màu trong môi trường acid/trung tính, hóa hồng tím trong base (pH > 8.3)',
  },
  {
    id: 'litmus_sol',
    name: 'Dung dịch Quỳ tím',
    iupacName: 'Litmus solution',
    formula: 'Litmus',
    state: 'indicator',
    defaultColor: 0x7c3aed,
    opacity: 0.6,
    category: 'indicator',
    defaultVolume: 2,
    description: 'Dung dịch chỉ thị màu tím, hóa đỏ trong acid (pH < 4.5), hóa xanh trong base (pH > 8.3)',
  },
  {
    id: 'agno3',
    name: 'Bạc nitrat',
    iupacName: 'Silver nitrate',
    formula: 'AgNO_3',
    state: 'solution',
    defaultColor: 0xf8fafc,
    opacity: 0.35,
    category: 'salt',
    defaultConcentration: 0.1,
    defaultVolume: 5,
    description: 'Dung dịch thuốc thử đặc trưng dùng để nhận biết ion halogenua (Cl⁻, Br⁻, I⁻)',
  },
  {
    id: 'nacl',
    name: 'Natri clorua',
    iupacName: 'Sodium chloride',
    formula: 'NaCl',
    state: 'solution',
    defaultColor: 0xf1f5f9,
    opacity: 0.3,
    category: 'salt',
    defaultConcentration: 1.0,
    defaultVolume: 5,
    description: 'Dung dịch muối ăn thông thường, cung cấp ion Na⁺ và Cl⁻',
  },
  {
    id: 'glucose',
    name: 'Dung dịch Glucose',
    iupacName: 'D-Glucose solution',
    formula: 'C_6H_{12}O_6',
    state: 'solution',
    defaultColor: 0xfef08a,
    opacity: 0.3,
    category: 'organic',
    defaultConcentration: 0.5,
    defaultVolume: 5,
    description: 'Monosaccharide có nhóm formyl (-CHO), có tính khử, tham gia phản ứng tráng bạc',
  },
  {
    id: 'nh3_sol',
    name: 'Dung dịch Amoniac',
    iupacName: 'Ammonia solution',
    formula: 'NH_3',
    state: 'solution',
    defaultColor: 0xe0f2fe,
    opacity: 0.3,
    category: 'base',
    defaultConcentration: 1.0,
    defaultVolume: 5,
    description: 'Dung dịch base yếu, có mùi khai đặc trưng, tạo phức tan với Ag⁺ và Cu²⁺',
  },
];

export const PRESET_EXPERIMENTS: LabPreset[] = [
  // --- GRADE 10 PRESETS ---
  {
    id: 'preset_zn_hcl',
    grade: 10,
    title: 'Kim loại Zn tác dụng HCl sinh khí Hydro (H₂)',
    lesson: 'Hóa học 10 – Bài 12: Phản ứng oxi hóa – khử',
    objective: 'Quan sát kim loại kẽm Zn tan dần và bọt khí H₂ không màu sủi bọt mãnh liệt thoát ra khỏi dung dịch.',
    apparatusType: 'test_tube',
    reagentsToAdd: [
      { reagentId: 'zn_metal', mass: 2.5 },
      { reagentId: 'hcl', volume: 6, concentration: 1.0 },
    ],
  },
  {
    id: 'preset_sulfate',
    grade: 10,
    title: 'Nhận biết ion Sulfate (SO₄²⁻) bằng BaCl₂',
    lesson: 'Hóa học 10 & 11 – Hợp chất của lưu huỳnh (Sulfur)',
    objective: 'Quan sát phản ứng tạo kết tủa trắng BaSO₄ tinh khiết, kiểm tra tính bền không tan trong acid mạnh.',
    apparatusType: 'test_tube',
    reagentsToAdd: [
      { reagentId: 'h2so4_dilute', volume: 5, concentration: 1.0 },
      { reagentId: 'bacl2', volume: 4, concentration: 0.5 },
    ],
  },
  {
    id: 'preset_caco3_hcl',
    grade: 10,
    title: 'Phản ứng acid HCl với đá vôi (CaCO₃) sinh khí CO₂',
    lesson: 'Hóa học 10 – Bài 17: Biến thiên enthalpy trong các phản ứng hóa học',
    objective: 'Quan sát hiện tượng sủi bọt khí CO₂ mãnh liệt và hòa tan chất rắn carbonate không tan trong nước.',
    apparatusType: 'beaker_100',
    reagentsToAdd: [
      { reagentId: 'caco3', mass: 2.0 },
      { reagentId: 'hcl', volume: 10, concentration: 1.0 },
    ],
  },
  {
    id: 'preset_so3_water',
    grade: 10,
    title: 'Khí SO₃ tác dụng với H₂O (Phản ứng tỏa nhiệt mạnh)',
    lesson: 'Hóa học 10 – Bài 16: Tốc độ phản ứng & Năng lượng phản ứng',
    objective: 'Quan sát hiện tượng hydrat hóa oxide acid tỏa nhiệt dữ dội sinh sương mù acid H₂SO₄, nhiệt độ tăng vọt.',
    apparatusType: 'beaker_250',
    reagentsToAdd: [
      { reagentId: 'water', volume: 15 },
      { reagentId: 'so3', volume: 5 },
    ],
  },
  {
    id: 'preset_agcl',
    grade: 10,
    title: 'Nhận biết muối halogenua: AgNO₃ tác dụng NaCl',
    lesson: 'Hóa học 10 – Bài 18: Nguyên tố nhóm VIIA (Halogen)',
    objective: 'Phản ứng trao đổi ion đặc trưng tạo kết tủa trắng vón AgCl không tan trong acid nitric.',
    apparatusType: 'test_tube',
    reagentsToAdd: [
      { reagentId: 'nacl', volume: 5, concentration: 1.0 },
      { reagentId: 'agno3', volume: 4, concentration: 0.1 },
    ],
  },

  // --- GRADE 11 PRESETS ---
  {
    id: 'preset_neutralization',
    grade: 11,
    title: 'Chuẩn độ trung hòa Acid – Base với Phenolphthalein',
    lesson: 'Hóa học 11 – Bài 3: Sự điện li & Chuẩn độ acid – base',
    objective: 'Theo dõi sự thay đổi màu sắc của chỉ thị phenolphthalein từ hồng đậm sang không màu khi trung hòa hoàn toàn.',
    apparatusType: 'erlenmeyer',
    reagentsToAdd: [
      { reagentId: 'naoh', volume: 6, concentration: 1.0 },
      { reagentId: 'phenolphthalein', volume: 1 },
      { reagentId: 'hcl', volume: 7, concentration: 1.0 },
    ],
  },
  {
    id: 'preset_cuoh2',
    grade: 11,
    title: 'Tạo và nhiệt phân kết tủa Cu(OH)₂ màu xanh lam',
    lesson: 'Hóa học 11 – Bài 2: Cân bằng trong dung dịch nước',
    objective: 'Tạo kết tủa keo màu xanh Cu(OH)₂ rồi dùng ngọn lửa đèn cồn nhiệt phân thành bột oxide CuO màu đen.',
    apparatusType: 'test_tube',
    reagentsToAdd: [
      { reagentId: 'cuso4', volume: 5, concentration: 1.0 },
      { reagentId: 'naoh', volume: 5, concentration: 1.0 },
    ],
    shouldHeat: true,
  },
  {
    id: 'preset_litmus_indicator',
    grade: 11,
    title: 'Khảo sát pH dung dịch acid/base bằng quỳ tím',
    lesson: 'Hóa học 11 – Bài 2: Sự điện li và thang đo pH',
    objective: 'So sánh sự chuyển màu của giấy quỳ tím trong dung dịch acid HCl (hóa đỏ) và dung dịch base NaOH (hóa xanh).',
    apparatusType: 'beaker_100',
    reagentsToAdd: [
      { reagentId: 'water', volume: 10 },
      { reagentId: 'hcl', volume: 3, concentration: 1.0 },
      { reagentId: 'litmus_sol', volume: 2 },
    ],
  },

  // --- GRADE 12 PRESETS ---
  {
    id: 'preset_fe_cu',
    grade: 12,
    title: 'Đinh sắt Fe phản ứng với dung dịch CuSO₄',
    lesson: 'Hóa học 12 – Bài 12: Đại cương về kim loại – Dãy thế điện cực chuẩn',
    objective: 'Chứng minh Fe có tính khử mạnh hơn Cu, đẩy ion Cu²⁺ tạo lớp đồng kim loại màu đỏ gạch bám ngoài đinh sắt.',
    apparatusType: 'test_tube',
    reagentsToAdd: [
      { reagentId: 'cuso4', volume: 8, concentration: 1.0 },
      { reagentId: 'fe_metal', mass: 3.5 },
    ],
  },
  {
    id: 'preset_silver_mirror',
    grade: 12,
    title: 'Phản ứng tráng bạc của Glucose (AgNO₃/NH₃)',
    lesson: 'Hóa học 12 – Bài 5: Glucose và Fructose',
    objective: 'Chứng minh nhóm aldehyde (-CHO) của Glucose có tính khử, khử phức bạc diamminesilver(I) tạo lớp gương bạc sáng loáng bám thành ống nghiệm.',
    apparatusType: 'test_tube',
    reagentsToAdd: [
      { reagentId: 'agno3', volume: 4, concentration: 0.1 },
      { reagentId: 'nh3_sol', volume: 4, concentration: 1.0 },
      { reagentId: 'glucose', volume: 5, concentration: 0.5 },
    ],
    shouldHeat: true,
  },
];

export const hexToColorString = (hexNum: number): string => {
  return '#' + hexNum.toString(16).padStart(6, '0');
};

/**
 * Universal Chemistry Reaction Analysis Engine
 * Calculates physical changes, equations, KaTeX notations, and safety alerts.
 */
export const analyzeChemistry = (container: ApparatusInstance): ChemistryAnalysisResult => {
  const reagentIds = container.addedReagents.map((ar) => ar.reagent.id);

  // Calculate approximate liquid volume in mL
  const totalLiquidVolume = container.addedReagents.reduce((acc, cur) => {
    if (cur.volume) return acc + cur.volume;
    if (cur.mass) return acc + cur.mass * 0.4; // Solid displacement
    return acc;
  }, 0);

  // Default initial neutral state
  const result: ChemistryAnalysisResult = {
    hasReacted: false,
    equation: '',
    ionEquation: '',
    phenomenon: '',
    scientificExplanation: '',
    safetyWarning: 'Luôn đeo kính bảo hộ và găng tay khi thao tác với hóa chất trong phòng thí nghiệm.',
    liquidColor: 0xe2e8f0,
    liquidHex: '#e2e8f0',
    liquidOpacity: 0.35,
    totalVolume: totalLiquidVolume,
    precipitateColor: null,
    precipitateHex: null,
    precipitateHeight: 0,
    hasGasBubbles: false,
    gasBubbleSpeed: 0,
    hasThermalMist: false,
    metalSurfaceColor: null,
    temperatureCalc: container.temperature,
    pHCalc: 7.0,
    litmusColor: '#8b5cf6', // Violet
    litmusLabel: 'Màu tím (Môi trường trung tính, pH ~ 7)',
  };

  if (reagentIds.length === 0) {
    result.phenomenon = 'Dụng cụ hiện đang trống. Hãy chọn hóa chất từ khay và nhấn "Thêm vào dụng cụ".';
    result.litmusLabel = 'Chưa có chất lỏng để thử quỳ tím';
    return result;
  }

  // Single chemical in container
  if (reagentIds.length === 1) {
    const single = container.addedReagents[0].reagent;
    result.liquidColor = single.defaultColor;
    result.liquidHex = hexToColorString(single.defaultColor);
    result.liquidOpacity = single.opacity;
    result.phenomenon = `Dụng cụ chứa ${single.name} (${single.formula}). Trạng thái tĩnh ổn định.`;

    if (single.category === 'acid' || single.id === 'so3') {
      result.pHCalc = 1.5;
      result.litmusColor = '#ef4444'; // Red
      result.litmusLabel = 'Hóa đỏ (Môi trường Acid mạnh, pH ~ 1.5)';
    } else if (single.category === 'base' || single.id === 'nh3_sol') {
      result.pHCalc = 12.5;
      result.litmusColor = '#2563eb'; // Blue
      result.litmusLabel = 'Hóa xanh (Môi trường Kiềm/Base, pH ~ 12.5)';
    } else if (single.id === 'caco3') {
      result.precipitateColor = 0xffffff;
      result.precipitateHex = '#ffffff';
      result.precipitateHeight = 0.28;
      result.phenomenon = 'Chất rắn CaCO₃ màu trắng không tan, lắng ở đáy dụng cụ.';
      result.pHCalc = 7.5;
    } else if (single.id === 'fe_metal') {
      result.metalSurfaceColor = 0x475569;
      result.phenomenon = 'Đinh sắt Fe màu xám sáng kim loại nằm trong dụng cụ.';
      result.pHCalc = 7.0;
    } else if (single.id === 'zn_metal') {
      result.metalSurfaceColor = 0x64748b;
      result.phenomenon = 'Các hạt kim loại kẽm Zn màu xám bạc nằm ở đáy dụng cụ.';
      result.pHCalc = 7.0;
    } else if (single.id === 'cuso4') {
      result.pHCalc = 4.8;
      result.litmusColor = '#f87171'; // Light red
      result.litmusLabel = 'Hơi phớt đỏ nhạt (Muối thủy phân tạo môi trường acid yếu, pH ~ 4.8)';
    }
    return result;
  }

  // Reaction 1: Zn + 2HCl -> ZnCl2 + H2 ^
  if (reagentIds.includes('zn_metal') && reagentIds.includes('hcl')) {
    result.hasReacted = true;
    result.equation = 'Zn + 2HCl \\rightarrow ZnCl_2 + H_2\\uparrow';
    result.ionEquation = 'Zn + 2H^+ \\rightarrow Zn^{2+} + H_2\\uparrow';
    result.phenomenon = 'Hạt kẽm Zn tan dần; bọt khí Hydro (H₂) không màu thoát ra sủi bọt rất mạnh và liên tục từ bề mặt kim loại.';
    result.scientificExplanation = 'Kẽm có thế điện cực chuẩn E°(Zn²⁺/Zn) = -0.76 V âm hơn cặp 2H⁺/H₂ (0.00 V), do đó Zn bị oxi hóa bởi ion H⁺ giải phóng khí H₂.';
    result.safetyWarning = 'Khí H₂ dễ cháy nổ khi trộn lẫn với oxygen trong không khí. Tránh để gần nguồn lửa trần hoặc tia lửa điện.';
    result.liquidColor = 0xf1f5f9;
    result.liquidHex = '#f1f5f9';
    result.liquidOpacity = 0.35;
    result.hasGasBubbles = true;
    result.gasBubbleSpeed = 3.2;
    result.gasType = 'H_2';
    result.pHCalc = 2.2;
    result.litmusColor = '#ef4444';
    result.litmusLabel = 'Hóa đỏ (Dung dịch acid HCl còn dư, pH ~ 2.2)';
    return result;
  }

  // Reaction 2: BaCl2 + H2SO4 -> BaSO4 v + 2HCl
  if (reagentIds.includes('bacl2') && reagentIds.includes('h2so4_dilute')) {
    result.hasReacted = true;
    result.equation = 'BaCl_2 + H_2SO_4 \\rightarrow BaSO_4\\downarrow + 2HCl';
    result.ionEquation = 'Ba^{2+} + SO_4^{2-} \\rightarrow BaSO_4\\downarrow';
    result.phenomenon = 'Xuất hiện ngay kết tủa màu trắng đục tinh khiết (BaSO₄), không tan trong môi trường acid mạnh.';
    result.scientificExplanation = 'Tích số tan K_sp(BaSO₄) ≈ 1.1 × 10⁻¹⁰ rất nhỏ; phản ứng trao đổi ion xảy ra tức thì tạo tinh thể BaSO₄ màu trắng lắng xuống đáy.';
    result.safetyWarning = 'Muối bari hòa tan (BaCl₂) có độc tính; tránh để dính vào da hoặc hít phải hơi sương.';
    result.liquidColor = 0xf0fdf4;
    result.liquidHex = '#f0fdf4';
    result.liquidOpacity = 0.5;
    result.precipitateColor = 0xffffff;
    result.precipitateHex = '#ffffff';
    result.precipitateHeight = 0.38;
    result.pHCalc = 1.0;
    result.litmusColor = '#ef4444';
    result.litmusLabel = 'Hóa đỏ (Dung dịch sau phản ứng có acid HCl, pH ~ 1.0)';
    return result;
  }

  // Reaction 3: CuSO4 + NaOH -> Cu(OH)2 v + Na2SO4 (Heated -> CuO black)
  if (reagentIds.includes('cuso4') && reagentIds.includes('naoh')) {
    result.hasReacted = true;
    if (container.isHeated || container.temperature > 60) {
      result.equation = 'Cu(OH)_2 \\xrightarrow{t^\\circ} CuO\\downarrow + H_2O';
      result.ionEquation = 'Cu(OH)_2(r) \\xrightarrow{t^\\circ} CuO(đen) + H_2O';
      result.phenomenon = 'Dưới tác dụng của nhiệt độ từ đèn cồn, kết tủa Cu(OH)₂ màu xanh lam bị nhiệt phân chuyển hoàn toàn thành bột CuO màu đen lắng xuống đáy.';
      result.scientificExplanation = 'Đồng(II) hiđroxit kém bền với nhiệt, bị nhiệt phân giải phóng nước và oxide đồng(II) màu đen.';
      result.liquidColor = 0xf8fafc;
      result.liquidHex = '#f8fafc';
      result.liquidOpacity = 0.4;
      result.precipitateColor = 0x0f172a; // Black CuO
      result.precipitateHex = '#0f172a';
      result.precipitateHeight = 0.35;
      result.pHCalc = 8.5;
      result.litmusColor = '#3b82f6';
      result.litmusLabel = 'Hóa xanh nhẹ (Dung dịch sau nhiệt phân có môi trường kiềm dư)';
    } else {
      result.equation = 'CuSO_4 + 2NaOH \\rightarrow Cu(OH)_2\\downarrow + Na_2SO_4';
      result.ionEquation = 'Cu^{2+} + 2OH^- \\rightarrow Cu(OH)_2\\downarrow';
      result.phenomenon = 'Xuất hiện kết tủa dạng keo màu xanh lam đậm đặc trưng của Cu(OH)₂. Dung dịch mất dần màu xanh lam nhạt.';
      result.scientificExplanation = 'Ion Cu²⁺ kết hợp với ion OH⁻ tạo kết tủa Cu(OH)₂ không tan trong nước, là phản ứng đặc trưng nhận biết ion Cu²⁺.';
      result.liquidColor = 0xe0f2fe;
      result.liquidHex = '#e0f2fe';
      result.liquidOpacity = 0.45;
      result.precipitateColor = 0x0284c7; // Deep blue Cu(OH)2
      result.precipitateHex = '#0284c7';
      result.precipitateHeight = 0.42;
      result.pHCalc = 11.5;
      result.litmusColor = '#2563eb';
      result.litmusLabel = 'Hóa xanh (Môi trường base có ion OH⁻ dư, pH ~ 11.5)';
    }
    return result;
  }

  // Reaction 4: CaCO3 + 2HCl -> CaCl2 + CO2 ^ + H2O
  if (reagentIds.includes('caco3') && reagentIds.includes('hcl')) {
    result.hasReacted = true;
    result.equation = 'CaCO_3 + 2HCl \\rightarrow CaCl_2 + CO_2\\uparrow + H_2O';
    result.ionEquation = 'CaCO_3(r) + 2H^+ \\rightarrow Ca^{2+} + CO_2\\uparrow + H_2O';
    result.phenomenon = 'Bột đá vôi CaCO₃ tan dần, đồng thời có hiện tượng sủi bọt khí không màu mãnh liệt (khí CO₂ bay lên).';
    result.scientificExplanation = 'Acid mạnh HCl đẩy acid carbonic (H₂CO₃) rất yếu và kém bền ra khỏi muối, H₂CO₃ phân hủy tức thì thành khí CO₂ và H₂O.';
    result.liquidColor = 0xf1f5f9;
    result.liquidHex = '#f1f5f9';
    result.liquidOpacity = 0.35;
    result.hasGasBubbles = true;
    result.gasBubbleSpeed = 2.8;
    result.gasType = 'CO_2';
    result.precipitateColor = 0xffffff;
    result.precipitateHex = '#ffffff';
    result.precipitateHeight = 0.08;
    result.pHCalc = 2.0;
    result.litmusColor = '#ef4444';
    result.litmusLabel = 'Hóa đỏ (Dung dịch có acid dư, pH ~ 2.0)';
    return result;
  }

  // Reaction 5: Fe + CuSO4 -> FeSO4 + Cu v
  if (reagentIds.includes('fe_metal') && reagentIds.includes('cuso4')) {
    result.hasReacted = true;
    result.equation = 'Fe + CuSO_4 \\rightarrow FeSO_4 + Cu\\downarrow';
    result.ionEquation = 'Fe + Cu^{2+} \\rightarrow Fe^{2+} + Cu\\downarrow';
    result.phenomenon = 'Màu xanh lam của dung dịch nhạt dần chuyển sang màu xanh lục rất nhạt của FeSO₄; bề mặt đinh sắt bám một lớp kim loại màu đỏ gạch của đồng (Cu).';
    result.scientificExplanation = 'Trong dãy thế điện cực chuẩn, thế cặp Fe²⁺/Fe (-0.44 V) âm hơn cặp Cu²⁺/Cu (+0.34 V), do đó Fe khử được ion Cu²⁺ thành kim loại Cu tự do.';
    result.liquidColor = 0xdcfce7; // Pale green Fe2+
    result.liquidHex = '#dcfce7';
    result.liquidOpacity = 0.55;
    result.metalSurfaceColor = 0xb45309; // Red copper coating
    result.precipitateColor = 0xb45309;
    result.precipitateHex = '#b45309';
    result.precipitateHeight = 0.15;
    result.pHCalc = 5.0;
    result.litmusColor = '#f87171';
    result.litmusLabel = 'Hơi phớt đỏ nhạt (Dung dịch muối Fe²⁺ có tính acid yếu, pH ~ 5.0)';
    return result;
  }

  // Reaction 6: SO3 + H2O -> H2SO4 (Highly exothermic)
  if (reagentIds.includes('so3') && reagentIds.includes('water')) {
    result.hasReacted = true;
    result.equation = 'SO_3 + H_2O \\rightarrow H_2SO_4';
    result.phenomenon = 'Phản ứng tỏa lượng nhiệt cực lớn! Dung dịch sôi bốc khói / sương mù acid màu trắng dày đặc quanh miệng dụng cụ, nhiệt độ tăng vọt > 85°C.';
    result.scientificExplanation = 'SO₃ là oxide acid cực mạnh, phản ứng hydrat hóa có hiệu ứng nhiệt biến thiên enthalpy ΔH = -88 kJ/mol tỏa nhiệt dữ dội.';
    result.safetyWarning = 'CỰC KỲ NGUY HIỂM: Phản ứng tỏa nhiệt có thể làm nứt vỡ dụng cụ nếu không chịu nhiệt; hơi sương H₂SO₄ ăn mòn và gây bỏng hóa học nặng!';
    result.liquidColor = 0xf8fafc;
    result.liquidHex = '#f8fafc';
    result.liquidOpacity = 0.7;
    result.hasThermalMist = true;
    result.temperatureCalc = Math.min(95, container.temperature + 55);
    result.pHCalc = 0.5;
    result.litmusColor = '#dc2626';
    result.litmusLabel = 'Hóa đỏ đậm (Acid sulfuric H₂SO₄ đậm đặc, pH < 1.0)';
    return result;
  }

  // Reaction 7: Neutralization with Phenolphthalein
  if (reagentIds.includes('naoh') && reagentIds.includes('phenolphthalein')) {
    if (reagentIds.includes('hcl')) {
      result.hasReacted = true;
      result.equation = 'NaOH + HCl \\rightarrow NaCl + H_2O';
      result.ionEquation = 'H^+ + OH^- \\rightarrow H_2O';
      result.phenomenon = 'Khi thêm acid HCl vào dung dịch base có chứa phenolphthalein, màu hồng tươi ban đầu nhạt dần và mất màu hoàn toàn (trở về trong suốt không màu).';
      result.scientificExplanation = 'Phản ứng trung hòa giữa H⁺ và OH⁻ làm giảm pH từ vùng kiềm (> 9) về vùng trung tính (pH ≈ 7), lúc này chỉ thị phenolphthalein chuyển về dạng phân tử không màu.';
      result.liquidColor = 0xf8fafc;
      result.liquidHex = '#f8fafc';
      result.liquidOpacity = 0.25;
      result.pHCalc = 7.0;
      result.litmusColor = '#8b5cf6';
      result.litmusLabel = 'Màu tím (Đã trung hòa hoàn toàn thành dung dịch muối NaCl, pH ~ 7.0)';
    } else {
      result.phenomenon = 'Dung dịch kiềm NaOH làm chất chỉ thị phenolphthalein chuyển sang màu hồng tím rực rỡ đặc trưng.';
      result.liquidColor = 0xf43f5e; // Vivid pink indicator
      result.liquidHex = '#f43f5e';
      result.liquidOpacity = 0.75;
      result.pHCalc = 12.5;
      result.litmusColor = '#2563eb';
      result.litmusLabel = 'Hóa xanh (Môi trường base mạnh, pH ~ 12.5)';
    }
    return result;
  }

  // Reaction 8: Silver mirror reaction (Glucose + AgNO3 + NH3)
  if (reagentIds.includes('agno3') && reagentIds.includes('nh3_sol') && reagentIds.includes('glucose')) {
    result.hasReacted = true;
    result.equation = 'CH_2OH(CHOH)_4CHO + 2[Ag(NH_3)_2]OH \\xrightarrow{t^\\circ} CH_2OH(CHOH)_4COONH_4 + 2Ag\\downarrow + 3NH_3 + H_2O';
    result.ionEquation = 'R-CHO + 2[Ag(NH_3)_2]^+ + 3OH^- \\xrightarrow{t^\\circ} R-COO^- + 2Ag\\downarrow + 4NH_3 + 2H_2O';
    result.phenomenon = 'Khi đun nóng nhẹ cách thủy, trên thành ống nghiệm xuất hiện một lớp bạc kim loại màu sáng loáng soi gương được (lớp gương bạc).';
    result.scientificExplanation = 'Nhóm aldehyde (-CHO) trong phân tử glucose bị oxy hóa thành muối amoni gluconat, đồng thời khử ion [Ag(NH₃)₂]⁺ thành bạc kim loại Ag bám đều lên thành thủy tinh sạch.';
    result.liquidColor = 0xe2e8f0;
    result.liquidHex = '#e2e8f0';
    result.liquidOpacity = 0.4;
    result.precipitateColor = 0x94a3b8; // Metallic silver sheen
    result.precipitateHex = '#cbd5e1';
    result.precipitateHeight = 0.45;
    result.pHCalc = 9.5;
    result.litmusColor = '#3b82f6';
    result.litmusLabel = 'Hóa xanh (Môi trường kiềm amoniac, pH ~ 9.5)';
    return result;
  }

  // Reaction 9: AgNO3 + NaCl -> AgCl v + NaNO3
  if (reagentIds.includes('agno3') && reagentIds.includes('nacl')) {
    result.hasReacted = true;
    result.equation = 'AgNO_3 + NaCl \\rightarrow AgCl\\downarrow + NaNO_3';
    result.ionEquation = 'Ag^+ + Cl^- \\rightarrow AgCl\\downarrow';
    result.phenomenon = 'Xuất hiện ngay kết tủa màu trắng dạng vón (AgCl) lắng xuống đáy ống nghiệm.';
    result.scientificExplanation = 'Tích số tan K_sp(AgCl) ≈ 1.8 × 10⁻¹⁰ rất bé, tạo kết tủa trắng không tan trong acid nitric HNO₃ loãng.';
    result.liquidColor = 0xf8fafc;
    result.liquidHex = '#f8fafc';
    result.liquidOpacity = 0.35;
    result.precipitateColor = 0xffffff;
    result.precipitateHex = '#ffffff';
    result.precipitateHeight = 0.32;
    result.pHCalc = 6.8;
    result.litmusColor = '#8b5cf6';
    result.litmusLabel = 'Màu tím (Dung dịch muối trung tính, pH ~ 6.8)';
    return result;
  }

  // Reaction 10: Litmus Solution testing Acid or Base
  if (reagentIds.includes('litmus_sol')) {
    if (reagentIds.includes('hcl') || reagentIds.includes('h2so4_dilute')) {
      result.phenomenon = 'Dung dịch chuyển sang màu đỏ tươi rực rỡ do môi trường có nồng độ ion H⁺ cao (pH < 4.5).';
      result.liquidColor = 0xef4444;
      result.liquidHex = '#ef4444';
      result.liquidOpacity = 0.8;
      result.pHCalc = 1.5;
      result.litmusColor = '#ef4444';
      result.litmusLabel = 'Đỏ rực (Môi trường acid mạnh, pH ~ 1.5)';
      return result;
    }
    if (reagentIds.includes('naoh') || reagentIds.includes('nh3_sol')) {
      result.phenomenon = 'Dung dịch chuyển sang màu xanh lam đậm do môi trường có nồng độ ion OH⁻ cao (pH > 8.3).';
      result.liquidColor = 0x2563eb;
      result.liquidHex = '#2563eb';
      result.liquidOpacity = 0.8;
      result.pHCalc = 12.5;
      result.litmusColor = '#2563eb';
      result.litmusLabel = 'Xanh đậm (Môi trường base mạnh, pH ~ 12.5)';
      return result;
    }
  }

  // Default: Physical Mix without reaction
  result.phenomenon = 'Các chất hòa tan và trộn lẫn vật lý đồng nhất với nhau, không xuất hiện kết tủa, không sinh bọt khí, không đổi màu. Không xảy ra phản ứng hóa học.';
  result.scientificExplanation = 'Các ion trong dung dịch tồn tại đồng thời mà không kết hợp tạo thành chất kết tủa, chất khí hay chất điện li yếu (không thỏa mãn điều kiện phản ứng trao đổi ion).';
  result.liquidColor = 0xf0fdfa;
  result.liquidHex = '#f0fdfa';
  result.liquidOpacity = 0.3;
  result.pHCalc = 7.0;
  return result;
};
