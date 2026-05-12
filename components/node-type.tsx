"use client";

import { useEffect, useRef } from "react";

// ── n8n / AI automation word pool ─────────────────────────────────────────────
const POOL = [
  // 2-3 letters
  "api","run","map","log","set","get","env","key","bot","llm","rag","dag",
  // 4-5 letters
  "node","hook","loop","data","json","http","auth","sync","fetch","route",
  "retry","merge","parse","agent","model","queue","event","cron","token",
  "cache","error","batch","slack","redis","mongo","input","output","email",
  "oauth","vault","graph","embed","chunk","index","infer","score","label",
  // 6-8 letters
  "trigger","webhook","payload","execute","workflow","routing","filter",
  "branch","deploy","prompt","schema","vector","polling","timeout","headers",
  "mapping","openai","claude","gemini","pinecone","supabase","airtable",
  "postgres","graphql","mongodb","ingress","channel","respond","context",
  "session","secrets","encoder","decoder","postman","request","respond",
  // 9+ letters
  "automation","execution","transform","credential","expression","iteration",
  "monitoring","middleware","parameters","integration","deployment","debugging",
  "websocket","connection","validation","embeddings","completion","retrieval",
  "orchestration","extraction","classification","tokenization","interpolation",
  "annotation","summarization","finetuning","inference","transcription",
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  r: number;
  color: string;
}

interface Enemy {
  id: number;
  word: string;
  typed: number;       // chars correctly typed so far
  x: number; y: number;
  vy: number;          // descent speed px/frame
  targeted: boolean;
  dying: boolean;
  dyingTimer: number;
  parts: Particle[];
}

type Phase = "idle" | "playing" | "over";
type WavePhase = "spawning" | "clearing" | "between";

interface GS {
  phase: Phase;
  wavePhase: WavePhase;
  enemies: Enemy[];
  score: number;
  lives: number;
  level: number;
  wordsTyped: number;
  startTime: number;
  targetId: number | null;
  emps: number;
  spawnQueue: string[];
  spawnTimer: number;
  betweenTimer: number;
  waveMsg: string;
  waveMsgTimer: number;
  nextId: number;
}

// ── Wave definitions ──────────────────────────────────────────────────────────
// vy is px/frame. At H≈600px, vy=0.65 → ~15s crossing time (good for wave 1).
const WAVES = [
  { count: 5,  vy: 0.65, min: 2, max: 4,  gap: 100 },
  { count: 6,  vy: 0.82, min: 3, max: 5,  gap:  90 },
  { count: 7,  vy: 1.00, min: 3, max: 6,  gap:  82 },
  { count: 7,  vy: 1.18, min: 4, max: 7,  gap:  74 },
  { count: 8,  vy: 1.36, min: 4, max: 8,  gap:  68 },
  { count: 8,  vy: 1.55, min: 5, max: 9,  gap:  62 },
  { count: 9,  vy: 1.75, min: 5, max: 10, gap:  56 },
  { count: 9,  vy: 1.98, min: 6, max: 12, gap:  50 },
  { count: 10, vy: 2.22, min: 4, max: 14, gap:  45 },
  { count: 11, vy: 2.50, min: 4, max: 16, gap:  40 },
];

function waveDef(lvl: number) {
  return WAVES[Math.min(lvl - 1, WAVES.length - 1)];
}

function pickWords(n: number, min: number, max: number): string[] {
  const src = POOL.filter(w => w.length >= min && w.length <= max);
  const pool = src.length >= n ? src : [...POOL];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n);
}

// ── Particle burst ─────────────────────────────────────────────────────────────
const P_COLORS = ["#FF6D5A", "#14F195", "#ffffff", "#ffcc44", "#9945FF", "#4D9DE0"];
function burst(x: number, y: number, n: number): Particle[] {
  return Array.from({ length: n }, () => {
    const a = Math.random() * Math.PI * 2;
    const s = 1.2 + Math.random() * 4.5;
    return {
      x, y,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 22 + Math.random() * 32,
      r: 1.8 + Math.random() * 3.5,
      color: P_COLORS[Math.floor(Math.random() * P_COLORS.length)],
    };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export function NodeType() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let W = canvas.offsetWidth || 900;
    let H = canvas.offsetHeight || 600;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // ── Pre-render background ──────────────────────────────────────────────
    const bgCv = document.createElement("canvas");
    function buildBg() {
      bgCv.width = W; bgCv.height = H;
      const bc = bgCv.getContext("2d")!;
      // Deep dark teal background
      bc.fillStyle = "#030c10";
      bc.fillRect(0, 0, W, H);
      // Dot-matrix grid
      bc.fillStyle = "rgba(20,241,149,0.055)";
      for (let gx = 28; gx < W; gx += 28) {
        for (let gy = 28; gy < H; gy += 28) {
          bc.beginPath();
          bc.arc(gx, gy, 1.1, 0, Math.PI * 2);
          bc.fill();
        }
      }
      // Subtle scanlines
      for (let gy = 0; gy < H; gy += 5) {
        bc.fillStyle = "rgba(0,0,0,0.10)";
        bc.fillRect(0, gy, W, 1);
      }
    }
    buildBg();

    // ── Game state ─────────────────────────────────────────────────────────
    const S: GS = {
      phase: "idle", wavePhase: "between",
      enemies: [], score: 0, lives: 3, level: 0,
      wordsTyped: 0, startTime: 0,
      targetId: null, emps: 3,
      spawnQueue: [], spawnTimer: 0,
      betweenTimer: 0, waveMsg: "", waveMsgTimer: 0,
      nextId: 0,
    };

    // ── Game logic ─────────────────────────────────────────────────────────
    function startGame() {
      Object.assign(S, {
        phase: "playing", wavePhase: "between",
        enemies: [], score: 0, lives: 3, level: 1,
        wordsTyped: 0, startTime: performance.now(),
        targetId: null, emps: 3,
        spawnQueue: [], spawnTimer: 0,
        betweenTimer: 0, waveMsg: "", waveMsgTimer: 0,
        nextId: 0,
      });
      beginWave();
    }

    function beginWave() {
      const def = waveDef(S.level);
      S.spawnQueue = pickWords(def.count, def.min, def.max);
      S.spawnTimer = 28;   // short initial delay so first enemy appears fast
      S.wavePhase = "spawning";
      S.waveMsg = `WAVE  ${S.level}`;
      S.waveMsgTimer = 100;
    }

    function spawnEnemy() {
      if (!S.spawnQueue.length) return;
      const def = waveDef(S.level);
      const word = S.spawnQueue.shift()!;
      const margin = 90;
      const x = margin + Math.random() * (W - margin * 2);
      const vy = def.vy + (Math.random() - 0.5) * 0.12;
      S.enemies.push({
        id: S.nextId++, word, typed: 0,
        x, y: -28, vy,
        targeted: false, dying: false, dyingTimer: 0, parts: [],
      });
    }

    function killEnemy(e: Enemy, pts: number) {
      e.dying = true;
      e.dyingTimer = 42;
      e.targeted = false;
      e.parts = burst(e.x, e.y, 30);
      S.score += pts;
      S.wordsTyped++;
      if (S.targetId === e.id) S.targetId = null;
    }

    function fireEMP() {
      if (S.emps <= 0 || S.phase !== "playing") return;
      S.emps--;
      for (const e of S.enemies) {
        if (!e.dying) killEnemy(e, e.word.length * 5 * S.level);
      }
      S.targetId = null;
    }

    // ── Input ──────────────────────────────────────────────────────────────
    function onKey(ev: KeyboardEvent) {
      if (S.phase === "idle" || S.phase === "over") {
        if (ev.code === "Space" || ev.key === "Enter") {
          ev.preventDefault();
          startGame();
        }
        return;
      }
      if (S.phase !== "playing") return;

      if (ev.key === "Enter") { ev.preventDefault(); fireEMP(); return; }
      if (ev.code === "Space") { ev.preventDefault(); return; }
      if (ev.key.length !== 1) return;

      const ch = ev.key.toLowerCase();
      if (!/[a-z0-9]/.test(ch)) return;

      // Advance current target
      if (S.targetId !== null) {
        const t = S.enemies.find(e => e.id === S.targetId && !e.dying);
        if (t) {
          if (ch === t.word[t.typed]) {
            t.typed++;
            if (t.typed === t.word.length) {
              killEnemy(t, t.word.length * 10 * S.level);
            }
          }
          // wrong key: do nothing — can't switch mid-word
          return;
        }
        // Target gone — reset partial progress if enemy still alive
        const lost = S.enemies.find(e => e.id === S.targetId);
        if (lost) { lost.typed = 0; lost.targeted = false; }
        S.targetId = null;
      }

      // Lock onto new target: must start with this char, prefer furthest down
      const candidates = S.enemies
        .filter(e => !e.dying && e.typed === 0 && e.word[0] === ch)
        .sort((a, b) => b.y - a.y);
      if (!candidates.length) return;

      const t = candidates[0];
      t.targeted = true;
      S.targetId = t.id;
      t.typed = 1;
      if (t.typed === t.word.length) {
        killEnemy(t, t.word.length * 10 * S.level);
      }
    }

    window.addEventListener("keydown", onKey);

    // ── Render helpers ─────────────────────────────────────────────────────
    function rrect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function drawEnemy(e: Enemy) {
      const FS = 13;
      const PX = 12, PY = 7;
      ctx.font = `${FS}px 'Courier New', monospace`;
      const fullW  = ctx.measureText(e.word).width;
      const bw = fullW + PX * 2 + 6; // +6 for node dot
      const bh = FS + PY * 2;
      const bx = e.x - bw / 2;
      const by = e.y - bh / 2;
      const danger = e.y > H - 130;
      const gc = e.targeted ? "#14F195" : danger ? "#FF6D5A" : "rgba(255,109,90,0.65)";

      // Box fill + border
      ctx.shadowColor = gc;
      ctx.shadowBlur  = e.targeted ? 24 : danger ? 16 : 8;
      ctx.fillStyle   = e.targeted
        ? "rgba(20,241,149,0.10)"
        : danger ? "rgba(255,109,90,0.16)" : "rgba(8,14,22,0.88)";
      rrect(bx, by, bw, bh, 5);
      ctx.fill();
      ctx.strokeStyle = gc;
      ctx.lineWidth   = e.targeted ? 1.6 : 1;
      rrect(bx, by, bw, bh, 5);
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // Node dot indicator (top-left corner, like n8n node circle)
      ctx.fillStyle = gc;
      ctx.shadowColor = gc;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(bx + 9, by + bh / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Word text: typed (accent) + remaining (dim)
      const typed = e.word.slice(0, e.typed);
      const rem   = e.word.slice(e.typed);
      const tx = bx + PX + 8; // offset for node dot
      const ty = e.y;

      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";

      if (typed) {
        ctx.fillStyle   = e.targeted ? "#14F195" : "#FF6D5A";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur  = 7;
        ctx.font = `bold ${FS}px 'Courier New', monospace`;
        ctx.fillText(typed, tx, ty);
        ctx.shadowBlur = 0;
      }
      const tw = typed ? ctx.measureText(typed).width : 0;
      ctx.fillStyle = danger ? "#ffb89a" : "#c8c8dc";
      ctx.font = `${FS}px 'Courier New', monospace`;
      ctx.fillText(rem, tx + tw, ty);
    }

    function drawLaser(target: Enemy | undefined, now: number) {
      if (!target || target.dying) return;
      const px = W / 2, py = H - 68;
      const pulse = 0.5 + Math.sin(now * 0.014) * 0.5;

      ctx.save();
      // Outer bloom
      ctx.globalAlpha = pulse * 0.45;
      ctx.strokeStyle = "#14F195";
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 22;
      ctx.lineWidth   = 5;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(target.x, target.y); ctx.stroke();

      // Mid beam
      ctx.globalAlpha = pulse * 0.85;
      ctx.shadowBlur  = 10;
      ctx.lineWidth   = 1.8;
      ctx.stroke();

      // Bright core
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = "#aaffdd";
      ctx.shadowBlur  = 4;
      ctx.lineWidth   = 0.7;
      ctx.stroke();
      ctx.restore();
    }

    function drawPlayer(now: number) {
      const px = W / 2, py = H - 68;
      const pulse = Math.sin(now * 0.003);
      ctx.save();
      ctx.translate(px, py);

      // Exhaust flame
      const eColors = ["#FF6D5A", "#ff9944", "#ffdd55"];
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.28 + Math.random() * 0.45;
        ctx.fillStyle   = eColors[i];
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur  = 14;
        ctx.beginPath();
        ctx.ellipse(0, 14 + i * 6, 3.5 - i * 0.5, 5 + Math.random() * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      // Ship body
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 16 + pulse * 5;
      ctx.fillStyle   = "#091510";
      ctx.strokeStyle = "#14F195";
      ctx.lineWidth   = 1.6;
      ctx.beginPath();
      ctx.moveTo( 0, -24);   // nose
      ctx.lineTo(-16, 10);   // left base
      ctx.lineTo( -7,  5);
      ctx.lineTo(  0, 13);   // center notch
      ctx.lineTo(  7,  5);
      ctx.lineTo( 16, 10);   // right base
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit bubble
      ctx.fillStyle   = "rgba(20,241,149,0.28)";
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.ellipse(0, -9, 5, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing accent lines
      ctx.strokeStyle = "#FF6D5A";
      ctx.shadowColor = "#FF6D5A";
      ctx.shadowBlur  = 8;
      ctx.lineWidth   = 1;
      ctx.beginPath(); ctx.moveTo(-16, 10); ctx.lineTo(-23, 1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo( 16, 10); ctx.lineTo( 23, 1); ctx.stroke();

      // Three n8n node dots
      ctx.fillStyle   = "#14F195";
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 6;
      [-5, 0, 5].forEach(dx => {
        ctx.beginPath();
        ctx.arc(dx, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    function drawParticles(parts: Particle[]) {
      for (const p of parts) {
        const a = Math.min(p.life / 22, 1);
        ctx.globalAlpha = a;
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
    }

    function drawHUD() {
      // Score
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.font = "bold 22px 'Courier New', monospace";
      ctx.fillStyle   = "#ffffff";
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 10;
      ctx.fillText(S.score.toLocaleString(), 18, 14);
      ctx.shadowBlur  = 0;

      // Score label
      ctx.font = "10px 'Courier New', monospace";
      ctx.fillStyle = "rgba(180,200,190,0.5)";
      ctx.fillText("SCORE", 18, 40);

      // Level (centre top)
      ctx.textAlign = "center";
      ctx.font = "11px 'Courier New', monospace";
      ctx.fillStyle = "rgba(180,200,190,0.55)";
      ctx.fillText(`LEVEL  ${S.level}`, W / 2, 14);

      // Lives (right)
      ctx.textAlign = "right";
      ctx.font = "18px 'Courier New', monospace";
      ctx.fillStyle   = "#FF6D5A";
      ctx.shadowColor = "#FF6D5A";
      ctx.shadowBlur  = 8;
      const livesStr = "◆".repeat(Math.max(0, S.lives)) + "◇".repeat(Math.max(0, 3 - S.lives));
      ctx.fillText(livesStr, W - 16, 14);
      ctx.shadowBlur = 0;

      // EMP + WPM
      ctx.font = "10px 'Courier New', monospace";
      ctx.fillStyle = "rgba(180,200,190,0.45)";
      const elapsed = S.startTime ? (performance.now() - S.startTime) / 60000 : 0.01;
      const wpm = Math.round(S.wordsTyped / Math.max(elapsed, 0.01));
      ctx.fillText(`EMP×${S.emps}   ${wpm} WPM`, W - 16, 38);

      // Keyboard hint (bottom centre)
      ctx.textAlign = "center";
      ctx.font = "10px 'Courier New', monospace";
      ctx.fillStyle = "rgba(180,200,190,0.28)";
      ctx.fillText("TYPE TO LOCK · ENTER = EMP", W / 2, H - 18);
    }

    function drawWaveMsg() {
      if (S.waveMsgTimer <= 0) return;
      const a = Math.min(S.waveMsgTimer / 25, 1) * Math.min((100 - S.waveMsgTimer + 15) / 15, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 32px 'Courier New', monospace";
      ctx.fillStyle   = "#14F195";
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 28;
      ctx.fillText(S.waveMsg, W / 2, H * 0.38);
      ctx.restore();
    }

    function drawIdle(now: number) {
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      // Title with glow
      ctx.font = "bold 46px 'Courier New', monospace";
      ctx.fillStyle   = "#14F195";
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 30;
      ctx.fillText("NODE TYPE", W / 2, H / 2 - 80);

      ctx.shadowBlur = 0;
      ctx.font = "15px 'Courier New', monospace";
      ctx.fillStyle = "rgba(200,210,205,0.75)";
      ctx.fillText("Type the words. Destroy the nodes.", W / 2, H / 2 - 38);

      ctx.font = "12px 'Courier New', monospace";
      ctx.fillStyle = "rgba(200,210,205,0.42)";
      ctx.fillText("First letter auto-locks onto an enemy  ·  ENTER fires EMP  ·  3 lives", W / 2, H / 2 - 10);

      // Pulsing CTA
      const a = 0.45 + Math.sin(now * 0.004) * 0.55;
      ctx.globalAlpha = a;
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillStyle   = "#FF6D5A";
      ctx.shadowColor = "#FF6D5A";
      ctx.shadowBlur  = 12;
      ctx.fillText("PRESS  SPACE  TO  START", W / 2, H / 2 + 48);
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
    }

    function drawOver(now: number) {
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      ctx.font = "bold 30px 'Courier New', monospace";
      ctx.fillStyle   = "#FF6D5A";
      ctx.shadowColor = "#FF6D5A";
      ctx.shadowBlur  = 22;
      ctx.fillText("WORKFLOW  TERMINATED", W / 2, H / 2 - 90);

      // Big score
      ctx.shadowBlur  = 0;
      ctx.font = "bold 58px 'Courier New', monospace";
      ctx.fillStyle   = "#ffffff";
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 15;
      ctx.fillText(S.score.toLocaleString(), W / 2, H / 2 - 20);

      // Stats
      ctx.shadowBlur = 0;
      ctx.font = "13px 'Courier New', monospace";
      ctx.fillStyle = "rgba(200,210,205,0.6)";
      const elapsed = S.startTime ? (performance.now() - S.startTime) / 60000 : 0.01;
      const wpm = Math.round(S.wordsTyped / Math.max(elapsed, 0.01));
      ctx.fillText(`Level ${S.level}  ·  ${S.wordsTyped} words destroyed  ·  ${wpm} WPM`, W / 2, H / 2 + 28);

      // Pulsing retry
      const a = 0.45 + Math.sin(now * 0.004) * 0.55;
      ctx.globalAlpha = a;
      ctx.font = "13px 'Courier New', monospace";
      ctx.fillStyle   = "#14F195";
      ctx.shadowColor = "#14F195";
      ctx.shadowBlur  = 12;
      ctx.fillText("PRESS  SPACE  TO  RETRY", W / 2, H / 2 + 72);
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
    }

    // ── Main loop ──────────────────────────────────────────────────────────
    let raf: number;

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      ctx.drawImage(bgCv, 0, 0);

      if (S.phase === "idle") {
        drawPlayer(now);
        drawIdle(now);
        return;
      }
      if (S.phase === "over") {
        drawPlayer(now);
        drawOver(now);
        return;
      }

      // ── Update ────────────────────────────────────────────────────────────
      // Wave message fade
      if (S.waveMsgTimer > 0) S.waveMsgTimer--;

      // Spawn
      if (S.wavePhase === "spawning") {
        S.spawnTimer--;
        if (S.spawnTimer <= 0 && S.spawnQueue.length > 0) {
          spawnEnemy();
          S.spawnTimer = waveDef(S.level).gap;
        }
        if (S.spawnQueue.length === 0) S.wavePhase = "clearing";
      }

      // Wave clear check
      if (S.wavePhase === "clearing" && S.enemies.length === 0) {
        S.wavePhase = "between";
        S.betweenTimer = 85;
        S.level++;
        // Bonus EMP every 2 waves
        if (S.level % 2 === 0) S.emps = Math.min(S.emps + 1, 5);
      }
      if (S.wavePhase === "between") {
        if (--S.betweenTimer <= 0) beginWave();
      }

      // Update enemies
      const keep: Enemy[] = [];
      for (const e of S.enemies) {
        if (e.dying) {
          e.dyingTimer--;
          for (const p of e.parts) {
            p.x += p.vx; p.y += p.vy;
            p.vy += 0.10; p.vx *= 0.96;
            p.life--;
          }
          e.parts = e.parts.filter(p => p.life > 0);
          if (e.dyingTimer > 0 || e.parts.length > 0) keep.push(e);
        } else {
          e.y += e.vy;
          if (e.y > H - 78) {
            // Reached bottom — lose a life
            S.lives = Math.max(0, S.lives - 1);
            if (S.targetId === e.id) S.targetId = null;
            if (S.lives <= 0) { S.phase = "over"; S.targetId = null; }
            // Small impact burst
            e.parts = burst(e.x, H - 78, 14);
            e.dying = true; e.dyingTimer = 18;
            keep.push(e);
          } else {
            keep.push(e);
          }
        }
      }
      S.enemies = keep;

      // ── Draw ──────────────────────────────────────────────────────────────
      // Danger zone gradient
      const dg = ctx.createLinearGradient(0, H - 120, 0, H);
      dg.addColorStop(0, "rgba(255,109,90,0)");
      dg.addColorStop(1, "rgba(255,109,90,0.07)");
      ctx.fillStyle = dg;
      ctx.fillRect(0, H - 120, W, 120);

      // Danger line
      ctx.strokeStyle = "rgba(255,109,90,0.28)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 6]);
      ctx.beginPath(); ctx.moveTo(0, H - 78); ctx.lineTo(W, H - 78); ctx.stroke();
      ctx.setLineDash([]);

      // Laser
      const tgt = S.enemies.find(e => e.id === S.targetId && !e.dying);
      drawLaser(tgt, now);

      // Enemies
      for (const e of S.enemies) {
        if (!e.dying) drawEnemy(e);
        if (e.parts.length) drawParticles(e.parts);
      }

      // Player ship
      drawPlayer(now);

      // HUD + wave msg
      drawHUD();
      drawWaveMsg();
    }

    requestAnimationFrame(tick);

    // ── Resize ─────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      buildBg();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="nt-root">
      <canvas ref={canvasRef} className="nt-canvas" />
    </div>
  );
}
