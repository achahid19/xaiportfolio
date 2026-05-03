"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ─── Annotation data ──────────────────────────────────────────────────────────
const ANNOTATIONS = [
  { id:"front-wing",  label:"Front Wing",  pos:[ 0.00, -0.22,  2.52], info:"Data Input node — receives all incoming execution triggers and downforce parameters from upstream." },
  { id:"halo",        label:"Halo",        pos:[ 0.00,  0.72,  0.22], info:"Error Handler — titanium shield protecting the execution context from unexpected runtime failures." },
  { id:"steering",    label:"Steering",    pos:[ 0.00,  0.46,  0.44], info:"Router Node — precision-directs workflow branches in real time at 18,000 decisions per second." },
  { id:"power-unit",  label:"Power Unit",  pos:[ 0.00,  0.32, -0.48], info:"Execute Workflow node — 1.6L hybrid processing core. Generates 1,000+ ops/lap of raw execution." },
  { id:"sidepods",    label:"Sidepods",    pos:[ 0.55,  0.13,  0.10], info:"IF Node — manages conditional air-routing decisions between hot and cold data paths." },
  { id:"floor",       label:"Floor",       pos:[ 0.00, -0.32,  0.40], info:"Data Pipeline — venturi ground-effect channel. Optimised for maximum data throughput at speed." },
  { id:"rear-wing",   label:"Rear Wing",   pos:[ 0.00,  0.70, -1.92], info:"Output Node — delivers the final downforce payload to its destination at peak efficiency." },
  { id:"tires",       label:"Tires",       pos:[ 0.75, -0.22,  1.62], info:"Trigger Nodes — the four contact patches between idea and tarmac. Pirelli C5 compound." },
] as const;

export function F1Studio() {
  const mountRef  = useRef<HTMLDivElement>(null);
  const annRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const lightRef  = useRef({ angle: 30, height: 65 });
  const [activeAnn,  setActiveAnn]  = useState<string | null>(null);
  const [lightAngle, setLightAngle] = useState(30);
  const [lightHeight,setLightHeight]= useState(65);
  const [ready, setReady] = useState(false);

  // Sync slider values to ref (read by rAF loop without re-render)
  useEffect(() => { lightRef.current = { angle: lightAngle, height: lightHeight }; }, [lightAngle, lightHeight]);

  useEffect(() => {
    if (!mountRef.current) return;
    let W = mountRef.current.clientWidth;
    let H = mountRef.current.clientHeight;

      // ── Renderer ────────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      Object.assign(renderer.domElement.style, {
        position: "absolute", inset: "0", display: "block",
      });
      mountRef.current.appendChild(renderer.domElement);

      // ── Scene ────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x070710);
      scene.fog = new THREE.FogExp2(0x070710, 0.022);

      // ── Camera ───────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 80);
      camera.position.set(5.5, 2.8, 7.5);

      // ── Controls ─────────────────────────────────────────────────────────
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping   = true;
      controls.dampingFactor   = 0.055;
      controls.autoRotate      = false;
      controls.minDistance     = 3.5;
      controls.maxDistance     = 16;
      controls.maxPolarAngle   = Math.PI * 0.505;
      controls.target.set(0, 0.25, 0);
      controls.update();

      // ── Lights ───────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x0c0c1e, 4));
      const keyLight  = new THREE.DirectionalLight(0xffffff, 9);
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

      // ── Ground ───────────────────────────────────────────────────────────
      const gndGeo = new THREE.PlaneGeometry(80, 80);
      const gndMat = new THREE.MeshStandardMaterial({ color: 0x07070e, roughness: 0.95, metalness: 0 });
      const ground = new THREE.Mesh(gndGeo, gndMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.73;
      ground.receiveShadow = true;
      scene.add(ground);

      const grid = new THREE.GridHelper(80, 80, 0x18182e, 0x121220);
      grid.position.y = -0.72;
      (grid.material as THREE.LineBasicMaterial).opacity = 0.6;
      (grid.material as THREE.LineBasicMaterial).transparent = true;
      scene.add(grid);

      // ── Materials ────────────────────────────────────────────────────────
      function pMat(c: number, r: number, m: number, cc = 0, em = 0, emC = c) {
        return new THREE.MeshPhysicalMaterial({
          color: c, roughness: r, metalness: m,
          clearcoat: cc, clearcoatRoughness: 0.04,
          emissive: emC, emissiveIntensity: em,
        });
      }
      const matBody    = pMat(0x0c0c16, 0.06, 0.98, 1.0);
      const matAccent  = pMat(0xFF6D5A, 0.09, 0.88, 0.8, 0.05, 0xFF6D5A);
      const matGreen   = pMat(0x14F195, 0.12, 0.75, 0.5, 0.14, 0x14F195);
      const matTire    = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.88, metalness: 0 });
      const matRim     = pMat(0xFF6D5A, 0.10, 0.95);
      const matDark    = new THREE.MeshStandardMaterial({ color: 0x030306, roughness: 0.55, metalness: 0.1 });
      const matCarbon  = new THREE.MeshStandardMaterial({ color: 0x101018, roughness: 0.6,  metalness: 0.3 });
      const matAnnDot  = new THREE.MeshStandardMaterial({ color: 0x4D9DE0, emissive: 0x4D9DE0, emissiveIntensity: 1.0, roughness: 0.1, metalness: 0 });
      const matAnnHit  = new THREE.MeshStandardMaterial({ color: 0xFF6D5A, emissive: 0xFF6D5A, emissiveIntensity: 1.0, roughness: 0.1, metalness: 0 });

      // ── Car group ────────────────────────────────────────────────────────
      const car = new THREE.Group();
      car.position.y = -0.07;
      scene.add(car);

      // Utility: create mesh + add to car
      function add(geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh {
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = true; m.receiveShadow = true;
        car.add(m);
        return m;
      }
      // Utility: position a mesh
      function at(m: THREE.Mesh, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) {
        m.position.set(x, y, z); m.scale.set(sx, sy, sz); return m;
      }
      // Utility: capsule oriented along Z
      function capsuleZ(r: number, l: number, segs = 6): THREE.CapsuleGeometry {
        const g = new THREE.CapsuleGeometry(r, l, segs, 20);
        g.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        return g;
      }

      // ── BODY ─────────────────────────────────────────────────────────────
      // Nose (tapered cone)
      {
        const g = new THREE.ConeGeometry(0.065, 1.75, 14, 1, false);
        g.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        at(add(g, matBody), 0, 0.22, 2.28, 1, 0.48, 1);
      }
      // Front section
      at(add(capsuleZ(0.18, 0.70, 5), matBody), 0, 0.23, 1.52, 1, 0.5, 1);
      // Main monocoque
      at(add(capsuleZ(0.31, 1.70, 7), matBody), 0, 0.26, 0.18, 1, 0.52, 1);
      // Rear body
      at(add(capsuleZ(0.24, 0.90, 5), matBody), 0, 0.23, -1.06, 1, 0.5, 1);
      // Engine cover spine
      at(add(capsuleZ(0.10, 0.60, 4), matBody), 0, 0.50, -0.26, 1, 0.88, 1);
      // Sidepods (L + R)
      for (const s of [-1, 1]) {
        at(add(capsuleZ(0.17, 0.82, 5), matBody), s * 0.46, 0.12, 0.08, 1, 0.55, 1);
      }
      // Cockpit void
      at(add(new THREE.BoxGeometry(0.32, 0.24, 0.52), matDark), 0, 0.40, 0.28);
      // Driver helmet
      {
        const g = new THREE.SphereGeometry(0.135, 18, 14);
        at(add(g, matAccent), 0, 0.50, 0.36, 0.82, 0.88, 0.78);
      }
      // Visor
      {
        const g = new THREE.SphereGeometry(0.14, 18, 14, 0, Math.PI * 2, 0, 0.7);
        at(add(g, matDark), 0, 0.48, 0.42, 0.75, 0.75, 0.35);
      }

      // ── HALO ─────────────────────────────────────────────────────────────
      {
        const pts = [
          new THREE.Vector3(-0.20, 0,     0.19),
          new THREE.Vector3(-0.22, 0.20,  0.02),
          new THREE.Vector3( 0,    0.30, -0.17),
          new THREE.Vector3( 0.22, 0.20,  0.02),
          new THREE.Vector3( 0.20, 0,     0.19),
        ];
        const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 26, 0.027, 9, false);
        const m = new THREE.Mesh(g, matAccent);
        m.position.set(0, 0.44, 0.28);
        m.castShadow = true;
        car.add(m);
      }
      at(add(new THREE.BoxGeometry(0.04, 0.24, 0.04), matAccent), 0, 0.60, 0.10);

      // ── FLOOR + DIFFUSER ─────────────────────────────────────────────────
      at(add(new THREE.BoxGeometry(1.10, 0.032, 3.35), matCarbon), 0, -0.31, -0.05);
      // Floor strakes
      for (let i = -2; i <= 2; i++) {
        at(add(new THREE.BoxGeometry(0.020, 0.050, 2.85), matBody), i * 0.21, -0.285, 0.0);
      }
      // Diffuser
      at(add(new THREE.BoxGeometry(1.18, 0.09, 0.52), matDark), 0, -0.225, -1.56);
      // Diffuser fins
      for (let i = -2; i <= 2; i++) {
        at(add(new THREE.BoxGeometry(0.022, 0.075, 0.46), matCarbon), i * 0.23, -0.19, -1.56);
      }

      // ── FRONT WING ───────────────────────────────────────────────────────
      at(add(new THREE.BoxGeometry(1.90, 0.026, 0.25), matBody),   0, -0.265, 2.50);
      at(add(new THREE.BoxGeometry(1.74, 0.022, 0.20), matAccent), 0, -0.218, 2.44);
      at(add(new THREE.BoxGeometry(1.55, 0.018, 0.15), matBody),   0, -0.170, 2.38);
      // Endplates
      for (const s of [-1, 1]) {
        at(add(new THREE.BoxGeometry(0.025, 0.17, 0.36), matBody), s * 0.94, -0.215, 2.46);
      }
      // Nose strut
      at(add(new THREE.BoxGeometry(0.05, 0.30, 0.055), matBody), 0, -0.02, 2.52);

      // ── REAR WING ────────────────────────────────────────────────────────
      at(add(new THREE.BoxGeometry(1.06, 0.052, 0.29), matBody),   0,  0.69, -1.90);
      at(add(new THREE.BoxGeometry(1.01, 0.044, 0.23), matAccent), 0,  0.60, -1.90);
      // Beam wing (green accent)
      at(add(new THREE.BoxGeometry(0.82, 0.032, 0.17), matGreen),  0,  0.23, -1.90);
      // Endplates
      for (const s of [-1, 1]) {
        at(add(new THREE.BoxGeometry(0.026, 0.44, 0.34), matBody), s * 0.51, 0.545, -1.90);
      }
      // Pillar
      at(add(new THREE.BoxGeometry(0.060, 0.42, 0.060), matBody), 0, 0.28, -1.90);

      // ── ACCENT STRIPES ────────────────────────────────────────────────────
      for (const s of [-1, 1]) {
        at(add(new THREE.BoxGeometry(0.008, 0.062, 2.65), matAccent), s * 0.328, 0.33, 0.12);
        at(add(new THREE.BoxGeometry(0.010, 0.055, 0.36), matGreen),  s * 0.330, 0.13, 0.48);
      }
      // Mirrors
      for (const s of [-1, 1]) {
        at(add(new THREE.BoxGeometry(0.06, 0.042, 0.14), matBody), s * 0.21, 0.52, 0.72);
      }

      // ── WHEELS ───────────────────────────────────────────────────────────
      function makeWheel(x: number, y: number, z: number, rear: boolean) {
        const R  = rear ? 0.375 : 0.330;
        const TW = rear ? 0.415 : 0.300;
        const wg = new THREE.Group();
        wg.position.set(x, y, z);
        car.add(wg);

        // Tire
        const tireMesh = new THREE.Mesh(new THREE.CylinderGeometry(R, R, TW, 40), matTire);
        tireMesh.rotation.z = Math.PI / 2;
        tireMesh.castShadow = true; tireMesh.receiveShadow = true;
        wg.add(tireMesh);

        // Sidewall rings
        for (const side of [-1, 1]) {
          const sw = new THREE.Mesh(
            new THREE.TorusGeometry(R * 0.82, 0.014, 8, 52),
            new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.75 })
          );
          sw.rotation.y = Math.PI / 2;
          sw.position.x = side * (TW / 2 - 0.01);
          wg.add(sw);
        }

        // Rim barrel
        const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.62, R * 0.62, TW + 0.01, 20), matRim);
        rimMesh.rotation.z = Math.PI / 2;
        rimMesh.castShadow = true;
        wg.add(rimMesh);

        // Spokes (5-star)
        for (let i = 0; i < 5; i++) {
          const sg = new THREE.BoxGeometry(TW - 0.02, R * 0.87, 0.024);
          const sm = new THREE.Mesh(sg, matRim);
          sm.rotation.x = (i / 5) * Math.PI * 2;
          wg.add(sm);
        }
        // Center cap
        const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, TW + 0.014, 10), matBody);
        capMesh.rotation.z = Math.PI / 2;
        wg.add(capMesh);
        // Brake disc
        const brk = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.44, R * 0.44, 0.04, 18), matDark);
        brk.rotation.z = Math.PI / 2;
        wg.add(brk);
      }
      makeWheel(-0.745, -0.245, 1.62, false);
      makeWheel( 0.745, -0.245, 1.62, false);
      makeWheel(-0.780, -0.225, -1.33, true);
      makeWheel( 0.780, -0.225, -1.33, true);

      // ── SUSPENSION ARMS ──────────────────────────────────────────────────
      function arm(x1:number,y1:number,z1:number, x2:number,y2:number,z2:number) {
        const a = new THREE.Vector3(x1,y1,z1), b = new THREE.Vector3(x2,y2,z2);
        const dir = b.clone().sub(a);
        const len = dir.length();
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const g = new THREE.CylinderGeometry(0.013, 0.013, len, 6);
        const m = new THREE.Mesh(g, matCarbon);
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
        m.castShadow = true;
        car.add(m);
      }
      for (const s of [-1, 1]) {
        arm(s*0.30, 0.18, 1.64,  s*0.74, -0.01, 1.62);
        arm(s*0.30, 0.01, 1.62,  s*0.74, -0.24, 1.62);
        arm(s*0.28, 0.16, -1.28, s*0.78, -0.01, -1.33);
        arm(s*0.28,-0.01, -1.26, s*0.78, -0.22, -1.33);
      }

      // ── ANNOTATION DOTS (3D spheres for raycasting) ───────────────────────
      const annSpheres: { mesh: THREE.Mesh; id: string }[] = [];
      ANNOTATIONS.forEach(ann => {
        const g = new THREE.SphereGeometry(0.05, 14, 10);
        const m = new THREE.Mesh(g, matAnnDot.clone());
        m.position.set(ann.pos[0], ann.pos[1], ann.pos[2]);
        m.userData.annId = ann.id;
        car.add(m);
        annSpheres.push({ mesh: m, id: ann.id });
      });

      // ── RAYCASTING ───────────────────────────────────────────────────────
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
          setActiveAnn(prev => (prev === id ? null : id));
        }
      }
      renderer.domElement.addEventListener("click", onCanvasClick);

      // ── Annotation HTML overlay update ────────────────────────────────────
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
          el.style.left  = `${x}px`;
          el.style.top   = `${y}px`;
          // Pulse the active dot
          const dot = el.querySelector(".ann-dot") as HTMLElement | null;
          if (dot) dot.style.background = activeId === ann.id ? "#FF6D5A" : "#4D9DE0";
          // Update 3D sphere color
          const s = annSpheres.find(a => a.id === ann.id);
          if (s) (s.mesh.material as THREE.MeshStandardMaterial).color.set(activeId === ann.id ? 0xFF6D5A : 0x4D9DE0);
        });
      }

      // ── Light update from sliders ─────────────────────────────────────────
      function syncLights() {
        const { angle, height } = lightRef.current;
        const a = (angle / 180) * Math.PI;
        const h = (height / 100) * Math.PI * 0.5;
        const D = 9;
        keyLight.position.set( Math.cos(a)*D, Math.sin(h)*D, Math.sin(a)*D);
        fillLight.position.set(-Math.cos(a)*5, 1.8,         -Math.sin(a)*4);
        rimLight.position.set(  Math.sin(a)*4, 2.2,         -Math.cos(a)*6);
      }

      // ── Animate ──────────────────────────────────────────────────────────
      let raf: number;
      let currentActiveId: string | null = null;
      setActiveAnn(id => { currentActiveId = id; return id; }); // get ref without closure

      function animate() {
        raf = requestAnimationFrame(animate);
        controls.update();
        syncLights();
        // Pulse annotation spheres
        const t = performance.now() * 0.003;
        annSpheres.forEach(({ mesh }) => {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.6 + Math.sin(t + mesh.position.z) * 0.4;
        });
        renderer.render(scene, camera);
        updateAnnotations(currentActiveId);
      }

      // Track activeAnn in a mutable ref for the rAF loop
      setActiveAnn(id => { currentActiveId = id; return id; });

      animate();
      setReady(true);

      // ── Resize ───────────────────────────────────────────────────────────
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

  // Keep currentActiveId in sync (needs to be readable by rAF without re-render)
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => { activeIdRef.current = activeAnn; }, [activeAnn]);

  const activeAnnotation = ANNOTATIONS.find(a => a.id === activeAnn) ?? null;

  return (
    <div className="f1-root">
      {/* Three.js canvas */}
      <div ref={mountRef} className="f1-canvas-wrap" />

      {/* Annotation dots (HTML overlay) */}
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

      {/* Info panel */}
      {activeAnnotation && (
        <div className="f1-info-panel">
          <div className="f1-info-header">
            <span className="f1-info-title mono">{activeAnnotation.label}</span>
            <button className="f1-info-close" onClick={() => setActiveAnn(null)}>✕</button>
          </div>
          <p className="f1-info-body mono">{activeAnnotation.info}</p>
        </div>
      )}

      {/* Light controls */}
      {ready && (
        <div className="f1-controls">
          {([
            { label: "LIGHT ANGLE",  val: lightAngle,  set: setLightAngle,  min: 0,  max: 360 },
            { label: "LIGHT HEIGHT", val: lightHeight, set: setLightHeight, min: 5,  max: 92  },
          ] as const).map(({ label, val, set, min, max }) => (
            <div className="f1-ctrl-row" key={label}>
              <div className="f1-ctrl-labels">
                <span className="f1-ctrl-name mono">{label}</span>
                <span className="f1-ctrl-val mono">{val}°</span>
              </div>
              <input type="range" min={min} max={max} value={val}
                onChange={e => (set as (v: number) => void)(Number(e.target.value))}
                className="f1-slider"
              />
            </div>
          ))}
        </div>
      )}

      {/* Bottom hint */}
      <div className="f1-hint mono">Drag to rotate · Click a dot to inspect</div>

      {/* Car branding */}
      {ready && (
        <div className="f1-brand mono">
          <span className="f1-brand-name">n8n RACING</span>
          <span className="f1-brand-sub">AIX Automation · Car #n8</span>
        </div>
      )}
    </div>
  );
}
