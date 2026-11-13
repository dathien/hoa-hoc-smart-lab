import React, { useState } from 'react';
import { Volume2, CheckCircle2, RotateCcw, Award, Info, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ElementMnemonic {
  symbol: string;
  name: string;
  chantWord: string;
  roleNote: string;
  isHydrogen?: boolean;
}

// Dãy hoạt động hóa học chuẩn hóa thống nhất (16 vị trí, không có Ba):
// K – Na – Ca – Mg – Al – Zn – Fe – Ni – Sn – Pb – (H) – Cu – Hg – Ag – Pt – Au
const MNEMONIC_DATA: ElementMnemonic[] = [
  { symbol: 'K', name: 'Potassium (Kali)', chantWord: 'Khi', roleNote: 'Kim loại kiềm hoạt động rất mạnh, phản ứng mãnh liệt với nước ở nhiệt độ thường tạo KOH và H₂.' },
  { symbol: 'Na', name: 'Sodium (Natri)', chantWord: 'nào', roleNote: 'Kim loại kiềm mạnh, phản ứng với nước ở nhiệt độ thường tạo NaOH và giải phóng khí H₂.' },
  { symbol: 'Ca', name: 'Calcium (Canxi)', chantWord: 'cần', roleNote: 'Kim loại kiềm thổ, phản ứng với nước ở nhiệt độ thường tạo Ca(OH)₂ ít tan và khí H₂.' },
  { symbol: 'Mg', name: 'Magnesium (Magie)', chantWord: 'may', roleNote: 'Hoạt động mạnh với dung dịch acid loãng (HCl, H₂SO₄ loãng); đẩy được các kim loại đứng sau ra khỏi dung dịch muối.' },
  { symbol: 'Al', name: 'Aluminium (Nhôm)', chantWord: 'áo', roleNote: 'Kim loại phổ biến hoạt động mạnh, khử được ion H⁺ trong acid loãng (bị thụ động hóa trong HNO₃, H₂SO₄ đặc nguội).' },
  { symbol: 'Zn', name: 'Zinc (Kẽm)', chantWord: 'giáp', roleNote: 'Thường dùng trong phòng thí nghiệm điều chế khí H₂ khi tác dụng với dung dịch HCl hoặc H₂SO₄ loãng.' },
  { symbol: 'Fe', name: 'Iron (Sắt)', chantWord: 'sắt', roleNote: 'Đẩy được H⁺ tạo muối Fe²⁺ và khí H₂ trong acid loãng; đẩy được Cu, Ag ra khỏi dung dịch muối.' },
  { symbol: 'Ni', name: 'Nickel (Niken)', chantWord: 'nhớ', roleNote: 'Đứng trước H trong dãy hoạt động hóa học, phản ứng chậm hơn với dung dịch acid loãng.' },
  { symbol: 'Sn', name: 'Tin (Thiếc)', chantWord: 'sang', roleNote: 'Đứng trước H, phản ứng với dung dịch acid loãng tạo muối Sn²⁺ và giải phóng H₂.' },
  { symbol: 'Pb', name: 'Lead (Chì)', chantWord: 'phố', roleNote: 'Kim loại cuối cùng đứng trước H; phản ứng chậm với acid loãng (tạo lớp PbCl₂/PbSO₄ ít tan bao bọc bề mặt).' },
  { symbol: 'H', name: 'Hydrogen (Hiđro)', chantWord: 'hỏi', isHydrogen: true, roleNote: 'Mốc so sánh phi kim (E° = 0,00 V). Kim loại đứng trước H đẩy được H₂ khỏi acid loãng; kim loại đứng sau không phản ứng.' },
  { symbol: 'Cu', name: 'Copper (Đồng)', chantWord: 'cửa', roleNote: 'Đứng sau H, không tan trong HCl hay H₂SO₄ loãng; tan trong HNO₃ hoặc H₂SO₄ đặc nóng.' },
  { symbol: 'Hg', name: 'Mercury (Thủy ngân)', chantWord: 'hàng', roleNote: 'Kim loại lỏng ở nhiệt độ thường, đứng sau H, không tác dụng với acid loãng không có tính oxi hóa.' },
  { symbol: 'Ag', name: 'Silver (Bạc)', chantWord: 'á', roleNote: 'Kim loại kém hoạt động, dẫn điện và dẫn nhiệt tốt nhất; không tác dụng với HCl, H₂SO₄ loãng.' },
  { symbol: 'Pt', name: 'Platinum (Bạch kim)', chantWord: 'phi', roleNote: 'Kim loại quý rất trơ về mặt hóa học, không bị oxi hóa bởi các acid thông thường.' },
  { symbol: 'Au', name: 'Gold (Vàng)', chantWord: 'âu', roleNote: 'Kim loại hoạt động yếu nhất trong dãy, bền vững trong tự nhiên, chỉ tan trong nước cường toan.' },
];

const SHUFFLED_PICK_SYMBOLS = [
  'Mg', 'K', 'Cu', 'Na', 'Al', 'Zn', 'Fe', 'H',
  'Ca', 'Ag', 'Pb', 'Ni', 'Sn', 'Hg', 'Au', 'Pt',
];

export const MnemonicGame: React.FC = () => {
  const [placedSymbols, setPlacedSymbols] = useState<string[]>([]);
  const [selectedElement, setSelectedElement] = useState<ElementMnemonic | null>(MNEMONIC_DATA[0]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const speakChant = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        'Khi nào cần may áo giáp sắt, nhớ sang phố hỏi cửa hàng á phi âu!'
      );
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePickSymbol = (symbol: string) => {
    if (placedSymbols.includes(symbol) || isCompleted) return;

    const targetItem = MNEMONIC_DATA[placedSymbols.length];
    if (symbol !== targetItem.symbol) {
      setFeedbackError(
        `Chưa chính xác! Vị trí số ${placedSymbols.length + 1} là "${targetItem.symbol}" (${targetItem.chantWord} – ${targetItem.name}). Hãy chọn lại!`
      );
      return;
    }

    setFeedbackError(null);
    const nextList = [...placedSymbols, symbol];
    setPlacedSymbols(nextList);

    if (nextList.length === MNEMONIC_DATA.length) {
      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleReset = () => {
    setPlacedSymbols([]);
    setIsCompleted(false);
    setFeedbackError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Bí Kíp Truyền Kỳ – Dãy Hoạt Động Hóa Học
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhớ thứ tự mức độ hoạt động hóa học giảm dần của kim loại: K – Na – Ca – Mg – Al – Zn – Fe – Ni – Sn – Pb – (H) – Cu – Hg – Ag – Pt – Au.
          </p>
        </div>

        <button
          onClick={speakChant}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors shadow-sm"
        >
          <Volume2 className="w-4 h-4 text-teal-600" />
          Nghe đọc câu thần chú
        </button>
      </div>

      {/* The Famous Chant Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md space-y-4">
        <div>
          <span className="text-[11px] font-bold text-teal-300 uppercase tracking-widest block mb-1">
            Câu thần chú ghi nhớ (16 vị trí):
          </span>
          <h3 className="text-lg md:text-xl font-black text-amber-300 tracking-wide leading-relaxed">
            “Khi nào cần may áo giáp sắt nhớ sang phố hỏi cửa hàng á phi âu”
          </h3>
        </div>

        <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {MNEMONIC_DATA.map((item, idx) => {
            const isSelected = selectedElement?.symbol === item.symbol;
            return (
              <button
                type="button"
                key={item.symbol}
                onClick={() => setSelectedElement(item)}
                className={`p-2 rounded-lg cursor-pointer transition-all border text-center ${
                  item.isHydrogen
                    ? isSelected
                      ? 'bg-amber-400/30 border-amber-300 ring-2 ring-amber-300'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/40'
                    : isSelected
                    ? 'bg-teal-400/30 border-teal-300 ring-2 ring-teal-300'
                    : 'bg-white/10 hover:bg-white/20 border-white/10'
                }`}
              >
                <span className="text-[10px] text-slate-300 block">#{idx + 1}</span>
                <span className="text-xs text-amber-200 font-bold block">{item.chantWord}</span>
                <span className="text-sm font-extrabold text-white block mt-0.5">
                  {item.isHydrogen ? `(${item.symbol})` : item.symbol}
                </span>
                <span className="text-[9px] text-slate-300 truncate block mt-0.5">{item.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {selectedElement && (
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="font-bold text-amber-200 flex items-center gap-2">
                <span>
                  {selectedElement.symbol} – {selectedElement.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/15 text-white text-[11px]">
                  Từ khóa: “{selectedElement.chantWord}”
                </span>
              </div>
              <p className="text-slate-100 leading-relaxed">{selectedElement.roleNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* Important Scientific Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <strong className="font-bold">Lưu ý khoa học quan trọng:</strong>
          <p className="leading-relaxed">
            - <strong>Hydrogen (H)</strong> là mốc so sánh điện cực chuẩn (E° = 0,00 V), <strong>không phải kim loại</strong>. Kim loại đứng trước H đẩy được H⁺ ra khỏi dung dịch acid loãng (HCl, H₂SO₄ loãng).
            <br />
            - Kim loại đầu dãy gồm <strong>K, Na, Ca</strong> tác dụng với nước ở nhiệt độ thường tạo dung dịch kiềm và giải phóng khí H₂.
            <br />
            - Từ <strong>Mg trở đi</strong>, kim loại đứng trước đẩy được kim loại đứng sau ra khỏi dung dịch muối.
          </p>
        </div>
      </div>

      {/* Mini Game: Reconstruct the Sequence */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              Thử thách: Sắp xếp theo đúng chiều hoạt động hóa học giảm dần
            </h4>
            <span className="text-xs text-slate-500">
              Nhấn lần lượt các nguyên tố theo đúng thứ tự câu thần chú (16 vị trí: từ K đến Au).
            </span>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm lại
          </button>
        </div>

        {/* Dropped / Placed Slots */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[60px] items-center">
          {placedSymbols.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              Bắt đầu bằng cách bấm vào nguyên tố đầu tiên tương ứng với chữ &quot;Khi&quot; bên dưới...
            </span>
          ) : (
            placedSymbols.map((sym, idx) => (
              <div
                key={sym}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 animate-fadeIn ${
                  sym === 'H' ? 'bg-amber-600 text-white' : 'bg-teal-600 text-white'
                }`}
              >
                <span>{idx + 1}.</span>
                <span>{sym === 'H' ? '(H)' : sym}</span>
              </div>
            ))
          )}
        </div>

        {feedbackError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {/* Completion Announcement */}
        {isCompleted && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-950">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h5 className="font-bold text-sm">Tuyệt vời! Bạn đã hoàn thành chính xác 16/16 vị trí!</h5>
              <p className="text-xs text-emerald-800">
                Thứ tự hoạt động hóa học K – Na – Ca – Mg – Al – Zn – Fe – Ni – Sn – Pb – (H) – Cu – Hg – Ag – Pt – Au đã được ghi nhớ chính xác.
              </p>
            </div>
          </div>
        )}

        {/* Shuffled Pick Buttons */}
        {!isCompleted && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Bấm chọn nguyên tố tiếp theo ({placedSymbols.length}/{MNEMONIC_DATA.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {SHUFFLED_PICK_SYMBOLS.map((sym) => {
                const isUsed = placedSymbols.includes(sym);
                return (
                  <button
                    key={sym}
                    disabled={isUsed}
                    onClick={() => handlePickSymbol(sym)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all min-w-[44px] ${
                      isUsed
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-teal-50 hover:border-teal-400 text-slate-800 border-slate-300 shadow-sm'
                    }`}
                  >
                    {sym === 'H' ? '(H)' : sym}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
