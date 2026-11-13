import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ELEMENTS_118,
  getElementByZ,
  getElementSubshells,
  toSup,
  SubshellOccupancy,
} from '../../data/elements118';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Atom,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Atom3DExplorerProps {
  selectedZ?: number;
  onSelectZ?: (z: number) => void;
  initialFocus?: '3d' | 'config';
}

const SHELL_NAMES = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)', 'O (n=5)', 'P (n=6)', 'Q (n=7)'];
const SHELL_SHORT = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
const SHELL_COLORS = [0x38bdf8, 0x34d399, 0xfbbf24, 0xf472b6, 0xa78bfa, 0xfb7185, 0x2dd4bf];

const EXCEPTION_Z = new Set([24, 29, 41, 42, 44, 45, 46, 47, 57, 58, 64, 78, 79, 89, 90, 91, 92, 93, 96, 103]);

const QUICK_PICKS = [1, 6, 7, 8, 11, 12, 13, 17, 19, 20, 24, 26, 29, 35, 47, 79];

function computeIonSubshells(z: number, charge: number): SubshellOccupancy[] {
  const neutral = getElementSubshells(z).map((s) => ({ ...s }));
  if (charge === 0) return neutral;

  if (charge > 0) {
    // Cation: remove electrons starting from highest n, then highest l (e.g. 4s before 3d)
    let toRemove = charge;
    const orderedRemoval = [...neutral].sort((a, b) => {
      if (b.n !== a.n) return b.n - a.n;
      const lRank = { s: 0, p: 1, d: 2, f: 3 };
      return lRank[b.lType] - lRank[a.lType];
    });
    for (const sub of orderedRemoval) {
      if (toRemove <= 0) break;
      const take = Math.min(sub.electrons, toRemove);
      sub.electrons -= take;
      toRemove -= take;
    }
    return neutral.filter((s) => s.electrons > 0);
  } else {
    // Anion: add electrons to highest-energy partially filled subshell (typically outer p or 1s)
    let toAdd = Math.abs(charge);
    const aufbau = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
    const map = new Map<string, SubshellOccupancy>();
    neutral.forEach((s) => map.set(s.name, s));
    for (const name of aufbau) {
      if (toAdd <= 0) break;
      const existing = map.get(name);
      const lType = name[1] as 's' | 'p' | 'd' | 'f';
      const cap = lType === 's' ? 2 : lType === 'p' ? 6 : lType === 'd' ? 10 : 14;
      const cur = existing ? existing.electrons : 0;
      if (cur < cap) {
        const add = Math.min(cap - cur, toAdd);
        if (existing) {
          existing.electrons += add;
        } else {
          map.set(name, { name, n: Number(name[0]), lType, electrons: add, capacity: cap });
        }
        toAdd -= add;
      }
    }
    const SPECTRO = ['1s', '2s', '2p', '3s', '3p', '3d', '4s', '4p', '4d', '4f', '5s', '5p', '5d', '5f', '6s', '6p', '6d', '7s', '7p'];
    return SPECTRO.map((n) => map.get(n)).filter((x): x is SubshellOccupancy => Boolean(x && x.electrons > 0));
  }
}

function getHundBoxes(electrons: number, capacity: number): ('up' | 'down' | 'both' | 'empty')[] {
  const numOrbitals = capacity / 2;
  const boxes: ('up' | 'down' | 'both' | 'empty')[] = Array.from({ length: numOrbitals }, () => 'empty');
  let rem = electrons;
  for (let i = 0; i < numOrbitals && rem > 0; i++) {
    boxes[i] = 'up';
    rem--;
  }
  for (let i = 0; i < numOrbitals && rem > 0; i++) {
    boxes[i] = 'both';
    rem--;
  }
  return boxes;
}

export const Atom3DExplorer: React.FC<Atom3DExplorerProps> = ({
  selectedZ: controlledZ,
  onSelectZ,
  initialFocus = '3d',
}) => {
  const [internalZ, setInternalZ] = useState<number>(controlledZ || 11);
  const activeZ = controlledZ ?? internalZ;

  const [ionCharge, setIonCharge] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'bohr' | 'quantum3d' | 'orbitals'>(
    initialFocus === 'config' ? 'quantum3d' : 'bohr'
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const canvasMountRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speedMultiplier);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const initialCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 4.2, 8.2));

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  // Reset ion charge when changing element
  useEffect(() => {
    setIonCharge(0);
  }, [activeZ]);

  const element = useMemo(() => getElementByZ(activeZ), [activeZ]);

  const activeSubshells = useMemo(
    () => computeIonSubshells(element.z, ionCharge),
    [element.z, ionCharge]
  );

  const activeShells = useMemo(() => {
    if (activeSubshells.length === 0) return [0];
    const maxN = Math.max(...activeSubshells.map((s) => s.n));
    const arr = Array.from({ length: maxN }, () => 0);
    activeSubshells.forEach((s) => {
      arr[s.n - 1] += s.electrons;
    });
    return arr;
  }, [activeSubshells]);

  const totalElectrons = activeShells.reduce((a, b) => a + b, 0);
  const estimatedNeutrons = useMemo(() => {
    const numMass = parseFloat(element.atomicMass.replace(/[\[\]]/g, '')) || element.z * 2;
    return Math.max(0, Math.round(numMass) - element.z);
  }, [element]);

  const unpairedCount = useMemo(() => {
    let count = 0;
    activeSubshells.forEach((s) => {
      const boxes = getHundBoxes(s.electrons, s.capacity);
      boxes.forEach((b) => {
        if (b === 'up') count++;
      });
    });
    return count;
  }, [activeSubshells]);

  const valenceSubshell = activeSubshells[activeSubshells.length - 1];

  const handleSelectZ = (nextZ: number) => {
    const clamped = Math.max(1, Math.min(118, nextZ));
    setInternalZ(clamped);
    if (onSelectZ) onSelectZ(clamped);
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(initialCamPosRef.current);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Three.js Interactive Atom Viewport
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = mount.clientWidth || 560;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090f1d);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm key + cool hemisphere lighting
    const hemiLight = new THREE.HemisphereLight(0xcffafe, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 2.5;
    controls.maxDistance = 22;
    controlsRef.current = controls;

    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    const disposables: { dispose: () => void }[] = [];

    // 1. Nucleus Cluster (capped cleanly for visual clarity while representing Z protons & N neutrons)
    const nucleusGroup = new THREE.Group();
    atomGroup.add(nucleusGroup);

    const totalNucleonsVisual = Math.min(48, Math.max(1, element.z + estimatedNeutrons));
    const protonVisualCount = Math.max(1, Math.round((element.z / Math.max(1, element.z + estimatedNeutrons)) * totalNucleonsVisual));

    const nucleonGeo = new THREE.SphereGeometry(totalNucleonsVisual === 1 ? 0.26 : 0.14, 20, 20);
    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.25,
    });
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.3,
    });
    disposables.push(nucleonGeo, protonMat, neutronMat);

    if (totalNucleonsVisual === 1) {
      const pMesh = new THREE.Mesh(nucleonGeo, protonMat);
      nucleusGroup.add(pMesh);
    } else {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < totalNucleonsVisual; i++) {
        const y = 1 - (i / Math.max(1, totalNucleonsVisual - 1)) * 2;
        const rShell = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = goldenAngle * i;
        const layerScale = 0.16 * Math.cbrt(totalNucleonsVisual) * (0.55 + (i % 3) * 0.16);
        const mesh = new THREE.Mesh(nucleonGeo, i < protonVisualCount ? protonMat : neutronMat);
        mesh.position.set(
          Math.cos(theta) * rShell * layerScale,
          y * layerScale,
          Math.sin(theta) * rShell * layerScale
        );
        nucleusGroup.add(mesh);
      }
    }

    // Orbiting Electron Nodes Registry
    interface ElectronTracker {
      pivot: THREE.Group;
      speed: number;
      baseAngle: number;
    }
    const electronTrackers: ElectronTracker[] = [];

    const numShells = activeShells.length;
    const baseRadius = 1.05;
    const stepRadius = Math.max(0.46, Math.min(0.68, 3.6 / Math.max(1, numShells)));
    const maxAtomRadius = baseRadius + (numShells - 1) * stepRadius + 0.4;

    if (viewMode === 'orbitals' && valenceSubshell) {
      // Render 3D Quantum Orbital Cloud Lobes for the outer subshell (s / p / d / f)
      const lobeMatPos = new THREE.MeshPhysicalMaterial({
        color: 0x14b8a6,
        roughness: 0.25,
        metalness: 0.05,
        transparent: true,
        opacity: 0.58,
      });
      const lobeMatNeg = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        roughness: 0.25,
        metalness: 0.05,
        transparent: true,
        opacity: 0.58,
      });
      const axisGeo = new THREE.CylinderGeometry(0.015, 0.015, 5.2, 12);
      const axisMat = new THREE.MeshBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
      disposables.push(lobeMatPos, lobeMatNeg, axisGeo, axisMat);

      // XYZ axes guides
      const axY = new THREE.Mesh(axisGeo, axisMat);
      const axX = new THREE.Mesh(axisGeo, axisMat);
      axX.rotation.z = Math.PI / 2;
      const axZ = new THREE.Mesh(axisGeo, axisMat);
      axZ.rotation.x = Math.PI / 2;
      atomGroup.add(axX, axY, axZ);

      const lType = valenceSubshell.lType;
      if (lType === 's') {
        const sGeo = new THREE.SphereGeometry(2.1, 36, 36);
        const sMesh = new THREE.Mesh(sGeo, lobeMatPos);
        atomGroup.add(sMesh);
        disposables.push(sGeo);
      } else if (lType === 'p') {
        // 3 orthogonal p-orbitals (px, py, pz) if occupied
        const lobeGeo = new THREE.SphereGeometry(0.82, 28, 28);
        lobeGeo.scale(0.8, 1.35, 0.8);
        disposables.push(lobeGeo);

        const occupiedOrbitals = Math.min(3, valenceSubshell.electrons);
        const dirs = [
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0, 1),
        ];
        for (let k = 0; k < occupiedOrbitals; k++) {
          const dir = dirs[k];
          const pPlus = new THREE.Mesh(lobeGeo, lobeMatPos);
          pPlus.position.copy(dir).multiplyScalar(1.15);
          pPlus.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

          const pMinus = new THREE.Mesh(lobeGeo, lobeMatNeg);
          pMinus.position.copy(dir).multiplyScalar(-1.15);
          pMinus.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate());

          atomGroup.add(pPlus, pMinus);
        }
      } else {
        // d or f cloverleaf 4-lobe representation
        const lobeGeo = new THREE.SphereGeometry(0.68, 24, 24);
        lobeGeo.scale(0.65, 1.45, 0.65);
        disposables.push(lobeGeo);

        const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
        angles.forEach((ang, idx) => {
          const dir = new THREE.Vector3(Math.cos(ang), Math.sin(ang), 0);
          const mesh = new THREE.Mesh(lobeGeo, idx % 2 === 0 ? lobeMatPos : lobeMatNeg);
          mesh.position.copy(dir).multiplyScalar(1.25);
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          atomGroup.add(mesh);
        });

        // Secondary z-ring / torus for dz2 / f symmetry
        const ringGeo = new THREE.TorusGeometry(1.15, 0.18, 20, 48);
        const ringMesh = new THREE.Mesh(ringGeo, lobeMatPos);
        ringMesh.rotation.x = Math.PI / 2;
        atomGroup.add(ringMesh);
        disposables.push(ringGeo);
      }
    } else {
      // Bohr Planar Shells OR Quantum 3D Tilted Shells
      const electronGeo = new THREE.SphereGeometry(0.11, 18, 18);
      disposables.push(electronGeo);

      activeShells.forEach((count, shellIdx) => {
        if (count <= 0) return;
        const r = baseRadius + shellIdx * stepRadius;
        const color = SHELL_COLORS[shellIdx % SHELL_COLORS.length];

        const shellPivot = new THREE.Group();
        if (viewMode === 'quantum3d') {
          shellPivot.rotation.set(
            (shellIdx % 2 === 0 ? 1 : -1) * 0.42 * ((shellIdx + 1) % 3),
            shellIdx * 0.55,
            shellIdx * 0.35
          );
        } else {
          shellPivot.rotation.set(Math.PI / 2 - 0.35, 0, 0);
        }
        atomGroup.add(shellPivot);

        // Ring mesh
        const ringGeo = new THREE.TorusGeometry(r, 0.018, 12, 96);
        const ringMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.48,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        shellPivot.add(ringMesh);
        disposables.push(ringGeo, ringMat);

        const electronMat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.65,
          roughness: 0.15,
          metalness: 0.1,
        });
        disposables.push(electronMat);

        const angularSpeed = (shellIdx % 2 === 0 ? 1 : -1) * (1.25 / (1 + shellIdx * 0.38));

        for (let eIdx = 0; eIdx < count; eIdx++) {
          const ePivot = new THREE.Group();
          const angle = (eIdx / count) * Math.PI * 2;
          const eMesh = new THREE.Mesh(electronGeo, electronMat);
          eMesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
          ePivot.add(eMesh);
          shellPivot.add(ePivot);

          electronTrackers.push({
            pivot: ePivot,
            speed: angularSpeed,
            baseAngle: angle,
          });
        }
      });
    }

    // Auto-fit camera distance so outer shells never clip
    const fitRadius = viewMode === 'orbitals' ? 3.2 : maxAtomRadius;
    const fovRad = (camera.fov * Math.PI) / 180;
    const aspect = width / height;
    const fovX = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
    const dist = Math.max(fitRadius / Math.sin(fovRad / 2), fitRadius / Math.sin(fovX / 2)) * 1.18;

    initialCamPosRef.current.set(0, dist * 0.32, dist * 0.95);
    camera.position.copy(initialCamPosRef.current);
    controls.target.set(0, 0, 0);
    controls.update();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || mount.clientWidth;
        const h = entry.contentRect.height || mount.clientHeight;
        if (w > 10 && h > 10) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(mount);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        if (!sync) {
          frameId = window.setTimeout(cb, 80);
          return;
        }
        const poll = () => {
          if (disposed) {
            gl.deleteSync(sync);
            return;
          }
          const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (status === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } catch {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(0.05, clock.getDelta());

      if (isPlayingRef.current) {
        const mult = speedRef.current;
        if (viewMode === 'orbitals') {
          atomGroup.rotation.y += dt * 0.45 * mult;
        } else {
          nucleusGroup.rotation.y += dt * 0.3 * mult;
          for (let i = 0; i < electronTrackers.length; i++) {
            electronTrackers[i].pivot.rotation.z += dt * electronTrackers[i].speed * mult;
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (mount) mount.innerHTML = '';
    };
  }, [element.z, ionCharge, viewMode, estimatedNeutrons, activeShells, valenceSubshell]);

  const filteredQuickList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ELEMENTS_118;
    return ELEMENTS_118.filter(
      (el) =>
        String(el.z) === q ||
        el.symbol.toLowerCase().includes(q) ||
        el.name.toLowerCase().includes(q) ||
        (el.viName && el.viName.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const configText = activeSubshells.map((s) => `${s.name}${toSup(s.electrons)}`).join(' ');

  return (
    <div className="space-y-5">
      {/* Header Element Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
              <Atom className="w-5 h-5 text-teal-700" />
              <span>Nguyên tử 3D & Cấu hình Electron</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mô phỏng mô hình Bohr, quỹ đạo không gian 3D, hình dạng obitan (s, p, d) và phân bố ô lượng tử theo quy tắc Aufbau – Hund – Pauli.
            </p>
          </div>

          {/* Stepper & Dropdown Element Picker */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
              <button
                type="button"
                onClick={() => handleSelectZ(element.z - 1)}
                disabled={element.z <= 1}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                title="Nguyên tố trước (Z - 1)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={element.z}
                onChange={(e) => handleSelectZ(Number(e.target.value))}
                aria-label="Chọn nguyên tố hóa học"
                className="bg-transparent text-xs font-bold text-slate-900 px-2 py-1.5 focus:outline-none"
              >
                {ELEMENTS_118.map((el) => (
                  <option key={el.z} value={el.z}>
                    Z={el.z} · {el.symbol} ({el.name})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleSelectZ(element.z + 1)}
                disabled={element.z >= 118}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                title="Nguyên tố tiếp theo (Z + 1)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const exact = ELEMENTS_118.find(
                  (el) =>
                    String(el.z) === e.target.value.trim() ||
                    el.symbol.toLowerCase() === e.target.value.trim().toLowerCase()
                );
                if (exact) handleSelectZ(exact.z);
              }}
              placeholder="Nhập Z hoặc ký hiệu (VD: 24, Cr)..."
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Quick Picks */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Chọn nhanh:</span>
          {QUICK_PICKS.map((qz) => {
            const qEl = getElementByZ(qz);
            const active = qz === element.z;
            return (
              <button
                key={qz}
                type="button"
                onClick={() => handleSelectZ(qz)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${
                  active
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {qEl.symbol} ({qz})
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Workspace: Left 3D Stage + Right Electron Configuration & Orbitals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT: 3D WebGL Atom Stage with Bottom Control Dock */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative flex flex-col min-h-[470px]">
          {/* Minimal Top Overlay Spec Readout */}
          <div className="p-4 flex flex-wrap items-start justify-between gap-3 z-10 pointer-events-none">
            <div className="text-white">
              <div className="text-xs text-teal-300 font-semibold">
                {element.name} ({element.symbol}
                {ionCharge !== 0 ? `${Math.abs(ionCharge) > 1 ? Math.abs(ionCharge) : ''}${ionCharge > 0 ? '+' : '-'}` : ''}) · Z = {element.z}
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5 tabular-nums">
                {element.z} proton · {estimatedNeutrons} neutron · {totalElectrons} electron
              </div>
            </div>

            {showLabels && (
              <div className="flex flex-wrap gap-1.5 justify-end">
                {activeShells.map((count, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-slate-200"
                  >
                    {SHELL_SHORT[i]}:{count}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dedicated Empty Canvas Container */}
          <div ref={canvasMountRef} className="flex-1 w-full min-h-[340px]" />

          {/* Unified Bottom Control Dock */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 z-10">
            <div className="flex flex-wrap items-center gap-1 bg-slate-800 p-1 rounded-lg">
              {[
                { id: 'bohr' as const, label: 'Mô hình Bohr' },
                { id: 'quantum3d' as const, label: 'Quỹ đạo 3D' },
                { id: 'orbitals' as const, label: 'Obitan (s, p, d)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewMode(m.id)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    viewMode === m.id
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Tạm dừng' : 'Chạy'}</span>
              </button>

              <label className="flex items-center gap-2 text-xs text-slate-300 px-2">
                <span>Tốc độ: {speedMultiplier.toFixed(1)}x</span>
                <input
                  type="range"
                  min={0.2}
                  max={2.5}
                  step={0.1}
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                  className="w-20 accent-teal-500"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowLabels((s) => !s)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                {showLabels ? 'Ẩn lớp e' : 'Hiện lớp e'}
              </button>

              <button
                type="button"
                onClick={resetCamera}
                title="Đặt lại góc nhìn 3D"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Electron Configuration, Ion Simulator & Hund Orbital Boxes */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Element & Ion State Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Cấu hình electron & Ô lượng tử
                </h3>
                <span className="text-xs text-slate-500">
                  Khối {element.block} · Chu kỳ {element.period} · Tổng {totalElectrons} electron
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {[-2, -1, 0, 1, 2, 3].map((chg) => {
                  const disabled = element.z - chg < 1;
                  return (
                    <button
                      key={chg}
                      type="button"
                      disabled={disabled}
                      onClick={() => setIonCharge(chg)}
                      className={`px-2 py-1 text-xs font-bold rounded transition-colors disabled:opacity-30 ${
                        ionCharge === chg
                          ? 'bg-teal-700 text-white'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      {chg === 0 ? 'Trung hòa' : chg > 0 ? `+${chg}` : `${chg}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Configuration Readout */}
            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900">
                  {ionCharge === 0
                    ? `Cấu hình nguyên tử ${element.symbol}:`
                    : `Cấu hình ion ${element.symbol}${Math.abs(ionCharge) > 1 ? Math.abs(ionCharge) : ''}${ionCharge > 0 ? '+' : '-'}:`}
                </span>
                {ionCharge === 0 && EXCEPTION_Z.has(element.z) && (
                  <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Ngoại lệ bão hòa/bán bão hòa
                  </span>
                )}
              </div>
              <div className="text-sm font-mono font-black text-teal-950 leading-relaxed break-words">
                {configText || '(Không còn electron — H⁺)'}
              </div>
              {ionCharge === 0 && (
                <div className="text-xs font-mono text-teal-800">
                  Viết gọn: <strong>{element.electronConfig}</strong>
                </div>
              )}
            </div>

            {/* Shell Distribution K..Q */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">
                Phân bố theo lớp electron (K → Q):
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {activeShells.map((cnt, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center"
                  >
                    <span className="text-[10px] font-bold text-slate-500 block">
                      {SHELL_NAMES[idx]}
                    </span>
                    <span className="text-sm font-black text-slate-900 tabular-nums">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hund & Pauli Orbital Box Diagram */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  <span>Biểu đồ ô lượng tử (Các phân lớp ngoài cùng):</span>
                </span>
                <span className="text-xs font-bold text-slate-600 tabular-nums">
                  {unpairedCount} e độc thân ({unpairedCount > 0 ? 'Thuận từ' : 'Nghịch từ'})
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 max-h-[210px] overflow-y-auto">
                {activeSubshells.slice(-5).map((sub) => {
                  const boxes = getHundBoxes(sub.electrons, sub.capacity);
                  return (
                    <div key={sub.name} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800 w-12 shrink-0">
                        {sub.name}{toSup(sub.electrons)}
                      </span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {boxes.map((state, bIdx) => (
                          <div
                            key={bIdx}
                            className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-sm font-black ${
                              state === 'empty'
                                ? 'bg-white border-slate-200 text-slate-300'
                                : state === 'up'
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-teal-50 border-teal-300 text-teal-900'
                            }`}
                          >
                            {state === 'both' ? '↑↓' : state === 'up' ? '↑' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {activeSubshells.length === 0 && (
                  <div className="text-xs text-slate-500 italic">
                    Ion H⁺ chỉ gồm 1 hạt nhân proton (0 electron).
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search matches list if searching */}
          {searchQuery.trim() && filteredQuickList.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">
                Kết quả tìm nhanh ({filteredQuickList.length}):
              </span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {filteredQuickList.slice(0, 12).map((el) => (
                  <button
                    key={el.z}
                    type="button"
                    onClick={() => {
                      handleSelectZ(el.z);
                      setSearchQuery('');
                    }}
                    className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-teal-100 text-slate-800 rounded"
                  >
                    {el.z}. {el.symbol}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
