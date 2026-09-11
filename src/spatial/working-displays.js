import * as T from 'three';
import { productionCycle, smooth, wrap, inspectionOffset } from './core/process-motion.js';
import { collectionParcel, collectionGate, collectionStage, collectionTrack, COLLECTION_LENGTH } from './core/consolidation-cycle.js';

const INK='#1c3448', PAPER='#eef0e9', GOLD='#c4a477';
const PALETTE=['#91bdb3','#d6a99f','#c6b6d7','#dbbc77'];
const COPY={
  form:['造型研究','FORM STUDY'], materials:['材料与色彩','MATERIAL STUDY'],
  process:['加工示意','PROCESS STUDY'], inspection:['光学比对','OPTICAL REVIEW'],
  connections:['协作流程','COLLABORATION'], logistics:['集货循环','CONSOLIDATION'],
  welcome:['欢迎来到展厅','WELCOME TO THE SHOWROOM'],library:['探索产品世界','EXPLORE OUR PRODUCTS']
};
const STEPS={feed:['传送','TRANSFER'],locate:['定位','LOCATE'],tool:['加工','TOOLING'],release:['复位','RELEASE']};
const COLLECTION_STEPS={gather:['依次集货','ACCUMULATE'],hold:['暂存成组','GROUP & HOLD'],open:['挡停放行','RELEASE'],dispatch:['整组送出','DISPATCH'],return:['后侧回流','RETURN LOOP']};

// Pure state is also used in lifecycle/cycle checks. No fake live metrics or real CAD claims.
export function workingDisplayFrame(spec,time,lang='zh') {
  const t=time+(spec.offset??0),cycle=productionCycle(t,spec.period??7);
  return {kind:spec.kind,time:t,lang,turn:t*.26,swatch:Math.floor(wrap(t/4,4)),
    scan:(inspectionOffset(t)+.18)/.36,step:cycle.stage,feed:cycle.feed,press:cycle.press,
    connection:wrap(t/3,3),...(spec.kind==='logistics'?{collection:collectionStage(t),parcels:[0,1,2].map(i=>collectionParcel(i,t)),gates:[0,1,2].map(i=>collectionGate(i,t))}:{})};
}

function paint(ctx,state,width,height) {
  const s=state,en=s.lang==='en';
  ctx.setTransform(width/1024,0,0,height/512,0,0);
  ctx.fillStyle=INK;ctx.fillRect(0,0,1024,512);
  const text=(value,x,y,size=24,color=PAPER)=>{ctx.fillStyle=color;ctx.font=`500 ${size}px Arial, "PingFang SC", sans-serif`;ctx.fillText(value,x,y);};
  const line=(points,color=GOLD,width=2)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
  const circle=(x,y,r,color,fill=false)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx[fill?'fillStyle':'strokeStyle']=color;ctx.lineWidth=3;fill?ctx.fill():ctx.stroke();};
  const pill=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(12,h/2));ctx.fill();};
  text('SHOWROOM',32,43,24,GOLD);text(COPY[s.kind][en?1:0],580,43,23);
  line([[32,64],[992,64]],'#3a5266',1);
  text(en?'CONCEPT DEMONSTRATION':'概念演示',32,484,18,'#acbcbf');

  if(s.kind==='welcome'||s.kind==='library') {
    const selected=Math.floor(wrap(s.time/5,3));
    const words=s.kind==='welcome'?(en?['COMPANY','PRODUCTS','GLOBAL']:['认识公司','探索产品','全球连接']):(en?['BEAUTY','PLAY','PARTY']:['美妆护理','儿童探索','生日派对']);
    for(let i=0;i<3;i++){
      const x=180+i*325,y=247;
      circle(x,y,88,i===selected?PALETTE[i]:'#526a7b');
      if(i===0){pill(x-39,y-18,32,73,GOLD);pill(x-34,y-45,22,27,PAPER);pill(x+5,y-41,33,96,PALETTE[0]);}
      else if(i===1){pill(x-43,y-6,39,48,PALETTE[0]);pill(x+4,y-6,39,48,PALETTE[2]);pill(x-20,y-56,40,45,GOLD);}
      else{circle(x-22,y-16,24,PALETTE[1]);circle(x+25,y-26,25,GOLD);line([[x-22,y+8],[x,y+55],[x+25,y-1]],PAPER,2);}
      text(words[i],x-(en?65:54),383,27,i===selected?PAPER:'#8cabae');
      if(i<2)line([[x+100,y],[x+225,y]],'#526a7b',2);
    }
    const progress=wrap(s.time/15,1);line([[90,428],[90+845*progress,428]],GOLD,4);
  } else if(s.kind==='form') {
    // Rotate the same wireframe as a single rigid form; fixed drafting grid below it.
    for(let x=58;x<620;x+=46)line([[x,105],[x,422]],'#244056',1);
    for(let y=105;y<423;y+=40)line([[58,y],[609,y]],'#244056',1);
    const project=(x,y,z)=>{const X=x*Math.cos(s.turn)+z*Math.sin(s.turn),Z=-x*Math.sin(s.turn)+z*Math.cos(s.turn);return [337+X*150,304-y*140+Z*46];};
    const contour=y=>Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2;return project(Math.cos(a),y,Math.sin(a)*.75);});
    for(const y of [0,.16,.36])line(contour(y),y===.36?PAPER:'#8eb8b7',2.5);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;line([project(Math.cos(a),0,Math.sin(a)*.75),project(Math.cos(a),.36,Math.sin(a)*.75)],'#91bdb3',2);}
    // A hinged lid, connected to the rear edge of the compact.
    const lid=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;lid.push(project(Math.cos(a),.36+(Math.sin(a)+1)*.6,-.75+(Math.sin(a)+1)*.26));}line(lid,PAPER,2.5);
    line([[690,145],[925,145]],GOLD,3);
    for(let i=0;i<3;i++){const y=203+i*65;circle(710,y,10,i===Math.floor(wrap(s.time/5,3))?PAPER:'#526a7b',true);line([[747,y],[935-i*25,y]],'#8dabae',5);}
  } else if(s.kind==='materials') {
    const colour=PALETTE[s.swatch];
    const glint=ctx.createRadialGradient(344+Math.cos(s.turn)*48,192,12,360,258,142);
    glint.addColorStop(0,'#fff9e6');glint.addColorStop(.3,colour);glint.addColorStop(1,'#274657');
    circle(366,262,134,glint,true);
    ctx.save();ctx.globalAlpha=.25;ctx.fillStyle='#040f1c';ctx.beginPath();ctx.ellipse(370,411,143,14,0,0,Math.PI*2);ctx.fill();ctx.restore();
    for(let i=0;i<4;i++){pill(620+i%2*165,133+Math.floor(i/2)*140,133,105,PALETTE[i]);if(i===s.swatch){ctx.strokeStyle=PAPER;ctx.lineWidth=4;ctx.strokeRect(612+i%2*165,125+Math.floor(i/2)*140,149,121);}}
  } else if(s.kind==='process') {
    const moving=s.feed;
    line([[82,355],[750,355]],'#9ab3b7',12);
    for(let i=-1;i<=2;i++){
      const x=423+(i+moving-1)*205;
      if(x<90||x>700)continue;
      pill(x-26,260,52,89,'#e1e3d6');pill(x-20,247,40,19,GOLD);
      line([[x-39,348],[x+39,348]],PALETTE[0],7);
    }
    line([[323,174],[323,118],[522,118],[522,174]],'#769295',12);
    pill(396,155+s.press*54,54,61,GOLD);line([[423,216+s.press*54],[423,242+s.press*54]],PAPER,6);
    text(STEPS[s.step][en?1:0],777,230,28);
    const index=['feed','locate','tool','release'].indexOf(s.step);
    for(let i=0;i<4;i++)circle(786+i*43,280,9,i===index?GOLD:'#526a7b',true);
  } else if(s.kind==='inspection') {
    line([[90,117],[587,117],[587,409],[90,409],[90,117]],'#527887',2);
    pill(278,182,120,176,'#709e9d');pill(293,155,90,40,GOLD);
    const scan=130+s.scan*260;
    const beam=ctx.createLinearGradient(0,scan-25,0,scan+12);beam.addColorStop(0,'#7adbc900');beam.addColorStop(1,'#7adbc977');ctx.fillStyle=beam;ctx.fillRect(99,scan-25,479,37);
    line([[100,scan],[578,scan]],'#b5fff0',3);
    for(let i=0;i<3;i++){line([[684,178+i*84],[928,178+i*84]],'#486675',2);circle(696+s.scan*210,178+i*84,7,PALETTE[i],true);}
  } else if(s.kind==='logistics') {
    const project=p=>[353+p.x*121,255+p.z*130];
    const loop=Array.from({length:97},(_,i)=>project(collectionTrack(i/96*COLLECTION_LENGTH)));
    line(loop,'#476672',42);line(loop,'#839e9e',28);
    s.parcels.forEach((p,i)=>{
      const [x,y]=project(p);ctx.save();ctx.translate(x,y);ctx.rotate(-p.yaw);
      pill(-29,-23,58,46,PALETTE[i]);line([[0,-23],[0,23]],PAPER,4);ctx.restore();
    });
    s.gates.forEach((g,i)=>{const [x,y]=project({x:.9-i*.9+.3075,z:.56});line([[x,y-23],[x,y+23]],g>.5?GOLD:'#284b60',g>.5?5:2);});
    text(COLLECTION_STEPS[s.collection][en?1:0],685,234,27);
    for(let i=0;i<3;i++)circle(707+i*48,296,11,PALETTE[i],true);
  } else {
    const nodes=[[204,280],[508,195],[813,300]];
    for(let i=0;i<3;i++){
      const a=nodes[i],b=nodes[(i+1)%3];line([a,b],'#5b7f8c',3);
      const local=wrap(s.connection-i,3);if(local<1){const f=smooth(local);circle(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,8,GOLD,true);}
    }
    const labels=en?['BRIEF','DESIGN','REVIEW']:['需求','设计','反馈'];
    nodes.forEach(([x,y],i)=>{circle(x,y,52,INK,true);circle(x,y,52,PALETTE[i]);text(labels[i],x-(en?38:28),y+9,26);});
  }
}

export function createWorkingDisplays(root) {
  const mounts=[];root.traverse(n=>{if(n.userData.workingDisplay)mounts.push(n);});
  const screens=mounts.map(mount=>{
    const spec=mount.userData.workingDisplay,canvas=document.createElement('canvas');
    canvas.width=1024;canvas.height=512;
    const ctx=canvas.getContext('2d');if(!ctx)throw Error('Working display canvas unavailable');
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
    const material=new T.MeshBasicMaterial({map:texture,toneMapped:false});
    const plane=new T.Mesh(new T.PlaneGeometry(spec.w,spec.h),material);
    plane.name='Concept working display · '+spec.kind;mount.add(plane);
    return {spec,canvas,ctx,texture,plane,lastFrame:-1,lang:null};
  });
  let disposed=false;
  const state={count:screens.length,time:0,frames:0};
  return {
    state,
    update(time,{lang='zh'}={}) {
      if(disposed)return false;
      let changed=false;
      for(const screen of screens) {
        const frame=Math.floor(time*12);
        if(screen.lastFrame===frame&&screen.lang===lang)continue;
        paint(screen.ctx,workingDisplayFrame(screen.spec,frame/12,lang),1024,512);
        screen.texture.needsUpdate=true;screen.lastFrame=frame;screen.lang=lang;changed=true;
      }
      if(changed){state.time=time;state.frames++;}return changed;
    },
    dispose(){
      disposed=true;
      for(const s of screens){s.plane.removeFromParent();s.plane.geometry.dispose();s.plane.material.dispose();s.texture.dispose();s.canvas.width=s.canvas.height=1;}
      screens.length=0;
    }
  };
}
