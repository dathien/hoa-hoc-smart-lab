import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ApparatusInstance, ChemistryAnalysisResult, Reagent } from './labTypes';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Maximize,
  Flame,
  Droplets,
  RotateCw,
  Trash2,
  Bookmark,
} from 'lucide-react';

interface Lab3DViewProps {
  containers: ApparatusInstance[];
  activeContainerId: string;
  onSelectContainer: (id: string) => void;
  onRemoveContainer?: (id: string) => void;
  onWashContainer?: (id: string) => void;
  onToggleHeater?: (id: string) => void;
  onShakeContainer?: (id: string) => void;
  onDipLitmus?: (id: string) => void;
  analyses: Record<string, ChemistryAnalysisResult>;
  isPouring: boolean;
  pouringReagent: Reagent | null;
  isFullscreen?: boolean;
}

const get3DPositions = (containers: ApparatusInstance[]): number[] => {
  const count = containers.length;
  if (count === 0) return [];
  if (count === 1) return [0];
  const step = count <= 3 ? 2.15 : count === 4 ? 1.85 : 1.58;
  const span = (count - 1) * step;
  const startX = -span / 2;
  return containers.map((_, idx) => startX + idx * step);
};

const disposeGroupResources = (root: THREE.Group) => {
  while (root.children.length > 0) {
    const child = root.children[0];
    root.remove(child);
    child.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
      const mat = (obj as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else if (mat) {
        mat.dispose();
      }
    });
  }
};

export const Lab3DView: React.FC<Lab3DViewProps> = ({
  containers,
  activeContainerId,
  onSelectContainer,
  onRemoveContainer,
  onWashContainer,
  onToggleHeater,
  onShakeContainer,
  onDipLitmus,
  analyses,
  isPouring,
  pouringReagent,
  isFullscreen = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Refs preserved cleanly across apparatus/reagent updates (prevents jarring camera resets)
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const apparatusRootRef = useRef<THREE.Group | null>(null);
  const tableMeshRef = useRef<THREE.Mesh | null>(null);
  const interactiveGroupsRef = useRef<THREE.Object3D[]>([]);
  const flamesRef = useRef<THREE.Mesh[]>([]);
  const pouringStreamRef = useRef<THREE.Mesh | null>(null);

  const sphericalRef = useRef({
    radius: 7.5,
    theta: 0,
    phi: Math.PI / 4.2,
  });
  const targetPointRef = useRef(new THREE.Vector3(0, 1.08, 0.25));

  const containersRef = useRef(containers);
  containersRef.current = containers;

  const onSelectRef = useRef(onSelectContainer);
  onSelectRef.current = onSelectContainer;

  const applyCameraFromSpherical = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { radius, theta, phi } = sphericalRef.current;
    const target = targetPointRef.current;

    camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = target.y + radius * Math.cos(phi);
    camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(target);
  }, []);

  const fitCameraToContainers = useCallback(
    (resetOrbitAngle = false) => {
      const camera = cameraRef.current;
      const mount = mountRef.current;
      if (!camera || !mount) return;

      const width = mount.clientWidth || 640;
      const height = mount.clientHeight || 460;
      const aspect = Math.max(0.4, width / Math.max(1, height));

      const positions = get3DPositions(containersRef.current);
      const minX = positions.length > 0 ? Math.min(...positions) - 0.95 : -2.0;
      const maxX = positions.length > 0 ? Math.max(...positions) + 0.95 : 2.0;
      const centerX = (minX + maxX) / 2;

      const halfW = Math.max(1.8, (maxX - minX) / 2);
      const halfH = 1.48;

      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

      const distV = halfH / Math.tan(vFov / 2);
      const distH = halfW / Math.tan(hFov / 2);
      const idealRadius = Math.max(5.6, Math.min(16.5, Math.max(distV, distH) * 1.18));

      targetPointRef.current.set(centerX, 1.08, 0.25);
      sphericalRef.current.radius = idealRadius;
      if (resetOrbitAngle) {
        sphericalRef.current.theta = 0;
        sphericalRef.current.phi = Math.PI / 4.2;
      }
      applyCameraFromSpherical();
    },
    [applyCameraFromSpherical]
  );

  // 1. Initialize WebGL Scene, Renderer, Controls & ResizeObserver ONCE
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 460;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / Math.max(1, height), 0.1, 120);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(5, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    fillLight.position.set(-6, 5, 4);
    scene.add(fillLight);

    // Workbench Tabletop (dynamically scaled horizontally when many apparatuses exist)
    const tableGeom = new THREE.BoxGeometry(14, 0.35, 7);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.32,
      metalness: 0.15,
    });
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = -0.18;
    table.receiveShadow = true;
    tableMeshRef.current = table;
    scene.add(table);

    const gridLineMat = new THREE.LineBasicMaterial({ color: 0x334155 });
    const gridPoints = [
      new THREE.Vector3(-6.8, 0.01, 1.5),
      new THREE.Vector3(6.8, 0.01, 1.5),
    ];
    const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
    scene.add(new THREE.Line(gridGeo, gridLineMat));

    const apparatusRoot = new THREE.Group();
    apparatusRootRef.current = apparatusRoot;
    scene.add(apparatusRoot);

    fitCameraToContainers(true);

    // Raycasting & Orbit Camera Dragging
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let prevMouse = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const getRaycastContainer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVector, camera);

      const intersects = raycaster.intersectObjects(interactiveGroupsRef.current, true);
      if (intersects.length > 0) {
        let cur: THREE.Object3D | null = intersects[0].object;
        while (cur) {
          if (cur.userData?.containerId) {
            return cur.userData.containerId as string;
          }
          cur = cur.parent;
        }
      }
      return null;
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerDownPos = { x: clientX, y: clientY };
      prevMouse = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (!isDragging) {
        const hovered = getRaycastContainer(clientX, clientY);
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
        return;
      }

      const dx = clientX - prevMouse.x;
      const dy = clientY - prevMouse.y;

      sphericalRef.current.theta -= dx * 0.007;
      sphericalRef.current.phi = Math.max(
        0.15,
        Math.min(Math.PI / 2.15, sphericalRef.current.phi - dy * 0.007)
      );
      applyCameraFromSpherical();
      prevMouse = { x: clientX, y: clientY };
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX =
        'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY =
        'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
      const dist = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);

      if (dist < 6) {
        const clickedId = getRaycastContainer(clientX, clientY);
        if (clickedId) {
          onSelectRef.current(clickedId);
        }
      }
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(
        3.6,
        Math.min(17.5, sphericalRef.current.radius + e.deltaY * 0.006)
      );
      applyCameraFromSpherical();
    };

    const domEl = renderer.domElement;
    domEl.style.touchAction = 'none';
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    let animId = 0;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.04;

      flamesRef.current.forEach((flame) => {
        flame.scale.y = 0.9 + Math.sin(clock * 8) * 0.15;
        flame.scale.x = 0.95 + Math.cos(clock * 6) * 0.1;
      });

      if (pouringStreamRef.current) {
        pouringStreamRef.current.scale.x = 0.9 + Math.sin(clock * 12) * 0.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Dynamic ResizeObserver (handles sidebar toggles, responsive resizes, fullscreen)
    const syncViewportSize = () => {
      if (!mount) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      if (nw <= 0 || nh <= 0) return;

      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      fitCameraToContainers(false);
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(syncViewportSize);
      ro.observe(mount);
    }
    window.addEventListener('resize', syncViewportSize);

    return () => {
      cancelAnimationFrame(animId);
      ro?.disconnect();
      window.removeEventListener('resize', syncViewportSize);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);

      disposeGroupResources(apparatusRoot);
      tableGeom.dispose();
      tableMat.dispose();
      gridGeo.dispose();
      gridLineMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      apparatusRootRef.current = null;
    };
  }, [applyCameraFromSpherical, fitCameraToContainers]);

  // 2. Rebuild ONLY Apparatus Meshes when state changes (without tearing down WebGL or resetting orbit!)
  const prevCountRef = useRef<number>(containers.length);
  useEffect(() => {
    const apparatusRoot = apparatusRootRef.current;
    if (!apparatusRoot) return;

    disposeGroupResources(apparatusRoot);
    interactiveGroupsRef.current = [];
    flamesRef.current = [];
    pouringStreamRef.current = null;

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      transmission: 0.92,
      thickness: 0.45,
    });

    const positions = get3DPositions(containers);
    let currentTargetPosition: THREE.Vector3 | null = null;

    for (let index = 0; index < containers.length; index++) {
      const container = containers[index];
      const posX = positions[index] ?? 0;
      const posZ = 0.25;
      const isSelected = container.id === activeContainerId;
      const analysis = analyses[container.id] || {
        liquidColor: 0xe2e8f0,
        liquidOpacity: 0.35,
        totalVolume: 0,
        precipitateColor: null,
        precipitateHeight: 0,
        hasGasBubbles: false,
        hasThermalMist: false,
      };

      const group = new THREE.Group();
      group.position.set(posX, 0, posZ);
      group.userData = { containerId: container.id };

      if (isSelected) {
        currentTargetPosition = new THREE.Vector3(posX, 1.2, posZ);

        const ringGeom = new THREE.RingGeometry(0.55, 0.65, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.02;
        group.add(ringMesh);

        const markerGeom = new THREE.OctahedronGeometry(0.12);
        const markerMat = new THREE.MeshStandardMaterial({ color: 0x14b8a6, emissive: 0x0f766e });
        const markerMesh = new THREE.Mesh(markerGeom, markerMat);
        markerMesh.position.y = 2.25;
        group.add(markerMesh);
      }

      const fillRatio = Math.min(0.9, Math.max(0, analysis.totalVolume / container.capacity));

      if (container.type === 'test_tube') {
        const rackMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
        const rackBaseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), rackMat);
        rackBaseMesh.position.y = 0.06;
        rackBaseMesh.receiveShadow = true;
        group.add(rackBaseMesh);

        const pillarGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8);
        const pillar1 = new THREE.Mesh(pillarGeom, rackMat);
        pillar1.position.set(-0.3, 0.65, 0);
        group.add(pillar1);
        const pillar2 = new THREE.Mesh(pillarGeom, rackMat);
        pillar2.position.set(0.3, 0.65, 0);
        group.add(pillar2);

        const rackTopMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), rackMat);
        rackTopMesh.position.y = 1.3;
        group.add(rackTopMesh);

        const tubeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.4, 24, 1, true), glassMat);
        tubeMesh.position.y = 0.85;
        tubeMesh.castShadow = true;
        group.add(tubeMesh);

        const bottomMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
          glassMat
        );
        bottomMesh.position.y = 0.15;
        group.add(bottomMesh);

        const lipMesh = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 24), glassMat);
        lipMesh.rotation.x = Math.PI / 2;
        lipMesh.position.y = 1.55;
        group.add(lipMesh);

        if (fillRatio > 0) {
          const liquidH = fillRatio * 1.25;
          const liqMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.21, 0.21, liquidH, 20),
            new THREE.MeshStandardMaterial({
              color: analysis.liquidColor,
              transparent: true,
              opacity: analysis.liquidOpacity,
              roughness: 0.15,
            })
          );
          liqMesh.position.y = 0.2 + liquidH / 2;
          group.add(liqMesh);

          if (analysis.precipitateColor !== null) {
            const pMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(0.21, 0.21, 0.2, 16),
              new THREE.MeshStandardMaterial({ color: analysis.precipitateColor, roughness: 0.6 })
            );
            pMesh.position.y = 0.25;
            group.add(pMesh);
          }
        }
      } else if (container.type === 'beaker_100' || container.type === 'beaker_250') {
        const radius = container.type === 'beaker_250' ? 0.68 : 0.52;
        const height = container.type === 'beaker_250' ? 1.45 : 1.2;

        const beakerMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius, height, 32, 1, true),
          glassMat
        );
        beakerMesh.position.y = height / 2;
        beakerMesh.castShadow = true;
        group.add(beakerMesh);

        const bottomMesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 32), glassMat);
        bottomMesh.rotation.x = Math.PI / 2;
        bottomMesh.position.y = 0.01;
        group.add(bottomMesh);

        const lipMesh = new THREE.Mesh(
          new THREE.TorusGeometry(radius + 0.02, 0.025, 8, 32),
          glassMat
        );
        lipMesh.rotation.x = Math.PI / 2;
        lipMesh.position.y = height;
        group.add(lipMesh);

        if (fillRatio > 0) {
          const liquidH = fillRatio * (height - 0.15);
          const liqMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius - 0.03, radius - 0.03, liquidH, 24),
            new THREE.MeshStandardMaterial({
              color: analysis.liquidColor,
              transparent: true,
              opacity: analysis.liquidOpacity,
              roughness: 0.12,
            })
          );
          liqMesh.position.y = 0.02 + liquidH / 2;
          group.add(liqMesh);

          if (analysis.precipitateColor !== null) {
            const pMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(radius - 0.03, radius - 0.03, 0.18, 20),
              new THREE.MeshStandardMaterial({ color: analysis.precipitateColor, roughness: 0.6 })
            );
            pMesh.position.y = 0.1;
            group.add(pMesh);
          }
        }
      } else if (container.type === 'erlenmeyer') {
        const flaskMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.72, 1.3, 32, 1, true),
          glassMat
        );
        flaskMesh.position.y = 0.65;
        flaskMesh.castShadow = true;
        group.add(flaskMesh);

        const neckMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, 0.45, 24, 1, true),
          glassMat
        );
        neckMesh.position.y = 1.45;
        group.add(neckMesh);

        const bottomMesh = new THREE.Mesh(new THREE.CircleGeometry(0.72, 32), glassMat);
        bottomMesh.rotation.x = Math.PI / 2;
        bottomMesh.position.y = 0.01;
        group.add(bottomMesh);

        if (fillRatio > 0) {
          const liquidH = fillRatio * 1.0;
          const liqMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.72 - fillRatio * 0.4, 0.69, liquidH, 24),
            new THREE.MeshStandardMaterial({
              color: analysis.liquidColor,
              transparent: true,
              opacity: analysis.liquidOpacity,
              roughness: 0.15,
            })
          );
          liqMesh.position.y = 0.02 + liquidH / 2;
          group.add(liqMesh);

          if (analysis.precipitateColor !== null) {
            const pMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(0.65, 0.69, 0.16, 20),
              new THREE.MeshStandardMaterial({ color: analysis.precipitateColor, roughness: 0.6 })
            );
            pMesh.position.y = 0.09;
            group.add(pMesh);
          }
        }
      } else if (container.type === 'round_flask') {
        const ringStand = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.08, 12, 24),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
        );
        ringStand.rotation.x = Math.PI / 2;
        ringStand.position.y = 0.08;
        group.add(ringStand);

        const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 24), glassMat);
        sphereMesh.position.y = 0.68;
        group.add(sphereMesh);

        const neckMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 0.6, 20, 1, true),
          glassMat
        );
        neckMesh.position.y = 1.5;
        group.add(neckMesh);

        if (fillRatio > 0) {
          const liqMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.62 * Math.min(1, fillRatio * 1.45), 20, 16),
            new THREE.MeshStandardMaterial({
              color: analysis.liquidColor,
              transparent: true,
              opacity: analysis.liquidOpacity,
            })
          );
          liqMesh.position.y = 0.55;
          group.add(liqMesh);
        }
      } else if (container.type === 'burner') {
        const burnerMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45, 0.55, 0.6, 24),
          new THREE.MeshPhysicalMaterial({
            color: 0x0284c7,
            roughness: 0.1,
            transmission: 0.8,
            thickness: 0.3,
          })
        );
        burnerMesh.position.y = 0.3;
        group.add(burnerMesh);

        const collarMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.2, 0.15, 16),
          new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 })
        );
        collarMesh.position.y = 0.68;
        group.add(collarMesh);

        if (container.isHeated) {
          const flameMesh = new THREE.Mesh(
            new THREE.ConeGeometry(0.16, 0.55, 16),
            new THREE.MeshBasicMaterial({ color: 0xf59e0b })
          );
          flameMesh.position.y = 1.05;
          group.add(flameMesh);
          flamesRef.current.push(flameMesh);

          const flameLight = new THREE.PointLight(0xf59e0b, 2.5, 5);
          flameLight.position.set(0, 1.1, 0);
          group.add(flameLight);
        }
      }

      interactiveGroupsRef.current.push(group);
      apparatusRoot.add(group);
    }

    if (isPouring && currentTargetPosition && pouringReagent) {
      const streamMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.7, 16),
        new THREE.MeshStandardMaterial({
          color: pouringReagent.defaultColor,
          transparent: true,
          opacity: 0.85,
          roughness: 0.2,
        })
      );
      streamMesh.position.set(currentTargetPosition.x, 2.25, currentTargetPosition.z);
      apparatusRoot.add(streamMesh);
      pouringStreamRef.current = streamMesh;
    }

    // Re-fit radius smoothly only when apparatus count changes (keep camera angle stable!)
    if (prevCountRef.current !== containers.length) {
      prevCountRef.current = containers.length;
      fitCameraToContainers(false);
    }

    return () => {
      glassMat.dispose();
    };
  }, [containers, activeContainerId, analyses, isPouring, pouringReagent, fitCameraToContainers]);

  // Refit smoothly when fullscreen toggles
  useEffect(() => {
    fitCameraToContainers(false);
  }, [isFullscreen, fitCameraToContainers]);

  const handleZoomIn = () => {
    sphericalRef.current.radius = Math.max(3.6, sphericalRef.current.radius - 1.1);
    applyCameraFromSpherical();
  };

  const handleZoomOut = () => {
    sphericalRef.current.radius = Math.min(17.5, sphericalRef.current.radius + 1.1);
    applyCameraFromSpherical();
  };

  const handleFitView = () => {
    fitCameraToContainers(false);
  };

  const handleResetView = () => {
    fitCameraToContainers(true);
  };

  const activeContainer = containers.find((c) => c.id === activeContainerId);
  const activeAnalysis = activeContainer ? analyses[activeContainer.id] : null;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col select-none shadow-inner">
      {/* ZONE 1: NON-OVERLAPPING TOP ACTION & 3D CAMERA TOOLBAR */}
      <div className="shrink-0 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {activeContainer ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 pr-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="text-sm font-black text-teal-300 truncate max-w-[180px]">
                {activeContainer.name}
              </span>
            </div>

            {onShakeContainer && (
              <button
                onClick={() => onShakeContainer(activeContainer.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all"
                title="Lắc nhẹ và đảo đều hóa chất"
              >
                <RotateCw className="w-3.5 h-3.5 text-teal-400" />
                <span>Lắc nhẹ</span>
              </button>
            )}

            {onToggleHeater && (
              <button
                onClick={() => onToggleHeater(activeContainer.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  activeContainer.isHeated
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                }`}
                title="Thắp đèn cồn đun nóng hoặc tắt lửa"
              >
                <Flame className={`w-3.5 h-3.5 ${activeContainer.isHeated ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{activeContainer.isHeated ? 'Tắt đun nóng' : 'Đun đèn cồn'}</span>
              </button>
            )}

            {onDipLitmus && (
              <button
                onClick={() => onDipLitmus(activeContainer.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all"
                title="Nhúng giấy quỳ tím vào dung dịch"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>Thử quỳ tím</span>
              </button>
            )}

            {onWashContainer && (
              <button
                onClick={() => onWashContainer(activeContainer.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold transition-all"
                title="Rửa sạch hóa chất trong dụng cụ"
              >
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>Rửa sạch</span>
              </button>
            )}

            {onRemoveContainer && (
              <button
                onClick={() => onRemoveContainer(activeContainer.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700 rounded-lg text-xs font-bold transition-all"
                title="Xóa dụng cụ này khỏi bàn thực hành"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Xóa dụng cụ</span>
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-400">
            Chế độ quan sát 3D không gian thực
          </span>
        )}

        {/* 3D Camera Observation Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-700/80 ml-auto">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="Phóng to 3D"
            aria-label="Phóng to 3D"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="Thu nhỏ 3D"
            aria-label="Thu nhỏ 3D"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitView}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-sky-300 hover:text-white hover:bg-sky-900/50 rounded-lg transition-all"
            title="Tự động thu phóng vừa khít toàn bộ dụng cụ 3D"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Vừa khung hình</span>
          </button>
          <button
            onClick={handleResetView}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-teal-300 hover:text-white hover:bg-teal-900/50 rounded-lg transition-all"
            title="Đặt lại góc nhìn 3D ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại góc nhìn</span>
          </button>
        </div>
      </div>

      {/* ZONE 2: DEDICATED WEBGL 3D CANVAS */}
      <div
        className={`relative w-full overflow-hidden bg-slate-900 ${
          isFullscreen
            ? 'h-[clamp(440px,64vh,720px)]'
            : 'h-[360px] sm:h-[430px] lg:h-[clamp(440px,56vh,570px)]'
        }`}
      >
        <div ref={mountRef} className="w-full h-full cursor-grab" />
      </div>

      {/* ZONE 3: BOTTOM 3D NAVIGATION CAPTION & STATUS STRIP (Outside Canvas) */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Kéo để xoay 360° • Cuộn để thu phóng • Chạm trực tiếp vào dụng cụ 3D để chọn</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
          {activeContainer && activeAnalysis ? (
            <span>
              V = {activeAnalysis.totalVolume.toFixed(1)}/{activeContainer.capacity} mL • T = {activeAnalysis.temperatureCalc}°C
            </span>
          ) : (
            <span>{containers.length} dụng cụ trên bàn</span>
          )}
        </div>
      </div>
    </div>
  );
};
