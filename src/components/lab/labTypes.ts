export const hexToColorString = (hexNum: number): string => {
  return '#' + hexNum.toString(16).padStart(6, '0');
};

export type ApparatusType =
  | 'test_tube'
  | 'beaker_100'
  | 'beaker_250'
  | 'erlenmeyer'
  | 'round_flask'
  | 'burner';

export interface Reagent {
  id: string;
  name: string;
  iupacName: string;
  formula: string;
  state: 'solution' | 'solid' | 'gas' | 'indicator';
  defaultColor: number; // Hex color for 3D/2D
  opacity: number;
  category: 'acid' | 'base' | 'salt' | 'metal' | 'oxide' | 'indicator' | 'organic';
  defaultConcentration?: number; // M
  defaultVolume?: number; // mL
  mass?: number; // g
  description: string;
}

export interface AddedReagentItem {
  reagent: Reagent;
  volume?: number; // mL
  concentration?: number; // M
  mass?: number; // g
  addedAt: number;
}

export interface ApparatusInstance {
  id: string;
  type: ApparatusType;
  name: string;
  capacity: number; // mL max
  x: number; // 2D canvas X
  y: number; // 2D canvas Y
  addedReagents: AddedReagentItem[];
  temperature: number; // °C
  isHeated: boolean;
  litmusTested?: {
    color: string;
    label: string;
    pH: number;
  };
}

export interface ChemistryAnalysisResult {
  hasReacted: boolean;
  equation: string;
  ionEquation: string;
  phenomenon: string;
  scientificExplanation: string;
  safetyWarning: string;
  liquidColor: number;
  liquidHex: string;
  liquidOpacity: number;
  totalVolume: number;
  precipitateColor: number | null;
  precipitateHex: string | null;
  precipitateHeight: number;
  hasGasBubbles: boolean;
  gasBubbleSpeed: number;
  gasType?: string;
  hasThermalMist: boolean;
  metalSurfaceColor: number | null;
  temperatureCalc: number;
  pHCalc: number;
  litmusColor: string;
  litmusLabel: string;
}

export interface LabPreset {
  id: string;
  grade: 10 | 11 | 12;
  title: string;
  lesson: string;
  objective: string;
  apparatusType: ApparatusType;
  reagentsToAdd: {
    reagentId: string;
    volume?: number;
    concentration?: number;
    mass?: number;
  }[];
  shouldHeat?: boolean;
}
