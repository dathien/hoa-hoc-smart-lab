import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Box, Pause, Play, RotateCcw, Search, Eye, EyeOff, Info } from 'lucide-react';
import { ChemFormula } from '../common/ChemFormula';

interface AtomSpec {
  id: string;
  el: string;
  pos: [number, number, number];
  charge?: string;
}

interface BondSpec {
  a: number;
  b: number;
  order: 1 | 2 | 3 | 1.5;
}

interface MoleculeSpec {
  id: string;
  formula: string;
  latex: string;
  name: string;
  category: 'Vô cơ' | 'Hữu cơ' | 'Tinh thể ion';
  grade: '10' | '11' | '12';
  vsepr: string;
  geometry: string;
  hybridization: string;
  bondAngle: string;
  polarity: 'Không phân cực' | 'Phân cực' | 'Mạng tinh thể ion';
  description: string;
  atoms: AtomSpec[];
  bonds: BondSpec[];
}

const CPK_COLORS: Record<string, { color: number; radius: number; hex: string; label: string }> = {
  H: { color: 0xf8fafc, radius: 0.34, hex: '#f8fafc', label: 'H (Trắng)' },
  C: { color: 0x334155, radius: 0.56, hex: '#334155', label: 'C (Xám đậm)' },
  N: { color: 0x2563eb, radius: 0.54, hex: '#2563eb', label: 'N (Xanh lam)' },
  O: { color: 0xdc2626, radius: 0.52, hex: '#dc2626', label: 'O (Đỏ)' },
  S: { color: 0xeab308, radius: 0.68, hex: '#eab308', label: 'S (Vàng)' },
  P: { color: 0xf97316, radius: 0.66, hex: '#f97316', label: 'P (Cam)' },
  Cl: { color: 0x16a34a, radius: 0.64, hex: '#16a34a', label: 'Cl (Xanh lá)' },
  F: { color: 0x22d3ee, radius: 0.46, hex: '#22d3ee', label: 'F (Lục nhạt)' },
  Na: { color: 0x7c3aed, radius: 0.52, hex: '#7c3aed', label: 'Na⁺ (Tím)' },
  Cu: { color: 0xd97706, radius: 0.68, hex: '#d97706', label: 'Cu (Đồng)' },
};

const MOLECULES_3D: MoleculeSpec[] = [
  {
    id: 'H2O',
    formula: 'H₂O',
    latex: 'H_2O',
    name: 'Nước (Water)',
    category: 'Vô cơ',
    grade: '10',
    vsepr: 'AX₂E₂',
    geometry: 'Chữ V (Gấp khúc)',
    hybridization: 'sp³',
    bondAngle: '104,5°',
    polarity: 'Phân cực',
    description:
      'Nguyên tử Oxi ở trạng thái lai hóa sp³ với 2 cặp electron không liên kết đẩy mạnh hai liên kết O–H, thu hẹp góc H–O–H xuống 104,5°.',
    atoms: [
      { id: 'O1', el: 'O', pos: [0, 0.28, 0] },
      { id: 'H1', el: 'H', pos: [-1.18, -0.62, 0] },
      { id: 'H2', el: 'H', pos: [1.18, -0.62, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
    ],
  },
  {
    id: 'NH3',
    formula: 'NH₃',
    latex: 'NH_3',
    name: 'Amoniac (Ammonia)',
    category: 'Vô cơ',
    grade: '11',
    vsepr: 'AX₃E₁',
    geometry: 'Chóp tam giác',
    hybridization: 'sp³',
    bondAngle: '107°',
    polarity: 'Phân cực',
    description:
      'Nguyên tử Nitơ lai hóa sp³ còn 1 cặp electron tự do ở đỉnh chóp đẩy 3 cặp liên kết N–H, tạo góc H–N–H 107° và phân tử phân cực mạnh.',
    atoms: [
      { id: 'N1', el: 'N', pos: [0, 0.48, 0] },
      { id: 'H1', el: 'H', pos: [1.28, -0.35, 0] },
      { id: 'H2', el: 'H', pos: [-0.64, -0.35, 1.11] },
      { id: 'H3', el: 'H', pos: [-0.64, -0.35, -1.11] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
    ],
  },
  {
    id: 'CH4',
    formula: 'CH₄',
    latex: 'CH_4',
    name: 'Methane',
    category: 'Hữu cơ',
    grade: '11',
    vsepr: 'AX₄',
    geometry: 'Tứ diện đều',
    hybridization: 'sp³',
    bondAngle: '109,5°',
    polarity: 'Không phân cực',
    description:
      'Carbon lai hóa sp³ liên kết với 4 nguyên tử H hướng về 4 đỉnh của tứ diện đều đối xứng hoàn toàn nên phân tử không phân cực.',
    atoms: [
      { id: 'C1', el: 'C', pos: [0, 0, 0] },
      { id: 'H1', el: 'H', pos: [0, 1.5, 0] },
      { id: 'H2', el: 'H', pos: [1.41, -0.5, 0] },
      { id: 'H3', el: 'H', pos: [-0.71, -0.5, 1.22] },
      { id: 'H4', el: 'H', pos: [-0.71, -0.5, -1.22] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
    ],
  },
  {
    id: 'CO2',
    formula: 'CO₂',
    latex: 'CO_2',
    name: 'Carbon dioxide',
    category: 'Vô cơ',
    grade: '10',
    vsepr: 'AX₂',
    geometry: 'Đường thẳng',
    hybridization: 'sp',
    bondAngle: '180°',
    polarity: 'Không phân cực',
    description:
      'Carbon lai hóa sp tạo 2 liên kết đôi C=O đối xứng ở hai phía, góc liên kết O=C=O bằng 180°, hai vector lưỡng cực triệt tiêu nhau.',
    atoms: [
      { id: 'C1', el: 'C', pos: [0, 0, 0] },
      { id: 'O1', el: 'O', pos: [-1.7, 0, 0] },
      { id: 'O2', el: 'O', pos: [1.7, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
  },
  {
    id: 'SO2',
    formula: 'SO₂',
    latex: 'SO_2',
    name: 'Sulfur dioxide',
    category: 'Vô cơ',
    grade: '11',
    vsepr: 'AX₂E₁',
    geometry: 'Chữ V (Gấp khúc)',
    hybridization: 'sp²',
    bondAngle: '119°',
    polarity: 'Phân cực',
    description:
      'Lưu huỳnh lai hóa sp² còn 1 cặp electron tự do làm phân tử có hình chữ V với góc liên kết O–S–O khoảng 119°.',
    atoms: [
      { id: 'S1', el: 'S', pos: [0, 0.35, 0] },
      { id: 'O1', el: 'O', pos: [-1.45, -0.5, 0] },
      { id: 'O2', el: 'O', pos: [1.45, -0.5, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
  },
  {
    id: 'SO3',
    formula: 'SO₃',
    latex: 'SO_3',
    name: 'Sulfur trioxide',
    category: 'Vô cơ',
    grade: '11',
    vsepr: 'AX₃',
    geometry: 'Tam giác phẳng',
    hybridization: 'sp²',
    bondAngle: '120°',
    polarity: 'Không phân cực',
    description:
      'Lưu huỳnh trung tâm lai hóa sp² gắn với 3 Oxi nằm trên cùng một mặt phẳng hướng về 3 đỉnh tam giác đều.',
    atoms: [
      { id: 'S1', el: 'S', pos: [0, 0, 0] },
      { id: 'O1', el: 'O', pos: [0, 1.72, 0] },
      { id: 'O2', el: 'O', pos: [1.49, -0.86, 0] },
      { id: 'O3', el: 'O', pos: [-1.49, -0.86, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
      { a: 0, b: 3, order: 2 },
    ],
  },
  {
    id: 'H2SO4',
    formula: 'H₂SO₄',
    latex: 'H_2SO_4',
    name: 'Sulfuric acid',
    category: 'Vô cơ',
    grade: '11',
    vsepr: 'AX₄',
    geometry: 'Tứ diện lệch',
    hybridization: 'sp³',
    bondAngle: '104°–124°',
    polarity: 'Phân cực',
    description:
      'Nguyên tử Lưu huỳnh ở tâm tứ diện liên kết đôi với 2 Oxi (=O) và liên kết đơn với 2 nhóm –OH phân cực mạnh.',
    atoms: [
      { id: 'S1', el: 'S', pos: [0, 0, 0] },
      { id: 'O1', el: 'O', pos: [0, 1.45, 0.9] },
      { id: 'O2', el: 'O', pos: [0, 1.45, -0.9] },
      { id: 'O3', el: 'O', pos: [-1.35, -0.95, 0] },
      { id: 'O4', el: 'O', pos: [1.35, -0.95, 0] },
      { id: 'H1', el: 'H', pos: [-2.15, -0.35, 0.35] },
      { id: 'H2', el: 'H', pos: [2.15, -0.35, -0.35] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 3, b: 5, order: 1 },
      { a: 4, b: 6, order: 1 },
    ],
  },
  {
    id: 'C2H4',
    formula: 'C₂H₄',
    latex: 'CH_2=CH_2',
    name: 'Ethylene (Ethene)',
    category: 'Hữu cơ',
    grade: '11',
    vsepr: 'AX₃ (mỗi C)',
    geometry: 'Phẳng (Tam giác phẳng tại mỗi C)',
    hybridization: 'sp²',
    bondAngle: '120°',
    polarity: 'Không phân cực',
    description:
      'Hai nguyên tử C lai hóa sp² tạo 1 liên kết σ và 1 liên kết π (liên kết đôi C=C). Tất cả 6 nguyên tử nằm trên cùng một mặt phẳng.',
    atoms: [
      { id: 'C1', el: 'C', pos: [-0.85, 0, 0] },
      { id: 'C2', el: 'C', pos: [0.85, 0, 0] },
      { id: 'H1', el: 'H', pos: [-1.65, 1.15, 0] },
      { id: 'H2', el: 'H', pos: [-1.65, -1.15, 0] },
      { id: 'H3', el: 'H', pos: [1.65, 1.15, 0] },
      { id: 'H4', el: 'H', pos: [1.65, -1.15, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 1, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 },
    ],
  },
  {
    id: 'C2H2',
    formula: 'C₂H₂',
    latex: 'CH\\equiv CH',
    name: 'Acetylene (Ethyne)',
    category: 'Hữu cơ',
    grade: '11',
    vsepr: 'AX₂ (mỗi C)',
    geometry: 'Thẳng hàng',
    hybridization: 'sp',
    bondAngle: '180°',
    polarity: 'Không phân cực',
    description:
      'Hai nguyên tử C lai hóa sp tạo liên kết ba (1σ + 2π) rất bền, cả 4 nguyên tử thẳng hàng trên một trục.',
    atoms: [
      { id: 'C1', el: 'C', pos: [-0.75, 0, 0] },
      { id: 'C2', el: 'C', pos: [0.75, 0, 0] },
      { id: 'H1', el: 'H', pos: [-2.05, 0, 0] },
      { id: 'H2', el: 'H', pos: [2.05, 0, 0] },
    ],
    bonds: [
      { a: 0, b: 1, order: 3 },
      { a: 0, b: 2, order: 1 },
      { a: 1, b: 3, order: 1 },
    ],
  },
  {
    id: 'C6H6',
    formula: 'C₆H₆',
    latex: 'C_6H_6',
    name: 'Benzene',
    category: 'Hữu cơ',
    grade: '11',
    vsepr: 'Lục giác đều phẳng',
    geometry: 'Lục giác đều phẳng',
    hybridization: 'sp²',
    bondAngle: '120°',
    polarity: 'Không phân cực',
    description:
      'Sáu nguyên tử C lai hóa sp² tạo vòng lục giác đều phẳng với hệ electron π liên hợp giải tỏa đều trên toàn vòng.',
    atoms: [
      ...[0, 1, 2, 3, 4, 5].map((k) => {
        const ang = (k * Math.PI) / 3;
        return {
          id: `C${k + 1}`,
          el: 'C',
          pos: [1.55 * Math.cos(ang), 1.55 * Math.sin(ang), 0] as [number, number, number],
        };
      }),
      ...[0, 1, 2, 3, 4, 5].map((k) => {
        const ang = (k * Math.PI) / 3;
        return {
          id: `H${k + 1}`,
          el: 'H',
          pos: [2.65 * Math.cos(ang), 2.65 * Math.sin(ang), 0] as [number, number, number],
        };
      }),
    ],
    bonds: [
      { a: 0, b: 1, order: 1.5 },
      { a: 1, b: 2, order: 1.5 },
      { a: 2, b: 3, order: 1.5 },
      { a: 3, b: 4, order: 1.5 },
      { a: 4, b: 5, order: 1.5 },
      { a: 5, b: 0, order: 1.5 },
      { a: 0, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 },
      { a: 2, b: 8, order: 1 },
      { a: 3, b: 9, order: 1 },
      { a: 4, b: 10, order: 1 },
      { a: 5, b: 11, order: 1 },
    ],
  },
  {
    id: 'SF6',
    formula: 'SF₆',
    latex: 'SF_6',
    name: 'Sulfur hexafluoride',
    category: 'Vô cơ',
    grade: '10',
    vsepr: 'AX₆',
    geometry: 'Bát diện đều',
    hybridization: 'sp³d²',
    bondAngle: '90°',
    polarity: 'Không phân cực',
    description:
      'Lưu huỳnh trung tâm liên kết với 6 nguyên tử Flo hướng về 6 đỉnh bát diện đều đối xứng hoàn toàn.',
    atoms: [
      { id: 'S1', el: 'S', pos: [0, 0, 0] },
      { id: 'F1', el: 'F', pos: [1.7, 0, 0] },
      { id: 'F2', el: 'F', pos: [-1.7, 0, 0] },
      { id: 'F3', el: 'F', pos: [0, 1.7, 0] },
      { id: 'F4', el: 'F', pos: [0, -1.7, 0] },
      { id: 'F5', el: 'F', pos: [0, 0, 1.7] },
      { id: 'F6', el: 'F', pos: [0, 0, -1.7] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 0, b: 5, order: 1 },
      { a: 0, b: 6, order: 1 },
    ],
  },
  {
    id: 'PCl5',
    formula: 'PCl₅',
    latex: 'PCl_5',
    name: 'Phosphorus pentachloride',
    category: 'Vô cơ',
    grade: '10',
    vsepr: 'AX₅',
    geometry: 'Lưỡng chóp tam giác',
    hybridization: 'sp³d',
    bondAngle: '90° và 120°',
    polarity: 'Không phân cực',
    description:
      'Ba nguyên tử Cl nằm ở mặt phẳng xích đạo (góc 120°) và 2 nguyên tử Cl nằm ở trục thẳng đứng (vuông góc 90°).',
    atoms: [
      { id: 'P1', el: 'P', pos: [0, 0, 0] },
      { id: 'Cl1', el: 'Cl', pos: [0, 1.85, 0] },
      { id: 'Cl2', el: 'Cl', pos: [0, -1.85, 0] },
      { id: 'Cl3', el: 'Cl', pos: [1.75, 0, 0] },
      { id: 'Cl4', el: 'Cl', pos: [-0.88, 0, 1.52] },
      { id: 'Cl5', el: 'Cl', pos: [-0.88, 0, -1.52] },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 0, b: 5, order: 1 },
    ],
  },
  {
    id: 'NaCl',
    formula: 'NaCl',
    latex: 'NaCl',
    name: 'Mạng tinh thể Sodium chloride',
    category: 'Tinh thể ion',
    grade: '10',
    vsepr: 'Ô mạng lập phương tâm diện (số phối trí 6)',
    geometry: 'Mạng lập phương ion Na⁺ / Cl⁻',
    hybridization: 'Liên kết ion',
    bondAngle: '90°',
    polarity: 'Mạng tinh thể ion',
    description:
      'Mỗi ion Na⁺ được bao quanh bởi 6 ion Cl⁻ theo hình bát diện và ngược lại, tạo mạng tinh thể ion rất bền, nhiệt độ nóng chảy 801°C.',
    atoms: (() => {
      const list: AtomSpec[] = [];
      let idx = 0;
      const step = 1.35;
      for (let x = -1; x <= 1; x += 2) {
        for (let y = -1; y <= 1; y += 2) {
          for (let z = -1; z <= 1; z += 2) {
            const isNa = ((x + 1) / 2 + (y + 1) / 2 + (z + 1) / 2) % 2 === 0;
            list.push({
              id: `I${idx++}`,
              el: isNa ? 'Na' : 'Cl',
              pos: [x * step * 0.85, y * step * 0.85, z * step * 0.85],
            });
          }
        }
      }
      return list;
    })(),
    bonds: (() => {
      const b: BondSpec[] = [];
      // Connect adjacent corners of the 2x2x2 cube
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          const diff = (i ^ j);
          if (diff === 1 || diff === 2 || diff === 4) {
            b.push({ a: i, b: j, order: 1 });
          }
        }
      }
      return b;
    })(),
  },
];

function createCylinderBetween(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  radius: number,
  material: THREE.Material
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, 18);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(p1).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}

export const Molecules3DExplorer: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('H2O');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Vô cơ' | 'Hữu cơ' | 'Tinh thể ion'>('ALL');
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [webglFallback, setWebglFallback] = useState(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const filteredMolecules = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return MOLECULES_3D.filter((m) => {
      if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        m.formula.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.geometry.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, categoryFilter]);

  const activeMolecule = useMemo(
    () => MOLECULES_3D.find((m) => m.id === selectedId) || MOLECULES_3D[0],
    [selectedId]
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      setWebglFallback(true);
      return;
    }

    const w = Math.max(container.clientWidth, 320);
    const h = Math.max(container.clientHeight, 360);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1220');

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 100);
    camera.position.set(0, 1.4, 6.2);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.6;
    controls.maxDistance = 14;
    controlsRef.current = controls;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(5, 7, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rim.position.set(-5, -3, -4);
    scene.add(rim);

    // Build molecule group
    const molGroup = new THREE.Group();
    scene.add(molGroup);

    const bondMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.3,
      metalness: 0.25,
    });
    const piBondMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.35,
      metalness: 0.3,
    });

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [bondMat, piBondMat];

    const atomMeshes: { mesh: THREE.Mesh; label: string }[] = [];

    activeMolecule.atoms.forEach((a) => {
      const style = CPK_COLORS[a.el] || { color: 0x94a3b8, radius: 0.5, hex: '#94a3b8', label: a.el };
      const geo = new THREE.SphereGeometry(style.radius, 32, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: style.color,
        roughness: 0.22,
        metalness: 0.18,
      });
      geometriesToDispose.push(geo);
      materialsToDispose.push(mat);

      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.set(a.pos[0], a.pos[1], a.pos[2]);
      molGroup.add(sphere);
      atomMeshes.push({ mesh: sphere, label: a.el });

      if (showLabels) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = a.el === 'H' ? '#0f172a' : '#ffffff';
          ctx.font = 'bold 58px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(a.el, 64, 64);
          const tex = new THREE.CanvasTexture(canvas);
          const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
          materialsToDispose.push(spriteMat);
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(0.65, 0.65, 1);
          sprite.position.set(a.pos[0], a.pos[1], a.pos[2] + style.radius * 0.25);
          molGroup.add(sprite);
        }
      }
    });

    activeMolecule.bonds.forEach((bond) => {
      const a = activeMolecule.atoms[bond.a];
      const b = activeMolecule.atoms[bond.b];
      if (!a || !b) return;
      const p1 = new THREE.Vector3(...a.pos);
      const p2 = new THREE.Vector3(...b.pos);
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      const up = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const perp = new THREE.Vector3().crossVectors(dir, up).normalize();

      if (bond.order === 1) {
        const cyl = createCylinderBetween(p1, p2, 0.11, bondMat);
        geometriesToDispose.push(cyl.geometry);
        molGroup.add(cyl);
      } else if (bond.order === 2 || bond.order === 1.5) {
        const offset = perp.clone().multiplyScalar(0.11);
        const c1 = createCylinderBetween(p1.clone().add(offset), p2.clone().add(offset), 0.075, bondMat);
        const c2 = createCylinderBetween(
          p1.clone().sub(offset),
          p2.clone().sub(offset),
          0.075,
          bond.order === 1.5 ? piBondMat : bondMat
        );
        geometriesToDispose.push(c1.geometry, c2.geometry);
        molGroup.add(c1, c2);
      } else if (bond.order === 3) {
        const offset = perp.clone().multiplyScalar(0.14);
        const c0 = createCylinderBetween(p1, p2, 0.07, bondMat);
        const c1 = createCylinderBetween(p1.clone().add(offset), p2.clone().add(offset), 0.065, piBondMat);
        const c2 = createCylinderBetween(p1.clone().sub(offset), p2.clone().sub(offset), 0.065, piBondMat);
        geometriesToDispose.push(c0.geometry, c1.geometry, c2.geometry);
        molGroup.add(c0, c1, c2);
      }
    });

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (isPlayingRef.current) {
        molGroup.rotation.y += 0.007;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nw = Math.max(container.clientWidth, 300);
      const nh = Math.max(container.clientHeight, 340);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.dispose();
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeMolecule, showLabels]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.4, 6.2);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const elementsInMolecule = useMemo(() => {
    const seen = new Set<string>();
    activeMolecule.atoms.forEach((a) => seen.add(a.el));
    return Array.from(seen).map((el) => ({
      el,
      ...(CPK_COLORS[el] || { hex: '#94a3b8', label: el }),
    }));
  }, [activeMolecule]);

  return (
    <div className="space-y-5">
      {/* Header & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                Phân tử &amp; Cấu tạo Không gian 3D
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Mô hình cầu – thanh theo thuyết VSEPR, trạng thái lai hóa và góc liên kết chuẩn SGK GDPT 2018.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm phân tử (H2O, CH4, Benzene...)"
              className="pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-60 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['ALL', 'Vô cơ', 'Hữu cơ', 'Tinh thể ion'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  categoryFilter === cat ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D Stage + Selector + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left List */}
        <div className="lg:col-span-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 max-h-[540px] overflow-y-auto">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-2 pb-1">
            Thư viện phân tử ({filteredMolecules.length})
          </div>
          {filteredMolecules.map((mol) => {
            const isActive = mol.id === activeMolecule.id;
            return (
              <button
                key={mol.id}
                onClick={() => setSelectedId(mol.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-teal-50 border-teal-300 shadow-2xs'
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <div className={`text-base font-black ${isActive ? 'text-teal-900' : 'text-slate-800'}`}>
                    {mol.formula}
                  </div>
                  <div className="text-xs text-slate-500 font-medium truncate">{mol.name}</div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  Lớp {mol.grade}
                </span>
              </button>
            );
          })}
          {filteredMolecules.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">Không tìm thấy phân tử phù hợp.</div>
          )}
        </div>

        {/* Center 3D Viewport */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-md flex flex-col">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{activeMolecule.category}</span>
              <h3 className="text-lg font-black text-white">
                {activeMolecule.name} ({activeMolecule.formula})
              </h3>
            </div>
            <div className="text-right tabular-nums">
              <span className="text-[11px] text-slate-400 block">Góc liên kết</span>
              <span className="text-sm font-black text-amber-300">{activeMolecule.bondAngle}</span>
            </div>
          </div>

          <div className="relative w-full h-[380px]">
            {webglFallback ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-6 text-center">
                <p className="font-bold text-sm">Trình duyệt hiện không hỗ trợ WebGL.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Hãy bật tăng tốc phần cứng để quan sát mô hình phân tử 3D tương tác.
                </p>
              </div>
            ) : (
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            )}
          </div>

          {/* Solid Bottom Dock (no backdrop-blur over WebGL) */}
          <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Tạm dừng xoay' : 'Tự động xoay'}</span>
              </button>
              <button
                onClick={() => setShowLabels((s) => !s)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {showLabels ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showLabels ? 'Ẩn ký hiệu' : 'Hiện ký hiệu'}</span>
              </button>
              <button
                onClick={handleResetCamera}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại góc nhìn</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 select-none">Kéo để xoay · Cuộn để thu phóng</span>
          </div>
        </div>

        {/* Right Scientific Details */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Hồ sơ hình học phân tử</span>
              <div className="mt-1">
                <ChemFormula formula={activeMolecule.latex} className="text-2xl font-black text-slate-900" />
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                activeMolecule.polarity === 'Phân cực'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : activeMolecule.polarity === 'Không phân cực'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}
            >
              {activeMolecule.polarity}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm tabular-nums">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Công thức VSEPR</span>
              <strong className="text-slate-900 font-black">{activeMolecule.vsepr}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Dạng hình học</span>
              <strong className="text-slate-900 font-bold">{activeMolecule.geometry}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Lai hóa nguyên tử tâm</span>
              <strong className="text-teal-800 font-black">{activeMolecule.hybridization}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Góc liên kết lý thuyết</span>
              <strong className="text-slate-900 font-black">{activeMolecule.bondAngle}</strong>
            </div>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-900 uppercase tracking-wider">
              <Info className="w-4 h-4 text-teal-700" />
              <span>Giải thích cấu tạo</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{activeMolecule.description}</p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Quy ước màu CPK trong mô hình:</span>
            <div className="flex flex-wrap gap-3">
              {elementsInMolecule.map((item) => (
                <div key={item.el} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
