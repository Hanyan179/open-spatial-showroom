import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { productionCycle, carrierPosition, printContour } from '../src/spatial/core/process-motion.js';
import { createRoomAmbient } from '../src/spatial/ambient.js';
import { workingDisplayFrame } from '../src/spatial/working-displays.js';
import { buildRegionalScene } from '../src/spatial/regional-scenes.js';
import { batchScene } from '../src/spatial/batch-scene.js';
import { disposeGroup } from '../src/spatial/runtime.js';

test('indexed carriers stop below the tool; cycle wrapping occurs under the end guards',()=>{
  let previous=null;
  for(let t=0;t<70;t+=.01){
    const c=productionCycle(t),positions=[-1,0,1].map(slot=>carrierPosition({slot},t)).sort((a,b)=>a-b);
    assert(Math.abs(positions[1]-positions[0]-1.8)<1e-8);
    assert(Math.abs(positions[2]-positions[1]-1.8)<1e-8);
    if(c.press>0){assert.equal(c.feed,1);assert(positions.some(x=>Math.abs(x)<1e-8));}
    const x=carrierPosition({slot:0},t);
    if(previous!==null&&Math.abs(x-previous)>1){assert(Math.abs(x)>2.6);assert(Math.abs(previous)>2.6);}
    previous=x;
  }
});

test('printer nozzle follows the part contour while bed stays on its fixed guide rails',()=>{
  for(let t=0;t<18;t+=.01){
    const a=printContour(t),b=printContour(t+.01);
    assert(Math.abs(a.x)<=.290001&&Math.abs(a.z)<=.190001);
    assert(Math.hypot(a.x-b.x,a.z-b.z)<.006,'no discontinuity at contour corners');
    const nextCycle=printContour(t+9);assert(Math.hypot(a.x-nextCycle.x,a.z-nextCycle.z)<1e-9);
  }
});

test('machine and screen state freeze together, resume without time jumps and dispose cleanly',()=>{
  const root=new T.Group(),carrier=new T.Group(),head=new T.Group(),manual=new T.Group();root.add(carrier,head,manual);
  carrier.position.x=1.8;carrier.userData.ambient={kind:'carrier',slot:1};
  head.userData.ambient={kind:'processHead'};manual.userData.inspect='lipstick';manual.rotation.y=1.1;
  const room=createRoomAmbient(root);
  for(let i=0;i<84;i++)room.update(1/60);
  const spec={kind:'process'},clock=room.time(),pose=carrier.position.clone(),frame=workingDisplayFrame(spec,clock);
  for(let i=0;i<120;i++)room.update(1/60,{paused:true});
  assert.equal(room.time(),clock);assert(carrier.position.equals(pose));assert.deepEqual(workingDisplayFrame(spec,room.time()),frame);
  room.update(1/60);assert(Math.abs(room.time()-clock-1/60)<1e-9);assert.equal(manual.rotation.y,1.1);
  assert.equal(room.update(.01,{reducedMotion:true}),true,'restoring geometry requests a render');
  assert.equal(carrier.position.x,1.8);assert.equal(head.position.y,0);
  assert.equal(room.update(.01,{reducedMotion:true}),false);
  const stopped=room.time();room.dispose();room.update(1);assert.equal(room.time(),stopped);assert.equal(room.actors.length,0);
});

test('built regional models preserve working parts and screen click ownership through batching',()=>{
  for(const id of ['china','cambodia','usa']){
    const {root}=buildRegionalScene(id);batchScene(root);
    let screens=0,carriers=0,printers=0;
    root.traverse(n=>{
      if(n.userData.workingDisplay){
        screens++;let owner=n;while(owner&&!owner.userData.action)owner=owner.parent;
        assert.equal(owner?.userData.action.type,'region');assert.equal(owner?.userData.action.id,id);
      }
      if(n.userData.ambient?.kind==='carrier')carriers++;
      if(n.userData.ambient?.kind==='printer')printers++;
    });
    assert(screens>=2);if(id==='cambodia')assert.equal(carriers,3);if(id==='china')assert.equal(printers,1);
    disposeGroup(root);
  }
});
