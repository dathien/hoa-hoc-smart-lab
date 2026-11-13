import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ApparatusInstance, ChemistryAnalysisResult, Reagent } from './labTypes';
import { RotateCcw, ZoomIn, ZoomOut, Eye, Sparkles } from 'lucide-react';

interface Lab3DViewProps {
  containers: ApparatusInstance[];
  activeContainerId: string;
  onSelectContainer: (id: string) => void;
  analyses: Record<string, ChemistryAnalysisResult>;
  isPouring: boolean;
  pouringReagent: Reagent | null;
}

export const Lab3DView: React.FC<Lab3DViewProps> = ({
  containers,
  activeContainerId,
  onSelectContainer,
  analyses,
  isPouring,
  pouringReagent,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraControlRef = useRef<{ resetView: () => void; zoomIn: () => void; zoomOut: () => void } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep slate high-contrast 3D lab environment

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 7.5);
    camera.lookAt(0, 1.15, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(5, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-6, 5, 4);
    scene.add(fillLight);

    // Laboratory Workbench Table
    const tableGeom = new THREE.BoxGeometry(11, 0.35, 6.5);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.15,
    });
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = -0.18;
    table.receiveShadow = true;
    scene.add(table);

    // Tabletop grid line accent
    const gridLineMat = new THREE.LineBasicMaterial({ color: 0x334155 });
    const gridPoints = [
      new THREE.Vector3(-5.2, 0.01, 1.5),
      new THREE.Vector3(5.2, 0.01, 1.5),
    ];
    const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const gridLine = new THREE.Line(gridGeo, gridLineMat);
    scene.add(gridLine);

    // Glass material for apparatuses
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      transmission: 0.92,
      thickness: 0.45,
    });

    const interactiveGroups: THREE.Object3D[] = [];
    const flames: THREE.Mesh[] = [];
    const flameLights: THREE.PointLight[] = [];
    let currentTargetPosition: THREE.Vector3 | null = null;

    // Distribute containers horizontally across workbench
    const containerCount = containers.length;
    const spacing = containerCount > 1 ? 7 / Math.max(1, containerCount - 1) : 0;
    const startX = containerCount > 1 ? -3.5 : 0;

    for (let index = 0; index < containers.length; index++) {
      const container = containers[index];
      const posX = containerCount === 1 ? 0 : startX + index * spacing;
      const posZ = 0.3;
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

        // Selection Highlight Ring on table
        const ringGeom = new THREE.RingGeometry(0.55, 0.65, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.02;
        group.add(ringMesh);

        // Top selection marker arrow / diamond
        const markerGeom = new THREE.OctahedronGeometry(0.12);
        const markerMat = new THREE.MeshStandardMaterial({ color: 0x14b8a6, emissive: 0x0f766e });
        const markerMesh = new THREE.Mesh(markerGeom, markerMat);
        markerMesh.position.y = 2.4;
        group.add(markerMesh);
      }

      const fillRatio = Math.min(0.9, Math.max(0, analysis.totalVolume / container.capacity));

      // 1. TEST TUBE 3D MODEL
      if (container.type === 'test_tube') {
        // Wooden rack stand for tube
        const rackBaseGeom = new THREE.BoxGeometry(0.8, 0.12, 0.8);
        const rackMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
        const rackBaseMesh = new THREE.Mesh(rackBaseGeom, rackMat);
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

        // Glass Tube
        const tubeCyl = new THREE.CylinderGeometry(0.24, 0.24, 1.4, 24, 1, true);
        const tubeMesh = new THREE.Mesh(tubeCyl, glassMat);
        tubeMesh.position.y = 0.85;
        tubeMesh.castShadow = true;
        group.add(tubeMesh);

        const tubeBottom = new THREE.SphereGeometry(0.24, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const bottomMesh = new THREE.Mesh(tubeBottom, glassMat);
        bottomMesh.position.y = 0.15;
        group.add(bottomMesh);

        const lipMesh = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 24), glassMat);
        lipMesh.rotation.x = Math.PI / 2;
        lipMesh.position.y = 1.55;
        group.add(lipMesh);

        // Liquid inside tube
        if (fillRatio > 0) {
          const liquidH = fillRatio * 1.25;
          const liqGeom = new THREE.CylinderGeometry(0.21, 0.21, liquidH, 20);
          const liqMat = new THREE.MeshStandardMaterial({
            color: analysis.liquidColor,
            transparent: true,
            opacity: analysis.liquidOpacity,
            roughness: 0.15,
          });
          const liqMesh = new THREE.Mesh(liqGeom, liqMat);
          liqMesh.position.y = 0.2 + liquidH / 2;
          group.add(liqMesh);

          // Precipitate inside
          if (analysis.precipitateColor !== null) {
            const pGeom = new THREE.CylinderGeometry(0.21, 0.21, 0.2, 16);
            const pMat = new THREE.MeshStandardMaterial({
              color: analysis.precipitateColor,
              roughness: 0.6,
            });
            const pMesh = new THREE.Mesh(pGeom, pMat);
            pMesh.position.y = 0.25;
            group.add(pMesh);
          }
        }
      }

      // 2. BEAKER 100 mL / 250 mL 3D MODEL
      else if (container.type === 'beaker_100' || container.type === 'beaker_250') {
        const radius = container.type === 'beaker_250' ? 0.68 : 0.52;
        const height = container.type === 'beaker_250' ? 1.45 : 1.2;

        const beakerCyl = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
        const beakerMesh = new THREE.Mesh(beakerCyl, glassMat);
        beakerMesh.position.y = height / 2;
        beakerMesh.castShadow = true;
        group.add(beakerMesh);

        const bottomDisc = new THREE.CircleGeometry(radius, 32);
        const bottomMesh = new THREE.Mesh(bottomDisc, glassMat);
        bottomMesh.rotation.x = Math.PI / 2;
        bottomMesh.position.y = 0.01;
        group.add(bottomMesh);

        const lipMesh = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.02, 0.025, 8, 32), glassMat);
        lipMesh.rotation.x = Math.PI / 2;
        lipMesh.position.y = height;
        group.add(lipMesh);

        // Liquid inside beaker
        if (fillRatio > 0) {
          const liquidH = fillRatio * (height - 0.15);
          const liqGeom = new THREE.CylinderGeometry(radius - 0.03, radius - 0.03, liquidH, 24);
          const liqMat = new THREE.MeshStandardMaterial({
            color: analysis.liquidColor,
            transparent: true,
            opacity: analysis.liquidOpacity,
            roughness: 0.12,
          });
          const liqMesh = new THREE.Mesh(liqGeom, liqMat);
          liqMesh.position.y = 0.02 + liquidH / 2;
          group.add(liqMesh);

          if (analysis.precipitateColor !== null) {
            const pGeom = new THREE.CylinderGeometry(radius - 0.03, radius - 0.03, 0.18, 20);
            const pMat = new THREE.MeshStandardMaterial({
              color: analysis.precipitateColor,
              roughness: 0.6,
            });
            const pMesh = new THREE.Mesh(pGeom, pMat);
            pMesh.position.y = 0.1;
            group.add(pMesh);
          }
        }
      }

      // 3. ERLENMEYER FLASK 3D MODEL
      else if (container.type === 'erlenmeyer') {
        const flaskGeom = new THREE.CylinderGeometry(0.25, 0.72, 1.3, 32, 1, true);
        const flaskMesh = new THREE.Mesh(flaskGeom, glassMat);
        flaskMesh.position.y = 0.65;
        flaskMesh.castShadow = true;
        group.add(flaskMesh);

        const neckGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.45, 24, 1, true);
        const neckMesh = new THREE.Mesh(neckGeom, glassMat);
        neckMesh.position.y = 1.45;
        group.add(neckMesh);

        const bottomMesh = new THREE.Mesh(new THREE.CircleGeometry(0.72, 32), glassMat);
        bottomMesh.rotation.x = Math.PI / 2;
        bottomMesh.position.y = 0.01;
        group.add(bottomMesh);

        if (fillRatio > 0) {
          const liquidH = fillRatio * 1.0;
          const liqGeom = new THREE.CylinderGeometry(
            0.72 - fillRatio * 0.4,
            0.69,
            liquidH,
            24
          );
          const liqMat = new THREE.MeshStandardMaterial({
            color: analysis.liquidColor,
            transparent: true,
            opacity: analysis.liquidOpacity,
            roughness: 0.15,
          });
          const liqMesh = new THREE.Mesh(liqGeom, liqMat);
          liqMesh.position.y = 0.02 + liquidH / 2;
          group.add(liqMesh);
        }
      }

      // 4. ROUND-BOTTOM FLASK 3D MODEL
      else if (container.type === 'round_flask') {
        const ringStand = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.08, 12, 24),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
        );
        ringStand.rotation.x = Math.PI / 2;
        ringStand.position.y = 0.08;
        group.add(ringStand);

        const sphereGeom = new THREE.SphereGeometry(0.65, 32, 24);
        const sphereMesh = new THREE.Mesh(sphereGeom, glassMat);
        sphereMesh.position.y = 0.68;
        group.add(sphereMesh);

        const neckGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 20, 1, true);
        const neckMesh = new THREE.Mesh(neckGeom, glassMat);
        neckMesh.position.y = 1.5;
        group.add(neckMesh);

        if (fillRatio > 0) {
          const liqSphere = new THREE.SphereGeometry(0.62 * Math.min(1, fillRatio * 1.5), 20, 16);
          const liqMat = new THREE.MeshStandardMaterial({
            color: analysis.liquidColor,
            transparent: true,
            opacity: analysis.liquidOpacity,
          });
          const liqMesh = new THREE.Mesh(liqSphere, liqMat);
          liqMesh.position.y = 0.55;
          group.add(liqMesh);
        }
      }

      // 5. ALCOHOL BURNER 3D MODEL
      else if (container.type === 'burner') {
        const burnerBaseGeom = new THREE.CylinderGeometry(0.45, 0.55, 0.6, 24);
        const burnerBaseMat = new THREE.MeshPhysicalMaterial({
          color: 0x0284c7,
          roughness: 0.1,
          transmission: 0.8,
          thickness: 0.3,
        });
        const burnerMesh = new THREE.Mesh(burnerBaseGeom, burnerBaseMat);
        burnerMesh.position.y = 0.3;
        group.add(burnerMesh);

        const collarGeom = new THREE.CylinderGeometry(0.18, 0.2, 0.15, 16);
        const collarMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
        const collarMesh = new THREE.Mesh(collarGeom, collarMat);
        collarMesh.position.y = 0.68;
        group.add(collarMesh);

        if (container.isHeated) {
          const flameGeom = new THREE.ConeGeometry(0.16, 0.55, 16);
          const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
          const flameMesh = new THREE.Mesh(flameGeom, flameMat);
          flameMesh.position.y = 1.05;
          group.add(flameMesh);
          flames.push(flameMesh);

          const flameLight = new THREE.PointLight(0xf59e0b, 2.5, 5);
          flameLight.position.set(posX, 1.1, posZ);
          scene.add(flameLight);
          flameLights.push(flameLight);
        }
      }

      interactiveGroups.push(group);
      scene.add(group);
    }

    // Animated Pouring Stream in 3D
    let pouringStreamMesh: THREE.Mesh | null = null;
    if (isPouring && currentTargetPosition && pouringReagent) {
      const streamGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16);
      const streamMat = new THREE.MeshStandardMaterial({
        color: pouringReagent.defaultColor,
        transparent: true,
        opacity: 0.85,
        roughness: 0.2,
      });
      pouringStreamMesh = new THREE.Mesh(streamGeom, streamMat);
      pouringStreamMesh.position.set(currentTargetPosition.x, 2.4, currentTargetPosition.z);
      scene.add(pouringStreamMesh);
    }

    // Interactive Drag to Rotate Camera & Click to Select Apparatus (Raycasting)
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let prevMouse = { x: 0, y: 0 };
    const spherical = { radius: 7.5, theta: 0, phi: Math.PI / 4.2 };

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const getRaycastContainer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVector, camera);

      const intersects = raycaster.intersectObjects(interactiveGroups, true);
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

      spherical.theta -= dx * 0.007;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.2, spherical.phi - dy * 0.007));

      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 1.15, 0);

      prevMouse = { x: clientX, y: clientY };
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
        const dist = Math.hypot(clientX - pointerDownPos.x, clientY - pointerDownPos.y);

        if (dist < 6) {
          const clickedId = getRaycastContainer(clientX, clientY);
          if (clickedId) {
            onSelectContainer(clickedId);
          }
        }
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
      }
    };

    // Camera view controls API
    cameraControlRef.current = {
      resetView: () => {
        spherical.radius = 7.5;
        spherical.theta = 0;
        spherical.phi = Math.PI / 4.2;
        camera.position.set(0, 3.8, 7.5);
        camera.lookAt(0, 1.15, 0);
      },
      zoomIn: () => {
        spherical.radius = Math.max(4.0, spherical.radius - 1.0);
        camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        camera.position.y = spherical.radius * Math.cos(spherical.phi);
        camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        camera.lookAt(0, 1.15, 0);
      },
      zoomOut: () => {
        spherical.radius = Math.min(12.0, spherical.radius + 1.0);
        camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        camera.position.y = spherical.radius * Math.cos(spherical.phi);
        camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        camera.lookAt(0, 1.15, 0);
      },
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Wheel zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(4.0, Math.min(12.0, spherical.radius + e.deltaY * 0.005));
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 1.15, 0);
    };
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.04;

      // Flame flicker
      flames.forEach((flame) => {
        flame.scale.y = 0.9 + Math.sin(clock * 8) * 0.15;
        flame.scale.x = 0.95 + Math.cos(clock * 6) * 0.1;
      });

      // Pouring stream pulsation
      if (pouringStreamMesh) {
        pouringStreamMesh.scale.x = 0.9 + Math.sin(clock * 12) * 0.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      flameLights.forEach((fl) => scene.remove(fl));
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [containers, activeContainerId, analyses, isPouring, pouringReagent]);

  return (
    <div className="relative w-full h-[520px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
      <div ref={mountRef} className="w-full h-full cursor-grab" />

      {/* 3D Camera Controls Floating Bar */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-lg">
        <button
          onClick={() => cameraControlRef.current?.zoomIn()}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          title="Phóng to 3D"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => cameraControlRef.current?.zoomOut()}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          title="Thu nhỏ 3D"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => cameraControlRef.current?.resetView()}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-teal-300 hover:text-white hover:bg-teal-900/50 rounded-lg transition-all"
          title="Đặt lại góc nhìn 3D ban đầu"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại góc nhìn</span>
        </button>
      </div>

      {/* Overlay Help Tip */}
      <div className="absolute bottom-3 left-4 text-xs font-semibold text-slate-400 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
        <Eye className="w-3.5 h-3.5 text-teal-400" />
        <span>Kéo chuột để xoay 360° • Cuộn để zoom • Nhấp trực tiếp vào dụng cụ để chọn</span>
      </div>
    </div>
  );
};
