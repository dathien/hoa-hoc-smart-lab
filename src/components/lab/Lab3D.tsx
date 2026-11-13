import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChemFormula } from '../common/ChemFormula';
import {
  ApparatusInstance,
  ApparatusType,
  ChemistryAnalysisResult,
  Reagent,
  LabPreset,
  hexToColorString,
} from './labTypes';
import {
  REAGENTS_DATA,
  PRESET_EXPERIMENTS,
  analyzeChemistry,
} from './labReagentsData';
import { LabApparatus2D } from './LabApparatus2D';
import { Lab3DView } from './Lab3DView';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  BookOpen,
  Eye,
  EyeOff,
  Flame,
  AlertTriangle,
  Beaker,
  Thermometer,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  Search,
  CheckCircle2,
  Bookmark,
  Droplets,
  HelpCircle,
  ChevronDown,
  Box,
  Monitor,
  Lightbulb,
  TestTube,
} from 'lucide-react';

// Apparatus palette item definition
interface ApparatusPaletteItem {
  type: ApparatusType;
  label: string;
  defaultCapacity: number;
  description: string;
}

const APPARATUS_PALETTE: ApparatusPaletteItem[] = [
  {
    type: 'test_tube',
    label: 'Ống nghiệm',
    defaultCapacity: 25,
    description: 'Dung tích 25 mL, dùng cho phản ứng định tính vi lượng',
  },
  {
    type: 'beaker_100',
    label: 'Cốc thủy tinh 100 mL',
    defaultCapacity: 100,
    description: 'Cốc mỏ 100 mL chia vạch, pha chế và hòa tan hóa chất',
  },
  {
    type: 'beaker_250',
    label: 'Cốc thủy tinh 250 mL',
    defaultCapacity: 250,
    description: 'Cốc mỏ 250 mL, dùng cho phản ứng thể tích lớn hoặc tỏa nhiệt',
  },
  {
    type: 'erlenmeyer',
    label: 'Bình tam giác',
    defaultCapacity: 150,
    description: 'Bình Erlenmeyer 150 mL, tối ưu cho chuẩn độ và lắc trộn',
  },
  {
    type: 'round_flask',
    label: 'Bình cầu',
    defaultCapacity: 200,
    description: 'Bình đáy tròn chịu nhiệt, dùng cho đun nóng và chưng cất',
  },
  {
    type: 'burner',
    label: 'Đèn cồn',
    defaultCapacity: 100,
    description: 'Nguồn cung cấp nhiệt độ cho các phản ứng cần đun nóng',
  },
];

export const Lab3D: React.FC = () => {
  // Mode selection: 2D Interactive SVG vs 3D Spatial WebGL
  const [labMode, setLabMode] = useState<'2D' | '3D'>('2D');

  // Grade filter for presets
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');

  // Apparatuses currently on workbench (synchronized between 2D and 3D)
  const [containers, setContainers] = useState<ApparatusInstance[]>([
    {
      id: 'tube_1',
      type: 'test_tube',
      name: 'Ống nghiệm 1',
      capacity: 25,
      x: 140,
      y: 190,
      addedReagents: [],
      temperature: 25,
      isHeated: false,
    },
    {
      id: 'beaker_1',
      type: 'beaker_100',
      name: 'Cốc mỏ 100 mL',
      capacity: 100,
      x: 320,
      y: 180,
      addedReagents: [],
      temperature: 25,
      isHeated: false,
    },
    {
      id: 'tube_2',
      type: 'test_tube',
      name: 'Ống nghiệm 2',
      capacity: 25,
      x: 500,
      y: 190,
      addedReagents: [],
      temperature: 25,
      isHeated: false,
    },
  ]);

  const [activeContainerId, setActiveContainerId] = useState<string>('tube_1');
  const [selectedReagentId, setSelectedReagentId] = useState<string>('bacl2');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset_sulfate');

  // Search & Category Filter for Chemicals
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    'all' | 'acid' | 'base' | 'salt' | 'metal' | 'indicator' | 'organic'
  >('all');

  // Parameter Adjustment States
  const [paramVolume, setParamVolume] = useState<number>(5); // mL
  const [paramConcentration, setParamConcentration] = useState<number>(1.0); // M
  const [paramMass, setParamMass] = useState<number>(2.0); // g

  // Animation & notice states
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [pouringReagent, setPouringReagent] = useState<Reagent | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // View & pedagogical controls
  const [showTeacherGuidance, setShowTeacherGuidance] = useState<boolean>(true);
  const [showScientificExplanation, setShowScientificExplanation] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // DOM container ref for fullscreen
  const workbenchContainerRef = useRef<HTMLDivElement>(null);

  // Filtered presets by grade
  const filteredPresets = useMemo(() => {
    if (selectedGrade === 'all') return PRESET_EXPERIMENTS;
    return PRESET_EXPERIMENTS.filter((p) => p.grade === selectedGrade);
  }, [selectedGrade]);

  const selectedPreset =
    PRESET_EXPERIMENTS.find((p) => p.id === selectedPresetId) || PRESET_EXPERIMENTS[0];

  const selectedReagent =
    REAGENTS_DATA.find((r) => r.id === selectedReagentId) || REAGENTS_DATA[0];

  const activeContainer =
    containers.find((c) => c.id === activeContainerId) || containers[0] || null;

  // Real-time analysis for all containers
  const analyses = useMemo(() => {
    const res: Record<string, ChemistryAnalysisResult> = {};
    containers.forEach((c) => {
      res[c.id] = analyzeChemistry(c);
    });
    return res;
  }, [containers]);

  const activeAnalysis = activeContainer ? analyses[activeContainer.id] : null;

  // Show toast notice helper
  const showNotice = (msg: string, duration = 3000) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, duration);
  };

  // Sync default parameters when selected reagent changes
  useEffect(() => {
    if (selectedReagent.defaultVolume) setParamVolume(selectedReagent.defaultVolume);
    if (selectedReagent.defaultConcentration)
      setParamConcentration(selectedReagent.defaultConcentration);
    if (selectedReagent.mass) setParamMass(selectedReagent.mass);
  }, [selectedReagentId]);

  // Fullscreen Handler
  const handleToggleFullscreen = () => {
    const el = workbenchContainerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  // 1. ADD APPARATUS TO WORKBENCH
  const handleAddApparatus = (item: ApparatusPaletteItem) => {
    if (containers.length >= 6) {
      showNotice('Bàn thực hành đã đầy tối đa 6 dụng cụ. Hãy xóa bớt trước khi thêm mới.');
      return;
    }

    const nextIndex = containers.length + 1;
    const newId = `${item.type}_${Date.now()}`;
    const newX = 80 + (containers.length % 4) * 160;
    const newY = 170 + Math.floor(containers.length / 4) * 30;

    const newInstance: ApparatusInstance = {
      id: newId,
      type: item.type,
      name: `${item.label} ${nextIndex}`,
      capacity: item.defaultCapacity,
      x: newX,
      y: newY,
      addedReagents: [],
      temperature: 25,
      isHeated: false,
    };

    setContainers((prev) => [...prev, newInstance]);
    setActiveContainerId(newId);
    showNotice(`Đã đặt ${newInstance.name} lên bàn thực hành.`);
  };

  // 2. UPDATE APPARATUS POSITION (Drag)
  const handleUpdatePosition = (id: string, x: number, y: number) => {
    setContainers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, x, y } : c))
    );
  };

  // 3. REMOVE APPARATUS
  const handleRemoveContainer = (id: string) => {
    setContainers((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeContainerId === id && filtered.length > 0) {
        setActiveContainerId(filtered[0].id);
      }
      return filtered;
    });
    showNotice('Đã xóa dụng cụ khỏi bàn thực hành.');
  };

  // 4. WASH / CLEAN APPARATUS
  const handleWashContainer = (id: string) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              addedReagents: [],
              temperature: 25,
              isHeated: false,
              litmusTested: undefined,
            }
          : c
      )
    );
    showNotice('Đã rửa sạch và làm khô dụng cụ.');
  };

  // 5. TOGGLE HEATER / BURNER
  const handleToggleHeater = (id: string) => {
    setContainers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextHeated = !c.isHeated;
        return {
          ...c,
          isHeated: nextHeated,
          temperature: nextHeated ? Math.min(95, c.temperature + 45) : 25,
        };
      })
    );
    const target = containers.find((c) => c.id === id);
    if (target) {
      showNotice(
        target.isHeated
          ? `Đã tắt đèn cồn dưới ${target.name}. Dụng cụ đang nguội dần.`
          : `Đã thắp đèn cồn đun nóng ${target.name}. Nhiệt độ đang tăng lên!`
      );
    }
  };

  // 6. SHAKE APPARATUS
  const handleShakeContainer = (id: string) => {
    const target = containers.find((c) => c.id === id);
    if (target) {
      showNotice(`Đang lắc nhẹ và đảo đều dung dịch trong ${target.name}...`, 1800);
    }
  };

  // 7. DIP LITMUS PAPER
  const handleDipLitmus = (id: string) => {
    const target = containers.find((c) => c.id === id);
    const targetAnalysis = analyses[id];
    if (!target || !targetAnalysis) return;

    showNotice(`Đang nhúng mẩu giấy quỳ tím vào ${target.name}...`, 1800);

    setTimeout(() => {
      setContainers((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                litmusTested: {
                  color: targetAnalysis.litmusColor,
                  label: targetAnalysis.litmusLabel,
                  pH: targetAnalysis.pHCalc,
                },
              }
            : c
        )
      );
    }, 1000);
  };

  // 8. ADD CHEMICAL REAGENT (With pouring animation)
  const handleAddReagent = () => {
    if (!activeContainer) {
      showNotice('Vui lòng chọn một dụng cụ trên bàn trước khi thêm hóa chất.');
      return;
    }
    if (isPouring) return;

    setIsPouring(true);
    setPouringReagent(selectedReagent);
    showNotice(
      `Đang rót ${selectedReagent.name} (${selectedReagent.formula}) vào ${activeContainer.name}...`,
      1500
    );

    setTimeout(() => {
      setContainers((prev) =>
        prev.map((c) => {
          if (c.id !== activeContainerId) return c;

          const newAdded = [
            ...c.addedReagents,
            {
              reagent: selectedReagent,
              volume: selectedReagent.state !== 'solid' ? paramVolume : undefined,
              concentration:
                selectedReagent.state === 'solution' ? paramConcentration : undefined,
              mass: selectedReagent.state === 'solid' ? paramMass : undefined,
              addedAt: Date.now(),
            },
          ];

          // Auto exothermic temperature bump if SO3 added to water
          let newTemp = c.temperature;
          if (
            selectedReagent.id === 'so3' &&
            c.addedReagents.some((ar) => ar.reagent.id === 'water')
          ) {
            newTemp = Math.min(95, newTemp + 55);
          }

          return {
            ...c,
            addedReagents: newAdded,
            temperature: newTemp,
          };
        })
      );
      setIsPouring(false);
      setPouringReagent(null);
    }, 900);
  };

  // 9. LOAD EXPERIMENT PRESET
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_EXPERIMENTS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);

    // Setup apparatus matching preset
    const targetId = `preset_container_${Date.now()}`;
    const targetApparatus: ApparatusInstance = {
      id: targetId,
      type: preset.apparatusType,
      name: `${preset.apparatusType === 'test_tube' ? 'Ống nghiệm' : 'Cốc thủy tinh'} Thí nghiệm`,
      capacity: preset.apparatusType === 'test_tube' ? 25 : 100,
      x: 240,
      y: 180,
      addedReagents: preset.reagentsToAdd.map((item) => {
        const reagentObj = REAGENTS_DATA.find((r) => r.id === item.reagentId)!;
        return {
          reagent: reagentObj,
          volume: item.volume || reagentObj.defaultVolume,
          concentration: item.concentration || reagentObj.defaultConcentration,
          mass: item.mass || reagentObj.mass,
          addedAt: Date.now(),
        };
      }),
      temperature: preset.shouldHeat ? 85 : 25,
      isHeated: Boolean(preset.shouldHeat),
    };

    setContainers([targetApparatus]);
    setActiveContainerId(targetId);
    setShowScientificExplanation(false); // Hide explanation initially so students predict first!
    showNotice(`Đã nạp thí nghiệm GDPT 2018: "${preset.title}".`, 3000);
  };

  // 10. RESET ALL BENCH
  const handleResetAll = () => {
    setContainers([
      {
        id: 'tube_1',
        type: 'test_tube',
        name: 'Ống nghiệm 1',
        capacity: 25,
        x: 180,
        y: 190,
        addedReagents: [],
        temperature: 25,
        isHeated: false,
      },
      {
        id: 'beaker_1',
        type: 'beaker_100',
        name: 'Cốc mỏ 100 mL',
        capacity: 100,
        x: 360,
        y: 180,
        addedReagents: [],
        temperature: 25,
        isHeated: false,
      },
    ]);
    setActiveContainerId('tube_1');
    showNotice('Đã đặt lại toàn bộ bàn thí nghiệm về trạng thái ban đầu.');
  };

  // Filter chemicals
  const filteredReagents = useMemo(() => {
    return REAGENTS_DATA.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.iupacName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategoryFilter === 'all' || r.category === activeCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategoryFilter]);

  return (
    <div
      ref={workbenchContainerRef}
      className={`space-y-4 max-w-7xl mx-auto font-sans transition-colors ${
        isFullscreen ? 'bg-slate-950 p-6 text-white min-h-screen overflow-y-auto' : ''
      }`}
    >
      {/* 1. TOP HEADER & PEDAGOGICAL CONTROL BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-teal-700 text-white shadow-xs">
                <Beaker className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Phòng thực hành Hóa học 2D/3D
                </h1>
                <p className="text-[15px] font-semibold text-slate-500 mt-0.5">
                  Bàn thí nghiệm tương tác trực tiếp • Hóa học THPT 10, 11, 12 • Chương trình GDPT 2018
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switch: 2D vs 3D & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* 2D / 3D Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLabMode('2D')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-black transition-all ${
                  labMode === '2D'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>2D Trực quan</span>
              </button>
              <button
                onClick={() => setLabMode('3D')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-black transition-all ${
                  labMode === '3D'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Box className="w-4 h-4" />
                <span>3D Không gian</span>
              </button>
            </div>

            {/* Toggle Teacher Guidance */}
            <button
              onClick={() => setShowTeacherGuidance(!showTeacherGuidance)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl border transition-all ${
                showTeacherGuidance
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Ẩn/Hiện lời dẫn và quy trình thực hành của giáo viên"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>{showTeacherGuidance ? 'Ẩn lời dẫn' : 'Lời dẫn giáo viên'}</span>
            </button>

            {/* Toggle Explanation (Hide for predictions) */}
            <button
              onClick={() => setShowScientificExplanation(!showScientificExplanation)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl border transition-all ${
                showScientificExplanation
                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Ẩn/Hiện giải thích bản chất để học sinh dự đoán trước"
            >
              {showScientificExplanation ? (
                <>
                  <EyeOff className="w-4 h-4 text-purple-600" />
                  <span>Ẩn giải thích</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>Hiện giải thích</span>
                </>
              )}
            </button>

            {/* Reset Bench */}
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shadow-2xs"
              title="Đặt lại toàn bộ bàn thí nghiệm"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Làm lại</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình trình chiếu'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Experiment Filter & Preset Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          {/* Grade Selector Pills */}
          <div className="md:col-span-4 flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Khối lớp:
            </span>
            {(
              [
                { id: 'all', label: 'Tất cả' },
                { id: 10, label: 'Lớp 10' },
                { id: 11, label: 'Lớp 11' },
                { id: 12, label: 'Lớp 12' },
              ] as const
            ).map((grade) => (
              <button
                key={grade.id}
                onClick={() => setSelectedGrade(grade.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  selectedGrade === grade.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {grade.label}
              </button>
            ))}
          </div>

          {/* Preset Dropdown */}
          <div className="md:col-span-8 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Bài thí nghiệm:
            </span>
            <div className="relative flex-1">
              <select
                value={selectedPresetId}
                onChange={(e) => handleLoadPreset(e.target.value)}
                className="w-full appearance-none pl-3 pr-10 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-[15px] font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer shadow-2xs"
              >
                {filteredPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    [Lớp {preset.grade}] {preset.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Selected Experiment Context Banner */}
        <div className="p-3.5 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-sky-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-black rounded-md bg-teal-700 text-white uppercase tracking-wider">
                Lớp {selectedPreset.grade}
              </span>
              <span className="text-[15px] font-extrabold text-teal-950">
                {selectedPreset.lesson}
              </span>
            </div>
            <p className="text-[15px] text-teal-900 font-medium leading-relaxed">
              <strong>Mục tiêu khám phá:</strong> {selectedPreset.objective}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap self-end sm:self-center">
            Dụng cụ đề xuất:{' '}
            <strong className="text-teal-800">
              {selectedPreset.apparatusType === 'test_tube'
                ? 'Ống nghiệm'
                : selectedPreset.apparatusType === 'erlenmeyer'
                ? 'Bình tam giác'
                : 'Cốc thủy tinh'}
            </strong>
          </span>
        </div>

        {/* Teacher Guidance Accordion (when enabled) */}
        {showTeacherGuidance && (
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Quy trình sư phạm 4 bước: Quan sát → Thao tác → Nhận xét → Khắc sâu</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-medium text-amber-950">
              <div className="p-2 bg-white/70 rounded-lg border border-amber-200">
                <strong>1. Chọn dụng cụ:</strong> Nhấn dụng cụ ở khay bên dưới để đưa lên bàn.
              </div>
              <div className="p-2 bg-white/70 rounded-lg border border-amber-200">
                <strong>2. Thêm hóa chất:</strong> Chọn chất ở khay, chỉnh mL/gam rồi nhấn "Thêm vào".
              </div>
              <div className="p-2 bg-white/70 rounded-lg border border-amber-200">
                <strong>3. Thao tác bổ trợ:</strong> Lắc nhẹ, đun đèn cồn hoặc nhúng quỳ tím trực tiếp.
              </div>
              <div className="p-2 bg-white/70 rounded-lg border border-amber-200">
                <strong>4. Dự đoán & Kết luận:</strong> Đặt câu hỏi cho học sinh trước khi mở phần giải thích.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Toast Bubble */}
      {actionNotice && (
        <div className="p-3 bg-teal-900 text-white rounded-xl shadow-lg border border-teal-700 flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
          <span className="text-[16px] font-bold">{actionNotice}</span>
        </div>
      )}

      {/* 2. KHAY DỤNG CỤ THÍ NGHIỆM (APPARATUS TRAY) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-teal-600" />
            <span>Khay dụng cụ thí nghiệm (Nhấn để đưa lên bàn thực hành)</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {containers.length}/6 dụng cụ trên bàn
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {APPARATUS_PALETTE.map((item) => (
            <button
              key={item.type}
              onClick={() => handleAddApparatus(item)}
              className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/70 text-left transition-all group shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[74px]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[15px] font-extrabold text-slate-800 group-hover:text-teal-900">
                  {item.label}
                </span>
                <Plus className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-1">
                {item.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN WORKBENCH GRID: (2D/3D Canvas + Reagent Tray) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Interactive Workbench Canvas (2D or 3D) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Top Toolbar of Canvas: Current active container selector buttons */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-700">Dụng cụ đang chọn:</span>
                <div className="flex flex-wrap gap-1.5">
                  {containers.map((c) => {
                    const isSelected = activeContainerId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveContainerId(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Chế độ: <strong className="text-teal-800">{labMode}</strong>
              </span>
            </div>

            {/* Canvas Area: Toggle between 2D SVG Canvas and 3D WebGL Canvas */}
            <div className="p-2 sm:p-3 bg-slate-950">
              {labMode === '2D' ? (
                <LabApparatus2D
                  containers={containers}
                  activeContainerId={activeContainerId}
                  onSelectContainer={(id) => setActiveContainerId(id)}
                  onUpdateContainerPosition={handleUpdatePosition}
                  onRemoveContainer={handleRemoveContainer}
                  onWashContainer={handleWashContainer}
                  onToggleHeater={handleToggleHeater}
                  onShakeContainer={handleShakeContainer}
                  onDipLitmus={handleDipLitmus}
                  isPouring={isPouring}
                  pouringReagent={pouringReagent}
                  analyses={analyses}
                />
              ) : (
                <Lab3DView
                  containers={containers}
                  activeContainerId={activeContainerId}
                  onSelectContainer={(id) => setActiveContainerId(id)}
                  analyses={analyses}
                  isPouring={isPouring}
                  pouringReagent={pouringReagent}
                />
              )}
            </div>
          </div>

          {/* 4. REAL-TIME PHENOMENON & SCIENTIFIC OBSERVATION PANEL */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                Hiện tượng quan sát thực tế & Báo cáo phản ứng
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <span className="text-[15px] font-mono font-bold text-amber-900">
                  {activeAnalysis?.temperatureCalc || 25}°C
                </span>
              </div>
            </div>

            {/* Observable Signs Card */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
                Dấu hiệu nhận biết:
              </span>
              <p className="text-[17px] text-teal-950 font-semibold leading-relaxed">
                {activeAnalysis?.phenomenon || 'Chưa chọn dụng cụ.'}
              </p>
            </div>

            {/* Litmus Paper Test Result Banner if tested */}
            {activeContainer?.litmusTested && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-10 rounded-sm border border-slate-400 shadow-xs shrink-0"
                    style={{ backgroundColor: activeContainer.litmusTested.color }}
                  />
                  <div>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                      Kết quả thử quỳ tím:
                    </span>
                    <span className="text-[16px] font-black text-purple-950">
                      {activeContainer.litmusTested.label}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white border border-purple-200 rounded-lg text-sm font-black text-purple-900 font-mono">
                  pH ≈ {activeContainer.litmusTested.pH}
                </div>
              </div>
            )}

            {/* Toggleable Scientific Mechanism & Equations */}
            {activeAnalysis?.hasReacted && (
              <div className="space-y-3 pt-1">
                {showScientificExplanation ? (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Phương trình hóa học phân tử:
                      </span>
                      <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[19px] font-semibold text-slate-900 overflow-x-auto">
                        <ChemFormula formula={activeAnalysis.equation} isBlock />
                      </div>
                    </div>

                    {activeAnalysis.ionEquation && (
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Phương trình ion rút gọn (GDPT 2018):
                        </span>
                        <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[19px] font-semibold text-teal-800 overflow-x-auto">
                          <ChemFormula formula={activeAnalysis.ionEquation} isBlock />
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Giải thích cơ chế khoa học:
                      </span>
                      <p className="mt-1 text-[16px] text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {activeAnalysis.scientificExplanation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-purple-50/60 border border-dashed border-purple-300 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-purple-900">
                      <HelpCircle className="w-5 h-5 text-purple-600 shrink-0" />
                      <p className="text-sm font-semibold">
                        Phương trình & giải thích đang được ẩn để học sinh tự quan sát và dự đoán.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowScientificExplanation(true)}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-black shrink-0 transition-all shadow-xs"
                    >
                      Hiện lời giải
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Safety Warning */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  Cảnh báo an toàn hóa chất:
                </span>
                <p className="text-[14px] text-amber-900 mt-0.5 leading-relaxed font-medium">
                  {activeAnalysis?.safetyWarning ||
                    'Luôn đeo kính bảo hộ và găng tay khi thao tác với hóa chất trong phòng thí nghiệm.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Reagent Tray, Search, Parameters & Add Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                Khay hóa chất thí nghiệm
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {filteredReagents.length}/{REAGENTS_DATA.length} hóa chất
              </span>
            </div>

            {/* Search Input for Chemicals */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm hóa chất (tên, công thức BaCl2, CuSO4...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[15px] font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-2xs"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'acid', label: 'Axit' },
                  { id: 'base', label: 'Bazơ' },
                  { id: 'salt', label: 'Muối' },
                  { id: 'metal', label: 'Kim loại' },
                  { id: 'indicator', label: 'Chỉ thị' },
                  { id: 'organic', label: 'Hữu cơ' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeCategoryFilter === cat.id
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Chemical Cards Selector Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto p-1 pr-1.5">
              {filteredReagents.map((reagent) => {
                const isSelected = selectedReagentId === reagent.id;
                return (
                  <button
                    key={reagent.id}
                    onClick={() => setSelectedReagentId(reagent.id)}
                    className={`p-3 rounded-xl border text-left transition-all min-h-[60px] flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/90 shadow-xs ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[17px] font-black text-slate-900 block">
                          <ChemFormula formula={reagent.formula} />
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            reagent.category === 'acid'
                              ? 'bg-rose-100 text-rose-800'
                              : reagent.category === 'base'
                              ? 'bg-blue-100 text-blue-800'
                              : reagent.category === 'salt'
                              ? 'bg-purple-100 text-purple-800'
                              : reagent.category === 'metal'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {reagent.state === 'solid'
                            ? 'Rắn'
                            : reagent.state === 'gas'
                            ? 'Khí'
                            : reagent.state === 'indicator'
                            ? 'Chỉ thị'
                            : 'Dung dịch'}
                        </span>
                      </div>
                      <span className="text-[12px] text-slate-600 font-semibold block leading-tight mt-1 truncate">
                        {reagent.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Chemical Detail & Parameter Adjustments */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Đang chọn hóa chất:
                  </span>
                  <span className="text-[17px] font-black text-slate-900">
                    <ChemFormula formula={selectedReagent.formula} /> – {selectedReagent.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {selectedReagent.iupacName}
                </span>
              </div>

              {/* Dynamic Parameter Sliders: Only relevant parameters shown */}
              {selectedReagent.state === 'solid' ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Khối lượng chất rắn:</span>
                    <span className="text-sm font-black text-teal-800 font-mono">{paramMass} g</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.5"
                    value={paramMass}
                    onChange={(e) => setParamMass(parseFloat(e.target.value))}
                    className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Thể tích thêm vào:</span>
                      <span className="text-sm font-black text-teal-800 font-mono">
                        {paramVolume} mL
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="1"
                      value={paramVolume}
                      onChange={(e) => setParamVolume(parseInt(e.target.value, 10))}
                      className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {selectedReagent.state === 'solution' && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                        <span>Nồng độ mol:</span>
                        <span className="text-sm font-black text-teal-800 font-mono">
                          {paramConcentration} M
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={paramConcentration}
                        onChange={(e) => setParamConcentration(parseFloat(e.target.value))}
                        className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Add to Active Container CTA Button */}
              <button
                onClick={handleAddReagent}
                disabled={isPouring || !activeContainer}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-base font-black text-white shadow-md transition-all ${
                  isPouring || !activeContainer
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-teal-700 hover:bg-teal-800 hover:shadow-lg active:scale-98'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span>
                  {activeContainer
                    ? `Thêm vào ${activeContainer.name}`
                    : 'Chọn dụng cụ để thêm'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
