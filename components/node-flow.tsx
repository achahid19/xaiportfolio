"use client";

import { useEffect, useRef, useState } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG = "#0d0d12";
function rgb(h: string) {
  const s = h.replace("#","");
  return `${parseInt(s.slice(0,2),16)},${parseInt(s.slice(2,4),16)},${parseInt(s.slice(4,6),16)}`;
}

// n8n node types — these are the "candies"
const NODES = [
  { name:"Webhook",      icon:"⚡", color:"#FF6D5A" },
  { name:"HTTP Request", icon:"↗",  color:"#4D9DE0" },
  { name:"IF",           icon:"◇",  color:"#F0C040" },
  { name:"Set",          icon:"≡",  color:"#9945FF" },
  { name:"Slack",        icon:"#",  color:"#E01E5A" },
  { name:"Code",         icon:"{}",  color:"#14F195" },
] as const;

// ─── Grid constants ───────────────────────────────────────────────────────────
const ROWS = 7, COLS = 7;
const ANIM_SWAP = 200;
const ANIM_DIE  = 360;
const ANIM_FALL = 300;

// ─── Pure grid functions ──────────────────────────────────────────────────────
function findMatches(grid: number[][]): Set<string> {
  const m = new Set<string>();
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let run = 1;
    for (let c = 1; c <= COLS; c++) {
      const same = c < COLS && grid[r][c] !== -1 && grid[r][c] === grid[r][c-1];
      if (same) { run++; }
      else { if (run >= 3) for (let k=0; k<run; k++) m.add(`${r},${c-1-k}`); run=1; }
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    let run = 1;
    for (let r = 1; r <= ROWS; r++) {
      const same = r < ROWS && grid[r][c] !== -1 && grid[r][c] === grid[r-1][c];
      if (same) { run++; }
      else { if (run >= 3) for (let k=0; k<run; k++) m.add(`${r-1-k},${c}`); run=1; }
    }
  }
  return m;
}

function applyGravity(grid: number[][]): void {
  for (let c = 0; c < COLS; c++) {
    const vals: number[] = [];
    for (let r = ROWS-1; r >= 0; r--) if (grid[r][c] !== -1) vals.push(grid[r][c]);
    for (let r = ROWS-1; r >= 0; r--) grid[r][c] = vals.length ? vals.shift()! : -1;
  }
}

function refill(grid: number[][], numTypes: number): void {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] === -1) grid[r][c] = Math.floor(Math.random()*numTypes);
}

function getFallDist(before: number[][], after: number[][]): number[][] {
  const dist = Array.from({length:ROWS}, ()=>new Array(COLS).fill(0));
  for (let c = 0; c < COLS; c++) {
    let emptyBelow = 0;
    for (let r = ROWS-1; r >= 0; r--) {
      if (before[r][c] === -1) emptyBelow++;
      else if (emptyBelow > 0) {
        const nr = r + emptyBelow;
        if (nr < ROWS) dist[nr][c] = emptyBelow;
      }
    }
    // new cells from refill enter from above
    for (let r = 0; r < emptyBelow; r++) dist[r][c] = emptyBelow - r + 1;
  }
  return dist;
}

function cloneGrid(g: number[][]): number[][] { return g.map(r=>[...r]); }

function initGrid(numTypes: number): number[][] {
  let grid: number[][];
  do {
    grid = Array.from({length:ROWS}, ()=>
      Array.from({length:COLS}, ()=>Math.floor(Math.random()*numTypes))
    );
    // Remove initial matches by re-rolling conflicting cells
    let changed = true;
    while (changed) {
      changed = false;
      const m = findMatches(grid);
      m.forEach(key => {
        const [r,c] = key.split(",").map(Number);
        grid[r][c] = Math.floor(Math.random()*numTypes);
        changed = true;
      });
    }
  } while (!hasValidMoves(grid, numTypes));
  return grid;
}

function hasValidMoves(grid: number[][], numTypes: number): boolean {
  void numTypes;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c+1 < COLS) {
        const g = cloneGrid(grid);
        [g[r][c], g[r][c+1]] = [g[r][c+1], g[r][c]];
        if (findMatches(g).size > 0) return true;
      }
      if (r+1 < ROWS) {
        const g = cloneGrid(grid);
        [g[r][c], g[r+1][c]] = [g[r+1][c], g[r][c]];
        if (findMatches(g).size > 0) return true;
      }
    }
  }
  return false;
}

// ─── Score per match ──────────────────────────────────────────────────────────
function matchScore(count: number, cascade: number): number {
  const base = count <= 3 ? 50 : count === 4 ? 120 : 200;
  return base * count * Math.max(1, cascade);
}

// ─── GS types ────────────────────────────────────────────────────────────────
interface Par  { x:number;y:number;vx:number;vy:number;life:number;color:string;size:number }
interface Pop  { x:number;y:number;text:string;life:number;color:string;vy:number }

type AnimType = "none"|"swap"|"die"|"fall";
interface GS {
  phase: "idle"|"playing"|"animating"|"levelup"|"over";
  grid: number[][];
  numTypes: number;
  sel: [number,number]|null;
  score: number; best: number;
  level: number; cascade: number;
  targetScore: number;
  // anim
  anim: AnimType; animStart: number;
  swapData: { r1:number;c1:number;r2:number;c2:number;back:boolean }|null;
  dieSet: Set<string>;
  fallDist: number[][];
  // fx
  pars: Par[]; pops: Pop[];
  flash: number; flashOk: boolean;
  // temp grid for animation reference
  preGrid: number[][];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function NodeFlow() {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const gs   = useRef<GS>(makeGS());
  const [uiPhase, setUiPhase] = useState<GS["phase"]>("idle");
  const [uiScore, setUiScore] = useState(0);
  const [uiBest,  setUiBest]  = useState(0);
  const [uiLevel, setUiLevel] = useState(1);
  const [uiTarget,setUiTarget]= useState(500);

  function makeGS(): GS {
    return {
      phase:"idle", grid:[], numTypes:5, sel:null,
      score:0, best:0, level:1, cascade:0, targetScore:500,
      anim:"none", animStart:0,
      swapData:null, dieSet:new Set(), fallDist:[],
      pars:[], pops:[], flash:0, flashOk:false,
      preGrid:[],
    };
  }

  useEffect(() => {
    const b = parseInt(localStorage.getItem("nf-best")??"0",10);
    if (b>0) { gs.current.best=b; setUiBest(b); }
  },[]);

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(()=>{
    const c=cvs.current!; const ctx=c.getContext("2d")!;
    let raf=0, last=0;
    function resize(){ const p=c.parentElement!; c.width=p.clientWidth; c.height=p.clientHeight; }
    resize();
    const ro=new ResizeObserver(resize); ro.observe(c.parentElement!);

    function loop(now:number){
      const dt=Math.min(now-(last||now),40); last=now;
      const g=gs.current;

      // Tick particle effects
      tickFx(g,dt);

      // Advance animations
      if (g.anim !== "none") {
        const dur = g.anim==="swap" ? ANIM_SWAP : g.anim==="die" ? ANIM_DIE : ANIM_FALL;
        if (now - g.animStart >= dur) finishAnim(g, now);
      }

      draw(ctx, g, c.width, c.height, now);
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // ── Animation sequencing ──────────────────────────────────────────────────
  function finishAnim(g:GS, now:number){
    if (g.anim==="swap") {
      const sd=g.swapData!;
      if (sd.back) {
        // snap back finished — back to idle
        g.anim="none"; g.phase="playing"; g.sel=null;
        setUiPhase("playing");
      } else {
        // forward swap done — check matches
        const matches=findMatches(g.grid);
        if (matches.size===0) {
          // no match — start snap-back
          const { r1,c1,r2,c2 }=sd;
          [g.grid[r1][c1],g.grid[r2][c2]]=[g.grid[r2][c2],g.grid[r1][c1]];
          g.swapData={...sd,back:true};
          g.animStart=now;
        } else {
          g.anim="none";
          startDie(g, matches, now);
        }
      }
    } else if (g.anim==="die") {
      // Remove dead cells, apply gravity, refill
      g.dieSet.forEach(key=>{
        const [r,c]=key.split(",").map(Number);
        g.grid[r][c]=-1;
      });
      const before=cloneGrid(g.grid);
      applyGravity(g.grid);
      refill(g.grid, g.numTypes);
      g.fallDist=getFallDist(before, g.grid);
      g.preGrid=before;
      g.dieSet=new Set();
      g.anim="fall"; g.animStart=now;
    } else if (g.anim==="fall") {
      // Fall done — check for cascade
      g.anim="none";
      g.fallDist=[];
      const matches=findMatches(g.grid);
      if (matches.size>0) {
        g.cascade++;
        startDie(g, matches, now);
      } else {
        // All done
        g.cascade=0;
        g.sel=null;
        // Check level up
        if (g.score>=g.targetScore) {
          const newLvl=g.level+1;
          const newTarget=Math.round(g.targetScore*2.2);
          const numTypes=newLvl>=4 ? 6 : 5;
          g.level=newLvl; g.targetScore=newTarget; g.numTypes=numTypes;
          g.phase="levelup";
          setUiLevel(newLvl); setUiTarget(newTarget); setUiPhase("levelup");
          setTimeout(()=>{
            g.grid=initGrid(numTypes);
            g.phase="playing"; g.cascade=0; g.sel=null;
            setUiPhase("playing");
          },1400);
        } else if (!hasValidMoves(g.grid, g.numTypes)) {
          // Shuffle
          shuffleGrid(g);
        } else {
          g.phase="playing"; setUiPhase("playing");
        }
      }
    }
  }

  function startDie(g:GS, matches:Set<string>, now:number){
    const pts=matchScore(matches.size, g.cascade+1);
    g.score+=pts;
    if(g.score>g.best){ g.best=g.score; localStorage.setItem("nf-best",String(g.score)); setUiBest(g.score); }
    setUiScore(g.score);
    // Spawn pop at center of matched cells
    const cells=[...matches].map(k=>k.split(",").map(Number));
    const cx=cells.reduce((a,b)=>a+b[1],0)/cells.length;
    const cy=cells.reduce((a,b)=>a+b[0],0)/cells.length;
    const c=cvs.current!;
    const {bx,by,cs}=boardLayout(c.width,c.height);
    const px=bx+(cx+0.5)*cs, py=by+(cy+0.5)*cs;
    const matchType=g.grid[cells[0][0]][cells[0][1]];
    const color=NODES[matchType]?.color??"#fff";
    g.pops.push({x:px,y:py,text:`+${pts}`,life:1.2,color,vy:-1.1});
    g.flash=150; g.flashOk=true;
    // Burst particles
    cells.forEach(([r,cc])=>{
      const nx=bx+(cc+0.5)*cs, ny=by+(r+0.5)*cs;
      for(let i=0;i<8;i++){
        const a=Math.PI*2*i/8+Math.random()*0.4;
        const s=1.5+Math.random()*3;
        g.pars.push({x:nx,y:ny,vx:Math.cos(a)*s,vy:Math.sin(a)*s-0.5,life:1,color,size:2+Math.random()*3});
      }
    });
    g.dieSet=matches;
    g.anim="die"; g.animStart=now;
  }

  function shuffleGrid(g:GS){
    const flat=g.grid.flat();
    for(let i=flat.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [flat[i],flat[j]]=[flat[j],flat[i]]; }
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) g.grid[r][c]=flat[r*COLS+c];
    // Ensure no initial matches after shuffle
    let m=findMatches(g.grid);
    while(m.size>0){m.forEach(k=>{const[r,c]=k.split(",").map(Number);g.grid[r][c]=Math.floor(Math.random()*g.numTypes);});m=findMatches(g.grid);}
  }

  function tickFx(g:GS,dt:number){
    g.flash=Math.max(0,g.flash-dt);
    for(const p of g.pars){p.x+=p.vx;p.y+=p.vy;p.vx*=0.91;p.vy*=0.91;p.vy+=0.06;p.life-=dt/480;}
    g.pars=g.pars.filter(p=>p.life>0);
    for(const p of g.pops){p.y+=p.vy;p.life-=dt/900;}
    g.pops=g.pops.filter(p=>p.life>0);
  }

  // ── Click handler ─────────────────────────────────────────────────────────
  function handleClick(e:React.MouseEvent<HTMLCanvasElement>){
    const g=gs.current;
    if(g.phase!=="playing") return;
    const c=cvs.current!; const r=c.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(c.width/r.width);
    const my=(e.clientY-r.top)*(c.height/r.height);
    const{bx,by,cs}=boardLayout(c.width,c.height);
    const col=Math.floor((mx-bx)/cs);
    const row=Math.floor((my-by)/cs);
    if(col<0||col>=COLS||row<0||row>=ROWS) { g.sel=null; return; }

    if(!g.sel){
      g.sel=[row,col];
    } else {
      const[sr,sc]=g.sel;
      if(sr===row&&sc===col){ g.sel=null; return; }
      // Adjacent?
      const adj=(Math.abs(sr-row)+Math.abs(sc-col))===1;
      if(adj){
        // Perform swap
        g.phase="animating"; setUiPhase("animating");
        [g.grid[sr][sc],g.grid[row][col]]=[g.grid[row][col],g.grid[sr][sc]];
        g.swapData={r1:sr,c1:sc,r2:row,c2:col,back:false};
        g.anim="swap"; g.animStart=performance.now();
      } else {
        g.sel=[row,col];
      }
    }
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  function startGame(){
    const g=gs.current;
    Object.assign(g,{
      phase:"playing", numTypes:5, sel:null,
      score:0, level:1, cascade:0, targetScore:500,
      anim:"none", swapData:null, dieSet:new Set(), fallDist:[],
      pars:[], pops:[], flash:0, flashOk:false, preGrid:[],
    });
    g.grid=initGrid(5);
    setUiPhase("playing"); setUiScore(0); setUiLevel(1); setUiTarget(500);
  }

  const isIdle    = uiPhase==="idle";
  const isOver    = uiPhase==="over";
  const isLvl     = uiPhase==="levelup";
  const isActive  = !isIdle && !isOver;

  return (
    <div className="nf-root">
      <canvas ref={cvs} className="nf-canvas" onClick={handleClick}
        style={{cursor: uiPhase==="playing" ? "pointer" : "default"}} />

      {/* HUD */}
      {isActive && (
        <div className="nf-hud">
          <div className="nf-hud-left">
            <span className="nf-hud-label mono">Score</span>
            <span className="nf-hud-score mono">{uiScore.toLocaleString()}</span>
            {uiBest>0&&<span className="nf-hud-best mono">best {uiBest.toLocaleString()}</span>}
          </div>
          <div className="nf-hud-center">
            <span className="nf-level mono">LVL {uiLevel}</span>
            <div className="nf-progress-bar">
              <div className="nf-progress-fill" style={{width:`${Math.min(100,(uiScore/uiTarget)*100)}%`}} />
            </div>
            <span className="nf-target mono">{uiScore.toLocaleString()} / {uiTarget.toLocaleString()}</span>
          </div>
          <div className="nf-hud-right">
            <span className="nf-hud-label mono">Nodes</span>
            <div className="nf-node-key">
              {NODES.slice(0,uiLevel>=4?6:5).map((n,i)=>(
                <span key={i} className="nf-dot" style={{background:n.color, boxShadow:`0 0 5px ${n.color}`}} title={n.name}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Level up */}
      {isLvl && (
        <div className="nf-levelup">
          <span className="nf-levelup-text mono">Level {uiLevel} →</span>
        </div>
      )}

      {/* Overlays */}
      {(isIdle||isOver) && (
        <div className="nf-overlay">
          <div className="nf-overlay-inner">
            {isOver ? (
              <>
                <div className="eyebrow mono" style={{color:"#ff4444"}}>Workflow Halted</div>
                <div className="nf-final-score mono">{uiScore.toLocaleString()}</div>
                {uiScore>=uiBest&&uiScore>0&&<div className="nf-best-badge mono">🏆 New best!</div>}
              </>
            ) : (
              <>
                <div className="eyebrow mono">Playground</div>
                <h2 className="nf-title">Node Flow</h2>
                <p className="nf-desc mono">
                  Match 3+ identical n8n nodes to execute them.<br/>
                  Chain cascades for massive combos.<br/>
                  <span style={{color:"#F0C040"}}>Click</span> a node, then click an adjacent one to swap.
                </p>
                {uiBest>0&&<div className="nf-best-badge mono">Best: <strong>{uiBest.toLocaleString()}</strong></div>}
              </>
            )}
            <button className="btn btn-primary nf-start-btn" onClick={startGame}>
              {isOver?"Try again →":"Start →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Board layout helper ──────────────────────────────────────────────────────
function boardLayout(W:number, H:number) {
  const HUD = 70;
  const PAD = 16;
  const avW = W - PAD*2;
  const avH = H - HUD - PAD;
  const cs  = Math.min(72, Math.floor(Math.min(avW/COLS, avH/ROWS)));
  const bw  = cs*COLS, bh = cs*ROWS;
  const bx  = Math.floor((W-bw)/2);
  const by  = HUD + Math.floor(((H-HUD-PAD)-bh)/2);
  return { bx, by, cs };
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
function draw(ctx:CanvasRenderingContext2D, g:GS, W:number, H:number, now:number){
  ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

  // Grid lines (faint)
  ctx.strokeStyle="rgba(255,255,255,0.022)"; ctx.lineWidth=0.5;
  ctx.beginPath();
  for(let x=0;x<W;x+=36){ctx.moveTo(x,0);ctx.lineTo(x,H);}
  for(let y=0;y<H;y+=36){ctx.moveTo(0,y);ctx.lineTo(W,y);}
  ctx.stroke();

  // Screen flash
  if(g.flash>0){
    ctx.fillStyle=g.flashOk?`rgba(20,241,149,${(g.flash/500)*0.13})`:`rgba(255,50,50,${(g.flash/500)*0.15})`;
    ctx.fillRect(0,0,W,H);
  }

  if(g.phase==="idle") return;

  const{bx,by,cs}=boardLayout(W,H);
  const GAP=Math.max(3,Math.floor(cs*0.055));

  // Board shadow
  ctx.save();
  ctx.shadowBlur=32; ctx.shadowColor="rgba(0,0,0,0.7)";
  ctx.fillStyle="rgba(8,8,14,0.6)";
  ctx.fillRect(bx-6,by-6,cs*COLS+12,cs*ROWS+12);
  ctx.restore();

  // Board border
  ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=1;
  ctx.strokeRect(bx-1,by-1,cs*COLS+2,cs*ROWS+2);

  // Compute animation progress
  const ap = g.anim==="none" ? 1 :
    Math.min(1,(now-g.animStart)/(g.anim==="swap"?ANIM_SWAP:g.anim==="die"?ANIM_DIE:ANIM_FALL));
  const ease = (t:number)=>t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; // easeInOut
  const ep = ease(ap);

  // Draw cells
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const type=g.grid[r][c];
      if(type===-1) continue;

      let drawX=bx+c*cs+GAP;
      let drawY=by+r*cs+GAP;
      let scale=1, alpha=1;
      const cw=cs-GAP*2, ch=cs-GAP*2;
      const isSelected=g.sel?.[0]===r&&g.sel?.[1]===c;

      // Swap animation
      if(g.anim==="swap"&&g.swapData){
        const{r1,c1,r2,c2,back}=g.swapData;
        const dir=back?-1:1;
        if(r===r1&&c===c1){
          drawX+=dir*ep*(c2-c1)*cs;
          drawY+=dir*ep*(r2-r1)*cs;
        } else if(r===r2&&c===c2){
          drawX-=dir*ep*(c2-c1)*cs;
          drawY-=dir*ep*(r2-r1)*cs;
        }
      }

      // Die animation (shrink + fade)
      if(g.anim==="die"&&g.dieSet.has(`${r},${c}`)){
        scale=1-ep;
        alpha=1-ep;
      }

      // Fall animation
      if(g.anim==="fall"&&g.fallDist.length){
        const fd=g.fallDist[r]?.[c]??0;
        if(fd>0) drawY-=(1-ep)*fd*cs;
      }

      if(alpha<=0.02) continue;

      const cx=drawX+cw/2, cy=drawY+ch/2;
      const nd=NODES[type];
      const color=nd.color;

      ctx.save();
      ctx.globalAlpha=alpha;
      ctx.translate(cx,cy); ctx.scale(scale,scale); ctx.translate(-cx,-cy);

      // Cell glow
      const glowStr=isSelected?0.9:0.35;
      ctx.shadowBlur=isSelected?20:8;
      ctx.shadowColor=`rgba(${rgb(color)},${glowStr})`;

      // Cell background
      rrx(ctx,drawX,drawY,cw,ch,6);
      ctx.fillStyle=`rgba(${rgb(color)},${isSelected?0.22:0.10})`; ctx.fill();

      // Cell border
      ctx.strokeStyle=`rgba(${rgb(color)},${isSelected?0.95:0.55})`;
      ctx.lineWidth=isSelected?2:1.5; ctx.stroke();
      ctx.shadowBlur=0;

      // Connection dot (top-left)
      ctx.fillStyle=`rgba(${rgb(color)},0.85)`;
      ctx.beginPath(); ctx.arc(drawX+8,drawY+8,3,0,Math.PI*2); ctx.fill();

      // Connection dot (bottom-right) — n8n style
      ctx.fillStyle=`rgba(${rgb(color)},0.45)`;
      ctx.beginPath(); ctx.arc(drawX+cw-8,drawY+ch-8,3,0,Math.PI*2); ctx.fill();

      // Node icon
      ctx.fillStyle=`rgba(${rgb(color)},0.95)`;
      ctx.font=`bold ${cs>55?14:11}px sans-serif`;
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText(nd.icon, cx, cy-5);

      // Node name
      ctx.fillStyle=`rgba(255,255,255,0.55)`;
      ctx.font=`${cs>60?8:7}px var(--font-mono-stack,monospace)`;
      ctx.fillText(nd.name, cx, cy+8);

      // Selected ring
      if(isSelected){
        ctx.strokeStyle=`rgba(${rgb(color)},0.6)`;
        ctx.lineWidth=1; ctx.setLineDash([3,3]);
        rrx(ctx,drawX-2,drawY-2,cw+4,ch+4,8);
        ctx.stroke(); ctx.setLineDash([]);
      }

      ctx.restore();
    }
  }

  // Row/col hint connections between matched cells (n8n bezier lines)
  if(g.anim==="die"){
    const cells=[...g.dieSet].map(k=>k.split(",").map(Number));
    if(cells.length>0){
      const type=g.grid[cells[0][0]]?.[cells[0][1]];
      if(type>=0){
        const color=NODES[type].color;
        ctx.save(); ctx.globalAlpha=(1-ep)*0.5;
        ctx.strokeStyle=color; ctx.lineWidth=1.5;
        ctx.shadowBlur=8; ctx.shadowColor=color;
        ctx.setLineDash([4,4]);
        for(let i=1;i<cells.length;i++){
          const[pr,pc]=cells[i-1];
          const[cr,cc]=cells[i];
          const x1=bx+(pc+0.5)*cs, y1=by+(pr+0.5)*cs;
          const x2=bx+(cc+0.5)*cs, y2=by+(cr+0.5)*cs;
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  drawPars(ctx,g); drawPops(ctx,g);

  // Level-up overlay
  if(g.phase==="levelup"){
    ctx.save();
    ctx.fillStyle="rgba(8,8,15,0.6)"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#14F195"; ctx.shadowBlur=28; ctx.shadowColor="#14F195";
    ctx.font="bold 34px var(--font-mono-stack,monospace)";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(`LEVEL ${g.level}`,W/2,H/2-10);
    ctx.shadowBlur=0; ctx.fillStyle="rgba(255,255,255,0.35)";
    ctx.font="12px var(--font-mono-stack,monospace)";
    ctx.fillText("new workflow incoming...",W/2,H/2+22);
    ctx.restore();
  }
}

function rrx(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

function drawPars(ctx:CanvasRenderingContext2D,g:GS){
  for(const p of g.pars){
    ctx.save(); ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.color; ctx.shadowBlur=4; ctx.shadowColor=p.color;
    ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    ctx.restore();
  }
}

function drawPops(ctx:CanvasRenderingContext2D,g:GS){
  for(const p of g.pops){
    ctx.save(); ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.color; ctx.shadowBlur=10; ctx.shadowColor=p.color;
    ctx.font="bold 14px var(--font-mono-stack,monospace)";
    ctx.textAlign="center"; ctx.fillText(p.text,p.x,p.y);
    ctx.restore();
  }
}
