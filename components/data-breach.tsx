"use client";

import { useEffect, useRef, useState } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#0d0d12", orange:"#FF6D5A", green:"#14F195", red:"#ff4444",
  yellow:"#F0C040", blue:"#4D9DE0", purple:"#9945FF", pink:"#E01E5A",
  gray:"#777", text:"#e8e8ee",
} as const;

function rgb(h:string){const s=h.replace("#","");return`${parseInt(s.slice(0,2),16)},${parseInt(s.slice(2,4),16)},${parseInt(s.slice(4,6),16)}`;}

// ─── Block types ──────────────────────────────────────────────────────────────
type BType = "webhook"|"http"|"if"|"set"|"error"|"code";
const BCLR:Record<BType,string> = {webhook:C.orange,http:C.blue,if:C.yellow,set:C.purple,error:C.red,code:C.gray};
const BICO:Record<BType,string> = {webhook:"⚡",http:"↗",if:"◇",set:"≡",error:"✕",code:"{}"};
const BNME:Record<BType,string> = {webhook:"Webhook",http:"HTTP",if:"IF",set:"Set",error:"Error",code:"Code"};
const BNHP:Record<BType,number>  = {webhook:3,http:2,if:2,set:1,error:1,code:2};

// ─── Physics constants ────────────────────────────────────────────────────────
const GRAVITY   = 0.38;
const MAX_DRAG  = 90;
const POWER     = 13.5;
const PROJ_R    = 9;
const GND       = 72;   // px from bottom
const BW = 62, BH = 40; // block dimensions

// ─── Ammo types & abilities ───────────────────────────────────────────────────
type AType = "webhook"|"http"|"if";
const AMMO_COLORS:Record<AType,string> = {webhook:C.orange, http:C.blue, if:C.yellow};
const AMMO_QUEUE:AType[] = ["webhook","http","if","webhook","http"];
const AMMO_HINT:Record<AType,string> = {
  webhook:"Click mid-flight to split into 3",
  http:   "Click mid-flight to pierce through",
  if:     "Click mid-flight to boost speed",
};

// ─── Level block definitions ──────────────────────────────────────────────────
// rx = x as 0-1 of canvas width, rb = rows from ground (0=ground level)
interface BDef { rx:number; rb:number; type:BType; }

const LEVELS:BDef[][] = [
  // Level 1 — two towers + isolated block
  [
    {rx:0.52,rb:0,type:"set"},
    {rx:0.52,rb:1,type:"http"},
    {rx:0.52,rb:2,type:"error"},
    {rx:0.66,rb:0,type:"set"},
    {rx:0.66,rb:1,type:"error"},
    {rx:0.80,rb:0,type:"webhook"},
    {rx:0.80,rb:1,type:"if"},
    {rx:0.80,rb:2,type:"http"},
    {rx:0.80,rb:3,type:"error"},
  ],
  // Level 2 — wall with protected errors
  [
    {rx:0.46,rb:0,type:"webhook"},{rx:0.46,rb:1,type:"webhook"},{rx:0.46,rb:2,type:"error"},
    {rx:0.56,rb:0,type:"http"},  {rx:0.56,rb:1,type:"error"},  {rx:0.56,rb:2,type:"if"},
    {rx:0.66,rb:0,type:"set"},   {rx:0.66,rb:1,type:"http"},   {rx:0.66,rb:2,type:"error"},
    {rx:0.76,rb:0,type:"code"},  {rx:0.76,rb:1,type:"error"},
    {rx:0.86,rb:0,type:"set"},   {rx:0.86,rb:1,type:"if"},     {rx:0.86,rb:2,type:"error"},
  ],
  // Level 3 — fortress layout
  [
    {rx:0.44,rb:0,type:"webhook"},{rx:0.44,rb:1,type:"webhook"},{rx:0.44,rb:2,type:"webhook"},{rx:0.44,rb:3,type:"error"},
    {rx:0.54,rb:0,type:"http"},  {rx:0.54,rb:1,type:"if"},     {rx:0.54,rb:2,type:"error"},
    {rx:0.62,rb:0,type:"set"},   {rx:0.62,rb:1,type:"error"},  {rx:0.62,rb:2,type:"code"},
    {rx:0.70,rb:0,type:"code"},  {rx:0.70,rb:1,type:"http"},   {rx:0.70,rb:2,type:"error"},  {rx:0.70,rb:3,type:"webhook"},
    {rx:0.80,rb:0,type:"if"},    {rx:0.80,rb:1,type:"error"},  {rx:0.80,rb:2,type:"set"},
    {rx:0.89,rb:0,type:"webhook"},{rx:0.89,rb:1,type:"error"},
  ],
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Block {
  x:number; y:number; vx:number; vy:number;
  angle:number; avel:number;
  type:BType; hp:number; maxHp:number;
  alive:boolean; flash:number; isTarget:boolean;
}
interface Proj {
  x:number; y:number; vx:number; vy:number; r:number;
  atype:AType; color:string;
  active:boolean; used:boolean;  // used = ability used
  trail:{x:number;y:number}[];
}
interface Par  {x:number;y:number;vx:number;vy:number;life:number;color:string;size:number}
interface Pop  {x:number;y:number;text:string;life:number;color:string;vy:number;big?:boolean}
interface Stream {x1:number;y1:number;x2:number;y2:number;cx:number;cy:number;t:number;color:string}

interface GS {
  phase:"idle"|"ready"|"aiming"|"flying"|"settling"|"clear"|"failed"|"win";
  level:number;
  blocks:Block[];
  projs:Proj[];
  ammoIdx:number;
  targetsLeft:number;
  score:number; best:number;
  dragging:boolean; dragX:number; dragY:number;
  settleTimer:number;
  pars:Par[]; pops:Pop[]; streams:Stream[];
  flash:number; flashOk:boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function launcherPos(W:number,H:number){return{lx:Math.round(W*0.12),ly:H-GND-44};}
function groundY(H:number){return H-GND;}

function makeBlocks(defs:BDef[],W:number,H:number):Block[]{
  const gy=groundY(H);
  return defs.map(d=>({
    x:d.rx*W, y:gy - d.rb*(BH+3) - BH/2,
    vx:0,vy:0,angle:0,avel:0,
    type:d.type,hp:BNHP[d.type],maxHp:BNHP[d.type],
    alive:true,flash:0,isTarget:d.type==="error",
  }));
}

function circleRect(cx:number,cy:number,cr:number,bx:number,by:number,bw:number,bh:number):boolean{
  const nx=Math.max(bx,Math.min(cx,bx+bw));
  const ny=Math.max(by,Math.min(cy,by+bh));
  const dx=cx-nx,dy=cy-ny;
  return dx*dx+dy*dy<=cr*cr;
}

function rrx(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

function trajectory(sx:number,sy:number,vx:number,vy:number,gy:number,steps=60):{x:number;y:number}[]{
  const pts=[];let x=sx,y=sy,dvx=vx,dvy=vy;
  for(let i=0;i<steps;i++){x+=dvx;y+=dvy;dvy+=GRAVITY;pts.push({x,y});if(y>gy)break;}
  return pts;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DataBreach(){
  const cvs  = useRef<HTMLCanvasElement>(null);
  const gs   = useRef<GS>(initGS());
  const [uiPhase,  setUiPhase]  = useState<GS["phase"]>("idle");
  const [uiScore,  setUiScore]  = useState(0);
  const [uiBest,   setUiBest]   = useState(0);
  const [uiLevel,  setUiLevel]  = useState(1);
  const [uiAmmo,   setUiAmmo]   = useState(AMMO_QUEUE.length);
  const [uiTargets,setUiTargets]= useState(0);
  const [uiHint,   setUiHint]   = useState("");

  function initGS():GS{
    return{phase:"idle",level:0,blocks:[],projs:[],ammoIdx:0,targetsLeft:0,
      score:0,best:0,dragging:false,dragX:0,dragY:0,settleTimer:0,
      pars:[],pops:[],streams:[],flash:0,flashOk:false};
  }

  useEffect(()=>{
    const b=parseInt(localStorage.getItem("db-best")??"0",10);
    if(b>0){gs.current.best=b;setUiBest(b);}
  },[]);

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(()=>{
    const c=cvs.current!; const ctx=c.getContext("2d")!;
    let raf=0,last=0;
    function resize(){const p=c.parentElement!;c.width=p.clientWidth;c.height=p.clientHeight;}
    resize();
    const ro=new ResizeObserver(resize);ro.observe(c.parentElement!);

    function loop(now:number){
      const dt=Math.min(now-(last||now),40);last=now;
      const g=gs.current;
      const W=c.width,H=c.height;
      if(g.phase==="flying"||g.phase==="settling"||g.phase==="ready"||g.phase==="aiming"){
        update(g,dt,W,H,now);
      }
      drawScene(ctx,g,W,H,now);
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function update(g:GS,dt:number,W:number,H:number,now:number){
    const gy=groundY(H);
    // Projectiles
    for(const p of g.projs){
      if(!p.active)continue;
      p.vx+=(p.atype==="http"&&p.used?0:0); // http handled in click
      p.vy+=GRAVITY;
      p.x+=p.vx; p.y+=p.vy;
      p.trail.push({x:p.x,y:p.y});
      if(p.trail.length>22)p.trail.shift();
      // Deactivate off-screen
      if(p.x>W+50||p.x<-50||p.y>gy+60){p.active=false;continue;}
      // Block collisions
      for(const blk of g.blocks){
        if(!blk.alive)continue;
        if(!circleRect(p.x,p.y,p.r,blk.x-BW/2,blk.y-BH/2,BW,BH))continue;
        // Hit!
        hitBlock(g,p,blk,W,H,now);
        if(p.atype!=="http"||!p.used){p.active=false;}  // http pierces once
      }
    }
    // Remove dead projs
    const anyActive=g.projs.some(p=>p.active);
    if(!anyActive&&g.phase==="flying"){
      g.phase="settling";g.settleTimer=1600;setUiPhase("settling");
    }
    // Settle timer
    if(g.phase==="settling"){
      g.settleTimer-=dt;
      if(g.settleTimer<=0)resolveRound(g,W,H,now);
    }
    // Block physics
    for(const blk of g.blocks){
      if(!blk.alive)continue;
      blk.vy+=GRAVITY;
      blk.x+=blk.vx; blk.y+=blk.vy;
      blk.angle+=blk.avel; blk.avel*=0.96;
      blk.flash=Math.max(0,blk.flash-dt);
      // Ground
      if(blk.y+BH/2>=gy){
        blk.y=gy-BH/2;
        blk.vy*=-0.28; blk.vx*=0.72;
        if(Math.abs(blk.vy)<0.6)blk.vy=0;
        blk.avel*=0.55;
      }
      // Wall bounds
      if(blk.x-BW/2<0){blk.x=BW/2;blk.vx=Math.abs(blk.vx)*0.4;}
    }
    // Particles & pops
    for(const p of g.pars){p.x+=p.vx;p.y+=p.vy;p.vx*=0.91;p.vy*=0.91;p.vy+=0.05;p.life-=dt/500;}
    g.pars=g.pars.filter(p=>p.life>0);
    for(const p of g.pops){p.y+=p.vy;p.life-=dt/900;}
    g.pops=g.pops.filter(p=>p.life>0);
    // Data streams (n8n workflow VFX)
    for(const s of g.streams)s.t=Math.min(1,s.t+dt/900);
    g.streams=g.streams.filter(s=>s.t<1.05);
    g.flash=Math.max(0,g.flash-dt);
    // UI throttle
    if(Math.floor(now/80)!==Math.floor((now-dt)/80)){
      setUiScore(g.score);
      setUiAmmo(Math.max(0,AMMO_QUEUE.length-g.ammoIdx));
      setUiTargets(g.targetsLeft);
    }
  }

  function hitBlock(g:GS,p:Proj,blk:Block,W:number,H:number,now:number){
    void now;
    blk.hp--;
    blk.flash=350;
    // Impulse
    const dx=blk.x-p.x, dy=blk.y-p.y;
    const d=Math.sqrt(dx*dx+dy*dy)||1;
    const force=4+Math.abs(p.vy)*0.5;
    blk.vx+=(dx/d)*force;
    blk.vy+=(dy/d)*force*0.8-3;
    blk.avel+=(Math.random()-0.5)*0.18;
    burst(g,blk.x,blk.y,BCLR[blk.type],6);
    if(blk.hp<=0){
      blk.alive=false;
      const pts=blk.isTarget?350:80;
      g.score+=pts;
      if(g.score>g.best){g.best=g.score;localStorage.setItem("db-best",String(g.score));}
      burst(g,blk.x,blk.y,BCLR[blk.type],18);
      g.pops.push({x:blk.x,y:blk.y-20,text:`+${pts}`,life:1.2,color:BCLR[blk.type],vy:-1.1});
      if(blk.isTarget){
        g.targetsLeft=Math.max(0,g.targetsLeft-1);
        // ★ Creative n8n element: workflow execution stream arcs out
        for(let i=0;i<3;i++){
          g.streams.push({
            x1:blk.x,y1:blk.y,
            x2:W*0.97,y2:H*0.1+Math.random()*H*0.5,
            cx:blk.x+W*0.15+Math.random()*W*0.1,
            cy:blk.y-(40+Math.random()*80),
            t:0,color:BCLR[blk.type],
          });
        }
        g.pops.push({x:blk.x,y:blk.y-44,text:"ERROR FIXED",life:1.6,color:C.green,vy:-0.7,big:true});
        g.flash=300;g.flashOk=true;
      }
    }
  }

  function resolveRound(g:GS,W:number,H:number,now:number){
    void now;void W;void H;
    if(g.targetsLeft===0){
      g.phase="clear";setUiPhase("clear");
      return;
    }
    const nextIdx=g.ammoIdx+1;
    if(nextIdx>=AMMO_QUEUE.length){
      g.phase="failed";setUiPhase("failed");
    } else {
      g.ammoIdx=nextIdx;
      g.projs=[];
      g.phase="ready";setUiPhase("ready");
      setUiHint(AMMO_HINT[AMMO_QUEUE[nextIdx]]);
    }
  }

  // ─ Ability ──────────────────────────────────────────────────────────────────
  function useAbility(g:GS){
    const p=g.projs.find(pr=>pr.active&&!pr.used);
    if(!p)return;
    p.used=true;
    if(p.atype==="webhook"){
      // Split into 3
      const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      const ang=Math.atan2(p.vy,p.vx);
      const offsets=[-0.4,0.4];
      offsets.forEach(off=>{
        g.projs.push({x:p.x,y:p.y,vx:Math.cos(ang+off)*spd*0.9,vy:Math.sin(ang+off)*spd*0.9,
          r:6,atype:p.atype,color:p.color,active:true,used:true,trail:[]});
      });
      p.r=6; burst(g,p.x,p.y,C.orange,10);
    } else if(p.atype==="if"){
      // Speed boost — accelerate forward
      const ang=Math.atan2(p.vy,p.vx);
      const boost=8;
      p.vx=Math.cos(ang)*boost; p.vy=Math.sin(ang)*boost;
      burst(g,p.x,p.y,C.yellow,8);
    } else if(p.atype==="http"){
      // Piercing — mark used so it keeps going through blocks
      p.used=true; burst(g,p.x,p.y,C.blue,8);
    }
    g.pops.push({x:p.x,y:p.y-20,text:p.atype==="webhook"?"SPLIT!":p.atype==="if"?"BOOST!":"PIERCE!",
      life:1,color:p.color,vy:-0.8,big:true});
  }

  function burst(g:GS,x:number,y:number,color:string,n:number){
    for(let i=0;i<n;i++){
      const a=Math.PI*2*i/n+Math.random()*0.4;
      const s=1.5+Math.random()*4;
      g.pars.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:1,color,size:2+Math.random()*3.5});
    }
  }

  // ─ Mouse handlers ────────────────────────────────────────────────────────────
  function onMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
    const g=gs.current;
    if(g.phase!=="ready")return;
    const c=cvs.current!;const r=c.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(c.width/r.width);
    const my=(e.clientY-r.top)*(c.height/r.height);
    const{lx,ly}=launcherPos(c.width,c.height);
    if(Math.sqrt((mx-lx)**2+(my-ly)**2)<65){
      g.dragging=true;g.dragX=mx;g.dragY=my;
      g.phase="aiming";setUiPhase("aiming");
    }
  }

  function onMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
    const g=gs.current;
    if(!g.dragging)return;
    const c=cvs.current!;const r=c.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(c.width/r.width);
    const my=(e.clientY-r.top)*(c.height/r.height);
    const{lx,ly}=launcherPos(c.width,c.height);
    const dx=mx-lx,dy=my-ly;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const clamped=Math.min(dist,MAX_DRAG);
    const ang=Math.atan2(dy,dx);
    g.dragX=lx+Math.cos(ang)*clamped;
    g.dragY=ly+Math.sin(ang)*clamped;
  }

  function onMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
    const g=gs.current;
    if(!g.dragging)return;
    e.preventDefault();
    const c=cvs.current!;
    const{lx,ly}=launcherPos(c.width,c.height);
    const dx=g.dragX-lx,dy=g.dragY-ly;
    const dist=Math.sqrt(dx*dx+dy*dy);
    g.dragging=false;
    if(dist<8){g.phase="ready";setUiPhase("ready");return;}
    const vx=-(dx/MAX_DRAG)*POWER;
    const vy=-(dy/MAX_DRAG)*POWER;
    const atype=AMMO_QUEUE[g.ammoIdx%AMMO_QUEUE.length];
    g.projs=[{x:lx,y:ly,vx,vy,r:PROJ_R,atype,color:AMMO_COLORS[atype],active:true,used:false,trail:[]}];
    g.phase="flying";setUiPhase("flying");
    setUiHint("Click to use ability!");
  }

  function onClick(e:React.MouseEvent<HTMLCanvasElement>){
    const g=gs.current;
    if(g.phase==="flying")useAbility(g);
    if((g.phase==="clear"||g.phase==="failed")&&!(e.target as HTMLElement).closest("button")){
      // ignore clicks on overlay buttons here
    }
  }

  // ─ Start / next / retry ──────────────────────────────────────────────────────
  function loadLevel(lvlIdx:number,preserveScore=false){
    const c=cvs.current!;
    const g=gs.current;
    const defs=LEVELS[lvlIdx]??LEVELS[LEVELS.length-1];
    const blocks=makeBlocks(defs,c.width,c.height);
    const targets=blocks.filter(b=>b.isTarget).length;
    Object.assign(g,{
      phase:"ready",level:lvlIdx,blocks,projs:[],ammoIdx:0,targetsLeft:targets,
      dragging:false,pars:[],pops:[],streams:[],flash:0,flashOk:false,
      score:preserveScore?g.score:0,
    });
    if(!preserveScore)setUiScore(0);
    setUiPhase("ready");setUiLevel(lvlIdx+1);setUiAmmo(AMMO_QUEUE.length);setUiTargets(targets);
    setUiHint(AMMO_HINT[AMMO_QUEUE[0]]);
  }

  function startGame(){gs.current.best=gs.current.best;loadLevel(0,false);}
  function nextLevel(){
    const g=gs.current;
    const next=g.level+1;
    if(next>=LEVELS.length){g.phase="win";setUiPhase("win" as GS["phase"]);}
    else loadLevel(next,true);
  }
  function retryLevel(){loadLevel(gs.current.level,false);}

  const ph=uiPhase;
  const isIdle=ph==="idle";
  const isWin=(ph as string)==="win";
  const showOverlay=isIdle||ph==="clear"||ph==="failed"||isWin;
  const showHUD=ph!=="idle"&&!isWin;

  return(
    <div className="db-root">
      <canvas ref={cvs} className="db-canvas"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp} onClick={onClick}
        style={{cursor:ph==="flying"?"crosshair":ph==="ready"||ph==="aiming"?"cell":"default"}}
      />

      {/* HUD */}
      {showHUD&&(
        <div className="db-hud">
          <div className="db-hud-left">
            <span className="db-hud-label mono">Level</span>
            <span className="db-hud-val mono">{uiLevel} / {LEVELS.length}</span>
          </div>
          <div className="db-hud-center">
            {/* Ammo rack */}
            <div className="db-ammo-rack">
              {AMMO_QUEUE.map((a,i)=>(
                <span key={i} className={`db-ammo-dot${i<uiAmmo?"":" db-ammo-dot--used"}`}
                  style={{background:i<uiAmmo?AMMO_COLORS[a]:"rgba(255,255,255,0.1)",
                    boxShadow:i<uiAmmo?`0 0 6px ${AMMO_COLORS[a]}`:"none",
                    transform:i===uiAmmo-1?"scale(1.3)":"scale(1)"}}
                />
              ))}
            </div>
            {uiHint&&<span className="db-hint mono">{uiHint}</span>}
          </div>
          <div className="db-hud-right">
            <span className="db-hud-label mono">Errors left</span>
            <span className="db-hud-val mono" style={{color:uiTargets>0?C.red:C.green}}>{uiTargets}</span>
            <span className="db-hud-best mono">best {uiBest.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Score floating */}
      {showHUD&&<div className="db-score mono">{uiScore.toLocaleString()}</div>}

      {/* Overlays */}
      {showOverlay&&(
        <div className="db-overlay">
          <div className="db-overlay-inner">
            {isIdle&&(<>
              <div className="eyebrow mono">Playground</div>
              <h2 className="db-title">Data Breach</h2>
              <p className="db-desc mono">
                Fire data packets from the Webhook slingshot.<br/>
                Smash all <span style={{color:C.red}}>Error nodes</span> blocking the workflow.<br/>
                Each packet has a special ability — click mid-flight!
              </p>
              <div className="db-ability-list">
                {(Object.entries(AMMO_HINT) as [AType,string][]).map(([a,h])=>(
                  <div key={a} className="db-ability-row mono">
                    <span className="db-ability-dot" style={{background:AMMO_COLORS[a],boxShadow:`0 0 6px ${AMMO_COLORS[a]}`}}/>
                    <span style={{color:AMMO_COLORS[a]}}>{a}</span>
                    <span className="db-ability-desc">— {h}</span>
                  </div>
                ))}
              </div>
              {uiBest>0&&<div className="db-best-tag mono">Best: <strong>{uiBest.toLocaleString()}</strong></div>}
              <button className="btn btn-primary db-start-btn" onClick={startGame}>Start →</button>
            </>)}
            {ph==="clear"&&(<>
              <div className="eyebrow mono" style={{color:C.green}}>Pipeline Restored!</div>
              <div className="db-overlay-score mono">{uiScore.toLocaleString()}</div>
              {uiLevel<LEVELS.length&&<button className="btn btn-primary db-start-btn" onClick={nextLevel}>Next level →</button>}
            </>)}
            {ph==="failed"&&(<>
              <div className="eyebrow mono" style={{color:C.red}}>Ammo depleted</div>
              <div className="db-overlay-score mono" style={{color:C.red}}>{uiTargets} error{uiTargets!==1?"s":""} remain</div>
              <button className="btn btn-primary db-start-btn" onClick={retryLevel}>Retry →</button>
            </>)}
            {isWin&&(<>
              <div className="eyebrow mono" style={{color:C.green}}>All workflows restored!</div>
              <div className="db-overlay-score mono">{uiScore.toLocaleString()}</div>
              {uiScore>=uiBest&&uiScore>0&&<div className="db-best-tag mono">🏆 New best!</div>}
              <button className="btn btn-primary db-start-btn" onClick={startGame}>Play again →</button>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
function drawScene(ctx:CanvasRenderingContext2D,g:GS,W:number,H:number,now:number){
  // BG
  ctx.fillStyle=C.bg; ctx.fillRect(0,0,W,H);
  // Grid
  ctx.strokeStyle="rgba(255,255,255,0.02)";ctx.lineWidth=0.5;
  ctx.beginPath();
  for(let x=0;x<W;x+=38){ctx.moveTo(x,0);ctx.lineTo(x,H);}
  for(let y=0;y<H;y+=38){ctx.moveTo(0,y);ctx.lineTo(W,y);}
  ctx.stroke();

  if(g.phase==="idle")return;

  const gy=groundY(H);
  const{lx,ly}=launcherPos(W,H);

  // Screen flash
  if(g.flash>0){
    ctx.fillStyle=g.flashOk?`rgba(20,241,149,${(g.flash/500)*0.14})`:`rgba(255,50,50,${(g.flash/500)*0.18})`;
    ctx.fillRect(0,0,W,H);
  }

  // Ground
  const grad=ctx.createLinearGradient(0,gy,0,H);
  grad.addColorStop(0,"rgba(255,109,90,0.15)");
  grad.addColorStop(0.3,"rgba(15,15,28,0.95)");
  grad.addColorStop(1,"rgba(8,8,15,1)");
  ctx.fillStyle=grad; ctx.fillRect(0,gy,W,H-gy);
  ctx.strokeStyle="rgba(255,109,90,0.35)";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();
  // Ground grid lines
  ctx.strokeStyle="rgba(255,255,255,0.04)";ctx.lineWidth=1;
  for(let x=0;x<W;x+=38){ctx.beginPath();ctx.moveTo(x,gy);ctx.lineTo(x,H);ctx.stroke();}

  // ★ n8n data stream VFX — workflow execution arcs
  for(const s of g.streams){
    const t=s.t;
    const bx=s.x1+(s.cx-s.x1)*3*t*(1-t)*(1-t)+3*(s.cx-s.x1)*t*t*(1-t);
    const by=s.y1+(s.cy-s.y1)*3*t*(1-t)*(1-t)+3*(s.cy-s.y1)*t*t*(1-t);
    // Draw bezier arc
    ctx.save();
    ctx.globalAlpha=Math.sin(t*Math.PI)*0.7;
    ctx.shadowBlur=12;ctx.shadowColor=s.color;
    ctx.fillStyle=s.color;
    ctx.beginPath();ctx.arc(bx,by,4,0,Math.PI*2);ctx.fill();
    // Trail
    ctx.globalAlpha=Math.sin(t*Math.PI)*0.25;
    ctx.strokeStyle=s.color;ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(s.x1,s.y1);
    ctx.quadraticCurveTo(s.cx,s.cy,bx,by);
    ctx.stroke();
    ctx.restore();
  }

  // Trajectory preview
  if(g.phase==="aiming"&&g.dragging){
    const{lx:slx,ly:sly}=launcherPos(W,H);
    const vx=-(g.dragX-slx)/MAX_DRAG*POWER;
    const vy=-(g.dragY-sly)/MAX_DRAG*POWER;
    const pts=trajectory(slx,sly,vx,vy,gy);
    const atype=AMMO_QUEUE[g.ammoIdx%AMMO_QUEUE.length];
    const tcolor=AMMO_COLORS[atype];
    ctx.save();
    for(let i=0;i<pts.length;i+=2){
      const a=(1-(i/pts.length))*0.55;
      ctx.globalAlpha=a;
      ctx.fillStyle=tcolor;ctx.shadowBlur=6;ctx.shadowColor=tcolor;
      ctx.beginPath();ctx.arc(pts[i].x,pts[i].y,3-(i/pts.length)*2,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  // Blocks
  for(const blk of g.blocks){if(blk.alive)drawBlock(ctx,blk,now);}
  // Particles + pops
  drawPars(ctx,g); drawPops(ctx,g);
  // Projectiles
  for(const p of g.projs){if(p.active)drawProj(ctx,p);}
  // Slingshot (drawn on top so it's always visible)
  drawSlingshot(ctx,lx,ly,g,now);
}

function drawBlock(ctx:CanvasRenderingContext2D,blk:Block,t:number){
  ctx.save();
  ctx.translate(blk.x,blk.y);ctx.rotate(blk.angle);
  const hf=blk.flash/350;
  const dmg=1-blk.hp/blk.maxHp;
  const color=BCLR[blk.type];
  const hw=BW/2,hh=BH/2;
  // Pulse for error nodes
  const pulse=blk.isTarget?(Math.sin(t*0.006)*0.3+0.7):1;

  ctx.shadowBlur=blk.isTarget?12+pulse*8:hf>0?16:5;
  ctx.shadowColor=hf>0?"#ffffff":`rgba(${rgb(color)},${hf>0?1:blk.isTarget?0.8:0.4})`;
  rrx(ctx,-hw,-hh,BW,BH,5);
  ctx.fillStyle=hf>0?`rgba(255,255,255,0.25)`:`rgba(${rgb(color)},${0.09+(1-dmg)*0.09})`;
  ctx.fill();
  ctx.strokeStyle=hf>0?`rgba(255,255,255,0.9)`:`rgba(${rgb(color)},${hf>0?1:0.45+(1-dmg)*0.4+(blk.isTarget?0.2:0)})`;
  ctx.lineWidth=blk.isTarget?2:1.5;ctx.stroke();
  ctx.shadowBlur=0;
  // Icon
  ctx.fillStyle=`rgba(${rgb(color)},0.9)`;
  ctx.beginPath();ctx.arc(-hw+8,0,3.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(255,255,255,${0.75-dmg*0.35})`;
  ctx.font=`bold ${BW>55?11:9}px sans-serif`;
  ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(BICO[blk.type],2,-5);
  ctx.font=`${BW>55?7:6}px var(--font-mono-stack,monospace)`;
  ctx.fillStyle=`rgba(255,255,255,${0.5-dmg*0.2})`;
  ctx.fillText(BNME[blk.type],2,6);
  // HP pips
  if(blk.maxHp>1){
    for(let i=0;i<blk.maxHp;i++){
      ctx.fillStyle=i<blk.hp?`rgba(${rgb(color)},0.85)`:"rgba(255,255,255,0.1)";
      ctx.beginPath();ctx.arc(hw-7-i*8,-hh+5,2.5,0,Math.PI*2);ctx.fill();
    }
  }
  // Damage crack
  if(dmg>0){
    ctx.strokeStyle="rgba(0,0,0,0.35)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-hw*0.4,-hh*0.6);ctx.lineTo(hw*0.2,hh*0.4);ctx.stroke();
  }
  ctx.restore();
}

function drawProj(ctx:CanvasRenderingContext2D,p:Proj){
  // Trail
  for(let i=1;i<p.trail.length;i++){
    const a=(i/p.trail.length)*0.45;
    const r=p.r*(i/p.trail.length)*0.6;
    ctx.save();ctx.globalAlpha=a;
    ctx.fillStyle=p.color;ctx.shadowBlur=6;ctx.shadowColor=p.color;
    ctx.beginPath();ctx.arc(p.trail[i].x,p.trail[i].y,r,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  // Ball
  ctx.save();
  ctx.shadowBlur=20;ctx.shadowColor=p.color;
  ctx.fillStyle=p.color;
  ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=8;ctx.shadowColor="rgba(255,255,255,0.8)";
  ctx.fillStyle="rgba(255,255,255,0.7)";
  ctx.beginPath();ctx.arc(p.x-p.r*0.25,p.y-p.r*0.25,p.r*0.28,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawSlingshot(ctx:CanvasRenderingContext2D,lx:number,ly:number,g:GS,now:number){
  const prongL={x:lx-16,y:ly-42};
  const prongR={x:lx+16,y:ly-42};
  const base  ={x:lx,   y:ly+14};
  // Fork body
  ctx.save();
  ctx.lineCap="round";ctx.lineJoin="round";
  ctx.shadowBlur=10;ctx.shadowColor=C.orange;
  ctx.strokeStyle=`rgba(${rgb(C.orange)},0.8)`;ctx.lineWidth=6;
  ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(lx,ly);ctx.stroke();
  ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(prongL.x,prongL.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(prongR.x,prongR.y);ctx.stroke();
  // Prong tips (node dots)
  ctx.fillStyle=C.orange;
  [prongL,prongR].forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();});
  // Rubber band + ball
  const isDragging=g.dragging||g.phase==="aiming";
  const atype=AMMO_QUEUE[g.ammoIdx%AMMO_QUEUE.length];
  const ballColor=AMMO_COLORS[atype];
  const ballX=isDragging?g.dragX:lx;
  const ballY=isDragging?g.dragY:ly-42;
  ctx.shadowBlur=0;
  ctx.strokeStyle=`rgba(255,160,80,${isDragging?0.85:0.5})`;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(prongL.x,prongL.y);ctx.lineTo(ballX,ballY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(prongR.x,prongR.y);ctx.lineTo(ballX,ballY);ctx.stroke();
  // Ball in slingshot (idle/aiming)
  if(g.phase==="ready"||g.phase==="aiming"){
    const pulse=Math.sin(now*0.006)*0.2+0.9;
    ctx.shadowBlur=18*pulse;ctx.shadowColor=ballColor;
    ctx.fillStyle=ballColor;
    ctx.beginPath();ctx.arc(ballX,ballY,PROJ_R+2,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=6;ctx.fillStyle="rgba(255,255,255,0.6)";
    ctx.beginPath();ctx.arc(ballX-3,ballY-3,3.5,0,Math.PI*2);ctx.fill();
  }
  // "SRC" label (n8n Webhook source node label)
  ctx.shadowBlur=0;ctx.globalAlpha=0.45;
  ctx.fillStyle="rgba(255,255,255,0.8)";ctx.font="8px var(--font-mono-stack,monospace)";
  ctx.textAlign="center";ctx.textBaseline="top";
  ctx.fillText("Webhook Trigger",lx,ly+18);
  ctx.restore();
}

function drawPars(ctx:CanvasRenderingContext2D,g:GS){
  for(const p of g.pars){
    ctx.save();ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.color;ctx.shadowBlur=4;ctx.shadowColor=p.color;
    ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    ctx.restore();
  }
}
function drawPops(ctx:CanvasRenderingContext2D,g:GS){
  for(const p of g.pops){
    ctx.save();ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.color;ctx.shadowBlur=10;ctx.shadowColor=p.color;
    ctx.font=p.big?"bold 15px var(--font-mono-stack,monospace)":"bold 13px var(--font-mono-stack,monospace)";
    ctx.textAlign="center";ctx.fillText(p.text,p.x,p.y);
    ctx.restore();
  }
}
