"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type NodeType = "trigger" | "action" | "condition" | "webhook" | "mega";

interface GNode {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  type: NodeType;
  pressure: number;     // 0→1 ages up over ~25s
  state: "idle" | "active" | "dying";
  activeTimer: number;  // ms left in active flash
  dyingTimer: number;   // ms left in death anim
  chainDelay: number;   // ms until chain-triggered
  scale: number;        // for spawn pop-in
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
  shape: "square" | "diamond";
}

interface Trail {
  x1: number; y1: number;
  x2: number; y2: number;
  t: number;
  color: string;
  targetId: number;
  chainScore: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS: Record<NodeType, string> = {
  trigger:   "#E06C4D",
  action:    "#4D9DE0",
  condition: "#9945FF",
  webhook:   "#14F195",
  mega:      "#FFD700",
};

const LABELS: Record<NodeType, string> = {
  trigger:   "Trigger",
  action:    "Action",
  condition: "If / Else",
  webhook:   "Webhook",
  mega:      "MEGA NODE",
};

const ICONS: Record<NodeType, string> = {
  trigger:   "⚡",
  action:    "⚙",
  condition: "◆",
  webhook:   "↗",
  mega:      "★",
};

const NW = 96; const NH = 46; // node width / height
const CONN_DIST    = 170;
const MAX_NODES    = 11;
const PRESSURE_MS  = 28000;
const ACTIVE_MS    = 280;
const DIE_MS       = 480;
const TRAIL_SPEED  = 0.0028;
const MEGA_INTERVAL = 18000;

let _uid = 0;

function rgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

function spawnNode(w: number, h: number, mega = false): GNode {
  const types: NodeType[] = ["trigger","action","condition","webhook"];
  const pad = 60;
  return {
    id: _uid++,
    x: pad + Math.random() * (w - pad * 2),
    y: pad + Math.random() * (h - pad * 2),
    vx: (Math.random() - 0.5) * 0.55,
    vy: (Math.random() - 0.5) * 0.55,
    type: mega ? "mega" : types[Math.floor(Math.random() * 4)],
    pressure: 0,
    state: "idle",
    activeTimer: 0,
    dyingTimer: 0,
    chainDelay: 0,
    scale: 0.01,
  };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FlowBreaker() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const gameRef     = useRef({
    nodes:       [] as GNode[],
    particles:   [] as Particle[],
    trails:      [] as Trail[],
    score:       0,
    bestScore:   0,
    multiplier:  1,
    multTimer:   0,
    lastTime:    0,
    megaTimer:   0,
    spawnTimer:  0,
    started:     false,
    tiltX:       0,
    tiltY:       0,
    newBest:     false,
    newBestTimer: 0,
    flashScore:  0,
    flashTimer:  0,
  });

  const [uiScore,      setUiScore]      = useState(0);
  const [uiBest,       setUiBest]       = useState(0);
  const [uiMult,       setUiMult]       = useState(1);
  const [started,      setStarted]      = useState(false);
  const [newBestFlash, setNewBestFlash] = useState(false);

  // Load best score
  useEffect(() => {
    const saved = parseInt(localStorage.getItem("flowbreaker-best") ?? "0", 10);
    gameRef.current.bestScore = saved;
    setUiBest(saved);
  }, []);

  // Mouse tilt
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const cx = (e.clientX - left) / width  - 0.5;
      const cy = (e.clientY - top)  / height - 0.5;
      gameRef.current.tiltX = cy * -10;
      gameRef.current.tiltY = cx *  10;
    }
    function onLeave() {
      gameRef.current.tiltX = 0;
      gameRef.current.tiltY = 0;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Apply tilt via rAF
  useEffect(() => {
    let raf = 0;
    let rx = 0, ry = 0;
    function tick() {
      const g = gameRef.current;
      rx += (g.tiltX - rx) * 0.06;
      ry += (g.tiltY - ry) * 0.06;
      if (wrapRef.current) {
        wrapRef.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Click handler
  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const g = gameRef.current;
    if (!g.started) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let hit: GNode | null = null;
    let bestDist = Infinity;
    for (const n of g.nodes) {
      if (n.state !== "idle") continue;
      const dx = mx - n.x, dy = my - n.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < Math.max(NW, NH) * 0.7 && d < bestDist) {
        bestDist = d;
        hit = n;
      }
    }
    if (!hit) return;

    triggerNode(hit, g.multiplier);
  }

  function triggerNode(node: GNode, mult: number) {
    const g = gameRef.current;
    if (node.state !== "idle") return;

    node.state = "active";
    node.activeTimer = ACTIVE_MS;

    const pts = node.isMega ? 500 : 10;
    const gained = Math.floor(pts * mult);
    g.score += gained;
    g.flashScore  = gained;
    g.flashTimer  = 900;
    g.multiplier  = Math.min(10, mult + (node.isMega ? 2 : 0.5));
    g.multTimer   = 1800;

    // Particles
    const color = COLORS[node.type];
    const count = node.isMega ? 28 : 14;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 2 + Math.random() * (node.isMega ? 5 : 3);
      g.particles.push({
        x: node.x, y: node.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, maxLife: 1,
        color, size: 3 + Math.random() * (node.isMega ? 6 : 3),
        shape: Math.random() > 0.5 ? "square" : "diamond",
      });
    }

    // If mega — chain everything
    if (node.isMega) {
      for (const n of g.nodes) {
        if (n.id !== node.id && n.state === "idle") {
          n.chainDelay = 200 + Math.random() * 600;
        }
      }
    } else {
      // Chain connected nodes
      for (const n of g.nodes) {
        if (n.id === node.id || n.state !== "idle") continue;
        const dx = n.x - node.x, dy = n.y - node.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < CONN_DIST) {
          const delay = 200 + (dist / CONN_DIST) * 400;
          if (n.chainDelay <= 0) n.chainDelay = delay;
          g.trails.push({
            x1: node.x, y1: node.y,
            x2: n.x,    y2: n.y,
            t: 0, color: COLORS[node.type],
            targetId: n.id,
            chainScore: Math.floor(10 * (g.multiplier + 0.5)),
          });
        }
      }
    }

    // Update best score
    if (g.score > g.bestScore) {
      g.bestScore  = g.score;
      g.newBest    = true;
      g.newBestTimer = 2000;
      localStorage.setItem("flowbreaker-best", String(g.score));
      setUiBest(g.score);
      setNewBestFlash(true);
      setTimeout(() => setNewBestFlash(false), 2000);
    }

    setUiScore(g.score);
    setUiMult(Math.round(g.multiplier * 10) / 10);
  }

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let dashOffset = 0;

    function resize() {
      const parent = canvas.parentElement!;
      canvas.width  = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    function loop(time: number) {
      const g = gameRef.current;
      const dt = Math.min(time - (g.lastTime || time), 50);
      g.lastTime = time;
      const W = canvas.width, H = canvas.height;

      if (!g.started) { drawIdle(ctx, W, H, time, dashOffset); raf = requestAnimationFrame(loop); return; }

      dashOffset += dt * 0.04;

      // ── Spawn ──
      g.spawnTimer += dt;
      if (g.spawnTimer > 2200 && g.nodes.length < MAX_NODES) {
        g.spawnTimer = 0;
        g.nodes.push(spawnNode(W, H));
      }
      g.megaTimer += dt;
      if (g.megaTimer > MEGA_INTERVAL && !g.nodes.some(n => n.type === "mega")) {
        g.megaTimer = 0;
        g.nodes.push(spawnNode(W, H, true));
      }

      // ── Update nodes ──
      for (const n of g.nodes) {
        if (n.scale < 1) n.scale = Math.min(1, n.scale + dt * 0.004);

        if (n.state === "idle") {
          n.x += n.vx; n.y += n.vy;
          const pad = NW * 0.6;
          if (n.x < pad || n.x > W - pad) n.vx *= -1;
          if (n.y < pad || n.y > H - pad) n.vy *= -1;
          n.pressure = Math.min(1, n.pressure + dt / PRESSURE_MS);
          if (n.chainDelay > 0) {
            n.chainDelay -= dt;
            if (n.chainDelay <= 0) { n.chainDelay = 0; triggerNode(n, g.multiplier); }
          }
        } else if (n.state === "active") {
          n.activeTimer -= dt;
          if (n.activeTimer <= 0) { n.state = "dying"; n.dyingTimer = DIE_MS; }
        } else if (n.state === "dying") {
          n.dyingTimer -= dt;
        }
      }
      g.nodes = g.nodes.filter(n => !(n.state === "dying" && n.dyingTimer <= 0));

      // ── Multiplier decay ──
      if (g.multiplier > 1) {
        g.multTimer -= dt;
        if (g.multTimer <= 0) {
          g.multiplier = Math.max(1, g.multiplier - 0.5);
          g.multTimer = 800;
          setUiMult(Math.round(g.multiplier * 10) / 10);
        }
      }

      // ── Trails ──
      for (const tr of g.trails) {
        tr.t += TRAIL_SPEED * dt;
        if (tr.t >= 1) {
          const tNode = g.nodes.find(n => n.id === tr.targetId);
          if (tNode && tNode.state === "idle") triggerNode(tNode, g.multiplier);
        }
      }
      g.trails = g.trails.filter(tr => tr.t < 1);

      // ── Particles ──
      for (const p of g.particles) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.94; p.vy *= 0.94;
        p.vy += 0.06;
        p.life -= dt / (p.maxLife * 700);
      }
      g.particles = g.particles.filter(p => p.life > 0);

      // ── Draw ──
      draw(ctx, g, W, H, time, dashOffset);

      // ── UI sync (throttled) ──
      if (Math.floor(time / 100) !== Math.floor((time - dt) / 100)) {
        setUiScore(g.score);
        setUiMult(Math.round(g.multiplier * 10) / 10);
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startGame() {
    const g = gameRef.current;
    const canvas = canvasRef.current!;
    g.started = true;
    g.score = 0; g.multiplier = 1; g.multTimer = 0;
    g.nodes = []; g.particles = []; g.trails = [];
    g.megaTimer = 0; g.spawnTimer = 0;
    // Initial nodes
    for (let i = 0; i < 5; i++) g.nodes.push(spawnNode(canvas.width, canvas.height));
    setStarted(true);
    setUiScore(0);
    setUiMult(1);
  }

  return (
    <div className="fb-root">
      <div className="fb-tilt-wrap" ref={wrapRef}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="fb-canvas"
          onClick={handleClick}
          style={{ cursor: started ? "crosshair" : "default" }}
        />

        {/* HUD */}
        {started && (
          <div className="fb-hud">
            <div className="fb-hud-left">
              <div className="fb-score-label mono">Score</div>
              <div className="fb-score-value mono">{uiScore.toLocaleString()}</div>
            </div>
            <div className={`fb-hud-center${newBestFlash ? " fb-hud-center--flash" : ""}`}>
              {uiMult > 1 && (
                <div className="fb-multiplier mono">×{uiMult.toFixed(1)}</div>
              )}
            </div>
            <div className="fb-hud-right">
              <div className="fb-score-label mono">Best</div>
              <div className={`fb-score-value mono${newBestFlash ? " fb-best--new" : ""}`}>
                {uiBest.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Start screen */}
        {!started && (
          <div className="fb-start">
            <div className="fb-start-inner">
              <div className="eyebrow mono">Playground</div>
              <h2 className="fb-start-title">Flow Breaker</h2>
              <p className="fb-start-desc mono">
                Click nodes to execute them. Trigger chain reactions.<br />
                Hit the <span style={{ color: "#FFD700" }}>★ MEGA</span> node to nuke everything.
              </p>
              {uiBest > 0 && (
                <div className="fb-start-best mono">Best score: <strong>{uiBest.toLocaleString()}</strong></div>
              )}
              <button className="btn btn-primary fb-start-btn" onClick={startGame}>
                Start playing →
              </button>
              <p className="fb-start-hint mono">Your best score is saved automatically</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Draw idle (pre-game) ────────────────────────────────────────────────────

function drawIdle(ctx: CanvasRenderingContext2D, W: number, H: number, time: number, dashOffset: number) {
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H, time);
}

// ─── Main draw ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function draw(
  ctx: CanvasRenderingContext2D,
  g: any,
  W: number, H: number,
  time: number,
  dashOffset: number
) {
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H, time);

  // Connections
  ctx.save();
  for (let i = 0; i < g.nodes.length; i++) {
    const a = g.nodes[i] as GNode;
    if (a.state === "dying") continue;
    for (let j = i + 1; j < g.nodes.length; j++) {
      const b = g.nodes[j] as GNode;
      if (b.state === "dying") continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > CONN_DIST) continue;
      const alpha = (1 - dist / CONN_DIST) * 0.35;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -dashOffset;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);
  ctx.restore();

  // Trails
  for (const tr of g.trails as Trail[]) {
    const px = tr.x1 + (tr.x2 - tr.x1) * tr.t;
    const py = tr.y1 + (tr.y2 - tr.y1) * tr.t;
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = tr.color;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = tr.color;
    ctx.fill();
    ctx.restore();
    // Trail line behind it
    ctx.beginPath();
    ctx.moveTo(tr.x1, tr.y1);
    ctx.lineTo(px, py);
    ctx.strokeStyle = `rgba(${rgb(tr.color)},${0.3 * (1 - tr.t)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Particles
  for (const p of g.particles as Particle[]) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = p.color;
    if (p.shape === "diamond") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    } else {
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
    ctx.restore();
  }

  // Nodes
  for (const n of g.nodes as GNode[]) {
    drawNode(ctx, n, time);
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number, time: number) {
  const step = 40;
  const pulse = Math.sin(time * 0.0005) * 0.015 + 0.04;
  ctx.strokeStyle = `rgba(255,255,255,${pulse})`;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawNode(ctx: CanvasRenderingContext2D, n: GNode, time: number) {
  const color  = COLORS[n.type];
  const s      = n.scale;
  const isDying = n.state === "dying";
  const isActive = n.state === "active";
  const dyingPct = isDying ? n.dyingTimer / DIE_MS : 1;
  const alpha  = isDying ? dyingPct : 1;
  const pulseFq = 0.002 + n.pressure * 0.006;
  const pulseAmt = isActive ? 1 : (Math.sin(time * pulseFq) * 0.5 + 0.5) * n.pressure;
  const glowSize = 10 + pulseAmt * 25 + (isActive ? 30 : 0) + (n.type === "mega" ? 20 : 0);
  const scaleX = isDying ? dyingPct * s : s;
  const scaleY = isDying ? dyingPct * s : s;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(n.x, n.y);
  ctx.scale(scaleX, scaleY);

  const x = -NW / 2, y = -NH / 2;

  // Glow
  ctx.shadowBlur  = glowSize;
  ctx.shadowColor = color;

  // Background
  rr(ctx, x, y, NW, NH, 7);
  ctx.fillStyle = isActive
    ? `rgba(${rgb(color)},0.25)`
    : `rgba(13,13,18,0.88)`;
  ctx.fill();

  // Border
  const borderAlpha = 0.35 + pulseAmt * 0.65 + (isActive ? 0.4 : 0);
  ctx.strokeStyle = `rgba(${rgb(color)},${Math.min(1, borderAlpha)})`;
  ctx.lineWidth   = n.type === "mega" ? 2 : 1.5;
  rr(ctx, x, y, NW, NH, 7);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Icon
  ctx.font = n.type === "mega" ? "bold 15px sans-serif" : "13px sans-serif";
  ctx.fillStyle   = color;
  ctx.textAlign   = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ICONS[n.type], x + 16, 1);

  // Label
  ctx.font = n.type === "mega"
    ? "bold 10px var(--font-mono-stack, monospace)"
    : "10px var(--font-mono-stack, monospace)";
  ctx.fillStyle   = `rgba(255,255,255,${0.55 + n.pressure * 0.45})`;
  ctx.textAlign   = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(LABELS[n.type], x + 28, 1);

  // Pressure bar
  if (n.type !== "mega" && n.pressure > 0.1) {
    const bw = NW - 20, bh = 2.5;
    const bx = x + 10, by = NH / 2 - 7;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = color;
    ctx.fillRect(bx, by, bw * n.pressure, bh);
  }

  ctx.restore();
}
