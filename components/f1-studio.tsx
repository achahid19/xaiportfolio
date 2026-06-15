"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ─── Annotation data ──────────────────────────────────────────────────────────
const ANNOTATIONS = [
  { id:"front-wing",  label:"Front Wing",  pos:[ 0.00, -0.26,  2.55], info:"Data Input node — receives all incoming execution triggers and downforce parameters from upstream." },
  { id:"halo",        label:"Halo",        pos:[ 0.00,  0.50,  0.22], info:"Error Handler — titanium shield protecting the execution context from unexpected runtime failures." },
  { id:"steering",    label:"Steering",    pos:[ 0.00,  0.36,  0.42], info:"Router Node — precision-directs workflow branches in real time at 18,000 decisions per second." },
  { id:"power-unit",  label:"Power Unit",  pos:[ 0.00,  0.18, -0.55], info:"Execute Workflow node — 1.6L hybrid processing core generating 1,000+ ops/lap of raw execution." },
  { id:"sidepods",    label:"Sidepods",    pos:[ 0.60,  0.08,  0.05], info:"IF Node — manages conditional air-routing decisions between hot and cold data paths." },
  { id:"floor",       label:"Floor",       pos:[ 0.00, -0.26,  0.30], info:"Data Pipeline — venturi ground-effect channel optimised for maximum data throughput at speed." },
  { id:"rear-wing",   label:"Rear Wing",   pos:[ 0.00,  0.68, -2.02], info:"Output Node — delivers the final downforce payload to its destination at peak efficiency." },
  { id:"tires",       label:"Tires",       pos:[ 0.76, -0.28,  1.55], info:"Trigger Nodes — four contact patches between idea and tarmac. Pirelli 18\" compound." },
] as const;

export function F1Studio() {
  const mountRef   = useRef<HTMLDivElement>(null);
  const annRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const lightRef   = useRef({ angle: 30, height: 65 });
  const [activeAnn,   setActiveAnn]   = useState<string | null>(null);
  const [lightAngle,  setLightAngle]  = useState(30);
  const [lightHeight, setLightHeight] = useState(65);
  const [ready, setReady] = useState(false);

  useEffect(() => { lightRef.current = { angle: lightAngle, height: lightHeight }; }, [lightAngle, lightHeight]);

  useEffect(() => {
    if (!mountRef.current) return;
    let W = mountRef.current.clientWidth;
    let H = mountRef.current.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    Object.assign(renderer.domElement.style, { position:"absolute", inset:"0", display:"block" });
    mountRef.current.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070710);
    scene.fog = new THREE.FogExp2(0x070710, 0.020);

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 80);
    camera.position.set(5.2, 2.4, 7.0);

    // ── Controls ──────────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.autoRotate    = false;
    controls.minDistance   = 3.5;
    controls.maxDistance   = 16;
    controls.maxPolarAngle = Math.PI * 0.505;
    controls.target.set(0, 0.10, 0);
    controls.update();

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0c0c1e, 4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.001;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far  = 40;
    keyLight.shadow.camera.left = keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.camera.right = keyLight.shadow.camera.top   =  6;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x14F195, 1.6);
    scene.add(fillLight);
    const rimLight  = new THREE.DirectionalLight(0xFF6D5A, 2.8);
    scene.add(rimLight);
    const underLight = new THREE.PointLight(0x9945FF, 0.8, 6);
    underLight.position.set(0, -0.5, 0);
    scene.add(underLight);

    // ── Ground ────────────────────────────────────────────────────────────────
    const gndMat = new THREE.MeshStandardMaterial({ color:0x07070e, roughness:0.95, metalness:0 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), gndMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.73;
    ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(80, 80, 0x18182e, 0x121220);
    grid.position.y = -0.72;
    (grid.material as THREE.LineBasicMaterial).opacity = 0.6;
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    scene.add(grid);

    // ── Materials ─────────────────────────────────────────────────────────────
    function pMat(c: number, r: number, m: number, cc = 0, em = 0, emC = c) {
      return new THREE.MeshPhysicalMaterial({
        color: c, roughness: r, metalness: m,
        clearcoat: cc, clearcoatRoughness: 0.04,
        emissive: emC, emissiveIntensity: em,
      });
    }
    const matBody   = pMat(0x08080f, 0.05, 0.98, 1.0);
    const matAccent = pMat(0xFF6D5A, 0.09, 0.88, 0.8, 0.06, 0xFF6D5A);
    const matGreen  = pMat(0x14F195, 0.12, 0.75, 0.5, 0.15, 0x14F195);
    const matTire   = new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.88, metalness:0 });
    const matRim    = pMat(0xd0d0d8, 0.08, 0.96);
    const matDark   = new THREE.MeshStandardMaterial({ color:0x030306, roughness:0.55, metalness:0.1 });
    const matCarbon = new THREE.MeshStandardMaterial({ color:0x0d0d15, roughness:0.6,  metalness:0.3 });
    const matWhite  = pMat(0xfafafa, 0.05, 0.10, 0.6);
    const matAnnDot = new THREE.MeshStandardMaterial({ color:0x4D9DE0, emissive:0x4D9DE0, emissiveIntensity:1.0, roughness:0.1, metalness:0 });

    // ── Car group ─────────────────────────────────────────────────────────────
    const car = new THREE.Group();
    car.position.y = -0.43;   // seats car on grid
    scene.add(car);

    function add(geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true; m.receiveShadow = true;
      car.add(m);
      return m;
    }
    function at(m: THREE.Mesh, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) {
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); return m;
    }
    // CapsuleGeometry oriented along Z-axis
    function capsuleZ(r: number, l: number, segs = 8): THREE.CapsuleGeometry {
      const g = new THREE.CapsuleGeometry(r, l, segs, 24);
      g.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
      return g;
    }

    // ── Layout constants (all Y in car-local space) ───────────────────────────
    const GND  = -0.30;        // ground plane Y
    const FLRY = GND + 0.025;  // undertray/floor Y  (-0.275)
    const YF   =  0.00;        // front axle Y
    const YR   =  0.03;        // rear axle Y (larger rear tires sit slightly higher)
    const RF   =  0.290;       // front outer tire radius
    const RR   =  0.325;       // rear outer tire radius
    const ZFA  =  1.55;        // front axle Z
    const ZRA  = -1.38;        // rear axle Z

    // ─────────────────────────────────────────────────────────────────────────
    // FLOOR / UNDERTRAY — spans full car length, very flat
    // ─────────────────────────────────────────────────────────────────────────
    at(add(new THREE.BoxGeometry(1.00, 0.020, 3.90), matCarbon), 0, FLRY, -0.20);
    // Floor edges (Gurney flap / edge-wing)
    for (const s of [-1, 1]) {
      at(add(new THREE.BoxGeometry(0.025, 0.055, 3.60), matCarbon), s * 0.508, FLRY + 0.018, -0.20);
    }
    // Flat-bottom venturi tunnels (visual only — 3 channels)
    for (let i = -1; i <= 1; i++) {
      at(add(new THREE.BoxGeometry(0.185, 0.008, 2.80), matDark), i * 0.26, FLRY - 0.002, -0.10);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NOSE CONE — long, thin, low (modern "snowplough" style)
    // ─────────────────────────────────────────────────────────────────────────
    {
      const pts = [
        new THREE.Vector3(0, FLRY + 0.130, 2.94),   // tip
        new THREE.Vector3(0, FLRY + 0.140, 2.58),
        new THREE.Vector3(0, FLRY + 0.165, 2.20),
        new THREE.Vector3(0, FLRY + 0.200, 1.80),   // nose root
      ];
      const noseGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts), 28, 0.072, 12, false
      );
      noseGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.40, 1));
      add(noseGeo, matBody);
      // Pointed tip cap
      const tip = add(new THREE.SphereGeometry(0.072, 10, 8), matBody);
      tip.position.set(0, FLRY + 0.130, 2.94);
      tip.scale.set(0.55, 0.40, 0.55);
    }
    // Front nose pillars (connecting nose underside to front wing)
    for (const s of [-0.135, 0.135]) {
      at(add(new THREE.BoxGeometry(0.040, 0.195, 0.048), matBody), s, FLRY + 0.030, 2.70);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FRONT TUB (nose root → cockpit)
    // ─────────────────────────────────────────────────────────────────────────
    at(add(capsuleZ(0.21, 0.78, 7), matBody), 0, FLRY + 0.245, 1.26, 1, 0.50, 1);

    // ─────────────────────────────────────────────────────────────────────────
    // MONOCOQUE / SURVIVAL CELL
    // ─────────────────────────────────────────────────────────────────────────
    at(add(capsuleZ(0.275, 1.05, 8), matBody), 0, FLRY + 0.275, 0.22, 1, 0.58, 1);
    // Raised cockpit surround (taller section around opening)
    at(add(capsuleZ(0.220, 0.52, 7), matBody), 0, FLRY + 0.305, 0.24, 1, 0.68, 1);

    // ─────────────────────────────────────────────────────────────────────────
    // COCKPIT OPENING
    // ─────────────────────────────────────────────────────────────────────────
    at(add(new THREE.BoxGeometry(0.310, 0.175, 0.480), matDark), 0, FLRY + 0.440, 0.30);
    // Cockpit rim (accent stripe)
    at(add(new THREE.BoxGeometry(0.330, 0.020, 0.500), matAccent), 0, FLRY + 0.530, 0.30);

    // ─────────────────────────────────────────────────────────────────────────
    // DRIVER HELMET
    // ─────────────────────────────────────────────────────────────────────────
    {
      const h = add(new THREE.SphereGeometry(0.130, 18, 14), matAccent);
      h.position.set(0, FLRY + 0.560, 0.34);
      h.scale.set(0.80, 0.88, 0.78);
    }
    {
      const v = add(new THREE.SphereGeometry(0.130, 18, 14, 0, Math.PI * 2, 0, 0.60), matDark);
      v.position.set(0, FLRY + 0.545, 0.40);
      v.scale.set(0.74, 0.74, 0.30);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HALO (titanium safety structure — U-shape tube over cockpit)
    // ─────────────────────────────────────────────────────────────────────────
    {
      const pts = [
        new THREE.Vector3(-0.182, 0,      0.18),
        new THREE.Vector3(-0.198, 0.172,  0.02),
        new THREE.Vector3( 0,     0.255, -0.16),
        new THREE.Vector3( 0.198, 0.172,  0.02),
        new THREE.Vector3( 0.182, 0,      0.18),
      ];
      const haloGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts), 32, 0.023, 10, false
      );
      const hm = new THREE.Mesh(haloGeo, matAccent);
      hm.position.set(0, FLRY + 0.478, 0.28);
      hm.castShadow = true;
      car.add(hm);
    }
    // Halo center mounting spine
    at(add(new THREE.BoxGeometry(0.030, 0.215, 0.030), matAccent), 0, FLRY + 0.608, 0.10);

    // ─────────────────────────────────────────────────────────────────────────
    // AIRBOX (air intake above cockpit)
    // ─────────────────────────────────────────────────────────────────────────
    at(add(new THREE.BoxGeometry(0.210, 0.130, 0.240), matCarbon), 0, FLRY + 0.575, 0.06);
    {
      const throat = add(new THREE.CylinderGeometry(0.090, 0.090, 0.130, 14), matDark);
      throat.position.set(0, FLRY + 0.575, 0.190);
      throat.rotation.x = Math.PI / 2;
      throat.scale.set(1.15, 0.70, 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ENGINE COVER + REAR BODY
    // ─────────────────────────────────────────────────────────────────────────
    at(add(capsuleZ(0.215, 0.80, 6), matBody), 0, FLRY + 0.315, -0.70, 1, 0.60, 1);
    // Shark fin (tall, thin aerodynamic fin above engine)
    at(add(new THREE.BoxGeometry(0.018, 0.480, 0.840), matBody), 0, FLRY + 0.655, -0.62);
    // T-wing stub at top of shark fin
    at(add(new THREE.BoxGeometry(0.340, 0.015, 0.095), matBody), 0, FLRY + 0.895, -0.44);
    // Rear body / gearbox fairing
    at(add(capsuleZ(0.165, 0.48, 5), matBody), 0, FLRY + 0.235, -1.52, 1, 0.55, 1);
    // Gearbox housing
    at(add(new THREE.BoxGeometry(0.290, 0.205, 0.370), matDark), 0, FLRY + 0.215, -1.96);
    // Rear crash structure
    at(add(new THREE.BoxGeometry(0.145, 0.130, 0.180), matCarbon), 0, FLRY + 0.155, -2.24);

    // ─────────────────────────────────────────────────────────────────────────
    // SIDEPODS (Red Bull-style extreme undercut)
    // ─────────────────────────────────────────────────────────────────────────
    for (const s of [-1, 1]) {
      // Main sidepod upper body
      at(add(capsuleZ(0.180, 0.92, 6), matBody), s * 0.490, FLRY + 0.215, -0.08, 1, 0.63, 1);
      // Sidepod inlet (large, rounded radiator opening)
      at(add(new THREE.BoxGeometry(0.210, 0.245, 0.036), matDark),  s * 0.492, FLRY + 0.215, 0.420);
      at(add(new THREE.BoxGeometry(0.246, 0.280, 0.024), matBody),  s * 0.492, FLRY + 0.215, 0.440);
      // Undercut (the dramatic cutaway beneath sidepod — Red Bull signature)
      at(add(new THREE.BoxGeometry(0.155, 0.055, 0.840), matBody),  s * 0.540, FLRY + 0.058, -0.02);
      // Sidepod trailing edge (narrows to fin)
      at(add(new THREE.BoxGeometry(0.110, 0.130, 0.220), matBody),  s * 0.480, FLRY + 0.175, -0.66);
      // n8n green accent plate on sidepod
      at(add(new THREE.BoxGeometry(0.007, 0.105, 0.400), matGreen), s * 0.670, FLRY + 0.240, -0.08);
      // Accent stripe on sidepod top
      at(add(new THREE.BoxGeometry(0.006, 0.038, 0.820), matAccent), s * 0.275, FLRY + 0.415, 0.10);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DIFFUSER (angled upward at rear)
    // ─────────────────────────────────────────────────────────────────────────
    {
      const diff = add(new THREE.BoxGeometry(1.08, 0.085, 0.680), matDark);
      diff.position.set(0, FLRY + 0.048, -1.880);
      diff.rotation.x = -0.30;
    }
    // Diffuser fins (7 channels)
    for (let i = -3; i <= 3; i++) {
      at(add(new THREE.BoxGeometry(0.015, 0.078, 0.620), matCarbon), i * 0.162, FLRY + 0.058, -1.880);
    }
    // Upper diffuser beam
    at(add(new THREE.BoxGeometry(1.10, 0.020, 0.065), matBody), 0, FLRY + 0.098, -1.640);

    // ─────────────────────────────────────────────────────────────────────────
    // FRONT WING ASSEMBLY (5-element, full 2m span)
    // ─────────────────────────────────────────────────────────────────────────
    const FWY = FLRY - 0.012;   // front wing reference height

    // Main plane (element 1) — full span, slight anhedral
    at(add(new THREE.BoxGeometry(1.960, 0.022, 0.285), matBody),   0, FWY + 0.000, 2.585);
    // Element 2 — slightly inboard
    at(add(new THREE.BoxGeometry(1.820, 0.020, 0.215), matAccent), 0, FWY + 0.048, 2.530);
    // Element 3
    at(add(new THREE.BoxGeometry(1.640, 0.018, 0.170), matBody),   0, FWY + 0.090, 2.480);
    // Element 4
    at(add(new THREE.BoxGeometry(1.380, 0.016, 0.132), matBody),   0, FWY + 0.124, 2.435);
    // Element 5 (only centre section)
    at(add(new THREE.BoxGeometry(0.860, 0.014, 0.098), matAccent), 0, FWY + 0.152, 2.398);

    // Main endplates (tall, with complex profile)
    for (const s of [-1, 1]) {
      at(add(new THREE.BoxGeometry(0.019, 0.250, 0.430), matBody),   s * 0.968, FWY + 0.075, 2.520);
      // Lower cascade winglets
      at(add(new THREE.BoxGeometry(0.015, 0.090, 0.200), matAccent), s * 0.890, FWY + 0.010, 2.660);
      at(add(new THREE.BoxGeometry(0.013, 0.070, 0.155), matBody),   s * 0.855, FWY + 0.046, 2.700);
      // Endplate foot
      at(add(new THREE.BoxGeometry(0.080, 0.014, 0.260), matBody),   s * 0.930, FWY - 0.010, 2.560);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REAR WING ASSEMBLY (DRS-capable, high-mounted)
    // ─────────────────────────────────────────────────────────────────────────
    const RWY = FLRY + 0.690;   // rear wing height base

    // Main element
    at(add(new THREE.BoxGeometry(1.080, 0.055, 0.305), matBody),   0, RWY + 0.118, -2.020);
    // DRS upper flap (accent color — moveable element)
    at(add(new THREE.BoxGeometry(1.040, 0.040, 0.235), matAccent), 0, RWY + 0.202, -2.020);
    // Beam wing (lower, narrow, green accent)
    at(add(new THREE.BoxGeometry(0.860, 0.024, 0.165), matGreen),  0, FLRY + 0.280, -1.960);
    // Beam wing supports
    for (const s of [-1, 1]) {
      at(add(new THREE.BoxGeometry(0.016, 0.240, 0.025), matBody), s * 0.380, FLRY + 0.395, -1.968);
    }

    // Rear wing endplates
    for (const s of [-1, 1]) {
      at(add(new THREE.BoxGeometry(0.021, 0.550, 0.415), matBody),   s * 0.528, RWY - 0.048, -2.020);
      // Endplate lower accent
      at(add(new THREE.BoxGeometry(0.024, 0.135, 0.195), matAccent), s * 0.530, RWY - 0.250, -2.100);
      // Endplate logo (n8n)
      at(add(new THREE.BoxGeometry(0.026, 0.100, 0.180), matGreen),  s * 0.531, RWY + 0.028, -2.050);
    }
    // Centre pillar
    at(add(new THREE.BoxGeometry(0.046, 0.510, 0.050), matBody), 0, RWY - 0.168, -1.988);

    // ─────────────────────────────────────────────────────────────────────────
    // LIVERY DETAILS
    // ─────────────────────────────────────────────────────────────────────────
    // Longitudinal body stripes (each side)
    for (const s of [-1, 1]) {
      at(add(new THREE.BoxGeometry(0.005, 0.040, 0.800), matGreen),  s * 0.274, FLRY + 0.235, -0.150);
    }
    // n8n logo on nose
    at(add(new THREE.BoxGeometry(0.009, 0.036, 0.260), matGreen), 0, FLRY + 0.215, 2.320);
    // Accent along floor edge channels
    for (const s of [-1, 1]) {
      at(add(new THREE.BoxGeometry(0.028, 0.010, 1.180), matAccent), s * 0.507, FLRY + 0.031, 0.480);
    }
    // Side mirrors
    for (const s of [-1, 1]) {
      at(add(new THREE.BoxGeometry(0.056, 0.036, 0.125), matBody), s * 0.195, FLRY + 0.568, 0.665);
    }
    // Rear light (required by regulations — red LED strip)
    {
      const rLight = add(new THREE.BoxGeometry(0.060, 0.024, 0.018), pMat(0xff2200, 0.1, 0, 0, 1.2, 0xff2200));
      rLight.position.set(0, FLRY + 0.168, -2.238);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WHEELS (18" rims, wide rear Pirelli slicks)
    // ─────────────────────────────────────────────────────────────────────────
    function makeWheel(x: number, y: number, z: number, rear: boolean) {
      const R  = rear ? RR   : RF;
      const TW = rear ? 0.375 : 0.260;
      const wg = new THREE.Group();
      wg.position.set(x, y, z);
      car.add(wg);

      // Outer tire — torus for proper round cross-section profile
      const tireRing = new THREE.Mesh(
        new THREE.TorusGeometry(R * 0.79, R * 0.225, 24, 64),
        matTire
      );
      tireRing.rotation.y = Math.PI / 2;
      tireRing.castShadow = true;
      wg.add(tireRing);
      // Tire centre fill (inside the torus)
      const tireFill = new THREE.Mesh(
        new THREE.CylinderGeometry(R * 0.565, R * 0.565, TW, 40),
        matTire
      );
      tireFill.rotation.z = Math.PI / 2;
      wg.add(tireFill);

      // Pirelli tyre band (white lettering simulation)
      const outerSide = x < 0 ? -1 : 1;
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(R * 0.790, 0.011, 6, 60),
        matWhite
      );
      band.rotation.y = Math.PI / 2;
      band.position.x = outerSide * (TW * 0.38);
      wg.add(band);

      // 18" alloy rim barrel
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(R * 0.610, R * 0.610, TW, 30),
        matRim
      );
      rim.rotation.z = Math.PI / 2;
      wg.add(rim);

      // 10-spoke design (2022 F1 specification)
      for (let i = 0; i < 10; i++) {
        const sg = new THREE.BoxGeometry(TW - 0.012, R * 0.86, 0.021);
        const sm = new THREE.Mesh(sg, matRim);
        sm.rotation.x = (i / 10) * Math.PI * 2;
        wg.add(sm);
      }
      // Centre hub cap
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.058, TW + 0.014, 14),
        matBody
      );
      cap.rotation.z = Math.PI / 2;
      wg.add(cap);

      // Brake disc (carbon ceramic)
      const brk = new THREE.Mesh(
        new THREE.CylinderGeometry(R * 0.432, R * 0.432, 0.030, 22),
        matDark
      );
      brk.rotation.z = Math.PI / 2;
      wg.add(brk);

      // n8n green rim ring accent
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(R * 0.610, 0.010, 8, 44),
        matGreen
      );
      ring.rotation.y = Math.PI / 2;
      wg.add(ring);
    }

    makeWheel(-0.718, YF, ZFA, false);
    makeWheel( 0.718, YF, ZFA, false);
    makeWheel(-0.752, YR, ZRA, true);
    makeWheel( 0.752, YR, ZRA, true);

    // ─────────────────────────────────────────────────────────────────────────
    // SUSPENSION — double wishbone front & rear
    // ─────────────────────────────────────────────────────────────────────────
    function arm(x1:number,y1:number,z1:number, x2:number,y2:number,z2:number) {
      const a = new THREE.Vector3(x1,y1,z1);
      const b = new THREE.Vector3(x2,y2,z2);
      const dir = b.clone().sub(a);
      const len = dir.length();
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const g = new THREE.CylinderGeometry(0.011, 0.011, len, 6);
      const m = new THREE.Mesh(g, matCarbon);
      m.position.copy(mid);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
      m.castShadow = true;
      car.add(m);
    }
    // Front double wishbone
    for (const s of [-1, 1]) {
      arm(s*0.28, FLRY+0.345, ZFA+0.06,  s*0.71, YF+0.055, ZFA);
      arm(s*0.28, FLRY+0.345, ZFA-0.07,  s*0.71, YF+0.055, ZFA);
      arm(s*0.27, FLRY+0.040, ZFA+0.04,  s*0.71, YF-0.110, ZFA);
      arm(s*0.27, FLRY+0.040, ZFA-0.05,  s*0.71, YF-0.110, ZFA);
      // Pushrod / pullrod
      arm(s*0.28, FLRY+0.355, ZFA,       s*0.71, YF-0.010, ZFA);
    }
    // Rear double wishbone
    for (const s of [-1, 1]) {
      arm(s*0.26, FLRY+0.320, ZRA+0.06,  s*0.75, YR+0.045, ZRA);
      arm(s*0.26, FLRY+0.320, ZRA-0.07,  s*0.75, YR+0.045, ZRA);
      arm(s*0.26, FLRY+0.035, ZRA+0.04,  s*0.75, YR-0.110, ZRA);
      arm(s*0.26, FLRY+0.035, ZRA-0.05,  s*0.75, YR-0.110, ZRA);
    }

    // ── Annotation spheres (raycasting targets) ───────────────────────────────
    const annSpheres: { mesh: THREE.Mesh; id: string }[] = [];
    ANNOTATIONS.forEach(ann => {
      const g = new THREE.SphereGeometry(0.05, 14, 10);
      const m = new THREE.Mesh(g, matAnnDot.clone());
      m.position.set(ann.pos[0], ann.pos[1], ann.pos[2]);
      m.userData.annId = ann.id;
      car.add(m);
      annSpheres.push({ mesh: m, id: ann.id });
    });

    // ── Raycasting ────────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse2    = new THREE.Vector2();
    const annMeshes = annSpheres.map(a => a.mesh);

    function onCanvasClick(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse2.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
      mouse2.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
      raycaster.setFromCamera(mouse2, camera);
      const hits = raycaster.intersectObjects(annMeshes);
      if (hits.length > 0) {
        const id = hits[0].object.userData.annId as string;
        setActiveAnn(prev => prev === id ? null : id);
      }
    }
    renderer.domElement.addEventListener("click", onCanvasClick);

    // ── Annotation HTML overlay ───────────────────────────────────────────────
    const tempV = new THREE.Vector3();
    function updateAnnotations(activeId: string | null) {
      if (!mountRef.current) return;
      ANNOTATIONS.forEach((ann, i) => {
        const el = annRefs.current[i];
        if (!el) return;
        tempV.set(ann.pos[0], ann.pos[1], ann.pos[2]);
        car.localToWorld(tempV);
        tempV.project(camera);
        if (tempV.z > 1) { el.style.display = "none"; return; }
        const x = ( tempV.x * 0.5 + 0.5) * W;
        const y = (-tempV.y * 0.5 + 0.5) * H;
        el.style.display = "flex";
        el.style.left = `${x}px`;
        el.style.top  = `${y}px`;
        const dot = el.querySelector(".ann-dot") as HTMLElement | null;
        if (dot) dot.style.background = activeId === ann.id ? "#FF6D5A" : "#4D9DE0";
        const s = annSpheres.find(a => a.id === ann.id);
        if (s) (s.mesh.material as THREE.MeshStandardMaterial).color.set(activeId === ann.id ? 0xFF6D5A : 0x4D9DE0);
      });
    }

    // ── Light sync ────────────────────────────────────────────────────────────
    function syncLights() {
      const { angle, height } = lightRef.current;
      const a = (angle / 180) * Math.PI;
      const h = (height / 100) * Math.PI * 0.5;
      const D = 9;
      keyLight.position.set( Math.cos(a)*D, Math.sin(h)*D, Math.sin(a)*D);
      fillLight.position.set(-Math.cos(a)*5, 1.8,         -Math.sin(a)*4);
      rimLight.position.set(  Math.sin(a)*4, 2.2,         -Math.cos(a)*6);
    }

    // ── Render loop ───────────────────────────────────────────────────────────
    let raf: number;
    let currentActiveId: string | null = null;
    setActiveAnn(id => { currentActiveId = id; return id; });

    function animate() {
      raf = requestAnimationFrame(animate);
      controls.update();
      syncLights();
      const t = performance.now() * 0.003;
      annSpheres.forEach(({ mesh }) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.6 + Math.sin(t + mesh.position.z) * 0.4;
      });
      renderer.render(scene, camera);
      updateAnnotations(currentActiveId);
    }
    setActiveAnn(id => { currentActiveId = id; return id; });
    animate();
    setReady(true);

    // ── Resize ────────────────────────────────────────────────────────────────
    function onResize() {
      if (!mountRef.current) return;
      W = mountRef.current.clientWidth;
      H = mountRef.current.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(mountRef.current!);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("click", onCanvasClick);
      renderer.dispose();
      mountRef.current?.contains(renderer.domElement) &&
        mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const activeIdRef = useRef<string | null>(null);
  useEffect(() => { activeIdRef.current = activeAnn; }, [activeAnn]);

  const activeAnnotation = ANNOTATIONS.find(a => a.id === activeAnn) ?? null;

  return (
    <div className="f1-root">
      <div ref={mountRef} className="f1-canvas-wrap" />

      {ANNOTATIONS.map((ann, i) => (
        <div
          key={ann.id}
          ref={el => { annRefs.current[i] = el; }}
          className="f1-ann"
          onClick={() => setActiveAnn(prev => prev === ann.id ? null : ann.id)}
        >
          <div className={`ann-dot ${activeAnn === ann.id ? "ann-dot--active" : ""}`} />
          <span className="f1-ann-label mono">{ann.label}</span>
        </div>
      ))}

      {activeAnnotation && (
        <div className="f1-info-panel">
          <div className="f1-info-header">
            <span className="f1-info-title mono">{activeAnnotation.label}</span>
            <button className="f1-info-close" onClick={() => setActiveAnn(null)}>✕</button>
          </div>
          <p className="f1-info-body mono">{activeAnnotation.info}</p>
        </div>
      )}

      {ready && (
        <div className="f1-controls">
          {([
            { label:"LIGHT ANGLE",  val:lightAngle,  set:setLightAngle,  min:0,  max:360 },
            { label:"LIGHT HEIGHT", val:lightHeight, set:setLightHeight, min:5,  max:92  },
          ] as const).map(({ label, val, set, min, max }) => (
            <div className="f1-ctrl-row" key={label}>
              <div className="f1-ctrl-labels">
                <span className="f1-ctrl-name mono">{label}</span>
                <span className="f1-ctrl-val mono">{val}°</span>
              </div>
              <input type="range" min={min} max={max} value={val}
                onChange={e => (set as (v:number) => void)(Number(e.target.value))}
                className="f1-slider"
              />
            </div>
          ))}
        </div>
      )}

      <div className="f1-hint mono">Drag to rotate · Click a dot to inspect</div>

      {ready && (
        <div className="f1-brand mono">
          <span className="f1-brand-name">n8n RACING</span>
          <span className="f1-brand-sub">AiX Automation · Car #n8</span>
        </div>
      )}
    </div>
  );
}
