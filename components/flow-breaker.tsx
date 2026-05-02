"use client";

import { useEffect, useRef, useState } from "react";

// ─── Palette ─────────────────────────────────────────────────────────────────

const PAL = {
  RED:    "#E06C4D",
  BLUE:   "#4D9DE0",
  GREEN:  "#14F195",
  PURPLE: "#9945FF",
} as const;

type CK = keyof typeof PAL;
const CKS: CK[] = ["RED","BLUE","GREEN","PURPLE"];

function rgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

// ─── Pipeline layout (relative 0–1 coords) ───────────────────────────────────

interface ND { id: string; rx: number; ry: number; type: "source"|"junction"|"dest"; ck?: CK; label?: string }
interface SD { id: string; from: string; to: string; cp1rx: number; cp1ry: number; cp2rx: number; cp2ry: number; swId?: string; swSt?: 0|1 }

const NODES: ND[] = [
  { id:"src",  rx:0.07, ry:0.50, type:"source" },
  { id:"j1",   rx:0.37, ry:0.50, type:"junction" },
  { id:"j2t",  rx:0.64, ry:0.25, type:"junction" },
  { id:"j2b",  rx:0.64, ry:0.75, type:"junction" },
  { id:"dR",   rx:0.92, ry:0.12, type:"dest", ck:"RED",    label:"Trigger"   },
  { id:"dB",   rx:0.92, ry:0.38, type:"dest", ck:"BLUE",   label:"Action"    },
  { id:"dG",   rx:0.92, ry:0.62, type:"dest", ck:"GREEN",  label:"Webhook"   },
  { id:"dP",   rx:0.92, ry:0.88, type:"dest", ck:"PURPLE", label:"Condition" },
];

const SEGS: SD[] = [
  { id:"src-j1",  from:"src",  to:"j1",  cp1rx:0.18, cp1ry:0.50, cp2rx:0.27, cp2ry:0.50 },
  { id:"j1-j2t",  from:"j1",   to:"j2t", cp1rx:0.47, cp1ry:0.50, cp2rx:0.54, cp2ry:0.25, swId:"j1",  swSt:0 },
  { id:"j1-j2b",  from:"j1",   to:"j2b", cp1rx:0.47, cp1ry:0.50, cp2rx:0.54, cp2ry:0.75, swId:"j1",  swSt:1 },
  { id:"j2t-dR",  from:"j2t",  to:"dR",  cp1rx:0.75, cp1ry:0.25, cp2rx:0.83, cp2ry:0.12, swId:"j2t", swSt:0 },
  { id:"j2t-dB",  from:"j2t",  to:"dB",  cp1rx:0.75, cp1ry:0.25, cp2rx:0.83, cp2ry:0.38, swId:"j2t", swSt:1 },
  { id:"j2b-dG",  from:"j2b",  to:"dG",  cp1rx:0.75, cp1ry:0.75, cp2rx:0.83, cp2ry:0.62, swId:"j2b", swSt:0 },
  { id:"j2b-dP",  from:"j2b",  to:"dP",  cp1rx:0.75, cp1ry:0.75, cp2rx:0.83, cp2ry:0.88, swId:"j2b", swSt:1 },
];

const DEST_MAP: Record<CK, string> = { RED:"dR", BLUE:"dB", GREEN:"dG", PURPLE:"dP" };

// ─── Math ────────────────────────────────────────────────────────────────────

function bz(t: number, p0: number, p1: number, p2: number, p3: number) {
  const m = 1 - t;
  return m*m*m*p0 + 3*m*m*t*p1 + 3*m*t*t*p2 + t*t*t*p3;
}

function segPt(seg: SD, t: number, W: number, H: number) {
  const f = NODES.find(n => n.id === seg.from)!;
  const e = NODES.find(n => n.id === seg.to)!;
  return {
    x: bz(t, f.rx*W, seg.cp1rx*W, seg.cp2rx*W, e.rx*W),
    y: bz(t, f.ry*H, seg.cp1ry*H, seg.cp2ry*H, e.ry*H),
  };
}

function nextSeg(fromId: string, sw: Record<string, 0|1>): string | null {
  const cs = SEGS.filter(s => s.from === fromId);
  if (!cs.length) return null;
  if (cs.length === 1) return cs[0].id;
  return cs.find(s => s.swSt === sw[fromId])?.id ?? null;
}

/** Follow current switch states to predict the full remaining route of a packet */
function predictPath(segId: string, sw: Record<string, 0|1>): string[] {
  const path: string[] = [segId];
  let current = segId;
  for (let i = 0; i < 5; i++) {
    const seg = SEGS.find(s => s.id === current);
    if (!seg) break;
    const toNd = NODES.find(n => n.id === seg.to);
    if (!toNd || toNd.type === "dest") break;
    const next = nextSeg(toNd.id, sw);
    if (!next) break;
    path.push(next);
    current = next;
  }
  return path;
}

// ─── Speed curve — one source of truth ───────────────────────────────────────
// Smooth exponential ramp: gentle at start, challenging by level 8–10, caps out

function spawnIntervalForLevel(lvl: number): number {
  // 4200ms → ~650ms over ~15 levels
  return Math.max(650, Math.round(4200 * Math.pow(0.84, lvl - 1)));
}

function baseSpdForLevel(lvl: number): number {
  // 0.00014 → ~0.00062 cap
  return Math.min(0.00062, 0.00014 * Math.pow(1.22, lvl - 1));
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Pkt {
  id: number; ck: CK; destId: string;
  segId: string; t: number; speed: number;
  state: "alive"|"die"; dieT: number;
  trail: {x:number; y:number}[];
}
interface Par { x:number; y:number; vx:number; vy:number; life:number; color:string; size:number }
interface Pop { x:number; y:number; text:string; life:number; color:string; vy:number; big?: boolean }

interface GS {
  pkts: Pkt[]; pars: Par[]; pops: Pop[];
  sw: Record<string, 0|1>;
  swBounce: Record<string, number>;
  destFlash: Record<string, {t:number; ok:boolean}>;
  score: number; best: number;
  lives: number; combo: number; level: number;
  delivered: number;              // correct deliveries — drives level
  spawnT: number; spawnInt: number; baseSpd: number;
  queue: CK[];                    // pre-generated upcoming packet colors
  screenFlash: number; screenFlashOk: boolean;
  started: boolean; over: boolean;
}

let _pid = 0;

function randomCK(): CK { return CKS[Math.floor(Math.random() * 4)]; }

function fillQueue(): CK[] {
  return [randomCK(), randomCK(), randomCK()];
}

function mkPkt(gs: GS): Pkt {
  const ck = gs.queue.shift() ?? randomCK();
  gs.queue.push(randomCK()); // keep queue full
  return { id:_pid++, ck, destId:DEST_MAP[ck], segId:"src-j1", t:0, speed:gs.baseSpd, state:"alive", dieT:0, trail:[] };
}

function addPars(gs: GS, x: number, y: number, color: string, n: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.PI*2*i/n + Math.random()*0.4;
    const s = 2 + Math.random()*4;
    gs.pars.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:1, color, size:2+Math.random()*3 });
  }
}

function rr(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FlowBreaker() {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const wrap  = useRef<HTMLDivElement>(null);
  const gs    = useRef<GS>({
    pkts:[], pars:[], pops:[],
    sw:{ j1:0, j2t:0, j2b:0 },
    swBounce:{}, destFlash:{},
    score:0, best:0, lives:3, combo:1, level:1, delivered:0,
    spawnT:0, spawnInt:spawnIntervalForLevel(1), baseSpd:baseSpdForLevel(1),
    queue: fillQueue(),
    screenFlash:0, screenFlashOk:false,
    started:false, over:false,
  });

  const [uiScore, setUiScore] = useState(0);
  const [uiBest,  setUiBest]  = useState(0);
  const [uiLives, setUiLives] = useState(3);
  const [uiCombo, setUiCombo] = useState(1);
  const [uiLevel, setUiLevel] = useState(1);
  const [uiQueue, setUiQueue] = useState<CK[]>([]);
  const [phase,   setPhase]   = useState<"idle"|"play"|"over">("idle");

  useEffect(() => {
    const b = parseInt(localStorage.getItem("pr-best") ?? "0", 10);
    gs.current.best = b; setUiBest(b);
  }, []);

  // 3D tilt
  useEffect(() => {
    let rx = 0, ry = 0, raf = 0;
    function tick() {
      if (wrap.current) wrap.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(tick);
    }
    function onMove(e: MouseEvent) {
      const el = wrap.current; if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      rx += (((e.clientY - top) / height - 0.5) * -7 - rx) * 0.08;
      ry += (((e.clientX - left) / width  - 0.5) *  7 - ry) * 0.08;
    }
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  // Click switches
  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const g = gs.current; if (!g.started || g.over) return;
    const c = cvs.current!; const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (c.width  / r.width);
    const my = (e.clientY - r.top)  * (c.height / r.height);
    const W = c.width, H = c.height;
    for (const n of NODES) {
      if (n.type !== "junction") continue;
      const dx = mx - n.rx*W, dy = my - n.ry*H;
      if (Math.sqrt(dx*dx + dy*dy) < 46) {
        g.sw[n.id] = g.sw[n.id] === 0 ? 1 : 0;
        g.swBounce[n.id] = 1;
      }
    }
  }

  // Game loop
  useEffect(() => {
    const c = cvs.current!; const ctx = c.getContext("2d")!;
    let raf = 0, last = 0;

    function resize() { const p = c.parentElement!; c.width = p.clientWidth; c.height = p.clientHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c.parentElement!);

    function loop(now: number) {
      const g = gs.current;
      const dt = Math.min(now - (last || now), 50); last = now;
      const W = c.width, H = c.height;

      if (!g.started) { drawBg(ctx, W, H, now); raf = requestAnimationFrame(loop); return; }

      // ── Spawn ────────────────────────────────────────────────────────────
      if (!g.over) {
        g.spawnT += dt;
        if (g.spawnT >= g.spawnInt) {
          g.spawnT = 0;
          g.pkts.push(mkPkt(g));
          setUiQueue([...g.queue]);
        }
      }

      // ── Update packets ────────────────────────────────────────────────────
      for (const p of g.pkts) {
        if (p.state === "die") { p.dieT -= dt; continue; }
        p.t += p.speed * dt;

        const seg = SEGS.find(s => s.id === p.segId)!;
        const pos = segPt(seg, Math.min(p.t, 1), W, H);
        p.trail.push({ x: pos.x, y: pos.y });
        if (p.trail.length > 14) p.trail.shift();

        if (p.t >= 1) {
          const toNd = NODES.find(n => n.id === seg.to)!;

          if (toNd.type === "dest") {
            const ok = seg.to === p.destId;
            if (ok) {
              g.delivered++;
              // Score: base grows with level, multiplied by combo
              const gained = (10 + g.level * 3) * g.combo;
              g.score += gained;
              g.combo  = Math.min(16, g.combo + 1);
              g.destFlash[seg.to] = { t:700, ok:true };
              g.screenFlash = 180; g.screenFlashOk = true;
              addPars(g, toNd.rx*W, toNd.ry*H, PAL[toNd.ck!], 16);
              g.pops.push({ x:toNd.rx*W, y:toNd.ry*H-24, text:`+${gained}`, life:1, color:PAL[toNd.ck!], vy:-1.2 });
              if (g.score > g.best) {
                g.best = g.score;
                localStorage.setItem("pr-best", String(g.score));
                setUiBest(g.score);
              }
            } else {
              g.lives--;
              // Soft penalty: drop combo by 2 (min 1), don't nuke it entirely
              g.combo = Math.max(1, g.combo - 2);
              g.screenFlash = 500; g.screenFlashOk = false;
              g.destFlash[seg.to] = { t:600, ok:false };
              addPars(g, toNd.rx*W, toNd.ry*H, "#ff3333", 20);
              g.pops.push({ x:toNd.rx*W, y:toNd.ry*H-24, text:"WRONG!", life:1, color:"#ff3333", vy:-1.2 });
              if (g.lives <= 0) { g.over = true; setPhase("over"); }
              setUiLives(g.lives); setUiCombo(g.combo);
            }
            p.state = "die"; p.dieT = 350;

          } else if (toNd.type === "junction") {
            const nx = nextSeg(toNd.id, g.sw);
            if (nx) { p.segId = nx; p.t = 0; p.trail = []; }
            else    { p.state = "die"; p.dieT = 200; }
          }
        }
      }
      g.pkts = g.pkts.filter(p => !(p.state === "die" && p.dieT <= 0));

      // ── Difficulty — driven by delivered count, not score ─────────────────
      const newLvl = Math.floor(g.delivered / 8) + 1;
      if (newLvl !== g.level) {
        g.level    = newLvl;
        g.spawnInt = spawnIntervalForLevel(newLvl);
        g.baseSpd  = baseSpdForLevel(newLvl);
        setUiLevel(newLvl);
        // Immediately speed up in-flight packets so they don't feel frozen
        for (const p of g.pkts) if (p.state === "alive") p.speed = g.baseSpd;
        g.screenFlash = 500; g.screenFlashOk = true;
        g.pops.push({ x:W/2, y:H/2-50, text:`LEVEL ${newLvl}`, life:1.8, color:"#ffcc44", vy:-0.4, big:true });
      }

      // ── Decay / particles ─────────────────────────────────────────────────
      for (const k of Object.keys(g.swBounce))  g.swBounce[k]  = Math.max(0, g.swBounce[k] - dt*0.007);
      for (const k of Object.keys(g.destFlash)) {
        g.destFlash[k].t = Math.max(0, g.destFlash[k].t - dt);
        if (g.destFlash[k].t <= 0) delete g.destFlash[k];
      }
      g.screenFlash = Math.max(0, g.screenFlash - dt);

      for (const p of g.pars) { p.x += p.vx; p.y += p.vy; p.vx *= 0.91; p.vy *= 0.91; p.vy += 0.05; p.life -= dt/550; }
      g.pars = g.pars.filter(p => p.life > 0);
      for (const p of g.pops) { p.y += p.vy; p.life -= dt/900; }
      g.pops = g.pops.filter(p => p.life > 0);

      // Throttled UI sync
      if (Math.floor(now/80) !== Math.floor((now - dt)/80)) {
        setUiScore(g.score); setUiCombo(g.combo);
      }

      drawScene(ctx, g, W, H, now);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startGame() {
    const g = gs.current;
    const q = fillQueue();
    Object.assign(g, {
      pkts:[], pars:[], pops:[],
      sw:{ j1:0, j2t:0, j2b:0 }, swBounce:{}, destFlash:{},
      score:0, lives:3, combo:1, level:1, delivered:0,
      spawnT:0, spawnInt:spawnIntervalForLevel(1), baseSpd:baseSpdForLevel(1),
      queue: q,
      screenFlash:0, over:false, started:true,
    });
    setPhase("play"); setUiScore(0); setUiLives(3); setUiCombo(1); setUiLevel(1); setUiQueue([...q]);
  }

  const isPlay = phase === "play";
  const isOver = phase === "over";

  return (
    <div className="fb-root">
      <div className="fb-tilt-wrap" ref={wrap}>
        <canvas ref={cvs} className="fb-canvas" onClick={handleClick}
          style={{ cursor: isPlay ? "crosshair" : "default" }} />

        {/* HUD */}
        {isPlay && (
          <div className="fb-hud">
            <div className="fb-hud-left">
              <span className="fb-score-label mono">Score</span>
              <span className="fb-score-value mono">{uiScore.toLocaleString()}</span>
            </div>
            <div className="fb-hud-center">
              <span className="fb-level-badge mono">LVL {uiLevel}</span>
              {uiCombo > 1 && <span className="fb-combo mono">×{uiCombo}</span>}
            </div>
            <div className="fb-hud-right">
              <div className="fb-hearts">
                {[0,1,2].map(i => (
                  <span key={i} className={`fb-heart${i < uiLives ? "" : " fb-heart--lost"}`}>♥</span>
                ))}
              </div>
              <span className="fb-score-label mono">Best</span>
              <span className="fb-score-value mono">{uiBest.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Upcoming packet queue */}
        {isPlay && uiQueue.length > 0 && (
          <div className="fb-queue">
            <span className="fb-queue-label mono">Next</span>
            {uiQueue.slice(0, 3).map((ck, i) => (
              <span
                key={i}
                className="fb-queue-dot"
                style={{ background: PAL[ck], opacity: 1 - i * 0.28, boxShadow: `0 0 6px ${PAL[ck]}` }}
                title={ck}
              />
            ))}
          </div>
        )}

        {/* Start / Game Over overlay */}
        {(phase === "idle" || phase === "over") && (
          <div className="fb-start">
            <div className="fb-start-inner">
              {isOver ? (
                <>
                  <div className="eyebrow mono" style={{ color:"#ff4444" }}>Pipeline Crashed</div>
                  <div className="fb-score-value mono" style={{ fontSize:52, color:"var(--accent)", marginTop:8 }}>{uiScore.toLocaleString()}</div>
                  {uiScore > 0 && uiScore >= uiBest && <div className="fb-start-best mono">🏆 New best!</div>}
                </>
              ) : (
                <>
                  <div className="eyebrow mono">Playground</div>
                  <h2 className="fb-start-title">Pipeline Rush</h2>
                  <p className="fb-start-desc mono">
                    Colored packets travel the pipeline.<br/>
                    Click <span style={{ color:"#ffcc44" }}>switches</span> to route each packet to its matching destination.<br/>
                    The glowing path shows where it&apos;ll go — plan ahead!
                  </p>
                  <div className="fb-legend">
                    {CKS.map(ck => (
                      <span key={ck} className="fb-legend-item mono" style={{ color:PAL[ck] }}>
                        ● {ck}
                      </span>
                    ))}
                  </div>
                  {uiBest > 0 && <div className="fb-start-best mono">Best: <strong>{uiBest.toLocaleString()}</strong></div>}
                </>
              )}
              <button className="btn btn-primary fb-start-btn" onClick={startGame}>
                {isOver ? "Try again →" : "Start →"}
              </button>
              {!isOver && <p className="fb-start-hint mono">3 wrong routes = game over · best score saved</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBg(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  ctx.fillStyle = "#08080f"; ctx.fillRect(0, 0, W, H);
  const step = 38, a = Math.sin(t * 0.0004) * 0.012 + 0.028;
  ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = 0; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 0; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
}

function drawScene(ctx: CanvasRenderingContext2D, g: GS, W: number, H: number, t: number) {
  drawBg(ctx, W, H, t);

  // Screen flash (error = red, success/level-up = green)
  if (g.screenFlash > 0) {
    const a = (g.screenFlash / 500) * 0.18;
    ctx.fillStyle = g.screenFlashOk ? `rgba(20,241,149,${a})` : `rgba(255,50,50,${a})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Route preview — draw predicted path for each live packet UNDER the pipes
  for (const p of g.pkts) {
    if (p.state !== "alive") continue;
    const futurePath = predictPath(p.segId, g.sw);
    drawPathPreview(ctx, p.segId, futurePath.slice(1), PAL[p.ck], p.t, W, H);
  }

  drawPipes(ctx, g, W, H, t);
  drawDests(ctx, g, W, H, t);
  drawSource(ctx, W, H, t);
  drawSwitches(ctx, g, W, H, t);
  drawPkts(ctx, g, W, H);
  drawPars(ctx, g);
  drawPops(ctx, g);
}

/**
 * Glow the remaining path the current packet will travel based on switch states.
 * Draws the tail of currentSeg (from t onward) + all future segments.
 */
function drawPathPreview(
  ctx: CanvasRenderingContext2D,
  currentSegId: string,
  futureSids: string[],
  color: string,
  currentT: number,
  W: number, H: number
) {
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.shadowBlur = 16;
  ctx.shadowColor = color;

  // Remaining portion of current segment (from currentT → 1), sampled
  const cSeg = SEGS.find(s => s.id === currentSegId);
  if (cSeg) {
    const fromNd = NODES.find(n => n.id === cSeg.from)!;
    const toNd   = NODES.find(n => n.id === cSeg.to)!;
    ctx.beginPath();
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const tt = currentT + (1 - currentT) * (i / steps);
      const x = bz(tt, fromNd.rx*W, cSeg.cp1rx*W, cSeg.cp2rx*W, toNd.rx*W);
      const y = bz(tt, fromNd.ry*H, cSeg.cp1ry*H, cSeg.cp2ry*H, toNd.ry*H);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Full future segments
  for (const sid of futureSids) {
    const seg = SEGS.find(s => s.id === sid);
    if (!seg) continue;
    const fromNd = NODES.find(n => n.id === seg.from)!;
    const toNd   = NODES.find(n => n.id === seg.to)!;
    ctx.beginPath();
    ctx.moveTo(fromNd.rx*W, fromNd.ry*H);
    ctx.bezierCurveTo(seg.cp1rx*W, seg.cp1ry*H, seg.cp2rx*W, seg.cp2ry*H, toNd.rx*W, toNd.ry*H);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPipes(ctx: CanvasRenderingContext2D, g: GS, W: number, H: number, t: number) {
  for (const seg of SEGS) {
    const active = seg.swId === undefined ? true : g.sw[seg.swId] === seg.swSt;
    const toNd   = NODES.find(n => n.id === seg.to)!;

    let pipeColor = "#aaaaaa";
    if      (toNd.type === "dest" && toNd.ck) pipeColor = PAL[toNd.ck];
    else if (toNd.id === "j2t")               pipeColor = "#8888ff";
    else if (toNd.id === "j2b")               pipeColor = "#88ff88";

    const alpha = active ? 0.55 : 0.12;
    const lw    = active ? 3    : 1.5;
    const glow  = active ? 10   : 0;

    const fromNd = NODES.find(n => n.id === seg.from)!;
    ctx.save();
    ctx.shadowBlur = glow; ctx.shadowColor = pipeColor;
    ctx.strokeStyle = `rgba(${rgb(pipeColor)},${alpha})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(fromNd.rx*W, fromNd.ry*H);
    ctx.bezierCurveTo(seg.cp1rx*W, seg.cp1ry*H, seg.cp2rx*W, seg.cp2ry*H, toNd.rx*W, toNd.ry*H);
    ctx.stroke();
    ctx.restore();

    // Animated flow dots on active pipes
    if (active) {
      for (let i = 0; i < 2; i++) {
        const ft = ((t * 0.00032 + i * 0.5) % 1);
        const pos = segPt(seg, ft, W, H);
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = pipeColor;
        ctx.shadowBlur = 8; ctx.shadowColor = pipeColor;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }
  }
}

function drawDests(ctx: CanvasRenderingContext2D, g: GS, W: number, H: number, t: number) {
  for (const n of NODES) {
    if (n.type !== "dest") continue;
    const x = n.rx*W, y = n.ry*H, color = PAL[n.ck!];
    const fl = g.destFlash[n.id];
    const fa = fl ? (fl.t / 700) : 0;
    const pulse = Math.sin(t * 0.002) * 0.25 + 0.75;

    ctx.save();
    ctx.shadowBlur = 8 + pulse*6 + fa*28; ctx.shadowColor = color;
    const bw = 84, bh = 32;
    rr(ctx, x-bw/2, y-bh/2, bw, bh, 6);
    ctx.fillStyle = `rgba(${rgb(color)},${0.07 + fa*0.22})`; ctx.fill();
    ctx.strokeStyle = `rgba(${rgb(color)},${0.45 + fa*0.55})`; ctx.lineWidth = 1.5 + fa; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255,255,255,${0.65 + fa*0.35})`;
    ctx.font = `${fa > 0.3 ? "bold " : ""}10px var(--font-mono-stack,monospace)`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(n.label ?? n.id, x, y);
    ctx.restore();

    // Color dot indicator
    ctx.save();
    ctx.fillStyle = color; ctx.shadowBlur = 6; ctx.shadowColor = color;
    ctx.beginPath(); ctx.arc(x - bw/2 + 10, y, 4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function drawSource(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  const n = NODES.find(nd => nd.id === "src")!;
  const x = n.rx*W, y = n.ry*H;
  const p = Math.sin(t * 0.003) * 0.3 + 0.7;
  ctx.save();
  ctx.shadowBlur = 14 + p*8; ctx.shadowColor = "rgba(255,255,255,0.5)";
  ctx.strokeStyle = `rgba(255,255,255,${0.4 + p*0.3})`; ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "10px var(--font-mono-stack,monospace)";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("SRC", x, y);
  ctx.restore();
}

function drawSwitches(ctx: CanvasRenderingContext2D, g: GS, W: number, H: number, t: number) {
  for (const n of NODES) {
    if (n.type !== "junction") continue;
    const x = n.rx*W, y = n.ry*H;
    const state  = g.sw[n.id];
    const bounce = g.swBounce[n.id] ?? 0;
    const sc     = 1 + bounce * 0.35;
    const pulse  = Math.sin(t * 0.0025) * 0.3 + 0.7;

    ctx.save();
    ctx.translate(x, y); ctx.scale(sc, sc);

    ctx.shadowBlur = 12 + pulse*8; ctx.shadowColor = "rgba(255,200,80,0.6)";
    ctx.fillStyle = "rgba(13,13,18,0.92)";
    ctx.strokeStyle = `rgba(255,200,80,${0.45 + pulse*0.3})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI*2); ctx.fill(); ctx.stroke();

    ctx.shadowBlur = 8; ctx.shadowColor = "rgba(255,200,80,0.8)";
    ctx.fillStyle = "rgba(255,200,80,0.95)";
    ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(state === 0 ? "↗" : "↘", 0, 1);

    ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.font = "8px var(--font-mono-stack,monospace)";
    ctx.fillText("SWITCH", 0, 36);

    ctx.restore();
  }
}

function drawPkts(ctx: CanvasRenderingContext2D, g: GS, W: number, H: number) {
  for (const p of g.pkts) {
    const seg = SEGS.find(s => s.id === p.segId); if (!seg) continue;
    const pos = segPt(seg, Math.min(p.t, 1), W, H);
    const color = PAL[p.ck];
    const alpha = p.state === "alive" ? 1 : Math.max(0, p.dieT / 350);

    // Trail
    if (p.trail.length > 1) {
      ctx.save();
      for (let i = 1; i < p.trail.length; i++) {
        const a = (i / p.trail.length) * 0.35 * alpha;
        ctx.strokeStyle = `rgba(${rgb(color)},${a})`;
        ctx.lineWidth = 3 * (i / p.trail.length);
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y); ctx.lineTo(p.trail[i].x, p.trail[i].y); ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 20; ctx.shadowColor = color;

    // Outer ring
    ctx.strokeStyle = `rgba(${rgb(color)},0.45)`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 16, 0, Math.PI*2); ctx.stroke();

    // Inner fill
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 10, 0, Math.PI*2); ctx.fill();

    // Letter
    ctx.shadowBlur = 0; ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.font = "bold 9px var(--font-mono-stack,monospace)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(p.ck[0], pos.x, pos.y);
    ctx.restore();
  }
}

function drawPars(ctx: CanvasRenderingContext2D, g: GS) {
  for (const p of g.pars) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color; ctx.shadowBlur = 5; ctx.shadowColor = p.color;
    ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    ctx.restore();
  }
}

function drawPops(ctx: CanvasRenderingContext2D, g: GS) {
  for (const p of g.pops) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color; ctx.shadowBlur = 10; ctx.shadowColor = p.color;
    ctx.font = p.big
      ? "bold 28px var(--font-mono-stack,monospace)"
      : "bold 14px var(--font-mono-stack,monospace)";
    ctx.textAlign = "center";
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }
}
