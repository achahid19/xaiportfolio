"use client";

import { useEffect, useRef, useState } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:     "#0d0d12",
  orange: "#FF6D5A",
  green:  "#14F195",
  red:    "#ff4444",
  yellow: "#F0C040",
  blue:   "#4D9DE0",
  purple: "#9945FF",
  pink:   "#E01E5A",
  text:   "#e8e8ee",
} as const;

function rgb(hex: string) {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
}

// ─── Node block types ─────────────────────────────────────────────────────────
const NODE_ROWS = [
  { label:"Webhook Trigger", color: C.orange, hp: 3, pts: 100 },
  { label:"HTTP Request",    color: C.blue,   hp: 2, pts: 70  },
  { label:"IF Condition",    color: C.yellow, hp: 2, pts: 60  },
  { label:"Set Node",        color: C.purple, hp: 1, pts: 40  },
  { label:"Slack Message",   color: C.pink,   hp: 1, pts: 50  },
];

const BALL_R   = 7;
const PADDLE_H = 12;
const BLOCK_H  = 26;
const BLOCK_GAP = 4;
const COLS     = 8;
const ROWS     = 5;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Block {
  x: number; y: number; w: number; h: number;
  hp: number; maxHp: number;
  label: string; color: string; pts: number;
  alive: boolean; flash: number;
}
interface Par  { x:number; y:number; vx:number; vy:number; life:number; color:string; size:number; }
interface Pop  { x:number; y:number; text:string; life:number; color:string; vy:number; }
interface Trail{ x:number; y:number; }

interface GS {
  phase: "idle"|"ready"|"playing"|"levelUp"|"over";
  // Paddle
  px: number; pw: number;
  // Ball
  bx: number; by: number; vx: number; vy: number;
  trail: Trail[];
  // Board
  blocks: Block[]; left: number;
  // Progress
  score: number; best: number;
  lives: number; level: number; combo: number;
  // Input
  keys: Set<string>;
  // Effects
  pars: Par[]; pops: Pop[];
  flash: number; flashOk: boolean;
  lvlTimer: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function paddleY(H: number) { return H - 55; }
function ballSpeed(level: number) { return 5 + level * 0.4; }

function rr(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

function makeBlocks(W: number, H: number, level: number): { blocks: Block[]; count: number } {
  const margin = 28;
  const totalW = W - margin * 2;
  const bw = (totalW - BLOCK_GAP * (COLS - 1)) / COLS;
  const startY = H * 0.08;
  const blocks: Block[] = [];

  for (let row = 0; row < ROWS; row++) {
    const nt = NODE_ROWS[row];
    // Extra HP on hard levels
    const hp = nt.hp + Math.floor((level - 1) / 3);
    for (let col = 0; col < COLS; col++) {
      // Create gaps for visual variety on higher levels
      if (level >= 2 && row === 1 && col % 4 === 3) continue;
      if (level >= 3 && row === 3 && col % 3 === 0) continue;
      if (level >= 4 && row === 0 && col % 2 === 1) continue;
      blocks.push({
        x: margin + col * (bw + BLOCK_GAP),
        y: startY + row * (BLOCK_H + BLOCK_GAP),
        w: bw, h: BLOCK_H,
        hp, maxHp: hp,
        label: nt.label, color: nt.color,
        pts: nt.pts * level,
        alive: true, flash: 0,
      });
    }
  }
  return { blocks, count: blocks.length };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function NodeSmash() {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const gs   = useRef<GS>(initGS());

  const [uiPhase, setUiPhase] = useState<GS["phase"]>("idle");
  const [uiScore, setUiScore] = useState(0);
  const [uiBest,  setUiBest]  = useState(0);
  const [uiLives, setUiLives] = useState(3);
  const [uiLevel, setUiLevel] = useState(1);
  const [uiCombo, setUiCombo] = useState(0);

  function initGS(): GS {
    return {
      phase:"idle", px:0, pw:110,
      bx:0, by:0, vx:0, vy:0, trail:[],
      blocks:[], left:0,
      score:0, best:0, lives:3, level:1, combo:0,
      keys: new Set(),
      pars:[], pops:[],
      flash:0, flashOk:false, lvlTimer:0,
    };
  }

  useEffect(() => {
    const b = parseInt(localStorage.getItem("ns-best")??"0", 10);
    if (b > 0) { gs.current.best = b; setUiBest(b); }
  }, []);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const g = gs.current;
    function down(e: KeyboardEvent) {
      g.keys.add(e.code);
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (g.phase === "ready") launch(g);
      }
      if (["ArrowLeft","ArrowRight","Space","ArrowUp"].includes(e.code)) e.preventDefault();
    }
    function up(e: KeyboardEvent) { g.keys.delete(e.code); }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  function launch(g: GS) {
    g.phase = "playing";
    const a = -Math.PI/2 + (Math.random()-0.5)*0.5;
    const s = ballSpeed(g.level);
    g.vx = Math.cos(a) * s;
    g.vy = Math.sin(a) * s;
    setUiPhase("playing");
  }

  // ── Resize + loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    const c = cvs.current!; const ctx = c.getContext("2d")!;
    let raf = 0, last = 0;

    function resize() {
      const p = c.parentElement!;
      c.width = p.clientWidth; c.height = p.clientHeight;
      const g = gs.current;
      if (g.phase === "idle" || g.phase === "over") {
        g.px = c.width / 2;
        g.bx = c.width / 2;
        g.by = paddleY(c.height) - BALL_R - 4;
      }
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c.parentElement!);

    function loop(now: number) {
      const dt = Math.min(now-(last||now), 40); last = now;
      const g = gs.current;
      const W = c.width, H = c.height;
      if (g.phase === "ready" || g.phase === "playing" || g.phase === "levelUp") {
        update(g, dt, W, H);
      }
      draw(ctx, g, W, H, now);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────
  function update(g: GS, dt: number, W: number, H: number) {
    const PY = paddleY(H);
    const SPEED = 8;

    // Move paddle
    if (g.keys.has("ArrowLeft")  || g.keys.has("KeyA")) g.px = Math.max(g.pw/2 + 2,   g.px - SPEED);
    if (g.keys.has("ArrowRight") || g.keys.has("KeyD")) g.px = Math.min(W - g.pw/2 - 2, g.px + SPEED);

    // Ball sits on paddle in "ready" phase
    if (g.phase === "ready") {
      g.bx = g.px;
      g.by = PY - BALL_R - 2;
      decayFx(g, dt);
      return;
    }

    // Integrate ball (sub-stepped for accuracy)
    const SUB = 3;
    for (let s = 0; s < SUB; s++) {
      g.bx += g.vx * (dt / 16) / SUB;
      g.by += g.vy * (dt / 16) / SUB;

      // Wall bounces
      if (g.bx - BALL_R < 0)  { g.bx = BALL_R;       g.vx =  Math.abs(g.vx); }
      if (g.bx + BALL_R > W)  { g.bx = W - BALL_R;   g.vx = -Math.abs(g.vx); }
      if (g.by - BALL_R < 0)  { g.by = BALL_R;        g.vy =  Math.abs(g.vy); }

      // Paddle
      if (
        g.vy > 0 &&
        g.by + BALL_R >= PY &&
        g.by - BALL_R <= PY + PADDLE_H &&
        g.bx >= g.px - g.pw/2 - BALL_R &&
        g.bx <= g.px + g.pw/2 + BALL_R
      ) {
        g.by = PY - BALL_R;
        const rel = Math.max(-1, Math.min(1, (g.bx - g.px) / (g.pw/2)));
        const angle = -Math.PI/2 + rel * 0.85;
        const spd = ballSpeed(g.level);
        g.vx = Math.cos(angle) * spd;
        g.vy = Math.sin(angle) * spd;
        g.combo = 0;
        setUiCombo(0);
      }

      // Blocks
      for (const blk of g.blocks) {
        if (!blk.alive) continue;
        const bLeft  = blk.x, bRight = blk.x + blk.w;
        const bTop   = blk.y, bBot   = blk.y + blk.h;
        if (g.bx+BALL_R < bLeft || g.bx-BALL_R > bRight) continue;
        if (g.by+BALL_R < bTop  || g.by-BALL_R > bBot)   continue;

        // Overlap on each axis
        const ox = Math.min(g.bx+BALL_R-bLeft, bRight-(g.bx-BALL_R));
        const oy = Math.min(g.by+BALL_R-bTop,  bBot  -(g.by-BALL_R));
        if (ox < oy) { g.vx = -g.vx; g.bx += g.vx > 0 ? ox/SUB : -ox/SUB; }
        else         { g.vy = -g.vy; g.by += g.vy > 0 ? oy/SUB : -oy/SUB; }

        blk.hp--;
        blk.flash = 350;
        g.combo++;
        setUiCombo(g.combo);

        if (blk.hp <= 0) {
          blk.alive = false;
          g.left--;
          const bonus = g.combo >= 5 ? 3 : g.combo >= 3 ? 2 : 1;
          const pts = blk.pts * bonus;
          g.score += pts;
          if (g.score > g.best) {
            g.best = g.score;
            localStorage.setItem("ns-best", String(g.score));
            setUiBest(g.score);
          }
          setUiScore(g.score);
          burst(g, blk.x+blk.w/2, blk.y+blk.h/2, blk.color, 14);
          g.pops.push({ x:blk.x+blk.w/2, y:blk.y-6, text:`+${pts}`, life:1.2, color:blk.color, vy:-0.9 });
          g.flash = 100; g.flashOk = true;
        } else {
          burst(g, blk.x+blk.w/2, blk.y+blk.h/2, blk.color, 4);
        }
        break;
      }
    }

    // Trail
    g.trail.push({ x:g.bx, y:g.by });
    if (g.trail.length > 18) g.trail.shift();

    // Ball lost
    if (g.by - BALL_R > H) {
      g.lives--;
      g.combo = 0;
      g.trail = [];
      g.flash = 700; g.flashOk = false;
      setUiLives(g.lives);
      setUiCombo(0);
      if (g.lives <= 0) {
        g.phase = "over";
        setUiPhase("over");
      } else {
        g.phase = "ready";
        g.bx = g.px;
        g.by = PY - BALL_R - 2;
        setUiPhase("ready");
      }
    }

    // Level cleared
    if (g.left <= 0 && g.phase === "playing") {
      g.level++;
      g.phase = "levelUp";
      g.lvlTimer = 1400;
      g.trail = [];
      setUiLevel(g.level);
      setTimeout(() => {
        const c = cvs.current!;
        const { blocks, count } = makeBlocks(c.width, c.height, g.level);
        g.blocks = blocks;
        g.left   = count;
        g.pw = Math.min(150, g.pw + 8);  // paddle grows a bit each level
        g.phase = "ready";
        g.bx = g.px;
        g.by = paddleY(c.height) - BALL_R - 2;
        setUiPhase("ready");
      }, 1400);
    }

    decayFx(g, dt);
  }

  function burst(g: GS, x:number, y:number, color:string, n:number) {
    for (let i=0; i<n; i++) {
      const a = Math.PI*2*i/n + Math.random()*0.5;
      const s = 1.5 + Math.random()*4;
      g.pars.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s-1, life:1, color, size:2+Math.random()*3 });
    }
  }

  function decayFx(g: GS, dt: number) {
    g.flash = Math.max(0, g.flash - dt);
    for (const b of g.blocks) b.flash = Math.max(0, b.flash - dt);
    for (const p of g.pars) { p.x+=p.vx; p.y+=p.vy; p.vx*=0.91; p.vy*=0.91; p.vy+=0.07; p.life-=dt/450; }
    g.pars = g.pars.filter(p=>p.life>0);
    for (const p of g.pops) { p.y+=p.vy; p.life-=dt/800; }
    g.pops = g.pops.filter(p=>p.life>0);
  }

  // ── Start / restart ───────────────────────────────────────────────────────
  function startGame() {
    const c = cvs.current!;
    const W = c.width, H = c.height;
    const g = gs.current;
    const { blocks, count } = makeBlocks(W, H, 1);
    Object.assign(g, {
      phase:"ready", px:W/2, pw:110,
      bx:W/2, by:paddleY(H)-BALL_R-2,
      vx:0, vy:0, trail:[],
      blocks, left:count,
      score:0, lives:3, level:1, combo:0,
      keys: new Set(),
      pars:[], pops:[],
      flash:0, flashOk:false,
    });
    setUiPhase("ready"); setUiScore(0); setUiLives(3); setUiLevel(1); setUiCombo(0);
  }

  const isIdle    = uiPhase === "idle";
  const isOver    = uiPhase === "over";
  const isReady   = uiPhase === "ready";
  const isLevelUp = uiPhase === "levelUp";
  const isActive  = uiPhase === "playing" || isReady || isLevelUp;

  return (
    <div className="ns-root">
      <canvas ref={cvs} className="ns-canvas" />

      {/* HUD */}
      {isActive && (
        <div className="ns-hud">
          <div className="ns-hud-left">
            <span className="ns-hud-label mono">Score</span>
            <span className="ns-hud-score mono">{uiScore.toLocaleString()}</span>
          </div>
          <div className="ns-hud-center">
            <span className="ns-level mono">LVL {uiLevel}</span>
            {uiCombo >= 3 && <span className="ns-combo mono">×{uiCombo}</span>}
          </div>
          <div className="ns-hud-right">
            <div className="ns-hearts">
              {[0,1,2].map(i=>(
                <span key={i} className={`ns-heart${i<uiLives?"":" ns-heart--lost"}`}>♥</span>
              ))}
            </div>
            {uiBest > 0 && <span className="ns-hud-best mono">best {uiBest.toLocaleString()}</span>}
          </div>
        </div>
      )}

      {/* Launch hint */}
      {isReady && (
        <div className="ns-launch-hint mono">Press Space to launch</div>
      )}

      {/* Level up banner */}
      {isLevelUp && (
        <div className="ns-levelup-banner">
          <span className="ns-levelup-text mono">Level {uiLevel} →</span>
        </div>
      )}

      {/* Start / Game over */}
      {(isIdle || isOver) && (
        <div className="ns-overlay">
          <div className="ns-overlay-inner">
            {isOver ? (
              <>
                <div className="eyebrow mono" style={{color:C.red}}>Pipeline Down</div>
                <div className="ns-final-score mono">{uiScore.toLocaleString()}</div>
                {uiScore > 0 && uiScore >= uiBest && <div className="ns-best-badge mono">🏆 New best!</div>}
              </>
            ) : (
              <>
                <div className="eyebrow mono">Playground</div>
                <h2 className="ns-title">Node Smash</h2>
                <p className="ns-desc mono">
                  Break n8n nodes with the pipeline ball.<br/>
                  <span style={{color:C.yellow}}>← →</span> to move &nbsp;·&nbsp; <span style={{color:C.orange}}>Space</span> to launch
                </p>
                {uiBest > 0 && <div className="ns-best-badge mono">Best: <strong>{uiBest.toLocaleString()}</strong></div>}
              </>
            )}
            <button className="btn btn-primary ns-start-btn" onClick={startGame}>
              {isOver ? "Try again →" : "Start →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function draw(ctx: CanvasRenderingContext2D, g:GS, W:number, H:number, t:number) {
  // BG
  ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);
  // Subtle grid
  const a = 0.022;
  ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x=0; x<W; x+=36) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
  for (let y=0; y<H; y+=36) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
  ctx.stroke();

  // Screen flash
  if (g.flash > 0) {
    const fa = (g.flash/700)*0.2;
    ctx.fillStyle = g.flashOk ? `rgba(20,241,149,${fa})` : `rgba(255,50,50,${fa})`;
    ctx.fillRect(0,0,W,H);
  }

  drawBlocks(ctx, g, t);
  drawParticles(ctx, g);
  drawPops(ctx, g);
  drawPaddle(ctx, g, H);
  drawBall(ctx, g);

  // Level-up overlay text
  if (g.phase === "levelUp") {
    ctx.save();
    ctx.fillStyle = `rgba(8,8,15,0.55)`;
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = C.green;
    ctx.shadowBlur = 30; ctx.shadowColor = C.green;
    ctx.font = "bold 36px var(--font-mono-stack,monospace)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`LEVEL ${g.level}`, W/2, H/2);
    ctx.restore();
  }
}

function drawBlocks(ctx: CanvasRenderingContext2D, g:GS, t:number) {
  for (const blk of g.blocks) {
    if (!blk.alive) continue;
    const hf  = blk.flash / 350;
    const dmg = 1 - blk.hp / blk.maxHp;
    const color = blk.color;
    const pulse = Math.sin(t*0.003)*0.08;

    ctx.save();
    ctx.shadowBlur = hf>0 ? 18 : 6+pulse*4;
    ctx.shadowColor = hf>0 ? "#ffffff" : color;

    // Fill — dims as HP drops
    rr(ctx, blk.x, blk.y, blk.w, blk.h, 5);
    ctx.fillStyle = hf>0
      ? `rgba(255,255,255,0.25)`
      : `rgba(${rgb(color)},${0.08 + (1-dmg)*0.1})`;
    ctx.fill();

    // Border — fades as HP drops
    ctx.strokeStyle = hf>0
      ? `rgba(255,255,255,0.9)`
      : `rgba(${rgb(color)},${0.35 + (1-dmg)*0.5})`;
    ctx.lineWidth = hf>0 ? 2 : 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Color dot (left side)
    ctx.fillStyle = `rgba(${rgb(color)},${0.7+(1-dmg)*0.3})`;
    ctx.beginPath(); ctx.arc(blk.x+9, blk.y+blk.h/2, 3.5, 0, Math.PI*2); ctx.fill();

    // Label
    ctx.fillStyle = `rgba(${rgb(C.text)},${0.4 + (1-dmg)*0.5})`;
    ctx.font = `${blk.w > 90 ? 9 : 8}px var(--font-mono-stack,monospace)`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(blk.label, blk.x + blk.w/2 + 4, blk.y + blk.h/2);

    // HP pips (top-right, if maxHp > 1)
    if (blk.maxHp > 1) {
      for (let i=0; i<blk.maxHp; i++) {
        ctx.fillStyle = i < blk.hp
          ? `rgba(${rgb(color)},0.85)`
          : `rgba(255,255,255,0.12)`;
        ctx.beginPath();
        ctx.arc(blk.x + blk.w - 7 - i*9, blk.y + 5, 2.5, 0, Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

function drawPaddle(ctx: CanvasRenderingContext2D, g:GS, H:number) {
  const PY = paddleY(H);
  const x  = g.px - g.pw/2;
  ctx.save();
  ctx.shadowBlur = 18; ctx.shadowColor = C.orange;
  rr(ctx, x, PY, g.pw, PADDLE_H, 5);
  // Glowing fill
  const grad = ctx.createLinearGradient(x, PY, x, PY+PADDLE_H);
  grad.addColorStop(0, `rgba(${rgb(C.orange)},0.95)`);
  grad.addColorStop(1, `rgba(${rgb(C.orange)},0.55)`);
  ctx.fillStyle = grad; ctx.fill();
  // Top highlight
  ctx.strokeStyle = "rgba(255,200,150,0.6)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x+5, PY+1); ctx.lineTo(x+g.pw-5, PY+1); ctx.stroke();
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, g:GS) {
  // Trail
  if (g.trail.length > 1) {
    for (let i=1; i<g.trail.length; i++) {
      const a = (i/g.trail.length)*0.4;
      const r = BALL_R*(i/g.trail.length)*0.7;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 6; ctx.shadowColor = "#ffffff";
      ctx.beginPath(); ctx.arc(g.trail[i].x, g.trail[i].y, r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
  // Ball
  ctx.save();
  ctx.shadowBlur = 22; ctx.shadowColor = "rgba(255,255,255,0.9)";
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R, 0, Math.PI*2); ctx.fill();
  // Inner glow core
  ctx.shadowBlur = 8; ctx.shadowColor = C.orange;
  ctx.fillStyle = `rgba(${rgb(C.orange)},0.5)`;
  ctx.beginPath(); ctx.arc(g.bx, g.by, BALL_R*0.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, g:GS) {
  for (const p of g.pars) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color; ctx.shadowBlur = 4; ctx.shadowColor = p.color;
    ctx.fillRect(p.x-p.size/2, p.y-p.size/2, p.size, p.size);
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
