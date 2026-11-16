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

export const LAB2D_WORLD = {
  WIDTH: 900,
  HEIGHT: 480,
  BENCH_SURFACE_Y: 365,
  DEFAULT_Y: 162,
  MARGIN_X: 36,
  MARGIN_TOP: 64,
  MARGIN_BOTTOM: 18,
} as const;

// Complete local bounding box around every 2D vessel (includes top badges, mist, selection ring, bottom label)
export const VESSEL_BOUNDS = {
  MIN_X: -12,
  MAX_X: 122, // width = 134 (centered around local x = 55)
  MIN_Y: -54, // top mist & badges headroom
  MAX_Y: 244, // bottom nameplate bottom + shadow
} as const;

export const clamp2DPosition = (x: number, y: number): { x: number; y: number } => {
  const minX = LAB2D_WORLD.MARGIN_X - VESSEL_BOUNDS.MIN_X;
  const maxX = LAB2D_WORLD.WIDTH - LAB2D_WORLD.MARGIN_X - VESSEL_BOUNDS.MAX_X;
  const minY = LAB2D_WORLD.MARGIN_TOP - VESSEL_BOUNDS.MIN_Y;
  const maxY = LAB2D_WORLD.HEIGHT - LAB2D_WORLD.MARGIN_BOTTOM - VESSEL_BOUNDS.MAX_Y;

  return {
    x: Math.round(Math.max(minX, Math.min(maxX, x))),
    y: Math.round(Math.max(minY, Math.min(maxY, y))),
  };
};

export const computeAutoLayoutContainers = (
  items: ApparatusInstance[]
): ApparatusInstance[] => {
  const count = items.length;
  if (count === 0) return items;

  const vesselWidth = VESSEL_BOUNDS.MAX_X - VESSEL_BOUNDS.MIN_X; // 134
  const vesselCenterOffset = (VESSEL_BOUNDS.MIN_X + VESSEL_BOUNDS.MAX_X) / 2; // 55
  const centerWorldX = LAB2D_WORLD.WIDTH / 2;

  if (count === 1) {
    const pos = clamp2DPosition(centerWorldX - vesselCenterOffset, LAB2D_WORLD.DEFAULT_Y);
    return [{ ...items[0], x: pos.x, y: pos.y }];
  }

  const usableLeft = LAB2D_WORLD.MARGIN_X - VESSEL_BOUNDS.MIN_X;
  const usableRight = LAB2D_WORLD.WIDTH - LAB2D_WORLD.MARGIN_X - VESSEL_BOUNDS.MAX_X;
  const maxSpan = usableRight - usableLeft;
  const idealStep = count <= 3 ? 215 : count === 4 ? 185 : Math.min(165, maxSpan / (count - 1));
  const totalSpan = Math.min(maxSpan, idealStep * (count - 1));
  const step = Math.max(vesselWidth + 4, totalSpan / (count - 1));
  const actualSpan = Math.min(maxSpan, step * (count - 1));
  const startCenterX = centerWorldX - actualSpan / 2;

  return items.map((item, index) => {
    const targetX = startCenterX + index * (actualSpan / (count - 1)) - vesselCenterOffset;
    const pos = clamp2DPosition(targetX, LAB2D_WORLD.DEFAULT_Y);
    return {
      ...item,
      x: pos.x,
      y: pos.y,
    };
  });
};

