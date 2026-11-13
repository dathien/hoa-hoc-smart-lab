import React, { useMemo, useState } from 'react';
import { Calculator, Scale, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { ELEMENTS_118 } from '../../data/elements118';

const ATOMIC_MASS_MAP: Record<string, number> = (() => {
  const m: Record<string, number> = {};
  ELEMENTS_118.forEach((e) => {
    const cleaned = e.atomicMass.replace(/[\[\]]/g, '');
    m[e.symbol] = parseFloat(cleaned) || 0;
  });
  return m;
})();

function parseFormulaCounts(formula: string): Record<string, number> | null {
  const clean = formula.replace(/\s+/g, '');
  if (!clean) return null;

  // Support hydrates separated by dot '.' or '·'
  const parts = clean.split(/[.·]/);
  const total: Record<string, number> = {};

  for (const rawPart of parts) {
    if (!rawPart) return null;
    let i = 0;
    const matchMult = rawPart.match(/^(\d+)(.*)$/);
    const partMult = matchMult ? parseInt(matchMult[1], 10) : 1;
    const body = matchMult ? matchMult[2] : rawPart;
    if (!body) return null;

    const stack: Record<string, number>[] = [{}];
    i = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === '(' || ch === '[') {
        stack.push({});
        i++;
      } else if (ch === ')' || ch === ']') {
        i++;
        let numStr = '';
        while (i < body.length && /\d/.test(body[i])) {
          numStr += body[i++];
        }
        const mult = numStr ? parseInt(numStr, 10) : 1;
        const popped = stack.pop();
        if (!popped || stack.length === 0) return null;
        const top = stack[stack.length - 1];
        for (const [el, cnt] of Object.entries(popped)) {
          top[el] = (top[el] || 0) + cnt * mult;
        }
      } else if (/[A-Z]/.test(ch)) {
        let sym = ch;
        i++;
        while (i < body.length && /[a-z]/.test(body[i])) {
          sym += body[i++];
        }
        if (!(sym in ATOMIC_MASS_MAP)) return null;
        let numStr = '';
        while (i < body.length && /\d/.test(body[i])) {
          numStr += body[i++];
        }
        const cnt = numStr ? parseInt(numStr, 10) : 1;
        const top = stack[stack.length - 1];
        top[sym] = (top[sym] || 0) + cnt;
      } else {
        return null;
      }
    }
    if (stack.length !== 1) return null;
    for (const [el, cnt] of Object.entries(stack[0])) {
      total[el] = (total[el] || 0) + cnt * partMult;
    }
  }
  return total;
}

function gcdBig(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0n ? 1n : x;
}

function lcmBig(a: bigint, b: bigint): bigint {
  return (a / gcdBig(a, b)) * b;
}

interface Frac {
  n: bigint;
  d: bigint;
}

function normFrac(n: bigint, d: bigint): Frac {
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcdBig(n, d);
  return { n: n / g, d: d / g };
}

function subFrac(a: Frac, b: Frac): Frac {
  return normFrac(a.n * b.d - b.n * a.d, a.d * b.d);
}
function mulFrac(a: Frac, b: Frac): Frac {
  return normFrac(a.n * b.n, a.d * b.d);
}
function divFrac(a: Frac, b: Frac): Frac {
  return normFrac(a.n * b.d, a.d * b.n);
}

function balanceChemicalEquation(
  equationInput: string
): { ok: true; formatted: string; reactants: { coeff: number; formula: string }[]; products: { coeff: number; formula: string }[] } | { ok: false; error: string } {
  const arrowSplit = equationInput.split(/->|=>|→|=/);
  if (arrowSplit.length !== 2) {
    return { ok: false, error: 'Vui lòng nhập phương trình có dạng: Chất tham gia -> Sản phẩm (dùng dấu ->).' };
  }
  const leftList = arrowSplit[0]
    .split('+')
    .map((s) => s.trim().replace(/^\d+/, ''))
    .filter(Boolean);
  const rightList = arrowSplit[1]
    .split('+')
    .map((s) => s.trim().replace(/^\d+/, ''))
    .filter(Boolean);

  if (leftList.length === 0 || rightList.length === 0) {
    return { ok: false, error: 'Thiếu chất tham gia hoặc sản phẩm.' };
  }

  const allSpecies = [...leftList, ...rightList];
  const parsed = allSpecies.map((f) => parseFormulaCounts(f));
  if (parsed.some((p) => !p)) {
    return { ok: false, error: 'Có công thức hóa học không hợp lệ. Hãy kiểm tra chữ hoa/thường (ví dụ: Fe2O3, H2SO4).' };
  }

  const elementSet = new Set<string>();
  parsed.forEach((p) => {
    if (p) Object.keys(p).forEach((el) => elementSet.add(el));
  });
  const elements = Array.from(elementSet);
  const numCols = allSpecies.length;
  const numRows = elements.length;

  // Build matrix: reactants positive, products negative
  const mat: Frac[][] = elements.map((el) =>
    allSpecies.map((_, colIdx) => {
      const cnt = parsed[colIdx]?.[el] || 0;
      const sign = colIdx < leftList.length ? 1n : -1n;
      return { n: BigInt(cnt) * sign, d: 1n };
    })
  );

  // RREF
  let pivotRow = 0;
  const pivotCols: number[] = [];
  for (let col = 0; col < numCols && pivotRow < numRows; col++) {
    let sel = -1;
    for (let r = pivotRow; r < numRows; r++) {
      if (mat[r][col].n !== 0n) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue;
    [mat[pivotRow], mat[sel]] = [mat[sel], mat[pivotRow]];
    const piv = mat[pivotRow][col];
    for (let c = col; c < numCols; c++) {
      mat[pivotRow][c] = divFrac(mat[pivotRow][c], piv);
    }
    for (let r = 0; r < numRows; r++) {
      if (r !== pivotRow && mat[r][col].n !== 0n) {
        const factor = mat[r][col];
        for (let c = col; c < numCols; c++) {
          mat[r][c] = subFrac(mat[r][c], mulFrac(factor, mat[pivotRow][c]));
        }
      }
    }
    pivotCols.push(col);
    pivotRow++;
  }

  const freeCols: number[] = [];
  for (let c = 0; c < numCols; c++) {
    if (!pivotCols.includes(c)) freeCols.push(c);
  }
  if (freeCols.length !== 1) {
    return {
      ok: false,
      error:
        freeCols.length === 0
          ? 'Phương trình không thể cân bằng với các chất đã nhập (kiểm tra bảo toàn nguyên tố).'
          : 'Phương trình có vô số nghiệm độc lập (nhập đúng một phản ứng duy nhất).',
    };
  }

  const freeCol = freeCols[0];
  const sol: Frac[] = Array.from({ length: numCols }, () => ({ n: 0n, d: 1n }));
  sol[freeCol] = { n: 1n, d: 1n };
  pivotCols.forEach((pCol, rIdx) => {
    sol[pCol] = normFrac(-mat[rIdx][freeCol].n, mat[rIdx][freeCol].d);
  });

  if (sol.some((f) => f.n <= 0n)) {
    return { ok: false, error: 'Không tìm được bộ hệ số dương hợp lệ.' };
  }

  let commonDen = 1n;
  sol.forEach((f) => {
    commonDen = lcmBig(commonDen, f.d);
  });
  const ints = sol.map((f) => Number((f.n * commonDen) / f.d));

  const reactants = leftList.map((formula, idx) => ({ coeff: ints[idx], formula }));
  const products = rightList.map((formula, idx) => ({ coeff: ints[leftList.length + idx], formula }));

  const fmtTerm = (t: { coeff: number; formula: string }) => `${t.coeff > 1 ? t.coeff : ''}${t.formula}`;
  return {
    ok: true,
    formatted: `${reactants.map(fmtTerm).join(' + ')} → ${products.map(fmtTerm).join(' + ')}`,
    reactants,
    products,
  };
}

const PRESET_EQUATIONS = [
  'FeS2 + O2 -> Fe2O3 + SO2',
  'Cu + HNO3 -> Cu(NO3)2 + NO + H2O',
  'KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O',
  'Al + NaOH + H2O -> NaAlO2 + H2',
  'Fe3O4 + H2SO4 -> Fe2(SO4)3 + SO2 + H2O',
];

export const StoichiometryTool: React.FC = () => {
  const [eqInput, setEqInput] = useState<string>('Cu + HNO3 -> Cu(NO3)2 + NO + H2O');
  const [molarFormula, setMolarFormula] = useState<string>('CuSO4.5H2O');
  const [massGram, setMassGram] = useState<number>(25);
  const [volMl, setVolMl] = useState<number>(250);

  const balanced = useMemo(() => balanceChemicalEquation(eqInput), [eqInput]);

  const molarResult = useMemo(() => {
    const counts = parseFormulaCounts(molarFormula);
    if (!counts) return null;
    let totalMass = 0;
    const breakdown = Object.entries(counts).map(([el, count]) => {
      const m = ATOMIC_MASS_MAP[el] || 0;
      const contrib = m * count;
      totalMass += contrib;
      return { el, count, atomicMass: m, contrib };
    });
    return { totalMass, breakdown };
  }, [molarFormula]);

  const moles = molarResult && molarResult.totalMass > 0 ? massGram / molarResult.totalMass : 0;
  const gasVolume25 = moles * 24.79;
  const molarityCm = volMl > 0 ? moles / (volMl / 1000) : 0;

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Cân bằng Phương trình &amp; Tính toán Hóa học
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Tự động cân bằng phương trình oxi hóa – khử bằng đại số tuyến tính và tính nhanh khối lượng mol, số mol, nồng độ CM, thể tích khí ở 25°C – 1 bar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Equation Balancer */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Scale className="w-4 h-4 text-teal-700" />
            <span>1. Cân bằng Phương trình Hóa học Tự động</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">
              Nhập phương trình (dùng dấu + và -&gt;, viết đúng hoa/thường kí hiệu nguyên tố):
            </label>
            <input
              type="text"
              value={eqInput}
              onChange={(e) => setEqInput(e.target.value)}
              placeholder="Ví dụ: Fe + HCl -> FeCl2 + H2"
              className="w-full px-4 py-2.5 font-mono text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
            />
          </div>

          {/* Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 block">Phương trình mẫu hay gặp:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_EQUATIONS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setEqInput(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-xs font-mono font-semibold text-slate-700 border border-slate-200 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Output */}
          {balanced.ok ? (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-800 uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Phương trình đã cân bằng:</span>
              </div>
              <div className="text-lg md:text-xl font-mono font-black text-teal-950 break-words">
                {balanced.formatted}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-700">
                <span className="font-bold">Tỉ lệ hệ số:</span>
                <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                  {[...balanced.reactants, ...balanced.products].map((x) => x.coeff).join(' : ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{balanced.error}</span>
            </div>
          )}
        </div>

        {/* Right: Molar Mass & Stoichiometry Calculator */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <ArrowRight className="w-4 h-4 text-teal-700" />
            <span>2. Tính Phân tử khối (M) &amp; Số mol</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">Công thức chất</label>
              <input
                type="text"
                value={molarFormula}
                onChange={(e) => setMolarFormula(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Khối lượng m (g)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={massGram}
                onChange={(e) => setMassGram(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 font-mono text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">V dung dịch (mL)</label>
              <input
                type="number"
                min={1}
                step={10}
                value={volMl}
                onChange={(e) => setVolMl(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 font-mono text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 tabular-nums"
              />
            </div>
          </div>

          {molarResult ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 tabular-nums">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 block">Phân tử khối (M)</span>
                  <strong className="text-lg font-black text-slate-900">
                    {molarResult.totalMass.toFixed(2)} g/mol
                  </strong>
                </div>
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
                  <span className="text-xs text-teal-800 block">Số mol (n = m/M)</span>
                  <strong className="text-lg font-black text-teal-950">{moles.toFixed(4)} mol</strong>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 block">Thể tích khí ĐKC (24,79)</span>
                  <strong className="text-base font-black text-slate-900">{gasVolume25.toFixed(3)} L</strong>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 block">Nồng độ mol (CM)</span>
                  <strong className="text-base font-black text-slate-900">{molarityCm.toFixed(3)} M</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-slate-600 block">Thành phần % khối lượng các nguyên tố:</span>
                <div className="flex flex-wrap gap-2 text-xs tabular-nums">
                  {molarResult.breakdown.map((b) => (
                    <span
                      key={b.el}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      {b.el} × {b.count}: {((b.contrib / molarResult.totalMass) * 100).toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold">
              Công thức chưa hợp lệ (hỗ trợ ngoặc tròn và muối ngậm nước, ví dụ: Al2(SO4)3, CuSO4.5H2O).
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
