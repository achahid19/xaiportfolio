"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#0d0d12", orange:"#FF6D5A", green:"#14F195", blue:"#4D9DE0",
  yellow:"#F0C040", purple:"#9945FF", red:"#ff4444", gray:"#555",
} as const;

function rgb(h:string){
  const s=h.replace("#","");
  return`${parseInt(s.slice(0,2),16)},${parseInt(s.slice(2,4),16)},${parseInt(s.slice(4,6),16)}`;
}

// ─── Node types (pipe blocks) ─────────────────────────────────────────────────
type NType="webhook"|"http"|"if"|"set"|"code"|"error";
const NCLR:Record<NType,string>={webhook:C.orange,http:C.blue,if:C.yellow,set:C.purple,code:C.gray,error:C.red};
const NICO:Record<NType,string>={webhook:"⚡",http:"↗",if:"◇",set:"≡",code:"{}",error:"✕"};
const NNME:Record<NType,string>={webhook:"Webhook",http:"HTTP",if:"IF Node",set:"Set",code:"Code",error:"Error"};
const NORMAL_TYPES:NType[]=["webhook","http","if","set","code"];

// ─── Physics ──────────────────────────────────────────────────────────────────
const GRAVITY   = 0.45;
const FLAP_VY   = -8.5;
const PLAYER_R  = 14;
const PIPE_W    = 76;
const GAP_H     = 148;
const GROUND_H  = 58;
const BW        = PIPE_W - 6;
const BH        = 40;
const PLAYER_X_FRAC = 0.2;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pipe { x:number; gapY:number; passed:boolean; top:NType[]; bot:NType[]; flashAlpha:number; }
interface Arc  { x1:number;y1:number; x2:number;y2:number; cx:number;cy:number; t:number; color:string; }
interface Par  { x:number;y:number;vx:number;vy:number;life:number;color:string;size:number; }

interface GS {
  phase:"idle"|"playing"|"dead";
  py:number; vy:number; rot:number;
  pipes:Pipe[];
  score:number; best:number;
  speed:number; spawnBudget:number;
  arcs:Arc[]; pars:Par[];
  frame:number;
  deathTimer:number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initGS():GS{
  return{phase:"idle",py:0,vy:0,rot:0,pipes:[],score:0,best:0,
    speed:3.2,spawnBudget:0,arcs:[],pars:[],frame:0,deathTimer:0};
}

function makePipe(spawnX:number,H:number):Pipe{
  const minY = 60 + GAP_H/2;
  const maxY = H - GROUND_H - GAP_H/2 - 20;
  const gapY = minY + Math.random()*(maxY-minY);
  const topH = gapY - GAP_H/2;
  const botH = H - GROUND_H - (gapY + GAP_H/2);
  const topCount = Math.max(1, Math.floor(topH/(BH+4)));
  const botCount = Math.max(1, Math.floor(botH/(BH+4)));
  const top = Array.from({length:topCount},()=>NORMAL_TYPES[Math.floor(Math.random()*NORMAL_TYPES.length)]);
  const bot = Array.from({length:botCount},()=>NORMAL_TYPES[Math.floor(Math.random()*NORMAL_TYPES.length)]);
  // sprinkle error nodes
  if(Math.random()<0.45&&top.length>1) top[Math.floor(Math.random()*top.length)]="error";
  if(Math.random()<0.45&&bot.length>1) bot[Math.floor(Math.random()*bot.length)]="error";
  return{x:spawnX,gapY,passed:false,top,bot,flashAlpha:0};
}

function spawnInterval(score:number):number{ return Math.max(200,330-score*2.5); }

function rrx(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// ─── Component ────────────────────────────────────────────────────────────────
export function NodeHop(){
  const cvs   = useRef<HTMLCanvasElement>(null);
  const gs    = useRef<GS>(initGS());
  const [uiPhase, setUiPhase] = useState<GS["phase"]>("idle");
  const [uiScore, setUiScore] = useState(0);
  const [uiBest,  setUiBest]  = useState(0);

  useEffect(()=>{
    const b=parseInt(localStorage.getItem("nh-best")??"0",10);
    if(b>0){gs.current.best=b;setUiBest(b);}
  },[]);

  const flap=useCallback(()=>{
    const g=gs.current;
    const c=cvs.current!;
    if(g.phase==="idle"){
      g.phase="playing";
      g.py=c.height/2;
      g.vy=FLAP_VY;
      g.pipes=[];
      g.score=0;
      g.speed=3.2;
      g.spawnBudget=0;
      g.arcs=[];g.pars=[];
      g.frame=0;
      setUiScore(0);
      setUiPhase("playing");
    } else if(g.phase==="playing"){
      g.vy=FLAP_VY;
      // flap particles
      const px=c.width*PLAYER_X_FRAC;
      for(let i=0;i<6;i++){
        const a=Math.PI+(Math.random()-0.5)*1.4;
        const s=1.5+Math.random()*3;
        g.pars.push({x:px,y:g.py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-0.5,life:1,color:C.green,size:2+Math.random()*2.5});
      }
    } else if(g.phase==="dead"&&g.deathTimer<=0){
      g.phase="idle";
      g.pipes=[];g.arcs=[];g.pars=[];
      setUiPhase("idle");
    }
  },[]);

  // keyboard
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();flap();}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[flap]);

  // game loop
  useEffect(()=>{
    const c=cvs.current!;
    const ctx=c.getContext("2d")!;
    let raf=0;

    function resize(){
      const p=c.parentElement!;
      c.width=p.clientWidth;c.height=p.clientHeight;
      if(gs.current.phase==="idle") gs.current.py=c.height/2;
    }
    resize();
    const ro=new ResizeObserver(resize);ro.observe(c.parentElement!);

    let last=0;
    function loop(now:number){
      const dt=Math.min(now-(last||now),40);last=now;
      const g=gs.current;
      const W=c.width,H=c.height;

      if(g.phase==="playing") update(g,W,H,dt);
      else if(g.phase==="dead"){
        g.deathTimer=Math.max(0,g.deathTimer-dt);
        tickParticles(g,dt);tickArcs(g,dt);
      }

      drawScene(ctx,g,W,H,now);
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function update(g:GS,W:number,H:number,dt:number){
    const px=W*PLAYER_X_FRAC;
    const gy=H-GROUND_H;
    g.frame++;

    // player physics
    g.vy+=GRAVITY;
    g.vy=Math.min(g.vy,14);
    g.py+=g.vy;
    g.rot=Math.max(-0.5,Math.min(Math.PI*0.5,g.vy*0.075));

    // speed ramp
    g.speed=3.2+g.score*0.08;

    // pipe spawning
    g.spawnBudget+=g.speed;
    const si=spawnInterval(g.score);
    if(g.spawnBudget>=si){
      g.pipes.push(makePipe(W+PIPE_W+10,H));
      g.spawnBudget-=si;
    }

    // move pipes + score
    for(const p of g.pipes){
      p.x-=g.speed;
      p.flashAlpha=Math.max(0,p.flashAlpha-dt/300);
      if(!p.passed&&p.x+PIPE_W<px){
        p.passed=true;
        g.score++;
        if(g.score>g.best){
          g.best=g.score;
          localStorage.setItem("nh-best",String(g.score));
          setUiBest(g.score);
        }
        setUiScore(g.score);
        p.flashAlpha=1;
        // execution arc VFX
        g.arcs.push({
          x1:p.x+PIPE_W/2,y1:p.gapY,
          x2:px,y2:g.py,
          cx:(p.x+px)/2,cy:p.gapY-80,
          t:0,color:C.green,
        });
      }
    }
    g.pipes=g.pipes.filter(p=>p.x>-PIPE_W-20);

    tickParticles(g,dt);tickArcs(g,dt);

    // collision — ceiling/ground
    if(g.py-PLAYER_R<=2||g.py+PLAYER_R>=gy){die(g,px,g.py);return;}

    // collision — pipes
    for(const p of g.pipes){
      const left=p.x,right=p.x+PIPE_W;
      const top=p.gapY-GAP_H/2,bot=p.gapY+GAP_H/2;
      if(px+PLAYER_R>left&&px-PLAYER_R<right){
        if(g.py-PLAYER_R<top||g.py+PLAYER_R>bot){die(g,px,g.py);return;}
      }
    }
  }

  function die(g:GS,px:number,py:number){
    g.phase="dead";g.deathTimer=900;setUiPhase("dead");
    for(let i=0;i<24;i++){
      const a=Math.PI*2*i/24+Math.random()*0.25;
      const s=2+Math.random()*5.5;
      g.pars.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:1.4,
        color:i%3===0?C.orange:i%3===1?C.red:"#fff",size:2+Math.random()*3.5});
    }
    g.arcs.push({x1:px,y1:py,x2:px+90,y2:py-50,cx:px+45,cy:py-100,t:0,color:C.red});
  }

  function tickParticles(g:GS,dt:number){
    for(const p of g.pars){p.x+=p.vx;p.y+=p.vy;p.vy+=0.06;p.vx*=0.92;p.life-=dt/550;}
    g.pars=g.pars.filter(p=>p.life>0);
  }
  function tickArcs(g:GS,dt:number){
    for(const a of g.arcs)a.t=Math.min(1,a.t+dt/600);
    g.arcs=g.arcs.filter(a=>a.t<1.05);
  }

  const ph=uiPhase;
  return(
    <div className="nh-root">
      <canvas ref={cvs} className="nh-canvas" onClick={flap} style={{cursor:"pointer"}}/>

      {ph==="playing"&&<div className="nh-score mono">{uiScore}</div>}

      {ph==="idle"&&(
        <div className="nh-overlay">
          <div className="nh-overlay-inner">
            <div className="eyebrow mono">Playground</div>
            <h2 className="nh-title">Node Hop</h2>
            <p className="nh-desc mono">
              Guide the data packet through the node pipeline.<br/>
              Avoid the node blocks — reach the output!<br/>
              <span style={{opacity:.6}}>Space / click to flap</span>
            </p>
            {uiBest>0&&<div className="nh-best-tag mono">Best <strong>{uiBest}</strong> executions</div>}
            <button className="btn btn-primary nh-start-btn" onClick={flap}>Launch →</button>
          </div>
        </div>
      )}

      {ph==="dead"&&(
        <div className="nh-overlay">
          <div className="nh-overlay-inner">
            <div className="eyebrow mono" style={{color:C.red}}>Execution Failed</div>
            <div className="nh-final-score mono">{uiScore}</div>
            <div className="nh-best-tag mono">Best <strong>{uiBest}</strong></div>
            <p className="nh-desc mono" style={{fontSize:"12px",opacity:.55}}>
              Space / click to retry
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
function drawScene(ctx:CanvasRenderingContext2D,g:GS,W:number,H:number,now:number){
  const gy=H-GROUND_H;
  const px=W*PLAYER_X_FRAC;

  // bg
  ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);

  // grid
  ctx.strokeStyle="rgba(255,255,255,0.022)";ctx.lineWidth=0.5;
  ctx.beginPath();
  for(let x=0;x<W;x+=40){ctx.moveTo(x,0);ctx.lineTo(x,H);}
  for(let y=0;y<H;y+=40){ctx.moveTo(0,y);ctx.lineTo(W,y);}
  ctx.stroke();

  // ground
  const gg=ctx.createLinearGradient(0,gy,0,H);
  gg.addColorStop(0,"rgba(20,241,149,0.1)");
  gg.addColorStop(0.5,"rgba(12,12,22,0.97)");
  gg.addColorStop(1,"#09090f");
  ctx.fillStyle=gg;ctx.fillRect(0,gy,W,GROUND_H);
  ctx.strokeStyle="rgba(20,241,149,0.35)";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();
  // bus label
  ctx.save();ctx.globalAlpha=0.18;ctx.fillStyle="#14F195";
  ctx.font="7px var(--font-mono-stack,monospace)";ctx.textAlign="left";ctx.textBaseline="top";
  ctx.fillText("── pipeline bus ──────────────────────────────────────────────────────",10,gy+7);
  ctx.restore();

  if(g.phase==="idle"){
    // idle: show a single centered pipe for preview
    const previewPipe:Pipe={x:W*0.55,gapY:H/2,passed:false,
      top:["webhook","http","if"] as NType[],
      bot:["set","code"] as NType[],flashAlpha:0};
    drawPipe(ctx,previewPipe,H,gy);
    // player hover
    const hover=Math.sin(now*0.003)*7;
    drawPlayer(ctx,px,H/2+hover,0,"idle",0,now);
    return;
  }

  // pipes
  for(const p of g.pipes) drawPipe(ctx,p,H,gy);

  // score flash "+1" on pass
  for(const p of g.pipes){
    if(p.flashAlpha>0){
      ctx.save();ctx.globalAlpha=p.flashAlpha;
      ctx.fillStyle=C.green;ctx.shadowBlur=12;ctx.shadowColor=C.green;
      ctx.font="bold 17px var(--font-mono-stack,monospace)";
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText("+1 exec",p.x+PIPE_W/2,p.gapY);
      ctx.restore();
    }
  }

  // execution arcs (VFX)
  for(const a of g.arcs){
    const t=a.t;
    const bx=(1-t)*(1-t)*a.x1+2*(1-t)*t*a.cx+t*t*a.x2;
    const by=(1-t)*(1-t)*a.y1+2*(1-t)*t*a.cy+t*t*a.y2;
    ctx.save();
    ctx.globalAlpha=Math.sin(t*Math.PI)*0.75;
    ctx.shadowBlur=14;ctx.shadowColor=a.color;
    ctx.fillStyle=a.color;
    ctx.beginPath();ctx.arc(bx,by,4.5,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=Math.sin(t*Math.PI)*0.18;
    ctx.strokeStyle=a.color;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(a.x1,a.y1);ctx.quadraticCurveTo(a.cx,a.cy,bx,by);ctx.stroke();
    ctx.restore();
  }

  // particles
  for(const p of g.pars){
    ctx.save();ctx.globalAlpha=Math.max(0,p.life*0.85);
    ctx.fillStyle=p.color;ctx.shadowBlur=5;ctx.shadowColor=p.color;
    ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    ctx.restore();
  }

  // player
  drawPlayer(ctx,px,g.py,g.rot,g.phase,g.frame,now);
}

function drawPipe(ctx:CanvasRenderingContext2D,pipe:Pipe,H:number,gy:number){
  const topEdge=pipe.gapY-GAP_H/2;
  const botEdge=pipe.gapY+GAP_H/2;
  const bx=pipe.x+3;

  // top blocks: stack downward from topEdge
  let y=topEdge-BH;
  for(let i=0;i<pipe.top.length&&y>-BH*2;i++){
    drawNodeBlock(ctx,bx,y,pipe.top[i]);
    y-=BH+4;
  }

  // bottom blocks: stack upward from botEdge
  y=botEdge;
  for(let i=0;i<pipe.bot.length&&y<gy;i++){
    drawNodeBlock(ctx,bx,y,pipe.bot[i]);
    y+=BH+4;
  }

  // gap dashed divider
  ctx.save();
  ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.lineWidth=1;
  ctx.setLineDash([3,7]);
  ctx.beginPath();ctx.moveTo(pipe.x+PIPE_W/2,topEdge);ctx.lineTo(pipe.x+PIPE_W/2,botEdge);ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawNodeBlock(ctx:CanvasRenderingContext2D,x:number,y:number,type:NType){
  const color=NCLR[type];
  ctx.save();
  ctx.shadowBlur=type==="error"?12:5;
  ctx.shadowColor=`rgba(${rgb(color)},0.65)`;
  rrx(ctx,x,y,BW,BH,4);
  ctx.fillStyle=`rgba(${rgb(color)},0.1)`;ctx.fill();
  ctx.strokeStyle=`rgba(${rgb(color)},0.5)`;ctx.lineWidth=1.5;ctx.stroke();
  ctx.shadowBlur=0;
  // left dot
  ctx.fillStyle=`rgba(${rgb(color)},0.9)`;
  ctx.beginPath();ctx.arc(x+7,y+BH/2,3,0,Math.PI*2);ctx.fill();
  // icon
  ctx.fillStyle="rgba(255,255,255,0.85)";
  ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(NICO[type],x+BW/2,y+BH/2-5);
  // name
  ctx.font="7px var(--font-mono-stack,monospace)";
  ctx.fillStyle="rgba(255,255,255,0.4)";
  ctx.fillText(NNME[type],x+BW/2,y+BH/2+7);
  ctx.restore();
}

function drawPlayer(
  ctx:CanvasRenderingContext2D,
  x:number,y:number,rot:number,
  phase:GS["phase"]|"idle",frame:number,now:number
){
  void frame;
  ctx.save();
  ctx.translate(x,y);ctx.rotate(rot);

  const dead=phase==="dead";
  const pulse=Math.sin(now*0.007)*0.18+0.85;
  const r=PLAYER_R;

  // glow
  ctx.shadowBlur=dead?8:24*pulse;
  ctx.shadowColor=dead?C.red:C.green;

  // body
  const grad=ctx.createRadialGradient(-r*0.3,-r*0.3,0,0,0,r);
  grad.addColorStop(0,dead?"#ff8888":"#7fffdd");
  grad.addColorStop(1,dead?C.red:C.green);
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
  ctx.fillStyle=grad;ctx.fill();

  // output dot (n8n style)
  ctx.shadowBlur=0;
  ctx.fillStyle="rgba(255,255,255,0.9)";
  ctx.beginPath();ctx.arc(r-2,0,3.5,0,Math.PI*2);ctx.fill();

  // inner icon
  ctx.fillStyle="rgba(10,10,18,0.75)";
  ctx.font="bold 10px sans-serif";
  ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(dead?"✕":"⚡",0,0);

  // trailing dashed connection line
  if(phase==="playing"){
    ctx.shadowBlur=7;ctx.shadowColor=C.green;
    ctx.strokeStyle=`rgba(${rgb(C.green)},${0.28*pulse})`;
    ctx.lineWidth=1.5;ctx.setLineDash([4,7]);
    ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(-r-34,0);ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}
