import * as T from 'three';
import {tagAmbient} from '../ambient.js';
import {COLLECTION,COLLECTION_LENGTH,collectionTrack,collectionParcel,collectionGate} from '../core/consolidation-cycle.js';

export function consolidationLoop(a,parent,carton) {
  const {group,box,cylinder,tube,mesh,sign}=a;
  const kraft=a.material('#c0a17a');kraft.name='kraft-paper';kraft.roughness=.93;
  const root=group('Zoned consolidation demonstration loop',parent,[0,0,.12]);
  const stops=[.9,0,-.9].map(x=>x+.3075),beltWidth=.31;
  const track=Array.from({length:129},(_,i)=>collectionTrack(i/128*COLLECTION_LENGTH));
  const outline=offset=>track.map(p=>new T.Vector2(p.x+Math.sin(p.yaw)*offset,-p.z-Math.cos(p.yaw)*offset));
  const slots=shape=>{for(const x of stops){const h=new T.Path();h.moveTo(x-.035,-.56-.27);h.lineTo(x+.035,-.56-.27);h.lineTo(x+.035,-.56+.27);h.lineTo(x-.035,-.56+.27);h.closePath();shape.holes.push(h);}return shape;};
  const plate=new T.Shape([new T.Vector2(-2.45,-.93),new T.Vector2(2.45,-.93),new T.Vector2(2.45,.93),new T.Vector2(-2.45,.93)]);plate.closePath();slots(plate);
  mesh(root,new T.ExtrudeGeometry(plate,{depth:.055,bevelEnabled:false}),'ivory',[0,.945,0],[-Math.PI/2,0,0]);
  const belt=new T.Shape(outline(beltWidth));belt.closePath();const inner=new T.Path(outline(-beltWidth).reverse());inner.closePath();belt.holes.push(inner);slots(belt);
  mesh(root,new T.ExtrudeGeometry(belt,{depth:.03,bevelEnabled:false}),'rubber',[0,1.02,0],[-Math.PI/2,0,0]);
  // Cylindrical rollers have an axisymmetric surface; paired drive rotors make
  // the movement visible without adding a draw call for every identical roller.
  const axis=new T.Vector3(0,1,0);
  for(let s=0;s<COLLECTION_LENGTH;s+=.145){
    const p=collectionTrack(s);
    if(s<3&&stops.some(x=>Math.abs(p.x-x)<.085))continue;
    const roller=cylinder(root,.045,.55,'steel',[p.x,1.05,p.z]);
    roller.quaternion.setFromUnitVectors(axis,new T.Vector3(Math.sin(p.yaw),0,Math.cos(p.yaw)));
  }
  for(const offset of [-.33,.33])tube(root,track.map(p=>[p.x+Math.sin(p.yaw)*offset,1.12,p.z+Math.cos(p.yaw)*offset]),.012,'steel');
  for(const x of [-1.7,1.7])for(const z of [-.44,.44]){
    box(root,[.065,.91,.065],'steel',[x,.475,z],.008);cylinder(root,.065,.025,'rubber',[x,.023,z]);
  }
  for(const z of [-.44,.44])box(root,[3.46,.06,.05],'navy',[0,.37,z],.008);
  for(let i=0;i<3;i++){
    const p=collectionParcel(i,0),carrier=group('Supported consolidation parcel '+i,root,[p.x,1.095,p.z]);carrier.rotation.y=p.yaw;
    tagAmbient(carrier,{kind:'collectionParcel',index:i});
    box(carrier,[.56,.035,.45],'navy',[0,.0175,0],.012);
    const parcel=carton(carrier,[0,.035,0],[.48,.36,.38]);
    parcel.traverse(n=>{if(n.material===a.material('wood'))n.material=kraft;});
    // Rubber locating pads prevent the carton sliding on its carrier.
    for(const x of [-.25,.25])box(carrier,[.025,.025,.4],'rubber',[x,.045,0],.005);
    const rest=-.15*(1-collectionGate(i,0));
    const stop=tagAmbient(group('Retractable accumulation stop '+i,root,[stops[i],rest,.56]),{kind:'collectionGate',index:i});
    box(stop,[.035,.14,.48],'steel',[0,1.105,0],.005);
    box(stop,[.008,.085,.43],'rubber',[-.022,1.13,0],.003);
    cylinder(stop,.021,.22,'steel',[0,.945,0]);cylinder(root,.045,.22,'navy',[stops[i],.855,.56]);
    box(root,[.035,.23,.035],'steel',[.9-i*.9,1.125,.945],.005);
    box(root,[.065,.07,.07],'navy',[.9-i*.9,1.25,.932],.01);
    const eye=cylinder(root,.012,.012,'teal',[.9-i*.9,1.25,.891]);eye.rotation.x=Math.PI/2;
  }
  for(const [i,x] of [-.9,.9].entries()){
    const motor=group('Accumulation zone drive',root,[x,.79,.81]);
    box(motor,[.32,.22,.22],'navy',[0,0,0],.025);
    const rotor=tagAmbient(group('Conveyor drive rotor',motor,[0,0,.125]),{kind:'collectionDrive',index:i});rotor.rotation.x=Math.PI/2;
    cylinder(rotor,.09,.03,'steel',[0,0,0]);box(rotor,[.12,.01,.018],'brass',[0,.02,0],.003);
    tube(root,[[x,.9,.81],[x,.99,.72],[x,1.02,.56]],.023,'steel');
  }
  // Direction arrows sit on the machine apron, outside the parcel envelope.
  const arrowShape=new T.Shape([new T.Vector2(-.05,-.05),new T.Vector2(.055,0),new T.Vector2(-.05,.05)]);arrowShape.closePath();
  for(const x of [-1.9,1.8]){box(root,[.19,.008,.028],'brass',[x,1.005,.875],.003);mesh(root,new T.ExtrudeGeometry(arrowShape,{depth:.006,bevelEnabled:false}),'brass',[x+.12,1.003,.875],[-Math.PI/2,0,0]);}
  const screen=group('Consolidation control monitor',root,[0,1.82,-.07]);
  box(screen,[.84,.45,.065],'navy',[0,0,0],.025);box(screen,[.045,.64,.045],'steel',[0,-.5,-.01],.007);box(screen,[.43,.025,.23],'steel',[0,-.807,0],.008);
  const surface=group('Consolidation work display',screen,[0,0,.036]);surface.userData.workingDisplay={kind:'logistics',w:.76,h:.37};
  sign(root,['集货循环 · 概念演示','CONSOLIDATION CYCLE · CONCEPT'],[0,.818,.956],2.3,.12,{colour:'#1c3448'});
  return root;
}
