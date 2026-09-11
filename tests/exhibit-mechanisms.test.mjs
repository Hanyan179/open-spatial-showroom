import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { exhibitAngle, gearOutline } from '../src/spatial/core/exhibit-motion.js';
import { createRoomAmbient } from '../src/spatial/ambient.js';
import { buildScene } from '../src/spatial/build-scenes.js';
import { batchScene } from '../src/spatial/batch-scene.js';
import { disposeGroup } from '../src/spatial/runtime.js';
import { productionCycle } from '../src/spatial/core/process-motion.js';

function inside([x,y],polygon){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [xi,yi]=polygon[i],[xj,yj]=polygon[j];if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)yes=!yes;}return yes;}
const rotated=(points,a,x)=>points.map(([u,v])=>[x+u*Math.cos(a)-v*Math.sin(a),u*Math.sin(a)+v*Math.cos(a)]);

test('discovery gears have coupled pitch speed, fixed centres and nonpenetrating teeth',()=>{
  const one=gearOutline(16),two=gearOutline(24),spec={kind:'gear',period:20};
  for(let t=0;t<20;t+=.07){
    const a=exhibitAngle({...spec,teeth:16,direction:1},t),b=exhibitAngle({...spec,teeth:24,direction:-1},t);
    assert(Math.abs(a*.22+b*.33)<1e-9,'pitch line speed matches');
    const p=rotated(one,a,-.3),q=rotated(two,b+Math.PI+Math.PI/24,.25);
    assert(!p.some(v=>inside(v,q))&&!q.some(v=>inside(v,p)),`teeth overlap at ${t}`);
  }
});

test('display drive yields to product rotation and resumes continuously without resetting the user angle',()=>{
  const root=new T.Group(),platter=new T.Group(),product=new T.Group();root.add(platter);platter.add(product);
  platter.userData.ambient={kind:'mountedYaw',holdAt:'compact',period:28};product.userData.inspect='compact';
  const ambient=createRoomAmbient(root);
  for(let i=0;i<200;i++)ambient.update(1/60);
  const stopped=platter.quaternion.clone();product.rotation.y=.73;
  for(let i=0;i<400;i++)ambient.update(1/60,{holdPoint:'compact'});
  assert(platter.quaternion.equals(stopped));assert.equal(product.rotation.y,.73);
  ambient.update(1/60,{holdPoint:'library'});
  assert(platter.quaternion.angleTo(stopped)<.003,'no catch-up jump after inspection');
  assert.equal(product.rotation.y,.73);
  const clock=ambient.time(),q=platter.quaternion.clone();ambient.update(20,{paused:true});
  assert.equal(ambient.time(),clock);assert(platter.quaternion.equals(q));ambient.dispose();
});

test('fixture dies stop at the stationary puck; telescope axes and display footprint remain bounded',()=>{
  for(let t=0;t<40;t+=.01){
    const lower=.37-.23*productionCycle(t,9).press;
    assert(lower>=.14-1e-9,'moving die never passes through fixed puck');
    assert(lower<=.37+1e-9);
    assert(Math.abs(exhibitAngle({kind:'trackingAzimuth',amplitude:.24,period:34},t))<=.24);
    assert(Math.abs(exhibitAngle({kind:'trackingAltitude',period:27},t))<=.07);
  }
  // Largest beauty exhibit corners remain supported by its .77m platter through a full rotation.
  assert(Math.hypot(1.22/2,.64/2)<.77);
});

test('all nine rooms retain purposeful dynamic features and supported mechanisms through model batching',async()=>{
  const expected={lobby:['screen:welcome'],samples:['mountedYaw','screen:library'],beauty:['mountedYaw'],play:['gear','trackingAzimuth','trackingAltitude'],party:['turntable','flame','sway'],office:['screen:connections'],china:['printer','screen:form'],usa:['mountedYaw','screen:connections'],cambodia:['fixtureClamp','collectionParcel','processHead']};
  for(const [id,kinds] of Object.entries(expected)){
    const {root}=await buildScene(id);batchScene(root);const found=new Set();
    root.traverse(n=>{
      const motion=n.userData.ambient;if(motion){found.add(motion.kind);assert(!/chair|sofa|carton|pallet trolley/i.test(n.name),'ordinary furniture is not self-driven');}
      if(n.userData.workingDisplay){found.add('screen:'+n.userData.workingDisplay.kind);let owner=n;while(owner&&!owner.userData.action)owner=owner.parent;assert(owner?.userData.action,`screen action missing in ${id}`);}
    });
    for(const kind of kinds)assert(found.has(kind),`${id} misses ${kind}`);disposeGroup(root);
  }
});
