import React, { useEffect, useState } from 'react';
import { FlaskConical, Droplets, BatteryCharging, Pipette, Calculator } from 'lucide-react';
import { Lab3D } from './Lab3D';
import { ReactionsIonsSim } from './ReactionsIonsSim';
import { ElectrochemistrySim } from './ElectrochemistrySim';
import { TitrationSim } from './TitrationSim';
import { StoichiometryTool } from './StoichiometryTool';

export type LabSubTabId =
  | 'virtual-lab'
  | 'reactions-ions'
  | 'electrochemistry'
  | 'titration'
  | 'stoichiometry';

interface LabWorkspaceProps {
  initialSubTab?: LabSubTabId;
  onSelectSubTab?: (sub: LabSubTabId) => void;
}

const LAB_SUBTABS: { id: LabSubTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'virtual-lab', label: 'Phòng thí nghiệm ảo 2D/3D', icon: FlaskConical },
  { id: 'reactions-ions', label: 'Phản ứng & Ion', icon: Droplets },
  { id: 'electrochemistry', label: 'Điện hóa & Pin', icon: BatteryCharging },
  { id: 'titration', label: 'Dung dịch & Chuẩn độ', icon: Pipette },
  { id: 'stoichiometry', label: 'Phương trình & Tính toán', icon: Calculator },
];

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({
  initialSubTab = 'virtual-lab',
  onSelectSubTab,
}) => {
  const [activeSub, setActiveSub] = useState<LabSubTabId>(initialSubTab);

  useEffect(() => {
    setActiveSub(initialSubTab);
  }, [initialSubTab]);

  const handleSelect = (id: LabSubTabId) => {
    setActiveSub(id);
    onSelectSubTab?.(id);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
        {LAB_SUBTABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeSub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`px-4 py-2.5 text-[15px] md:text-[16px] font-bold rounded-xl transition-all flex items-center gap-2 min-h-[44px] ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {activeSub === 'virtual-lab' && <Lab3D />}
      {activeSub === 'reactions-ions' && <ReactionsIonsSim />}
      {activeSub === 'electrochemistry' && <ElectrochemistrySim />}
      {activeSub === 'titration' && <TitrationSim />}
      {activeSub === 'stoichiometry' && <StoichiometryTool />}
    </div>
  );
};
