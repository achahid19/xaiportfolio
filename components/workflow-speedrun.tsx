"use client";

import { useEffect, useRef, useState } from "react";

// ─── Palette (n8n dark) ───────────────────────────────────────────────────────
const C = {
  bg:"#0d0d12", orange:"#FF6D5A", green:"#14F195",
  red:"#ff4444", yellow:"#F0C040", blue:"#4D9DE0",
  purple:"#9945FF", pink:"#E01E5A", gray:"#888",
  text:"#e8e8ee", muted:"#444",
} as const;

function rgb(hex: string) {
  const h = hex.replace("#","");
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
}

type NType = "trigger"|"http"|"if"|"set"|"code"|"slack"|"email"|"error"|"end";
const NCLR: Record<NType,string> = {
  trigger:C.orange, http:C.blue, if:C.yellow, set:C.purple,
  code:C.gray, slack:C.pink, email:C.blue, error:C.red, end:C.green,
};
const NICO: Record<NType,string> = {
  trigger:"⚡", http:"↗", if:"◇", set:"≡",
  code:"{}", slack:"#", email:"@", error:"!", end:"✓",
};

// ─── Data model ───────────────────────────────────────────────────────────────
interface WNode {
  id:string; rx:number; ry:number; type:NType; label:string;
  next:string[]; correctNext?:string; condition?:string; inputHint?:string;
}
interface WConn { from:string; to:string; cp1rx:number; cp1ry:number; cp2rx:number; cp2ry:number; label?:string; }
interface Level  { name:string; desc:string; nodes:WNode[]; conns:WConn[]; order:string[]; }

// ─── Bezier helpers ───────────────────────────────────────────────────────────
function bz(t:number, a:number, b:number, c:number, d:number) {
  const m=1-t; return m*m*m*a+3*m*m*t*b+3*m*t*t*c+t*t*t*d;
}
function connPt(cn:WConn, t:number, W:number, H:number, fn:WNode, tn:WNode) {
  return { x:bz(t,fn.rx*W,cn.cp1rx*W,cn.cp2rx*W,tn.rx*W), y:bz(t,fn.ry*H,cn.cp1ry*H,cn.cp2ry*H,tn.ry*H) };
}
function nw(W:number) { return Math.min(104, Math.max(72, W*0.095)); } // half-width of node card
const NH = 18; // half-height of node card (px)

// ─── Which nodes can be clicked at current step ───────────────────────────────
// If the previous node (in execution order) was an IF, show all its branches
function getClickable(lv:Level, idx:number): string[] {
  if (idx >= lv.order.length) return [];
  const target = lv.order[idx];
  const pred = lv.nodes.find(n => n.next.includes(target) && n.type==="if");
  return pred ? pred.next : [target];
}

// ─── Levels ───────────────────────────────────────────────────────────────────
const LEVELS: Level[] = [
  {
    name: "First Contact",
    desc: "Simple linear flow — click each node to execute it in order.",
    nodes: [
      { id:"n1", rx:0.09, ry:0.36, type:"trigger", label:"Webhook",        next:["n2"] },
      { id:"n2", rx:0.29, ry:0.36, type:"http",    label:"HTTP GET /users", next:["n3"] },
      { id:"n3", rx:0.50, ry:0.36, type:"set",     label:"Set Fields",      next:["n4"] },
      { id:"n4", rx:0.71, ry:0.36, type:"slack",   label:"Slack Message",   next:["n5"] },
      { id:"n5", rx:0.90, ry:0.36, type:"end",     label:"Done",            next:[] },
    ],
    conns: [
      { from:"n1", to:"n2", cp1rx:0.17, cp1ry:0.36, cp2rx:0.21, cp2ry:0.36 },
      { from:"n2", to:"n3", cp1rx:0.38, cp1ry:0.36, cp2rx:0.42, cp2ry:0.36 },
      { from:"n3", to:"n4", cp1rx:0.59, cp1ry:0.36, cp2rx:0.63, cp2ry:0.36 },
      { from:"n4", to:"n5", cp1rx:0.79, cp1ry:0.36, cp2rx:0.83, cp2ry:0.36 },
    ],
    order: ["n1","n2","n3","n4","n5"],
  },
  {
    name: "Status Gate",
    desc: "HTTP returned status: 404. The IF checks status = 200 — pick the right branch.",
    nodes: [
      { id:"n1", rx:0.07, ry:0.38, type:"trigger", label:"Webhook",          next:["n2"] },
      { id:"n2", rx:0.26, ry:0.38, type:"http",    label:"HTTP GET /health",  next:["n3"], inputHint:"status: 404" },
      { id:"n3", rx:0.47, ry:0.38, type:"if",      label:"status = 200?",     next:["n4","n5"], correctNext:"n5", condition:"status === 200", inputHint:"status: 404" },
      { id:"n4", rx:0.70, ry:0.17, type:"slack",   label:"Notify Success",    next:["n6"] },
      { id:"n5", rx:0.70, ry:0.59, type:"error",   label:"Error Handler",     next:["n6"] },
      { id:"n6", rx:0.91, ry:0.38, type:"end",     label:"Done",              next:[] },
    ],
    conns: [
      { from:"n1", to:"n2", cp1rx:0.15, cp1ry:0.38, cp2rx:0.18, cp2ry:0.38 },
      { from:"n2", to:"n3", cp1rx:0.35, cp1ry:0.38, cp2rx:0.39, cp2ry:0.38 },
      { from:"n3", to:"n4", cp1rx:0.57, cp1ry:0.38, cp2rx:0.61, cp2ry:0.17, label:"YES" },
      { from:"n3", to:"n5", cp1rx:0.57, cp1ry:0.38, cp2rx:0.61, cp2ry:0.59, label:"NO"  },
      { from:"n4", to:"n6", cp1rx:0.79, cp1ry:0.17, cp2rx:0.85, cp2ry:0.38 },
      { from:"n5", to:"n6", cp1rx:0.79, cp1ry:0.59, cp2rx:0.85, cp2ry:0.38 },
    ],
    order: ["n1","n2","n3","n5","n6"],   // n5 = correct (status 404 ≠ 200 → NO)
  },
  {
    name: "Full Pipeline",
    desc: "Fetch, filter, then decide. count: 12 — is count > 0? Route to the right output.",
    nodes: [
      { id:"n1", rx:0.07, ry:0.36, type:"trigger", label:"Schedule",      next:["n2"] },
      { id:"n2", rx:0.24, ry:0.36, type:"http",    label:"GET /users",    next:["n3"], inputHint:"count: 12" },
      { id:"n3", rx:0.41, ry:0.36, type:"set",     label:"Filter Active", next:["n4"] },
      { id:"n4", rx:0.58, ry:0.36, type:"if",      label:"count > 0?",    next:["n5","n6"], correctNext:"n5", condition:"count > 0", inputHint:"count: 12" },
      { id:"n5", rx:0.77, ry:0.16, type:"email",   label:"Email Report",  next:["n7"] },
      { id:"n6", rx:0.77, ry:0.57, type:"code",    label:"Log: Empty",    next:["n7"] },
      { id:"n7", rx:0.93, ry:0.36, type:"end",     label:"Done",          next:[] },
    ],
    conns: [
      { from:"n1", to:"n2", cp1rx:0.14, cp1ry:0.36, cp2rx:0.17, cp2ry:0.36 },
      { from:"n2", to:"n3", cp1rx:0.31, cp1ry:0.36, cp2rx:0.34, cp2ry:0.36 },
      { from:"n3", to:"n4", cp1rx:0.48, cp1ry:0.36, cp2rx:0.51, cp2ry:0.36 },
      { from:"n4", to:"n5", cp1rx:0.66, cp1ry:0.36, cp2rx:0.70, cp2ry:0.16, label:"YES" },
      { from:"n4", to:"n6", cp1rx:0.66, cp1ry:0.36, cp2rx:0.70, cp2ry:0.57, label:"NO"  },
      { from:"n5", to:"n7", cp1rx:0.85, cp1ry:0.16, cp2rx:0.90, cp2ry:0.36 },
      { from:"n6", to:"n7", cp1rx:0.85, cp1ry:0.57, cp2rx:0.90, cp2ry:0.36 },
    ],
    order: ["n1","n2","n3","n4","n5","n7"],  // n5 = correct (count 12 > 0 → YES)
  },
];

// ─── Game state ───────────────────────────────────────────────────────────────
interface Packet { cn:WConn; t:number; color:string; fn:WNode; tn:WNode; }
interface Pop    { x:number; y:number; text:string; life:number; color:string; vy:number; }

interface GS {
  phase: "idle"|"playing"|"levelEnd"|"end";
  levelIdx: number;
  orderIdx: number;
  nodeState: Record<string,"idle"|"active"|"done"|"error">;
  errorFlash: Record<string,number>;
  errors: number; levelErrors: number;
  startMs: number; levelStartMs: number;
  levelTimes: number[];
  carX: number; carTargetX: number;
  dashOff: number; carSpeed: number;
  packets: Packet[];
  pops: Pop[];
  flash: number; flashOk: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WorkflowSpeedrun() {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const gs   = useRef<GS>(initGS());
  const [uiPhase,   setUiPhase]   = useState<GS["phase"]>("idle");
  const [uiLevel,   setUiLevel]   = useState(0);
  const [uiElapsed, setUiElapsed] = useState(0);
  const [uiErrors,  setUiErrors]  = useState(0);
  const [uiBest,    setUiBest]    = useState(0);
  const [uiLTimes,  setUiLTimes]  = useState<number[]>([]);

  function initGS(): GS {
    return {
      phase:"idle", levelIdx:0, orderIdx:0,
      nodeState:{}, errorFlash:{},
      errors:0, levelErrors:0,
      startMs:0, levelStartMs:0, levelTimes:[],
      carX:0, carTargetX:0, dashOff:0, carSpeed:0,
      packets:[], pops:[],
      flash:0, flashOk:false,
    };
  }

  useEffect(() => {
    const b = parseInt(localStorage.getItem("ws-best")??"0",10);
    if (b > 0) setUiBest(b);
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const c = cvs.current!; const ctx = c.getContext("2d")!;
    let raf = 0, last = 0;
    function resize() { const p=c.parentElement!; c.width=p.clientWidth; c.height=p.clientHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c.parentElement!);

    function loop(now: number) {
      const dt = Math.min(now-(last||now), 50); last = now;
      const g = gs.current;
      const W = c.width, H = c.height;

      if (g.phase === "playing") {
        // Update packets
        for (const pk of g.packets) pk.t += dt / 420;
        g.packets = g.packets.filter(pk => pk.t < 1.05);

        // Decay error flashes
        for (const k of Object.keys(g.errorFlash)) {
          g.errorFlash[k] = Math.max(0, g.errorFlash[k] - dt);
          if (g.errorFlash[k] <= 0) delete g.errorFlash[k];
        }
        g.flash = Math.max(0, g.flash - dt);

        // Car lerp
        g.carSpeed = Math.abs(g.carTargetX - g.carX);
        g.carX += (g.carTargetX - g.carX) * 0.07;
        g.dashOff = (g.dashOff + g.carSpeed * 0.04) % 28;

        // Pops
        for (const p of g.pops) { p.y += p.vy; p.life -= dt/900; }
        g.pops = g.pops.filter(p => p.life > 0);

        // Timer UI (throttled)
        if (Math.floor(now/50) !== Math.floor((now-dt)/50)) {
          setUiElapsed(now - g.startMs);
        }
      }

      drawScene(ctx, g, W, H, now);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  // ── Load a level ──────────────────────────────────────────────────────────
  function loadLevel(g: GS, idx: number, now: number) {
    const lv = LEVELS[idx];
    g.levelIdx = idx;
    g.orderIdx = 0;
    g.levelErrors = 0;
    g.levelStartMs = now;
    g.nodeState = Object.fromEntries(lv.nodes.map(n => [n.id,"idle"]));
    g.errorFlash = {};
    g.packets = [];
    // Set first clickable nodes as active
    for (const id of getClickable(lv, 0)) g.nodeState[id] = "active";
    // Car position
    const W = cvs.current?.width ?? 800;
    const carStart = W * 0.06, carEnd = W * 0.91;
    g.carX = carStart;
    g.carTargetX = carStart;
    setUiLevel(idx);
    updateCarTarget(g, lv, W);
  }

  function updateCarTarget(g: GS, lv: Level, W: number) {
    const carStart = W * 0.06, carEnd = W * 0.91;
    g.carTargetX = carStart + (g.orderIdx / lv.order.length) * (carEnd - carStart);
  }

  // ── Start game ────────────────────────────────────────────────────────────
  function startGame() {
    const g = gs.current;
    Object.assign(g, initGS());
    g.phase = "playing";
    g.startMs = performance.now();
    loadLevel(g, 0, g.startMs);
    setUiPhase("playing"); setUiErrors(0); setUiElapsed(0); setUiLTimes([]);
  }

  // ── Handle click ─────────────────────────────────────────────────────────
  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const g = gs.current;
    if (g.phase !== "playing") return;
    const c = cvs.current!; const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (c.width / r.width);
    const my = (e.clientY - r.top)  * (c.height / r.height);
    const W = c.width, H = c.height;
    const lv = LEVELS[g.levelIdx];
    const NHalf = nw(W);

    // Find which node was clicked
    for (const nd of lv.nodes) {
      if (Math.abs(mx - nd.rx*W) < NHalf && Math.abs(my - nd.ry*H*WF_H) < NH) {
        handleNodeClick(g, nd.id, lv, W, H);
        return;
      }
    }
  }

  function handleNodeClick(g: GS, nodeId: string, lv: Level, W: number, H: number) {
    const clickable = getClickable(lv, g.orderIdx);
    if (!clickable.includes(nodeId)) return; // not clickable right now

    const correctId = lv.order[g.orderIdx];
    const isCorrect = nodeId === correctId;
    const nd = lv.nodes.find(n => n.id === nodeId)!;

    if (isCorrect) {
      // ✓ Correct
      g.nodeState[nodeId] = "done";
      g.flash = 200; g.flashOk = true;

      // Spawn data packet along the connection leading OUT of this node
      const outConn = lv.conns.find(cn => cn.from === nodeId && cn.to === lv.order[g.orderIdx+1]);
      if (outConn) {
        const tn = lv.nodes.find(n => n.id === outConn.to)!;
        g.packets.push({ cn: outConn, t: 0, color: NCLR[nd.type], fn: nd, tn });
      }

      g.pops.push({ x: nd.rx*W, y: nd.ry*H*WF_H - 30, text:"✓", life:1, color:C.green, vy:-1.0 });
      g.orderIdx++;

      if (g.orderIdx >= lv.order.length) {
        // Level complete
        const levelMs = performance.now() - g.levelStartMs;
        g.levelTimes.push(levelMs);
        setUiLTimes([...g.levelTimes]);

        if (g.levelIdx + 1 < LEVELS.length) {
          // Brief pause then load next level
          setTimeout(() => {
            g.phase = "playing";
            loadLevel(g, g.levelIdx + 1, performance.now());
            setUiPhase("playing");
          }, 1400);
          g.phase = "levelEnd";
          setUiPhase("levelEnd");
        } else {
          // All done
          const totalMs = performance.now() - g.startMs;
          const prev = parseInt(localStorage.getItem("ws-best")??"0",10);
          if (prev === 0 || totalMs < prev) {
            localStorage.setItem("ws-best", String(Math.round(totalMs)));
            setUiBest(Math.round(totalMs));
          }
          g.phase = "end";
          setUiPhase("end");
        }
      } else {
        // Activate next clickable nodes
        const nextClickable = getClickable(lv, g.orderIdx);
        for (const id of nextClickable) g.nodeState[id] = "active";
      }

      updateCarTarget(g, lv, W);
      setUiErrors(g.errors);

    } else {
      // ✗ Wrong
      g.errors++;
      g.levelErrors++;
      g.errorFlash[nodeId] = 600;
      g.nodeState[nodeId] = "error";
      g.flash = 500; g.flashOk = false;
      g.pops.push({ x: nd.rx*W, y: nd.ry*H*WF_H - 28, text:"WRONG", life:1, color:C.red, vy:-0.9 });
      setTimeout(() => {
        if (g.nodeState[nodeId] !== "done") g.nodeState[nodeId] = "active";
      }, 650);
      setUiErrors(g.errors);
    }
  }

  const isIdle    = uiPhase === "idle";
  const isEnd     = uiPhase === "end";
  const isLvlEnd  = uiPhase === "levelEnd";
  const isPlaying = uiPhase === "playing" || isLvlEnd;

  return (
    <div className="ws-root">
      <canvas ref={cvs} className="ws-canvas" onClick={handleClick}
        style={{ cursor: isPlaying ? "crosshair" : "default" }} />

      {/* HUD */}
      {isPlaying && (
        <div className="ws-hud">
          <div className="ws-hud-left">
            <span className="ws-hud-label mono">Level</span>
            <span className="ws-hud-val mono">{uiLevel + 1} / {LEVELS.length}</span>
            <span className="ws-hud-name mono">{LEVELS[uiLevel]?.name}</span>
          </div>
          <div className="ws-hud-center">
            <span className="ws-hud-time mono">{fmtMs(uiElapsed)}</span>
            {uiBest > 0 && <span className="ws-hud-best mono">best {fmtMs(uiBest)}</span>}
          </div>
          <div className="ws-hud-right">
            {uiErrors > 0 && (
              <span className="ws-hud-errors mono">✗ {uiErrors} error{uiErrors !== 1 ? "s":""}</span>
            )}
          </div>
        </div>
      )}

      {/* Level end flash */}
      {isLvlEnd && (
        <div className="ws-levelup">
          <span className="ws-levelup-text mono">
            Level {uiLevel} done — {fmtMs(uiLTimes[uiLTimes.length-1])}
          </span>
        </div>
      )}

      {/* Overlays */}
      {(isIdle || isEnd) && (
        <div className="ws-overlay">
          <div className="ws-overlay-inner">
            {isEnd ? (
              <>
                <div className="eyebrow mono" style={{color:C.green}}>Workflow Complete</div>
                <div className="ws-overlay-score mono">{fmtMs(uiElapsed)}</div>
                {uiErrors === 0 && <div className="ws-overlay-perfect mono">⚡ Perfect execution</div>}
                {uiErrors > 0   && <div className="ws-overlay-errors mono">✗ {uiErrors} routing error{uiErrors!==1?"s":""}</div>}
                <div className="ws-level-times">
                  {uiLTimes.map((t,i) => (
                    <span key={i} className="ws-level-time mono">
                      Level {i+1}: {fmtMs(t)}
                    </span>
                  ))}
                </div>
                {uiBest > 0 && uiElapsed <= uiBest && <div className="ws-overlay-best mono">🏆 New best!</div>}
              </>
            ) : (
              <>
                <div className="eyebrow mono">Playground</div>
                <h2 className="ws-overlay-title">Workflow Speedrun</h2>
                <p className="ws-overlay-desc mono">
                  Execute 3 n8n workflows as fast as possible.<br/>
                  Click nodes in the correct order — <span style={{color:C.yellow}}>IF nodes</span> require you to pick the right branch.<br/>
                  The car advances with every correct execution.
                </p>
                {uiBest > 0 && <div className="ws-overlay-best mono">Best time: <strong>{fmtMs(uiBest)}</strong></div>}
              </>
            )}
            <button className="btn btn-primary ws-start-btn" onClick={startGame}>
              {isEnd ? "Run again →" : "Start →"}
            </button>
            {isIdle && <p className="ws-overlay-hint mono">Best time saved automatically · 0 errors = perfect run</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WF_H = 0.74;  // workflow canvas takes top 74%, track bottom 26%

function fmtMs(ms: number): string {
  if (ms <= 0) return "0:00.0";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const t = Math.floor((ms % 1000) / 100);
  return `${m}:${String(s).padStart(2,"0")}.${t}`;
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBg(ctx: CanvasRenderingContext2D, W:number, H:number, t:number) {
  ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);
  const step = 36, a = Math.sin(t*0.0003)*0.008+0.018;
  ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x=0; x<W; x+=step) { ctx.moveTo(x,0); ctx.lineTo(x,H*WF_H); }
  for (let y=0; y<H*WF_H; y+=step) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
  ctx.stroke();
}

function rr(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

function drawScene(ctx: CanvasRenderingContext2D, g:GS, W:number, H:number, t:number) {
  drawBg(ctx, W, H, t);

  if (g.phase === "idle") { drawTrack(ctx,g,W,H,t); return; }

  // Screen flash
  if (g.flash > 0) {
    ctx.fillStyle = g.flashOk
      ? `rgba(20,241,149,${(g.flash/500)*0.12})`
      : `rgba(255,50,50,${(g.flash/500)*0.15})`;
    ctx.fillRect(0,0,W,H);
  }

  const lv = LEVELS[g.levelIdx];
  if (!lv) return;

  drawConnections(ctx, g, lv, W, H, t);
  drawPackets(ctx, g, W, H);
  drawNodes(ctx, g, lv, W, H, t);
  drawPops(ctx, g);
  drawTrack(ctx, g, W, H, t);
}

function drawConnections(ctx: CanvasRenderingContext2D, g:GS, lv:Level, W:number, H:number, t:number) {
  for (const cn of lv.conns) {
    const fn = lv.nodes.find(n=>n.id===cn.from)!;
    const tn = lv.nodes.find(n=>n.id===cn.to)!;
    const isDone   = g.nodeState[cn.from]==="done" && (g.nodeState[cn.to]==="done"||g.nodeState[cn.to]==="active");
    const isActive = g.nodeState[cn.from]==="done" && g.nodeState[cn.to]==="active";
    const color = isDone ? C.green : NCLR[fn.type];
    const alpha = isDone ? 0.6 : 0.18;
    const lw    = isActive ? 2.5 : 1.5;

    ctx.save();
    ctx.shadowBlur = isActive ? 8 : 0; ctx.shadowColor = color;
    ctx.strokeStyle = `rgba(${rgb(color)},${alpha})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(fn.rx*W, fn.ry*H*WF_H);
    ctx.bezierCurveTo(cn.cp1rx*W, cn.cp1ry*H*WF_H, cn.cp2rx*W, cn.cp2ry*H*WF_H, tn.rx*W, tn.ry*H*WF_H);
    ctx.stroke();

    // Animated flow dots on done/active connections
    if (isDone || isActive) {
      for (let i=0; i<2; i++) {
        const ft = ((t*0.00028 + i*0.5) % 1);
        const pt = connPt(cn, ft, W, H*WF_H, fn, tn);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = color; ctx.shadowBlur = 6; ctx.shadowColor = color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 2, 0, Math.PI*2); ctx.fill();
      }
    }

    // YES/NO branch labels
    if (cn.label) {
      const mid = connPt(cn, 0.42, W, H*WF_H, fn, tn);
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      ctx.fillStyle = cn.label==="YES" ? `rgba(${rgb(C.green)},0.75)` : `rgba(${rgb(C.red)},0.75)`;
      ctx.font = "bold 9px var(--font-mono-stack,monospace)";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(cn.label, mid.x, mid.y - 8);
    }
    ctx.restore();
  }
}

function drawNodes(ctx: CanvasRenderingContext2D, g:GS, lv:Level, W:number, H:number, t:number) {
  const NHalf = nw(W);
  for (const nd of lv.nodes) {
    const x = nd.rx*W, y = nd.ry*H*WF_H;
    const state = g.nodeState[nd.id] ?? "idle";
    const color = NCLR[nd.type];
    const errF  = (g.errorFlash[nd.id]??0) / 600;
    const pulse = Math.sin(t*0.004)*0.5+0.5;

    const glowColor = errF > 0 ? C.red : state==="done" ? C.green : state==="active" ? color : color;
    const glowAlpha = errF > 0 ? errF : state==="done" ? 0.5 : state==="active" ? 0.5+pulse*0.3 : 0.1;
    const borderAlpha = errF > 0 ? 0.9 : state==="done" ? 0.85 : state==="active" ? 0.75 : 0.22;
    const fillAlpha   = errF > 0 ? 0.18 : state==="done" ? 0.12 : state==="active" ? 0.1 : 0.04;
    const sc = state==="active" ? 1+Math.sin(t*0.004)*0.025 : 1;

    ctx.save();
    ctx.translate(x,y); ctx.scale(sc,sc); ctx.translate(-x,-y);
    ctx.shadowBlur = state==="active"||state==="done" ? 16 : 4;
    ctx.shadowColor = `rgba(${rgb(glowColor)},${glowAlpha})`;

    rr(ctx, x-NHalf, y-NH, NHalf*2, NH*2, 6);
    ctx.fillStyle = `rgba(${rgb(glowColor)},${fillAlpha})`; ctx.fill();
    ctx.strokeStyle = `rgba(${rgb(glowColor)},${borderAlpha})`; ctx.lineWidth = state==="active"?2:1.5; ctx.stroke();
    ctx.shadowBlur = 0;

    // Service icon (left dot)
    ctx.fillStyle = `rgba(${rgb(color)},0.9)`;
    ctx.beginPath(); ctx.arc(x-NHalf+10, y, 4, 0, Math.PI*2); ctx.fill();

    // Label
    ctx.fillStyle = state==="done" ? `rgba(${rgb(C.green)},0.95)` : `rgba(${rgb(C.text)},${state==="idle"?0.35:0.85})`;
    ctx.font = `${state==="active"?"bold ":""}${NHalf<80?"9":"10"}px var(--font-mono-stack,monospace)`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(nd.label, x+4, y);

    // inputHint (data badge)
    if (nd.inputHint && (state==="active"||state==="done")) {
      ctx.fillStyle = `rgba(${rgb(C.yellow)},0.8)`;
      ctx.font = "8px var(--font-mono-stack,monospace)";
      ctx.fillText(nd.inputHint, x, y + NH + 10);
    }

    // Condition on IF node
    if (nd.type==="if" && nd.condition) {
      ctx.fillStyle = `rgba(${rgb(C.yellow)},0.6)`;
      ctx.font = "8px var(--font-mono-stack,monospace)";
      ctx.fillText(nd.condition, x, y - NH - 8);
    }
    ctx.restore();
  }
}

function drawPackets(ctx: CanvasRenderingContext2D, g:GS, W:number, H:number) {
  for (const pk of g.packets) {
    const t = Math.min(pk.t, 1);
    const pt = connPt(pk.cn, t, W, H*WF_H, pk.fn, pk.tn);
    const a = t < 0.1 ? t*10 : t > 0.9 ? (1-t)*10 : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.shadowBlur = 14; ctx.shadowColor = pk.color;
    ctx.fillStyle = pk.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function drawTrack(ctx: CanvasRenderingContext2D, g:GS, W:number, H:number, t:number) {
  const trackY = H * WF_H;
  const roadH  = H * 0.26;
  const midY   = trackY + roadH * 0.50;
  const carStartX = W * 0.06, carEndX = W * 0.91;

  // Road bg
  ctx.fillStyle = "rgba(12,12,20,0.95)";
  ctx.fillRect(0, trackY, W, roadH);
  // Subtle top border
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, trackY); ctx.lineTo(W, trackY); ctx.stroke();

  // Road edge lines
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, trackY + roadH*0.12); ctx.lineTo(W, trackY + roadH*0.12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, trackY + roadH*0.88); ctx.lineTo(W, trackY + roadH*0.88); ctx.stroke();

  // Dashed center line
  ctx.setLineDash([18, 10]);
  ctx.lineDashOffset = -g.dashOff;
  ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
  ctx.setLineDash([]);

  // Finish line
  const fx = carEndX + 10;
  const sqSz = 7;
  for (let row=0; row<4; row++) {
    for (let col=0; col<2; col++) {
      const even = (row+col)%2===0;
      ctx.fillStyle = even ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)";
      ctx.fillRect(fx + col*sqSz, trackY + roadH*0.14 + row*sqSz, sqSz, sqSz);
    }
  }

  // Car (only during game)
  if (g.phase === "playing" || g.phase === "levelEnd" || g.phase === "end") {
    const cx = g.carX;
    const cy = midY - 1;
    const cw = 28, ch = 14;

    // Speed trail
    if (g.carSpeed > 0.5) {
      for (let i=1; i<=5; i++) {
        ctx.save();
        ctx.globalAlpha = (0.4 - i*0.07) * Math.min(1, g.carSpeed/3);
        ctx.fillStyle = C.orange;
        ctx.shadowBlur = 4; ctx.shadowColor = C.orange;
        rr(ctx, cx - cw/2 - i*7, cy - ch/2, cw, ch, 3);
        ctx.fill();
        ctx.restore();
      }
    }

    // Car body
    ctx.save();
    ctx.shadowBlur = 16; ctx.shadowColor = C.orange;
    ctx.fillStyle = C.orange;
    rr(ctx, cx-cw/2, cy-ch/2, cw, ch, 4);
    ctx.fill();
    // Windshield
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(cx+2, cy-ch/2+3, 10, ch-6);
    // Front glow
    ctx.shadowBlur = 20; ctx.shadowColor = "rgba(255,200,100,0.9)";
    ctx.fillStyle = "rgba(255,220,120,0.9)";
    ctx.beginPath(); ctx.arc(cx+cw/2-2, cy, 3, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function drawPops(ctx: CanvasRenderingContext2D, g:GS) {
  for (const p of g.pops) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color; ctx.shadowBlur = 8; ctx.shadowColor = p.color;
    ctx.font = "bold 13px var(--font-mono-stack,monospace)";
    ctx.textAlign = "center";
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }
}
