import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SplashScreen3DProps {
  onComplete: () => void;
  storeName?: string;
  storeLocation?: string;
  duration?: number;
}

/* ─────────────────── HELPERS ─────────────────── */

function makeToonGradient(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 4; canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  [64, 128, 192, 255].forEach((v, i) => {
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(i, 0, 1, 1);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function toon(color: number, gm: THREE.Texture): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ color, gradientMap: gm });
}

function outline(parent: THREE.Object3D, geo: THREE.BufferGeometry, s = 1.05) {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }));
  m.scale.setScalar(s);
  parent.add(m);
}

/* ─────────────────── BUILD CHARACTER ─────────────────── */

function buildKira(gm: THREE.Texture) {
  const kira = new THREE.Group();
  kira.rotation.y = 0.3;

  // ── HEAD ──
  const headG = new THREE.Group();
  headG.position.y = 2.2;

  const faceGeo = new THREE.SphereGeometry(0.32, 16, 16);
  const face = new THREE.Mesh(faceGeo, toon(0xFFD4A8, gm));
  face.scale.y = 0.92;
  headG.add(face);
  outline(headG, faceGeo, 1.04);

  // Eyes
  const irisMat = toon(0x7B61FF, gm);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

  [-0.11, 0.11].forEach((xOff) => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(xOff, 0.02, 0.28);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), whiteMat);
    sclera.scale.set(1, 1.1, 0.4);
    eyeGroup.add(sclera);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), irisMat);
    iris.position.z = 0.02;
    iris.scale.set(1, 1, 0.3);
    eyeGroup.add(iris);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pupilMat);
    pupil.position.z = 0.035;
    eyeGroup.add(pupil);

    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), whiteMat);
    highlight.position.set(0.02, 0.02, 0.04);
    eyeGroup.add(highlight);

    headG.add(eyeGroup);
  });

  // Eyebrows
  const browMat = new THREE.MeshBasicMaterial({ color: 0x1A1A2E });
  [-0.11, 0.11].forEach((xOff) => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), browMat);
    brow.position.set(xOff, 0.1, 0.3);
    brow.rotation.z = xOff < 0 ? 0.15 : -0.15;
    headG.add(brow);
  });

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), toon(0xE8B88A, gm));
  nose.position.set(0, -0.04, 0.32);
  headG.add(nose);

  // Mouth
  const mouthGeo = new THREE.TorusGeometry(0.05, 0.012, 8, 12, Math.PI);
  const mouth = new THREE.Mesh(mouthGeo, new THREE.MeshBasicMaterial({ color: 0xC4956A }));
  mouth.rotation.x = Math.PI;
  mouth.position.set(0, -0.1, 0.28);
  headG.add(mouth);

  // Ears
  [-0.3, 0.3].forEach((xOff) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), toon(0xF0D5A8, gm));
    ear.scale.x = 0.5;
    ear.position.set(xOff, 0, 0);
    headG.add(ear);
  });

  // Earbud (left ear)
  const earbud = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), new THREE.MeshBasicMaterial({ color: 0x2D2D4F }));
  earbud.position.set(-0.3, 0, 0.02);
  headG.add(earbud);

  // ── HAIR ──
  const hairMat = toon(0x1A1A2E, gm);

  const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), hairMat);
  hairTop.scale.y = 0.72;
  hairTop.position.y = 0.1;
  headG.add(hairTop);
  outline(headG, new THREE.SphereGeometry(0.35, 16, 16), 1.04);

  // Front bangs
  const bangGeo = new THREE.BoxGeometry(0.1, 0.18, 0.08);
  [-0.12, 0, 0.12].forEach((xOff, i) => {
    const bang = new THREE.Mesh(bangGeo, hairMat);
    bang.position.set(xOff, 0.12, 0.25);
    bang.rotation.x = i === 1 ? -0.2 : -0.1;
    headG.add(bang);
  });

  // Violet accent streak
  const streakMat = toon(0x7B61FF, gm);
  const streak = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.05), streakMat);
  streak.position.set(-0.14, 0.08, 0.26);
  streak.name = 'violetStreak';
  headG.add(streak);

  // Side hair
  [-0.28, 0.28].forEach((xOff) => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.06), hairMat);
    side.position.set(xOff, -0.06, 0.05);
    headG.add(side);
  });

  // Back hair
  const backHair = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.3, 8), hairMat);
  backHair.position.set(0, -0.08, -0.12);
  headG.add(backHair);

  headG.name = 'head';
  kira.add(headG);

  // ── NECK ──
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.18, 8), toon(0xFFD4A8, gm));
  neck.position.y = 1.88;
  kira.add(neck);

  // ── TORSO ──
  const torsoG = new THREE.Group();
  torsoG.position.y = 1.35;
  torsoG.name = 'torso';

  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.7, 8);
  const body = new THREE.Mesh(bodyGeo, toon(0xF0F0F0, gm));
  torsoG.add(body);
  outline(torsoG, bodyGeo, 1.04);

  // Collar
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 12), toon(0xDDDDDD, gm));
  collar.position.y = 0.32;
  collar.rotation.x = Math.PI / 2;
  torsoG.add(collar);

  // Apron
  const apronGeo = new THREE.BoxGeometry(0.5, 0.62, 0.04);
  const apron = new THREE.Mesh(apronGeo, toon(0x1E293B, gm));
  apron.position.set(0, -0.02, 0.14);
  torsoG.add(apron);
  outline(torsoG, apronGeo, 1.03);

  // Apron straps
  const strapMat = toon(0x1E293B, gm);
  [-0.18, 0.18].forEach((xOff) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.03), strapMat);
    strap.position.set(xOff, 0.35, 0.12);
    torsoG.add(strap);
  });

  // Pocket
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0x141D30, transparent: true, opacity: 0.6 }));
  pocket.position.set(-0.08, -0.12, 0.17);
  torsoG.add(pocket);

  // Badge
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), new THREE.MeshBasicMaterial({ color: 0x7B61FF }));
  badge.position.set(-0.08, -0.09, 0.2);
  torsoG.add(badge);

  kira.add(torsoG);

  // ── LEFT ARM (relaxed pose) ──
  const leftArmG = new THREE.Group();
  leftArmG.position.set(-0.32, 1.55, 0);

  const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 8), toon(0xF0F0F0, gm));
  lUpperArm.rotation.z = 0.5;
  lUpperArm.position.set(-0.1, -0.1, 0);
  leftArmG.add(lUpperArm);

  const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 8), toon(0xFFD4A8, gm));
  lForearm.position.set(-0.26, -0.22, 0.05);
  lForearm.rotation.z = 0.3;
  leftArmG.add(lForearm);

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), toon(0xFFD4A8, gm));
  lHand.scale.set(0.8, 0.85, 0.7);
  lHand.position.set(-0.36, -0.32, 0.08);
  leftArmG.add(lHand);

  // Wristband
  const wristband = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 12), new THREE.MeshBasicMaterial({ color: 0x2DD4BF, transparent: true, opacity: 0.7 }));
  wristband.position.set(-0.3, -0.26, 0.06);
  wristband.rotation.x = Math.PI / 2;
  leftArmG.add(wristband);

  kira.add(leftArmG);

  // ── RIGHT ARM (scanner arm) ──
  const rightArmG = new THREE.Group();
  rightArmG.position.set(0.32, 1.55, 0);
  rightArmG.name = 'rightArm';

  const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 8), toon(0xF0F0F0, gm));
  rUpperArm.rotation.set(-0.5, 0, -0.5);
  rUpperArm.position.set(0.1, -0.08, 0.08);
  rightArmG.add(rUpperArm);

  const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 8), toon(0xFFD4A8, gm));
  rForearm.rotation.set(-0.3, 0, -0.25);
  rForearm.position.set(0.24, -0.16, 0.2);
  rightArmG.add(rForearm);

  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), toon(0xFFD4A8, gm));
  rHand.scale.set(0.8, 0.85, 0.7);
  rHand.position.set(0.38, -0.2, 0.3);
  rightArmG.add(rHand);

  // Scanner gun
  const scannerG = new THREE.Group();
  scannerG.position.set(0.42, -0.18, 0.34);
  scannerG.rotation.set(0, -0.3, -0.1);
  scannerG.name = 'scanner';

  const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.08), toon(0x7B61FF, gm));
  scannerG.add(gunBody);
  outline(scannerG, new THREE.BoxGeometry(0.3, 0.1, 0.08), 1.06);

  const gunGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.07), toon(0x5B41DF, gm));
  gunGrip.position.set(-0.04, -0.11, 0);
  gunGrip.rotation.z = 0.25;
  scannerG.add(gunGrip);

  const triggerGeo = new THREE.TorusGeometry(0.025, 0.01, 6, 10, Math.PI);
  const trigger = new THREE.Mesh(triggerGeo, new THREE.MeshBasicMaterial({ color: 0xFBBF24 }));
  trigger.position.set(-0.02, -0.05, 0);
  trigger.rotation.z = Math.PI / 2;
  scannerG.add(trigger);

  const barrelTip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0x2DD4BF }));
  barrelTip.rotation.z = Math.PI / 2;
  barrelTip.position.set(0.18, 0, 0);
  barrelTip.name = 'barrelTip';
  scannerG.add(barrelTip);

  // Glow ring
  const glowRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.035, 0.008, 8, 16),
    new THREE.MeshBasicMaterial({ color: 0x7B61FF, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
  );
  glowRing.position.set(0.18, 0, 0);
  glowRing.rotation.y = Math.PI / 2;
  glowRing.name = 'glowRing';
  scannerG.add(glowRing);

  rightArmG.add(scannerG);
  kira.add(rightArmG);

  // ── LEGS ──
  const legsG = new THREE.Group();
  legsG.position.y = 0.55;

  const hipGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.15, 8);
  legsG.add(new THREE.Mesh(hipGeo, toon(0x1E293B, gm)));

  const pantsMat = toon(0x1E1E2E, gm);

  // Left leg (forward-leaning)
  const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 8), pantsMat);
  lLeg.position.set(-0.1, -0.35, 0.06);
  lLeg.rotation.x = -0.08;
  legsG.add(lLeg);

  // Right leg
  const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 8), pantsMat);
  rLeg.position.set(0.1, -0.35, -0.04);
  rLeg.rotation.x = 0.06;
  legsG.add(rLeg);

  // Shoes
  const shoeMat = toon(0xF0F0F0, gm);
  const shoeGeo = new THREE.BoxGeometry(0.14, 0.08, 0.24);

  const lShoe = new THREE.Mesh(shoeGeo, shoeMat);
  lShoe.position.set(-0.1, -0.64, 0.1);
  legsG.add(lShoe);
  outline(legsG, shoeGeo, 1.06);

  const rShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rShoe.position.set(0.1, -0.64, 0);
  legsG.add(rShoe);

  // Shoe accents
  [lShoe, rShoe].forEach(shoe => {
    const accent = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), new THREE.MeshBasicMaterial({ color: 0x7B61FF }));
    accent.position.set(0, 0.02, 0.1);
    shoe.add(accent);
  });

  kira.add(legsG);

  return kira;
}

/* ────────────────── BUILD PRODUCT BOX ────────────────── */

function buildProduct(gm: THREE.Texture) {
  const product = new THREE.Group();
  product.name = 'product';

  const boxGeo = new THREE.BoxGeometry(0.38, 0.52, 0.2);
  const box = new THREE.Mesh(boxGeo, toon(0xFF6B6B, gm));
  product.add(box);
  outline(product, boxGeo, 1.05);

  // White label
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.44),
    new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 })
  );
  label.position.z = 0.101;
  product.add(label);

  // Barcode lines
  const barMat = new THREE.MeshBasicMaterial({ color: 0x1A1A1A });
  [-0.06, -0.03, 0, 0.03, 0.06, 0.09].forEach((xOff, i) => {
    const w = i % 3 === 0 ? 0.02 : 0.012;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.001), barMat);
    bar.position.set(xOff - 0.015, -0.06, 0.103);
    product.add(bar);
  });

  // Brand color blocks (fake text)
  [0.08, 0.03].forEach((yOff) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.001), new THREE.MeshBasicMaterial({ color: 0xFF6B6B }));
    block.position.set(0, yOff + 0.08, 0.103);
    product.add(block);
  });

  // Scan flash overlay
  const flash = new THREE.Mesh(
    new THREE.BoxGeometry(0.39, 0.53, 0.21),
    new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0 })
  );
  flash.name = 'scanFlash';
  product.add(flash);

  product.position.set(1.8, 1.3, 0.5);
  return product;
}

/* ────────────────── BUILD SCAN BEAM ────────────────── */

function buildScanBeam() {
  const beamG = new THREE.Group();
  beamG.name = 'scanBeam';
  beamG.visible = false;

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x7B61FF, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 1.2, 8), beamMat);
  beam.rotation.z = Math.PI / 2;
  beam.position.x = 0.6;
  beamG.add(beam);

  // Outer glow
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x7B61FF, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.2, 8), glowMat);
  glow.rotation.z = Math.PI / 2;
  glow.position.x = 0.6;
  beamG.add(glow);

  // Position beam origin at scanner tip area
  beamG.position.set(0.85, 1.38, 0.55);

  return beamG;
}

/* ────────────────── BUILD PARTICLES ────────────────── */

function buildImpactParticles() {
  const particles: THREE.Mesh[] = [];
  const colors = [0x7B61FF, 0x2DD4BF, 0xFBBF24, 0xF472B6];
  const group = new THREE.Group();
  group.name = 'impactParticles';
  group.position.set(1.8, 1.3, 0.5);
  group.visible = false;

  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      new THREE.MeshBasicMaterial({ color: colors[i % 4], transparent: true, opacity: 1 })
    );
    m.userData.dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.3) * 2,
      (Math.random() - 0.5) * 2
    ).normalize().multiplyScalar(0.8 + Math.random());
    m.userData.life = 0;
    group.add(m);
    particles.push(m);
  }

  return { group, particles };
}

function buildAmbientSparkles() {
  const count = 50;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = Math.random() * 5;
    positions[i * 3 + 2] = -1 - Math.random() * 7;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({ color: 0xA78BFA, size: 0.04, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
  return new THREE.Points(geo, mat);
}

function buildBackgroundBoxes() {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x7B61FF, transparent: true, opacity: 0.2 });
  const geo = new THREE.BoxGeometry(0.05, 0.05, 0.05);

  for (let i = 0; i < 30; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set((Math.random() - 0.5) * 8, Math.random() * 5, -2 - Math.random() * 6);
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    m.userData.rotSpeed = (Math.random() - 0.5) * 0.01;
    group.add(m);
  }
  return group;
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */

export default function SplashScreen3D({
  onComplete,
  storeName = 'FreshMart',
  storeLocation = 'Kondapur',
  duration = 3000,
}: SplashScreen3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  // 0=dark 1=enter 2=settle 3=charge 4=fire 5=logo 6=hold 7=exit

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setPhase(6);
      const t = setTimeout(onComplete, 1200);
      return () => clearTimeout(t);
    }

    // ── Scene setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x0D0D0D);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    keyLight.position.set(3, 5, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xA78BFA, 0.6);
    fillLight.position.set(-4, 2, 1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x2DD4BF, 0.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0x1a0a2e, 0.4);
    scene.add(ambient);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({ color: 0x0D0D0D })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    scene.add(floor);

    // Floor glow
    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.8, 32),
      new THREE.MeshBasicMaterial({ color: 0x7B61FF, transparent: true, opacity: 0.08 })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -0.09;
    floorGlow.name = 'floorGlow';
    scene.add(floorGlow);

    // Build everything
    const gm = makeToonGradient();
    const kira = buildKira(gm);
    kira.position.y = -3; // Start below for entrance animation
    scene.add(kira);

    const product = buildProduct(gm);
    product.visible = false;
    scene.add(product);

    const scanBeam = buildScanBeam();
    scene.add(scanBeam);

    const { group: impactGroup, particles: impactParts } = buildImpactParticles();
    scene.add(impactGroup);

    const sparkles = buildAmbientSparkles();
    scene.add(sparkles);

    const bgBoxes = buildBackgroundBoxes();
    scene.add(bgBoxes);

    // ── Phase timers ──
    const timers = [
      setTimeout(() => setPhase(1), 50),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 700),
      setTimeout(() => setPhase(4), 900),
      setTimeout(() => setPhase(5), 1200),
      setTimeout(() => setPhase(6), 1600),
      setTimeout(() => setPhase(7), duration - 400),
      setTimeout(onComplete, duration),
    ];

    // ── Animation state ──
    let scanFired = false;
    let scanTime = 0;
    const startTime = Date.now();
    const clock = new THREE.Clock();
    let frameId = 0;
    let currentPhase = 0;
    const phaseRef = { current: 0 };

    // ── Animation loop ──
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const elapsed = (Date.now() - startTime) / 1000;

      // Camera dolly
      camera.position.z = 5.5 - elapsed * 0.23;
      camera.position.y = 1.2 + elapsed * 0.07;
      camera.lookAt(0, 0.8, 0);

      // Character entrance (spring up from below)
      if (currentPhase >= 1 && kira.position.y < 0) {
        kira.position.y += (0 - kira.position.y) * 0.08;
        if (Math.abs(kira.position.y) < 0.02) kira.position.y = 0;
      }

      // idle breathing
      const torso = kira.getObjectByName('torso');
      if (torso && currentPhase >= 2) {
        torso.scale.y = 1 + Math.sin(t * 1.2) * 0.012;
        torso.position.y = 1.35 + Math.sin(t * 1.2) * 0.008;
      }

      // Head subtle bob
      const head = kira.getObjectByName('head');
      if (head && currentPhase >= 2) {
        head.position.y = 2.2 + Math.sin(t * 1.2) * 0.005;
      }

      // Hair sway
      const streak = kira.getObjectByName('violetStreak');
      if (streak) {
        streak.rotation.z = Math.sin(t * 0.8 + 0.4) * 0.06;
      }

      // Scanner glow pulse
      const glowRing = kira.getObjectByName('glowRing') as THREE.Mesh | undefined;
      if (glowRing && currentPhase >= 2) {
        const s = 1 + Math.sin(t * 7.8) * 0.3;
        glowRing.scale.setScalar(s);
      }

      // Eye blink (at ~1.2s and ~2.4s)
      if (head) {
        head.children.forEach(child => {
          if (child instanceof THREE.Group) {
            const blinkTime1 = Math.abs(elapsed - 1.2);
            const blinkTime2 = Math.abs(elapsed - 2.4);
            const isBlinking = blinkTime1 < 0.06 || blinkTime2 < 0.06;
            child.scale.y = isBlinking ? 0.05 : 1;
          }
        });
      }

      // Product float
      if (currentPhase >= 2) {
        if (!product.visible) product.visible = true;
        product.position.y = 1.3 + Math.sin(t * 1.8) * 0.12;
        product.rotation.y = Math.sin(t * 1.1) * 0.15;
        product.rotation.z = Math.sin(t * 0.8) * 0.06;
      }

      // Scan fire!
      if (currentPhase >= 4 && !scanFired) {
        scanFired = true;
        scanTime = t;
        scanBeam.visible = true;
        scanBeam.scale.x = 0.01;
        impactGroup.visible = true;

        // Flash product
        const flash = product.getObjectByName('scanFlash') as THREE.Mesh;
        if (flash) {
          (flash.material as THREE.MeshBasicMaterial).opacity = 0.35;
          setTimeout(() => { (flash.material as THREE.MeshBasicMaterial).opacity = 0; }, 200);
        }
      }

      // Beam extend
      if (scanBeam.visible && scanBeam.scale.x < 1) {
        scanBeam.scale.x += (1 - scanBeam.scale.x) * 0.12;
        if (scanBeam.scale.x > 0.98) scanBeam.scale.x = 1;
      }

      // Beam pulse
      if (scanBeam.visible && scanBeam.scale.x >= 0.98) {
        const beamMesh = scanBeam.children[0] as THREE.Mesh;
        if (beamMesh) {
          (beamMesh.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 10) * 0.35;
        }
      }

      // Arm recoil
      const rightArm = kira.getObjectByName('rightArm');
      if (rightArm && scanFired) {
        const recoilDt = t - scanTime;
        if (recoilDt < 0.25) {
          rightArm.rotation.x = Math.sin(recoilDt * Math.PI / 0.25) * -0.15;
        } else {
          rightArm.rotation.x *= 0.95;
        }
      }

      // Impact particles
      if (impactGroup.visible) {
        impactParts.forEach(p => {
          p.userData.life += 0.016;
          if (p.userData.life > 0.5) {
            p.userData.life = 0;
            p.position.set(0, 0, 0);
            (p.material as THREE.MeshBasicMaterial).opacity = 1;
          } else {
            const speed = p.userData.life * 2;
            p.position.add(p.userData.dir.clone().multiplyScalar(0.03));
            (p.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - p.userData.life * 2.5);
          }
        });
      }

      // Ambient sparkles drift up
      const sparkPos = sparkles.geometry.attributes.position;
      for (let i = 0; i < sparkPos.count; i++) {
        const y = sparkPos.getY(i) + 0.003;
        sparkPos.setY(i, y > 5 ? 0 : y);
      }
      sparkPos.needsUpdate = true;

      // Background boxes rotation
      bgBoxes.children.forEach(child => {
        child.rotation.x += child.userData.rotSpeed;
        child.rotation.y += child.userData.rotSpeed * 0.7;
      });

      // Floor glow pulse
      const fg = scene.getObjectByName('floorGlow') as THREE.Mesh;
      if (fg && currentPhase >= 2) {
        const s = 1 + Math.sin(t * 2.5) * 0.2;
        fg.scale.setScalar(s);
      }

      // Exit fade — handled by CSS on container

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Phase sync
    const interval = setInterval(() => {
      currentPhase = phaseRef.current;
    }, 30);

    // Expose ref updater
    (containerRef.current as any).__setPhase = (p: number) => { phaseRef.current = p; currentPhase = p; };

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(interval);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);

      // Dispose everything
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync phase to animation loop via ref  
  useEffect(() => {
    if (containerRef.current && (containerRef.current as any).__setPhase) {
      (containerRef.current as any).__setPhase(phase);
    }
  }, [phase]);

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        opacity: phase >= 7 ? 0 : 1,
        transition: 'opacity 0.4s ease-in',
        background: '#0D0D0D',
      }}
    >
      {/* Three.js Canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* ═══ HTML OVERLAY ═══ */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end" style={{ paddingBottom: '6%' }}>

        {/* HUD Card */}
        <div
          className="absolute right-[8%] top-[38%] px-3.5 py-2.5 rounded-lg"
          style={{
            background: 'rgba(123,97,255,0.10)',
            border: '1px solid rgba(123,97,255,0.25)',
            backdropFilter: 'blur(8px)',
            opacity: phase >= 4 && phase < 5 ? 1 : 0,
            transform: phase >= 4 ? 'translateX(0)' : 'translateX(16px)',
            transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#A78BFA', fontWeight: 600, letterSpacing: 2 }}>
            SCANNING...
          </div>
          <div className="mt-1.5 rounded-full overflow-hidden" style={{ width: 80, height: 3, background: 'rgba(123,97,255,0.2)' }}>
            <div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #7B61FF, #2DD4BF)',
                animation: phase >= 4 ? 'hudFill 0.8s ease-out forwards' : 'none',
                width: '0%',
              }}
            />
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
            marginBottom: 6,
          }}
        >
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: '#7B61FF' }}>S</span>
            <span style={{ color: '#F0F0F0' }}>canGo</span>
            <span style={{ color: '#7B61FF' }}>.</span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: '#A0A0A0',
            fontSize: 13,
            letterSpacing: 4,
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            opacity: phase >= 5 ? 0.6 : 0,
            transform: phase >= 5 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1) 0.15s',
            marginBottom: 20,
          }}
        >
          Scan. Pay. Walk out.
        </div>

        {/* Loading dots */}
        {phase >= 6 && (
          <div className="flex gap-2.5 mb-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 8, height: 8,
                  background: '#7B61FF',
                  animation: `dotPulse 1s ease-in-out ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Store name */}
        <div
          style={{
            color: '#606060',
            fontSize: 11,
            letterSpacing: 1,
            opacity: phase >= 6 ? 0.6 : 0,
            transition: 'opacity 0.4s ease-out 0.2s',
          }}
        >
          {storeName} · {storeLocation}
        </div>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        @keyframes hudFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
