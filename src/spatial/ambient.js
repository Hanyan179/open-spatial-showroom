import { productionCycle, carrierPosition, printContour, inspectionOffset } from './core/process-motion.js';
import { exhibitAngle } from './core/exhibit-motion.js';
import { collectionParcel, collectionGate } from './core/consolidation-cycle.js';

// Each room owns its own clock. Hidden rooms and reading overlays never advance it.
// Transform from the rest pose every frame; never accumulate camera or model drift.
export function motionValue(spec,time){
 const phase=spec.phase||0,period=spec.period||12,w=(time/period+phase)*Math.PI*2;
 if(spec.kind==='turntable')return time*Math.PI*2/period;
 if(spec.kind==='press'){
  const p=((time/period+phase)%1+1)%1;
  const ease=t=>t*t*(3-2*t);
  return p<.2?0:p<.4?ease((p-.2)/.2):p<.58?1:p<.8?1-ease((p-.58)/.22):0;
 }
 return Math.sin(w)*.8+Math.sin(w*.53+phase)*.2;
}

export function createRoomAmbient(root){
 const actors=[];let time=0,disposed=false,atRest=true;
 root.traverse(node=>{const spec=node.userData.ambient;if(!spec)return;actors.push({node,spec,position:node.position.clone(),rotation:node.rotation.clone(),scale:node.scale.clone(),held:0});});
 function pose(clock,dt,holdPoint){for(const a of actors){const {node,spec,position,rotation,scale}=a;if(spec.holdAt&&spec.holdAt===holdPoint){a.held+=dt;continue;}const t=clock-a.held,v=motionValue(spec,t);node.position.copy(position);node.rotation.copy(rotation);node.scale.copy(scale);
  if(spec.kind==='mountedYaw'||spec.kind==='trackingAzimuth')node.rotateY(exhibitAngle(spec,t));
  else if(spec.kind==='trackingAltitude')node.rotateX(exhibitAngle(spec,t));
  else if(spec.kind==='gear')node.rotateZ(exhibitAngle(spec,t));
  else if(spec.kind==='fixtureClamp')node.position.y+=productionCycle(t,spec.period).press*(spec.amplitude??-.23);
  else if(spec.kind==='collectionParcel'){const p=collectionParcel(spec.index,t);node.position.x=p.x;node.position.z=p.z;node.rotation.set(0,p.yaw,0);}
  else if(spec.kind==='collectionGate')node.position.y+=.15*(collectionGate(spec.index,t)-collectionGate(spec.index,0));
  else if(spec.kind==='collectionDrive'){let distance=0;for(let i=0;i<3;i++)distance+=collectionParcel(i,t).distance-collectionParcel(i,0).distance;node.rotateY(-distance/(3*.09));}
  else if(spec.kind==='carrier')node.position.x+=carrierPosition(spec,t)-(spec.slot??0)*(spec.pitch??1.8);
  else if(spec.kind==='processHead')node.position.y+=productionCycle(t,spec.period).press*(spec.amplitude??-.2);
  else if(spec.kind==='drive')node.rotateY(productionCycle(t,spec.period).travel*(spec.pitch??1.8)/(spec.radius??.14));
  else if(spec.kind==='printer')node.position.x+=printContour(t,spec.period).x;
  else if(spec.kind==='printerBed')node.position.z-=printContour(t,spec.period).z;
  else if(spec.kind==='scanner')node.position.z+=inspectionOffset(t);
  else if(spec.kind==='turntable')node.rotateY(v);
  else if(spec.kind==='display')node.rotation.y+=v*(spec.amplitude??.32);
  else if(spec.kind==='press'||spec.kind==='slide')node.position[spec.axis||'y']+=v*(spec.amplitude??.15);
  else if(spec.kind==='flame'){node.scale.y*=1+v*.1;node.rotation.z+=v*.07;}
  else {node.rotation.z+=v*(spec.amplitude??.015);node.rotation.x+=Math.sin(t*.37+(spec.phase||0))*(spec.amplitude??.015)*.4;}
 }}
 return {actors,time:()=>time,update(dt,{paused=false,reducedMotion=false,holdPoint=null}={}){
  if(disposed||paused)return false;
  if(reducedMotion){
   if(atRest)return false;
   for(const a of actors){a.node.position.copy(a.position);a.node.rotation.copy(a.rotation);a.node.scale.copy(a.scale);}
   atRest=true;return actors.length>0;
  }
  const delta=Math.min(Math.max(dt,0),.05);time+=delta;pose(time,delta,holdPoint);atRest=false;return actors.length>0;
 },dispose(){disposed=true;actors.length=0;}};
}

export function tagAmbient(node,spec){node.userData.ambient=spec;return node;}
