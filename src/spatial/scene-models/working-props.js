import * as T from 'three';
import { tagAmbient } from '../ambient.js';
import { gearOutline } from '../core/exhibit-motion.js';

// Build-only helpers: explicit drive and support, never motion on an ordinary object.
export function poweredPlatter(a,parent,p,{radius=.76,period=32,holdAt,fullTurn=false}={}) {
  const {group,box,cylinder,ring,tube}=a,base=group('Powered display base',parent,p);
  base.userData.mechanism={kind:'display',support:'bearing',drive:'enclosed gear motor'};
  cylinder(base,radius,.045,'navy',[0,.0225,0]);
  cylinder(base,radius*.75,.027,'steel',[0,.059,0]);
  ring(base,radius*.88,.012,'brass',[0,.056,0]);
  const motor=group('Display drive housing',base,[0,.027,-radius*.7]);
  box(motor,[.17,.045,.12],'navy',[0,0,0],.01);
  for(let i=0;i<4;i++)box(motor,[.006,.01,.007],'steel',[-.05+i*.032,0,-.064],0);
  tube(base,[[0,.024,-radius*.7],[0,.024,-radius*.92],[.2,.024,-radius*.92]],.007,'rubber');
  const platter=tagAmbient(group('Motor-driven exhibition platter',base,[0,.083,0]),{kind:fullTurn?'turntable':'mountedYaw',period,amplitude:.32,holdAt});
  cylinder(platter,radius,.03,'ivory',[0,-.015,0]);
  // Small rim marks make the bearing movement readable without adding screen UI.
  for(let i=0;i<12;i++){const theta=i*Math.PI/6;box(platter,[.02,.007,.02],'brass',[Math.cos(theta)*radius*.95,.002,Math.sin(theta)*radius*.95],.002);}
  return platter;
}

export function discoveryGears(a,parent,p) {
  const {group,box,cylinder,mesh,sign,target}=a,g=group('Powered colour gear demonstrator',parent,p);
  g.userData.mechanism={kind:'gears',drive:'enclosed motor',support:'two fixed axles'};
  target(g,{type:'roomProducts',category:'creative-kits',id:'play-compounds'});
  box(g,[1.34,1.03,.055],'ivory',[.05,.01,0],.035);
  for(const [i,x] of [-.3,.25].entries()) {
    const teeth=i?24:16,shaft=group('Fixed gear shaft',g,[x,0,.052]);
    cylinder(shaft,.034,.13,'brass',[0,0,.05]).rotation.x=Math.PI/2;
    const rotor=tagAmbient(group('Meshing discovery gear',shaft,[0,0,.065]),{kind:'gear',teeth,direction:i?-1:1,period:20});
    if(i)rotor.rotation.z=Math.PI+Math.PI/teeth;
    const points=gearOutline(teeth),shape=new T.Shape(points.map(p=>new T.Vector2(...p)));
    const hub=new T.Path();hub.absarc(0,0,.048,0,Math.PI*2,true);shape.holes.push(hub);
    mesh(rotor,new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false}),i?'teal':'rose',[0,0,-.0225]);
    for(let k=0;k<3;k++){const t=k*Math.PI*2/3;box(rotor,[.08,.025,.007],'ivory',[Math.cos(t)*.13,Math.sin(t)*.13,.026],.005).rotation.z=t;}
    cylinder(shaft,.059,.025,'brass',[0,0,.104]).rotation.x=Math.PI/2;
  }
  box(g,[.16,.2,.13],'navy',[-.3,-.01,-.08],.025);
  box(g,[1.28,.97,.012],'glass',[.05,.01,.205],0);
  for(const x of [-.55,.66])for(const y of [-.4,.4])cylinder(g,.018,.2,'steel',[x,y,.1]).rotation.x=Math.PI/2;
  sign(g,['联动探索'],[.05,-.39,.035],.92,.075,{i18n:{zh:['联动探索 · 演示装置'],en:['GEARED DISCOVERY · DEMONSTRATOR']}});
  return g;
}

export function guidedFixture(a,parent,p) {
  const {group,box,cylinder,sign}=a,g=group('Powered guided clamping fixture',parent,p);
  g.userData.mechanism={kind:'clamp',drive:'pneumatic cylinder',support:'two linear guides'};
  box(g,[.69,.05,.58],'steel',[0,.025,0],.012);
  cylinder(g,.13,.09,'teal',[0,.095,0]);
  for(const x of [-.26,.26])cylinder(g,.022,.74,'steel',[x,.42,0]);
  box(g,[.69,.08,.22],'navy',[0,.79,0],.018);
  cylinder(g,.085,.39,'teal',[0,1.005,0]);
  const head=tagAmbient(group('Guided fixture die and ram',g),{kind:'fixtureClamp',period:9,amplitude:-.23});
  box(head,[.58,.07,.36],'navy',[0,.44,0],.014);
  cylinder(head,.13,.1,'steel',[0,.42,0]); // Lower face: .37 -> .14, meets the fixed puck exactly.
  cylinder(head,.033,.66,'steel',[0,.735,0]);
  for(const x of [-.26,.26])cylinder(head,.043,.12,'brass',[x,.44,0]);
  sign(g,['夹紧演示'],[0,.02,.301],.47,.057,{i18n:{zh:['夹紧 / 停留 / 松开'],en:['CLAMP / HOLD / RELEASE']}});
  return g;
}
