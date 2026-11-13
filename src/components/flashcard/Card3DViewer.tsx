import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Card3DViewerProps {
  modelType: 'H2O' | 'H2SO4' | 'SO3' | 'CH4' | 'CO2' | 'NH3' | 'O2' | 'NaCl' | 'CuSO4';
  className?: string;
  height?: number;
  interactive?: boolean;
}

export const Card3DViewer: React.FC<Card3DViewerProps> = ({
  modelType,
  className = '',
  height = 175,
  interactive = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 240;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);

    // Studio Lighting for Scientific Presentation
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.25);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.65);
    fillLight.position.set(-4, -3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    // Standard CPK Color Materials with Natural Specular Shading
    const matO = new THREE.MeshPhongMaterial({
      color: 0xef4444, // Oxygen: Red
      specular: 0x442222,
      shininess: 70,
    });
    const matH = new THREE.MeshPhongMaterial({
      color: 0xf8fafc, // Hydrogen: White/Light Silver
      specular: 0x333333,
      shininess: 50,
    });
    const matS = new THREE.MeshPhongMaterial({
      color: 0xfacc15, // Sulfur: Yellow
      specular: 0x443300,
      shininess: 80,
    });
    const matC = new THREE.MeshPhongMaterial({
      color: 0x334155, // Carbon: Dark Charcoal
      specular: 0x222222,
      shininess: 60,
    });
    const matN = new THREE.MeshPhongMaterial({
      color: 0x2563eb, // Nitrogen: Blue
      specular: 0x112244,
      shininess: 75,
    });
    const matBond = new THREE.MeshPhongMaterial({
      color: 0x94a3b8, // Covalent Bond: Slate Cylinder
      specular: 0x222222,
      shininess: 40,
    });

    // Helper: Add atom sphere
    const addAtom = (pos: THREE.Vector3, radius: number, material: THREE.Material) => {
      const geom = new THREE.SphereGeometry(radius, 32, 32);
      const mesh = new THREE.Mesh(geom, material);
      mesh.position.copy(pos);
      moleculeGroup.add(mesh);
      return mesh;
    };

    // Helper: Add bond cylinder connecting two exact atom centers
    const addBond = (v1: THREE.Vector3, v2: THREE.Vector3, radius = 0.075) => {
      const distance = v1.distanceTo(v2);
      const geom = new THREE.CylinderGeometry(radius, radius, distance, 24);
      const mesh = new THREE.Mesh(geom, matBond);

      // Midpoint
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      mesh.position.copy(mid);

      // Align cylinder axis (default is Y) with vector (v2 - v1)
      const dir = new THREE.Vector3().subVectors(v2, v1).normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

      moleculeGroup.add(mesh);
      return mesh;
    };

    // Construct 3D Molecular Geometry with Strict Scientific Accuracy
    if (modelType === 'H2O') {
      // 1. H2O (Water)
      // Geometry: Bent (gấp khúc) ~ 104.5 degrees
      // Central Oxygen (red), 2 Hydrogens (white), 2 single covalent bonds
      // Bond length ~ 1.05 units
      const posO = new THREE.Vector3(0, 0, 0);
      const bondLen = 1.05;
      const angleRad = (104.5 * Math.PI) / 180;
      const halfAngle = angleRad / 2;

      const posH1 = new THREE.Vector3(
        bondLen * Math.sin(halfAngle),
        -bondLen * Math.cos(halfAngle),
        0
      );
      const posH2 = new THREE.Vector3(
        -bondLen * Math.sin(halfAngle),
        -bondLen * Math.cos(halfAngle),
        0
      );

      addAtom(posO, 0.44, matO);
      addAtom(posH1, 0.27, matH);
      addAtom(posH2, 0.27, matH);

      addBond(posO, posH1, 0.075);
      addBond(posO, posH2, 0.075);

      // Fixed optimal 3D perspective angle showing bent geometry clearly
      moleculeGroup.rotation.set(0.18, 0.38, 0.05);
    } else if (modelType === 'CH4') {
      // 2. CH4 (Methane)
      // Geometry: Regular Tetrahedron (tứ diện đều) ~ 109.5 degrees
      // Central Carbon (dark grey), 4 Hydrogens (white), 4 C-H bonds
      const posC = new THREE.Vector3(0, 0, 0);
      const r = 1.1;

      const posH1 = new THREE.Vector3(0, r, 0);
      const posH2 = new THREE.Vector3((2 * Math.SQRT2 * r) / 3, -r / 3, 0);
      const posH3 = new THREE.Vector3(
        (-Math.SQRT2 * r) / 3,
        -r / 3,
        Math.sqrt(2 / 3) * r
      );
      const posH4 = new THREE.Vector3(
        (-Math.SQRT2 * r) / 3,
        -r / 3,
        -Math.sqrt(2 / 3) * r
      );

      addAtom(posC, 0.42, matC);
      addAtom(posH1, 0.25, matH);
      addAtom(posH2, 0.25, matH);
      addAtom(posH3, 0.25, matH);
      addAtom(posH4, 0.25, matH);

      addBond(posC, posH1, 0.075);
      addBond(posC, posH2, 0.075);
      addBond(posC, posH3, 0.075);
      addBond(posC, posH4, 0.075);

      // Fixed optimal 3D perspective angle showcasing all 4 tetrahedral vertices
      moleculeGroup.rotation.set(0.35, 0.55, 0.1);
    } else if (modelType === 'SO3') {
      // 3. SO3 (Sulfur trioxide)
      // Geometry: Trigonal Planar (tam giác phẳng đều) ~ 120 degrees
      // Central Sulfur (yellow), 3 Oxygens (red), 3 S-O bonds
      const posS = new THREE.Vector3(0, 0, 0);
      const r = 1.15;

      const posO1 = new THREE.Vector3(0, r, 0);
      const posO2 = new THREE.Vector3(
        r * Math.sin((120 * Math.PI) / 180),
        r * Math.cos((120 * Math.PI) / 180),
        0
      );
      const posO3 = new THREE.Vector3(
        r * Math.sin((240 * Math.PI) / 180),
        r * Math.cos((240 * Math.PI) / 180),
        0
      );

      addAtom(posS, 0.48, matS);
      addAtom(posO1, 0.36, matO);
      addAtom(posO2, 0.36, matO);
      addAtom(posO3, 0.36, matO);

      addBond(posS, posO1, 0.08);
      addBond(posS, posO2, 0.08);
      addBond(posS, posO3, 0.08);

      // Fixed optimal 3D perspective angle tilted to show planar symmetry in 3D
      moleculeGroup.rotation.set(0.62, 0.42, 0.12);
    } else if (modelType === 'H2SO4') {
      // 4. H2SO4 (Sulfuric acid)
      // Exact atoms: 1 Sulfur (center), 4 Oxygens (tetrahedral arrangement), 2 Hydrogens (bonded to 2 of the Oxygens)
      // Total: exactly 7 atoms, 6 bonds. No floating spheres or loose cylinders.
      const posS = new THREE.Vector3(0, 0, 0);
      const rSO = 1.15;

      // 4 Oxygens located at tetrahedral positions around Sulfur
      // O1 and O2 are terminal oxo Oxygens (=O)
      const posO1 = new THREE.Vector3(0, rSO, 0);
      const posO2 = new THREE.Vector3(
        (2 * Math.SQRT2 * rSO) / 3,
        -rSO / 3,
        0
      );

      // O3 and O4 are hydroxyl Oxygens (-OH)
      const posO3 = new THREE.Vector3(
        (-Math.SQRT2 * rSO) / 3,
        -rSO / 3,
        Math.sqrt(2 / 3) * rSO
      );
      const posO4 = new THREE.Vector3(
        (-Math.SQRT2 * rSO) / 3,
        -rSO / 3,
        -Math.sqrt(2 / 3) * rSO
      );

      // Hydrogens placed at realistic covalent distance (~0.75) bonded to O3 and O4
      const rOH = 0.75;
      const posH1 = new THREE.Vector3()
        .copy(posO3)
        .add(new THREE.Vector3(-0.45, 0.45, 0.45).normalize().multiplyScalar(rOH));
      const posH2 = new THREE.Vector3()
        .copy(posO4)
        .add(new THREE.Vector3(-0.45, 0.45, -0.45).normalize().multiplyScalar(rOH));

      // Add exactly 7 atoms
      addAtom(posS, 0.48, matS); // 1 Central Sulfur
      addAtom(posO1, 0.35, matO); // 4 Oxygens
      addAtom(posO2, 0.35, matO);
      addAtom(posO3, 0.35, matO);
      addAtom(posO4, 0.35, matO);
      addAtom(posH1, 0.24, matH); // 2 Hydrogens
      addAtom(posH2, 0.24, matH);

      // Add exactly 6 bonds
      addBond(posS, posO1, 0.08);
      addBond(posS, posO2, 0.08);
      addBond(posS, posO3, 0.075);
      addBond(posS, posO4, 0.075);
      addBond(posO3, posH1, 0.06);
      addBond(posO4, posH2, 0.06);

      // Fixed optimal 3D perspective angle showing central S, 4 O and both H branches
      moleculeGroup.rotation.set(-0.25, 0.65, 0.1);
    } else if (modelType === 'CO2') {
      // Linear (thẳng hàng) 180 degrees
      const posC = new THREE.Vector3(0, 0, 0);
      const posO1 = new THREE.Vector3(-1.15, 0, 0);
      const posO2 = new THREE.Vector3(1.15, 0, 0);

      addAtom(posC, 0.42, matC);
      addAtom(posO1, 0.36, matO);
      addAtom(posO2, 0.36, matO);

      addBond(posC, posO1, 0.08);
      addBond(posC, posO2, 0.08);

      moleculeGroup.rotation.set(0.25, 0.45, 0);
    } else if (modelType === 'NH3') {
      // Trigonal Pyramidal (chóp tam giác đều) - chính xác góc liên kết H-N-H = 107 độ
      // Nguyên tử N (xanh lam) ở đỉnh chóp, 3 nguyên tử H (trắng) ở 3 đỉnh đáy tam giác đều
      const r = 1.067;
      const h = 0.428;
      const posN = new THREE.Vector3(0, h * 0.5, 0);
      const posH1 = new THREE.Vector3(0, -h * 0.5, r);
      const posH2 = new THREE.Vector3(r * 0.866, -h * 0.5, -r * 0.5);
      const posH3 = new THREE.Vector3(-r * 0.866, -h * 0.5, -r * 0.5);

      addAtom(posN, 0.44, matN);
      addAtom(posH1, 0.25, matH);
      addAtom(posH2, 0.25, matH);
      addAtom(posH3, 0.25, matH);

      addBond(posN, posH1, 0.075);
      addBond(posN, posH2, 0.075);
      addBond(posN, posH3, 0.075);

      // Góc nhìn ban đầu tối ưu, quan sát rõ 3 liên kết N-H không bị che khuất
      moleculeGroup.rotation.set(0.35, 0.52, 0.08);
    } else if (modelType === 'CuSO4') {
      // Copper(II) sulfate (CuSO4) - Phức tinh thể ion Cu2+ (xanh lam) và gốc SO4(2-) (tứ diện)
      const matCu = new THREE.MeshPhongMaterial({ color: 0x0284c7, specular: 0x3388cc, shininess: 85 });
      const posCu = new THREE.Vector3(-0.95, 0, 0);
      const posS = new THREE.Vector3(0.95, 0, 0);
      addAtom(posCu, 0.46, matCu); // Cu2+
      addAtom(posS, 0.44, matS); // S

      // 4 nguyên tử O xếp thành tứ diện quanh S
      const rO = 0.95;
      const posO1 = new THREE.Vector3(0.95, rO, 0);
      const posO2 = new THREE.Vector3(0.95 + (2 * Math.SQRT2 * rO) / 3, -rO / 3, 0);
      const posO3 = new THREE.Vector3(0.95 - (Math.SQRT2 * rO) / 3, -rO / 3, Math.sqrt(2 / 3) * rO);
      const posO4 = new THREE.Vector3(0.95 - (Math.SQRT2 * rO) / 3, -rO / 3, -Math.sqrt(2 / 3) * rO);

      addAtom(posO1, 0.33, matO);
      addAtom(posO2, 0.33, matO);
      addAtom(posO3, 0.33, matO);
      addAtom(posO4, 0.33, matO);

      addBond(posS, posO1, 0.075);
      addBond(posS, posO2, 0.075);
      addBond(posS, posO3, 0.075);
      addBond(posS, posO4, 0.075);

      // Cặp liên kết phối trí ion Cu2+ --- SO4(2-)
      addBond(posCu, posS, 0.05);

      moleculeGroup.rotation.set(0.3, 0.5, 0.1);
    } else if (modelType === 'NaCl') {
      // NaCl Crystal Unit (Na+ purple, Cl- green)
      const matNa = new THREE.MeshPhongMaterial({ color: 0xa855f7, shininess: 60 });
      const matCl = new THREE.MeshPhongMaterial({ color: 0x22c55e, shininess: 60 });
      const s = 0.65;
      const coords = [
        { pos: new THREE.Vector3(-s, -s, -s), isNa: true },
        { pos: new THREE.Vector3(s, -s, -s), isNa: false },
        { pos: new THREE.Vector3(-s, s, -s), isNa: false },
        { pos: new THREE.Vector3(s, s, -s), isNa: true },
        { pos: new THREE.Vector3(-s, -s, s), isNa: false },
        { pos: new THREE.Vector3(s, -s, s), isNa: true },
        { pos: new THREE.Vector3(-s, s, s), isNa: true },
        { pos: new THREE.Vector3(s, s, s), isNa: false },
      ];
      coords.forEach((c) => {
        addAtom(c.pos, c.isNa ? 0.28 : 0.38, c.isNa ? matNa : matCl);
      });
      // Add frame bonds
      const addIonicBond = (i: number, j: number) => addBond(coords[i].pos, coords[j].pos, 0.04);
      addIonicBond(0, 1); addIonicBond(1, 3); addIonicBond(3, 2); addIonicBond(2, 0);
      addIonicBond(4, 5); addIonicBond(5, 7); addIonicBond(7, 6); addIonicBond(6, 4);
      addIonicBond(0, 4); addIonicBond(1, 5); addIonicBond(2, 6); addIonicBond(3, 7);
      moleculeGroup.rotation.set(0.4, 0.55, 0.1);
    } else {
      // Diatomic O2
      const pos1 = new THREE.Vector3(-0.65, 0, 0);
      const pos2 = new THREE.Vector3(0.65, 0, 0);
      addAtom(pos1, 0.38, matO);
      addAtom(pos2, 0.38, matO);
      addBond(pos1, pos2, 0.08);
      moleculeGroup.rotation.set(0.2, 0.35, 0);
    }

    // Auto-Centering and Auto-Fitting to Frame
    // 1. Group geometry around its true geometric center
    const bbox = new THREE.Box3().setFromObject(moleculeGroup);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // Reposition all children so that moleculeGroup's origin is exactly the center of the molecule
    // (This guarantees rotation around origin rotates around true molecule center)
    moleculeGroup.position.sub(center);

    // Recompute bounding box and bounding sphere after centering
    const centeredBox = new THREE.Box3().setFromObject(moleculeGroup);
    const boundingSphere = new THREE.Sphere();
    centeredBox.getBoundingSphere(boundingSphere);

    // Compute required distance to fit the entire bounding sphere (plus safe margin) into camera view
    const fovY = (camera.fov * Math.PI) / 180;
    const aspect = width / height;
    const fovX = 2 * Math.atan(Math.tan(fovY / 2) * aspect);

    // Use sphere radius with safe margin of 25-30% so that ANY rotation angle never cuts off atoms/bonds
    const safeRadius = (boundingSphere.radius || 1.2) * 1.30;
    const distY = safeRadius / Math.sin(fovY / 2);
    const distX = safeRadius / Math.sin(fovX / 2);
    const fitDistance = Math.max(distX, distY);

    camera.position.set(0, 0, Math.max(fitDistance, 3.2));
    camera.lookAt(0, 0, 0);
    camera.near = 0.1;
    camera.far = 100;
    camera.updateProjectionMatrix();

    // Render initial view
    renderer.render(scene, camera);

    // ResizeObserver to handle card container dimensions reliably (grid layout, flips, mobile/desktop resize)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width || currentMount.clientWidth;
        if (newWidth > 0 && Math.abs(newWidth - camera.aspect * height) > 2) {
          const newAspect = newWidth / height;
          camera.aspect = newAspect;
          renderer.setSize(newWidth, height);
          
          const newFovX = 2 * Math.atan(Math.tan(fovY / 2) * newAspect);
          const newDistX = safeRadius / Math.sin(newFovX / 2);
          const newDist = Math.max(newDistX, distY);
          camera.position.z = Math.max(newDist, 3.2);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        }
      }
    });
    resizeObserver.observe(currentMount);

    // Interactive controls (rotation & wheel zoom in inspector modal)
    let cleanupListeners: (() => void) | null = null;

    if (interactive) {
      let isDragging = false;
      let prevPointer = { x: 0, y: 0 };

      const onPointerDown = (clientX: number, clientY: number) => {
        isDragging = true;
        prevPointer = { x: clientX, y: clientY };
      };

      const onPointerMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        const dx = clientX - prevPointer.x;
        const dy = clientY - prevPointer.y;
        moleculeGroup.rotation.y += dx * 0.01;
        moleculeGroup.rotation.x += dy * 0.01;
        prevPointer = { x: clientX, y: clientY };
        renderer.render(scene, camera);
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      // Mouse events
      const onMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
      const onMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
      const onMouseUp = () => onPointerUp();

      // Touch events for mobile support
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      };
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };
      const onTouchEnd = () => onPointerUp();

      // Mouse wheel zoom
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomDelta = e.deltaY * 0.005;
        camera.position.z = THREE.MathUtils.clamp(
          camera.position.z + zoomDelta,
          fitDistance * 0.6,
          fitDistance * 2.5
        );
        renderer.render(scene, camera);
      };

      const dom = renderer.domElement;
      dom.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      dom.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
      dom.addEventListener('wheel', onWheel, { passive: false });

      cleanupListeners = () => {
        dom.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        dom.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        dom.removeEventListener('wheel', onWheel);
      };
    }

    return () => {
      resizeObserver.disconnect();
      if (cleanupListeners) cleanupListeners();
      renderer.dispose();
      if (currentMount) currentMount.innerHTML = '';
    };
  }, [modelType, height, interactive]);

  return (
    <div className={`relative flex items-center justify-center select-none w-full ${className}`}>
      <div
        ref={mountRef}
        style={{ width: '100%', height: `${height}px` }}
        className={`w-full flex items-center justify-center overflow-hidden ${
          interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
        }`}
      />
    </div>
  );
};
