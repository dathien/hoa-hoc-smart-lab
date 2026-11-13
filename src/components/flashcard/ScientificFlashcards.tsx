import React, { useState } from 'react';
import { Card3DViewer } from './Card3DViewer';
import { ChemFormula } from '../common/ChemFormula';
import {
  RotateCw,
  Star,
  Maximize2,
  X,
  Search,
  Atom,
} from 'lucide-react';

export interface ScientificCardData {
  id: string;
  chemicalName: string;
  vietnameseName: string;
  formula: string;
  molarMass: number; // g/mol
  stateAtRoomTemp: string;
  molecular3DModel: 'H2O' | 'H2SO4' | 'SO3' | 'CH4' | 'CO2' | 'NH3' | 'NaCl' | 'CuSO4';
  geometryType: string;
  bondAngle: string;
  hybridization: string;
  physicalProperties: string;
  chemicalProperties: string[];
  keyReactions: string[];
  applications: string;
  safetyNotes: string;
  curriculumCategory: 'Axit' | 'Oxit' | 'Base' | 'Muối' | 'Hiđrocacbon' | 'Hợp chất chứa Nitơ';
  grade: 10 | 11 | 12;
}

export const SCIENTIFIC_FLASHCARDS: ScientificCardData[] = [
  {
    id: 'sc_nh3',
    chemicalName: 'Ammonia',
    vietnameseName: 'Amoniac',
    formula: 'NH3',
    molarMass: 17.03,
    stateAtRoomTemp: 'Khí không màu, mùi khai sốc đặc trưng',
    molecular3DModel: 'NH3',
    geometryType: 'Chóp tam giác đều (Trigonal pyramidal)',
    bondAngle: '107° (do cặp electron tự do trên N đẩy mạnh các liên kết)',
    hybridization: 'sp³ (1 cặp e không liên kết và 3 liên kết σ)',
    physicalProperties: 'Khí nhẹ hơn không khí (d ≈ 17/29). Tan cực kỳ nhiều trong nước (1 lít nước hòa tan khoảng 800 lít NH₃ ở 20°C). Nhiệt độ sôi -33,3°C.',
    chemicalProperties: [
      'Tính base yếu trong dung dịch: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ (làm quỳ tím hóa xanh, phenolphthalein hóa hồng).',
      'Tính khử mạnh (số oxi hóa N là -3 thấp nhất): 4NH₃ + 5O₂ → 4NO + 6H₂O (xúc tác Pt, 850°C).',
      'Tác dụng với acid tạo muối amoni: NH₃ + HCl → NH₄Cl (khói trắng đặc trưng).',
      'Tạo phức chất tan với nhiều cation kim loại chuyển tiếp: Cu²⁺, Ag⁺, Zn²⁺.',
    ],
    keyReactions: [
      'NH_3 + H_2O \\rightleftharpoons NH_4^+ + OH^-',
      'NH_3 + HCl \\rightarrow NH_4Cl',
      '4NH_3 + 3O_2 \\xrightarrow{t^\\circ} 2N_2 + 6H_2O',
    ],
    applications: 'Nguyên liệu hàng đầu sản xuất phân đạm (urê, ammonium nitrate), acid nitric, thuốc nổ và chất làm lạnh công nghiệp.',
    safetyNotes: 'Khí độc, gây kích ứng mạnh niêm mạc mắt và đường hô hấp. Nồng độ cao có thể gây bỏng và phù phổi cấp. Thực hiện thí nghiệm trong tủ hút.',
    curriculumCategory: 'Hợp chất chứa Nitơ',
    grade: 11,
  },
  {
    id: 'sc_h2o',
    chemicalName: 'Water',
    vietnameseName: 'Nước (Dihydrogen monoxide)',
    formula: 'H2O',
    molarMass: 18.02,
    stateAtRoomTemp: 'Chất lỏng trong suốt, không màu, không mùi',
    molecular3DModel: 'H2O',
    geometryType: 'Dạng gấp khúc (Bent / V-shaped)',
    bondAngle: '104,5° (lai hóa sp³ lệch do 2 cặp e tự do của O)',
    hybridization: 'sp³ (2 cặp electron liên kết O–H và 2 cặp electron tự do)',
    physicalProperties: 'Nhiệt độ sôi 100°C, nhiệt độ đông đặc 0°C (ở 1 atm). Khối lượng riêng lớn nhất ở 4°C (1,0 g/mL). Dung môi phân cực mạnh.',
    chemicalProperties: [
      'Phân tử phân cực mạnh do độ âm điện của O (3,44) lớn hơn H (2,20).',
      'Tạo liên kết hydrogen liên phân tử bền vững, dẫn đến nhiệt dung riêng và nhiệt hóa hơi rất cao.',
      'Phản ứng với kim loại kiềm mạnh: 2Na + 2H₂O → 2NaOH + H₂↑.',
      'Tham gia phản ứng thủy phân este, carbohydrate, muối của acid/base yếu.',
    ],
    keyReactions: [
      '2H_2 + O_2 \\xrightarrow{t^\\circ} 2H_2O',
      '2Na + 2H_2O \\rightarrow 2NaOH + H_2\\uparrow',
      'SO_3 + H_2O \\rightarrow H_2SO_4',
    ],
    applications: 'Dung môi phổ biến nhất trong đời sống và hóa học; chất điều hòa nhiệt độ khí quyển và cơ thể sinh vật.',
    safetyNotes: 'An toàn tuyệt đối trong đời sống. Đề phòng bỏng hơi nước sôi.',
    curriculumCategory: 'Oxit',
    grade: 10,
  },
  {
    id: 'sc_so3',
    chemicalName: 'Sulfur trioxide',
    vietnameseName: 'Lưu huỳnh trioxit',
    formula: 'SO3',
    molarMass: 80.06,
    stateAtRoomTemp: 'Chất lỏng không màu (sôi ở 45°C), dưới 17°C là tinh thể rắn',
    molecular3DModel: 'SO3',
    geometryType: 'Tam giác phẳng đều (Trigonal planar)',
    bondAngle: '120° (đối xứng phẳng hoàn hảo)',
    hybridization: 'sp² (3 liên kết S–O phân bố đều 120° trong mặt phẳng)',
    physicalProperties: 'Chất lỏng không màu, bốc khói mạnh trong không khí ẩm. Nhiệt độ nóng chảy 16,9°C, nhiệt độ sôi 45°C.',
    chemicalProperties: [
      'Oxide acid mạnh: tác dụng mãnh liệt với nước tỏa lượng nhiệt khổng lồ tạo dung dịch H₂SO₄.',
      'Tác dụng với dung dịch kiềm: SO₃ + 2NaOH → Na₂SO₄ + H₂O.',
      'Tan trong H₂SO₄ đặc tạo thành oleum (H₂SO₄.nSO₃).',
    ],
    keyReactions: [
      '2SO_2 + O_2 \\xrightleftharpoons[V_2O_5]{450^\\circ C} 2SO_3',
      'SO_3 + H_2O \\rightarrow H_2SO_4 \\quad (\\Delta H < 0)',
      'SO_3 + 2NaOH \\rightarrow Na_2SO_4 + H_2O',
    ],
    applications: 'Sản phẩm trung gian then chốt trong công nghiệp sản xuất sulfuric acid theo phương pháp tiếp xúc kép.',
    safetyNotes: 'Chất ăn mòn cực mạnh, phản ứng với nước tỏa nhiệt gây nổ bắn acid; hơi SO₃ tạo sương mù acid ăn mòn đường thở.',
    curriculumCategory: 'Oxit',
    grade: 11,
  },
  {
    id: 'sc_h2so4',
    chemicalName: 'Sulfuric acid',
    vietnameseName: 'Axit sunfuric',
    formula: 'H2SO4',
    molarMass: 98.08,
    stateAtRoomTemp: 'Chất lỏng sánh như dầu, không màu, không bay hơi',
    molecular3DModel: 'H2SO4',
    geometryType: 'Tứ diện biến dạng quanh nguyên tử S',
    bondAngle: 'O=S=O xấp xỉ 119°, O–S–O xấp xỉ 104°',
    hybridization: 'sp³ (S ở tâm tứ diện liên kết với 4 nguyên tử O, có 2 nhóm –O–H)',
    physicalProperties: 'Khối lượng riêng 1,84 g/cm³ (dung dịch 98%). Tan vô hạn trong nước và tỏa nhiệt rất lớn. Nhiệt độ sôi 337°C.',
    chemicalProperties: [
      'Dung dịch loãng: là acid mạnh bậc hai, đổi màu quỳ tím sang đỏ, tác dụng kim loại trước H, base, oxide base.',
      'H₂SO₄ đặc: có tính oxi hóa cực mạnh (oxi hóa hầu hết kim loại trừ Au, Pt lên số oxi hóa cao nhất).',
      'Tính háo nước mãnh liệt: chiếm các nguyên tố H và O trong hợp chất hữu cơ (than hóa đường sucrose, cellulose).',
    ],
    keyReactions: [
      'Cu + 2H_2SO_4(đ) \\xrightarrow{t^\\circ} CuSO_4 + SO_2\\uparrow + 2H_2O',
      'C_{12}H_{22}O_{11} \\xrightarrow{H_2SO_4(đ)} 12C + 11H_2O',
      'BaCl_2 + H_2SO_4 \\rightarrow BaSO_4\\downarrow + 2HCl',
    ],
    applications: 'Được mệnh danh là "Máu của ngành công nghiệp hóa chất": sản xuất phân bón, chất tẩy rửa, thuốc nổ, ắc quy chì.',
    safetyNotes: 'CỰC KỲ NGUY HIỂM: Gây bỏng hóa học sâu. Khi pha loãng: RÓT TỪ TỪ ACID VÀO NƯỚC, TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM NGƯỢC LẠI.',
    curriculumCategory: 'Axit',
    grade: 11,
  },
  {
    id: 'sc_cuso4',
    chemicalName: 'Copper(II) sulfate',
    vietnameseName: 'Đồng(II) sunfat',
    formula: 'CuSO4',
    molarMass: 159.61,
    stateAtRoomTemp: 'Chất rắn màu trắng (khan), dạng ngậm nước CuSO₄.5H₂O màu xanh lam',
    molecular3DModel: 'CuSO4',
    geometryType: 'Tinh thể ion phức bát diện phối trí quanh Cu²⁺',
    bondAngle: 'Cấu trúc mạng tinh thể phối trí bát diện',
    hybridization: 'Lai hóa d²sp³ / sp³d² trong ion phức đồng',
    physicalProperties: 'Muối khan hút ẩm rất mạnh chuyển sang màu xanh lam. Dung dịch trong nước có màu xanh lam đặc trưng của ion [Cu(H₂O)₆]²⁺.',
    chemicalProperties: [
      'Tác dụng với dung dịch kiềm tạo kết tủa xanh lam: CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄.',
      'Bị kim loại có tính khử mạnh hơn đẩy ra khỏi dung dịch muối: Fe + CuSO₄ → FeSO₄ + Cu↓.',
      'Phản ứng trao đổi với muối Ba²⁺ tạo kết tủa trắng BaSO₄.',
    ],
    keyReactions: [
      'CuSO_4 + 2NaOH \\rightarrow Cu(OH)_2\\downarrow + Na_2SO_4',
      'Fe + CuSO_4 \\rightarrow FeSO_4 + Cu\\downarrow',
      'BaCl_2 + CuSO_4 \\rightarrow BaSO_4\\downarrow + CuCl_2',
    ],
    applications: 'Dùng diệt nấm mốc trong nông nghiệp (dung dịch Boocđô), mạ điện đồng, chất nhuộm vải và tinh chế đồng điện phân.',
    safetyNotes: 'Có độc tính đối với sinh vật thủy sinh. Tránh nuốt phải hoặc để dính vào mắt.',
    curriculumCategory: 'Muối',
    grade: 11,
  },
  {
    id: 'sc_ch4',
    chemicalName: 'Methane',
    vietnameseName: 'Metan',
    formula: 'CH4',
    molarMass: 16.04,
    stateAtRoomTemp: 'Khí không màu, không mùi, nhẹ hơn không khí',
    molecular3DModel: 'CH4',
    geometryType: 'Tứ diện đều đối xứng hoàn hảo (Regular tetrahedron)',
    bondAngle: '109,5° (tất cả 4 góc liên kết H–C–H đều bằng nhau)',
    hybridization: 'sp³ (C ở tâm tứ diện tạo 4 liên kết σ bền vững với 4 H)',
    physicalProperties: 'Tỉ khối d = 16/29 ≈ 0,55 (nhẹ hơn không khí). Rất ít tan trong nước, tan trong dung môi hữu cơ. Nhiệt độ sôi -161,5°C.',
    chemicalProperties: [
      'Phản ứng cháy tỏa nhiệt lớn: CH₄ + 2O₂ → CO₂ + 2H₂O (ΔH = -890 kJ/mol).',
      'Phản ứng thế halogen (đặc trưng của alkane): CH₄ + Cl₂ → CH₃Cl + HCl (chiếu sáng).',
      'Phản ứng nhiệt phân: 2CH₄ → C₂H₂ + 3H₂ (1500°C, làm lạnh nhanh).',
    ],
    keyReactions: [
      'CH_4 + 2O_2 \\xrightarrow{t^\\circ} CO_2 + 2H_2O',
      'CH_4 + Cl_2 \\xrightarrow{as} CH_3Cl + HCl',
      '2CH_4 \\xrightarrow{1500^\\circ C} C_2H_2 + 3H_2',
    ],
    applications: 'Thành phần chính của khí thiên nhiên và khí dầu mỏ; nhiên liệu sạch cho công nghiệp và sinh hoạt; nguyên liệu điều chế H₂ và acetylene.',
    safetyNotes: 'Hỗn hợp khí CH₄ và O₂ (theo tỉ lệ thể tích 1:2) là hỗn hợp nổ cực kỳ nguy hiểm trong hầm lò khai thác than.',
    curriculumCategory: 'Hiđrocacbon',
    grade: 11,
  },
  {
    id: 'sc_co2',
    chemicalName: 'Carbon dioxide',
    vietnameseName: 'Khí cacbonic / Băng khô',
    formula: 'CO2',
    molarMass: 44.01,
    stateAtRoomTemp: 'Khí không màu, không mùi, nặng hơn không khí',
    molecular3DModel: 'CO2',
    geometryType: 'Đường thẳng (Linear / O=C=O)',
    bondAngle: '180° (phân tử đối xứng thẳng hàng)',
    hybridization: 'sp (C ở giữa tạo 2 liên kết σ và 2 liên kết π với 2 O)',
    physicalProperties: 'Nặng hơn không khí (d = 44/29 ≈ 1,52). Thăng hoa ở -78,5°C tạo băng khô (đá khói). Tan một lượng nhỏ trong nước.',
    chemicalProperties: [
      'Oxide acid: tan trong nước tạo acid carbonic yếu thuận nghịch: CO₂ + H₂O ⇌ H₂CO₃.',
      'Tác dụng với dung dịch kiềm: CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O (làm vẩn đục nước vôi trong).',
      'Không duy trì sự cháy của đa số chất (trừ kim loại hoạt động mạnh: 2Mg + CO₂ → 2MgO + C).',
    ],
    keyReactions: [
      'CO_2 + Ca(OH)_2 \\rightarrow CaCO_3\\downarrow + H_2O',
      'CO_2 + C \\xrightarrow{t^\\circ} 2CO',
      '2Mg + CO_2 \\xrightarrow{t^\\circ} 2MgO + C',
    ],
    applications: 'Chất chữa cháy cho đám cháy thông thường; tạo gas nước ngọt; bảo quản thực phẩm lạnh (băng khô).',
    safetyNotes: 'Không duy trì sự hô hấp. Khí nồng độ cao trong phòng kín gây ngạt thở nguy hiểm.',
    curriculumCategory: 'Oxit',
    grade: 11,
  },
  {
    id: 'sc_nacl',
    chemicalName: 'Sodium chloride',
    vietnameseName: 'Natri clorua (Muối ăn)',
    formula: 'NaCl',
    molarMass: 58.44,
    stateAtRoomTemp: 'Chất rắn tinh thể màu trắng, vị mặn',
    molecular3DModel: 'NaCl',
    geometryType: 'Mạng tinh thể lập phương tâm diện (Face-centered cubic)',
    bondAngle: '90° giữa các trục tọa độ tinh thể',
    hybridization: 'Liên kết ion thuần khiết giữa cation Na⁺ và anion Cl⁻',
    physicalProperties: 'Nhiệt độ nóng chảy 801°C, nhiệt độ sôi 1465°C. Tan nhiều trong nước (độ tan khoảng 36 g/100 mL nước ở 20°C). Tinh thể giòn.',
    chemicalProperties: [
      'Hợp chất ion bền vững, không bị phân hủy bởi nhiệt độ thông thường.',
      'Tác dụng với dung dịch AgNO₃ tạo kết tủa trắng: NaCl + AgNO₃ → AgCl↓ + NaNO₃.',
      'Điện phân dung dịch có màng ngăn: 2NaCl + 2H₂O → 2NaOH + Cl₂↑ + H₂↑.',
      'Điện phân nóng chảy: 2NaCl → 2Na + Cl₂↑.',
    ],
    keyReactions: [
      'NaCl + AgNO_3 \\rightarrow AgCl\\downarrow + NaNO_3',
      '2NaCl + 2H_2O \\xrightarrow{dpdd, mn} 2NaOH + Cl_2\\uparrow + H_2\\uparrow',
      '2NaCl \\xrightarrow{dpnc} 2Na + Cl_2\\uparrow',
    ],
    applications: 'Gia vị thực phẩm, bảo quản thức ăn; nguyên liệu điều chế kim loại natri, khí clo, xút NaOH, nước Javel.',
    safetyNotes: 'An toàn trong sử dụng hằng ngày; ăn quá nhiều muối gây tăng huyết áp và bệnh tim mạch.',
    curriculumCategory: 'Muối',
    grade: 10,
  },
];

export const ScientificFlashcards: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<'all' | 10 | 11 | 12>('all');
  const [flippedCards, setFlippedCards] = useState<{ [cardId: string]: boolean }>({});
  const [masteredCards, setMasteredCards] = useState<{ [cardId: string]: boolean }>({ sc_nh3: true, sc_h2o: true });
  const [inspectCard, setInspectCard] = useState<ScientificCardData | null>(null);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id: string) => {
    setMasteredCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCards = SCIENTIFIC_FLASHCARDS.filter((card) => {
    const matchSearch =
      card.chemicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.formula.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (selectedGrade !== 'all' && card.grade !== selectedGrade) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'mastered') return Boolean(masteredCards[card.id]);
    return card.curriculumCategory === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
          <Atom className="w-7 h-7 text-teal-600" />
          Flashcard Hóa học
        </h2>

        {/* Search, Grade & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Tìm tên chất hoặc công thức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-[16px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 font-medium text-slate-800 min-h-[44px]"
            />
          </div>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 10 | 11 | 12))}
            aria-label="Lọc theo lớp"
            className="px-3.5 py-2.5 text-[15px] font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 min-h-[44px]"
          >
            <option value="all">Tất cả lớp</option>
            <option value={10}>Lớp 10</option>
            <option value={11}>Lớp 11</option>
            <option value={12}>Lớp 12</option>
          </select>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {['all', 'mastered', 'Axit', 'Oxit', 'Hợp chất chứa Nitơ', 'Muối', 'Hiđrocacbon'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-[15px] font-bold rounded-lg transition-all min-h-[44px] ${
                  selectedCategory === cat
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'Tất cả' : cat === 'mastered' ? 'Đã thuộc (⭐)' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredCards.length === 0 && (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-base font-bold text-slate-700">Không tìm thấy thẻ chất hóa học phù hợp.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedGrade('all');
            }}
            className="px-4 py-2 text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
          >
            Xem lại tất cả thẻ
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCards.map((card) => {
          const isFlipped = Boolean(flippedCards[card.id]);
          const isMastered = Boolean(masteredCards[card.id]);

          return (
            <div
              key={card.id}
              className="w-full h-[570px] perspective-1000 select-none"
              style={{ perspective: '1000px' }}
            >
              {/* Card 3D Rotating Wrapper with hardware acceleration */}
              <div
                className="relative w-full h-full duration-500 transform-style-3d transition-transform"
                style={{
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* ========================================================
                    FRONT SIDE: SCIENTIFIC FLASHCARD FACE
                    ======================================================== */}
                <div
                  className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-white border-2 border-slate-200 shadow-md flex flex-col overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                  }}
                >
                  {/* Top Bar: Scientific Nomenclature & Grade Badge */}
                  <div className="p-4 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] px-2 py-0.5 rounded bg-teal-500/30 text-teal-200 border border-teal-400/40 font-bold">
                          Lớp {card.grade}
                        </span>
                        <span className="text-[13px] text-teal-200 font-semibold">
                          {card.curriculumCategory}
                        </span>
                      </div>
                      <h3 className="text-xl font-black mt-0.5 tracking-tight">
                        {card.chemicalName}
                      </h3>
                      <span className="text-[14px] text-slate-300 font-medium block">
                        {card.vietnameseName}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMastered(card.id);
                      }}
                      title={isMastered ? 'Đã thuộc chất này' : 'Đánh dấu đã thuộc'}
                      className={`p-2 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        isMastered
                          ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${isMastered ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Chemical Formula & Molecular Geometry Pill */}
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                        Công thức hóa học
                      </span>
                      <div className="text-2xl font-black text-teal-900">
                        <ChemFormula formula={card.formula} />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                        Khối lượng mol
                      </span>
                      <span className="text-base font-extrabold text-slate-700">
                        {card.molarMass} g/mol
                      </span>
                    </div>
                  </div>

                  {/* 3D Molecular Model (Clean fixed view with accurate angles) */}
                  <div className="flex-1 p-2 bg-gradient-to-b from-white to-slate-50 flex flex-col items-center justify-center overflow-hidden relative">
                    <Card3DViewer
                      modelType={card.molecular3DModel}
                      height={215}
                      className="w-full"
                      interactive={false}
                    />
                    <div className="text-center mt-1">
                      <span className="text-[14px] font-bold text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        📐 Dạng hình học: {card.geometryType}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Highlights & Geometry Info */}
                  <div className="p-3.5 bg-slate-50/90 border-t border-slate-100 text-sm space-y-1">
                    <div className="text-[15px] text-slate-700 font-medium">
                      <strong>Góc liên kết:</strong> {card.bondAngle}
                    </div>
                    <div className="text-[15px] text-slate-700 font-medium">
                      <strong>Kiểu lai hóa:</strong> {card.hybridization}
                    </div>
                  </div>

                  {/* Action Bar (Inspect & Flip) */}
                  <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setInspectCard(card)}
                      className="flex items-center gap-1.5 px-3 py-2 text-[15px] font-bold text-slate-700 hover:text-teal-800 bg-slate-100 hover:bg-teal-50 rounded-xl transition-all min-h-[44px]"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Xoay 3D 360°</span>
                    </button>

                    <button
                      onClick={() => toggleFlip(card.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-[15px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all min-h-[44px] shadow-2xs"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>Lật xem mặt sau</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================
                    BACK SIDE: COMPREHENSIVE TEXTBOOK CHEMICAL KNOWLEDGE
                    FIXED: NEVER HORIZONTALLY MIRRORED, CRISP & ACCURATE
                    ======================================================== */}
                <div
                  className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-white border-2 border-teal-500 shadow-lg flex flex-col p-4 overflow-y-auto"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div>
                      <h4 className="text-lg font-black text-slate-900">
                        {card.chemicalName} (<ChemFormula formula={card.formula} />)
                      </h4>
                      <span className="text-xs text-teal-700 font-bold">
                        {card.vietnameseName} · Lớp {card.grade}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleFlip(card.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors min-h-[44px]"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>Lật về trước</span>
                    </button>
                  </div>

                  {/* Body Knowledge Sections */}
                  <div className="space-y-3.5 mt-3 text-sm">
                    {/* 1. Molecular Geometry & Hybridization */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Cấu tạo phân tử & Hình học không gian
                      </span>
                      <p className="text-[15px] text-slate-800 leading-relaxed mt-0.5 font-medium">
                        {card.geometryType}. Góc liên kết {card.bondAngle}. Nguyên tử trung tâm lai hóa {card.hybridization}.
                      </p>
                    </div>

                    {/* 2. Physical Properties */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Tính chất vật lí tiêu biểu
                      </span>
                      <p className="text-[15px] text-slate-800 leading-relaxed mt-0.5 font-medium">
                        {card.physicalProperties}
                      </p>
                    </div>

                    {/* 3. Chemical Properties */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Tính chất hóa học đặc trưng
                      </span>
                      <ul className="text-[15px] text-slate-800 space-y-1.5 pl-4 list-disc mt-1 font-medium">
                        {card.chemicalProperties.map((cp, idx) => (
                          <li key={idx} className="leading-relaxed">{cp}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 4. Key Representative Chemical Equations */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Phương trình phản ứng tiêu biểu
                      </span>
                      <div className="space-y-1.5 mt-1">
                        {card.keyReactions.map((reac, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[16px]">
                            <ChemFormula formula={reac} isBlock />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. Applications */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Ứng dụng thực tiễn
                      </span>
                      <p className="text-[15px] text-slate-700 leading-relaxed mt-0.5 font-medium">
                        {card.applications}
                      </p>
                    </div>

                    {/* 6. Safety Warning */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[14px] text-amber-900">
                      <strong>Lưu ý an toàn thí nghiệm:</strong> {card.safetyNotes}
                    </div>

                    {/* Action in back side: Deep 3D viewer */}
                    <div className="pt-2">
                      <button
                        onClick={() => setInspectCard(card)}
                        className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
                      >
                        <Maximize2 className="w-5 h-5" />
                        <span>Mở màn hình xoay 360° & Phóng to cấu trúc</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: DEEP 3D MOLECULAR INSPECTOR (360° Rotate, Zoom, Reset view) */}
      {inspectCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-800 text-xl">
                  {inspectCard.chemicalName} ({inspectCard.vietnameseName}) – <ChemFormula formula={inspectCard.formula} />
                </h3>
                <span className="text-sm text-slate-500 font-semibold">
                  Mô hình cấu tạo không gian 3D tương tác
                </span>
              </div>
              <button
                onClick={() => setInspectCard(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Interactive 3D Canvas */}
            <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center relative">
              <Card3DViewer
                modelType={inspectCard.molecular3DModel}
                height={290}
                className="w-full"
                interactive={true}
              />
              <span className="text-xs text-slate-400 mt-2 select-none">
                🖱️ Kéo chuột hoặc vuốt để xoay tự do 360° · Cuộn chuột để phóng to/thu nhỏ
              </span>
            </div>

            {/* Scientific structural details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-base text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-medium">
                <span className="font-bold text-slate-800">Dạng hình học:</span>
                <span className="text-teal-800 font-bold">{inspectCard.geometryType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-medium">
                <span className="font-bold text-slate-800">Góc liên kết chuẩn:</span>
                <span className="text-teal-800 font-bold">{inspectCard.bondAngle}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="font-bold text-slate-800">Trạng thái lai hóa:</span>
                <span className="text-teal-800 font-bold">{inspectCard.hybridization}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectCard(null)}
                className="px-6 py-2.5 text-base font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors min-h-[44px]"
              >
                Đóng màn hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
