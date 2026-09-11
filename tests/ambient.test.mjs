import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {batchSample} from '../src/spatial/sample-batch.js';
import {batchScene} from '../src/spatial/batch-scene.js';
import {createRoomAmbient,motionValue} from '../src/spatial/ambient.js';
import {meteorPose,createStarfield} from '../src/spatial/starfield.js';
import {facingRegionQuaternion} from '../src/spatial/earth.js';
import {MARKETS} from '../src/spatial/core/markets.js';
import {disposeGroup} from '../src/spatial/runtime.js';

test('geometry batching preserves moving pivots, world-space shape and inherited click actions',()=>{
 const root=new T.Group(),bay=new T.Group(),pivot=new T.Group();root.add(bay);bay.position.set(-5.9,0,2);bay.rotation.y=Math.PI/2;bay.add(pivot);pivot.position.set(.3,1.04,-.1);pivot.userData.ambient={kind:'slide',axis:'x',amplitude:.3};bay.userData.action={type:'region',id:'china',chapter:2};
 for(const x of [-.2,.2]){const m=new T.Mesh(new T.BoxGeometry(.3,.4,.2),new T.MeshStandardMaterial());m.position.set(x,.6,0);pivot.add(m);}
 const sign=new T.Group();sign.userData.sign={text:['SAMPLE']};pivot.add(sign);root.updateMatrixWorld(true);const before=new T.Box3().setFromObject(pivot),rest=pivot.position.clone();batchScene(root);root.updateMatrixWorld(true);const after=new T.Box3().setFromObject(pivot);
 assert(before.min.distanceTo(after.min)<1e-6);assert(before.max.distanceTo(after.max)<1e-6);assert(pivot.position.equals(rest));assert.equal(sign.parent,pivot);pivot.traverse(o=>{if(o.isMesh)assert.deepEqual(o.userData.action,bay.userData.action);});
 const motion=createRoomAmbient(root);motion.update(.05);assert(!pivot.position.equals(rest));disposeGroup(root);
});

test('room animation is bounded, pause-safe, independent per room, and does not accumulate objects',()=>{
 const root=new T.Group(),press=new T.Group(),tree=new T.Group(),turntable=new T.Group();root.add(press,tree,turntable);press.position.set(3,2.08,1);press.userData.ambient={kind:'press',period:7,amplitude:-.09};tree.rotation.z=.1;tree.userData.ambient={kind:'sway',amplitude:.018,period:12};turntable.userData.ambient={kind:'display',period:28,amplitude:.32};
 const ambient=createRoomAmbient(root),other=createRoomAmbient(new T.Group());const ids=root.children.map(n=>n.uuid);
 for(let i=0;i<12000;i++){ambient.update(1/60);assert(press.position.y>=1.99-1e-9&&press.position.y<=2.08);assert(Math.abs(tree.rotation.z-.1)<=.0180001);assert(Math.abs(turntable.rotation.y)<=.32,'the product front stays readable during idle motion');}
 const t=ambient.time(),rotation=turntable.rotation.y;ambient.update(10,{paused:true});assert.equal(ambient.time(),t);assert.equal(turntable.rotation.y,rotation);assert.equal(other.time(),0);assert.deepEqual(root.children.map(n=>n.uuid),ids);
 ambient.update(.05,{reducedMotion:true});assert.equal(ambient.time(),t);assert.equal(turntable.rotation.y,0);assert.equal(press.position.y,2.08);assert.equal(tree.rotation.z,.1);
 for(let i=0;i<300;i++)assert(motionValue({kind:'press',period:7},i/10)>=0&&motionValue({kind:'press',period:7},i/10)<=1);
});

test('meteors are intermittent, fade in and out, and reuse two objects across sky cycles',()=>{
 assert.equal(meteorPose(0).visible,false);assert.equal(meteorPose(6.9).visible,false);assert.equal(meteorPose(8).visible,true);assert.equal(meteorPose(11).visible,false);assert.equal(meteorPose(36).opacity,0);
 for(let t=0;t<300;t+=.1){const p=meteorPose(t);assert(p.opacity>=0&&p.opacity<=.71);assert([p.x,p.y].every(Number.isFinite));}
 const scene=new T.Scene(),sky=createStarfield(scene),count=sky.group.children.length,ids=sky.group.children.map(n=>n.uuid);for(let i=0;i<7000;i++)sky.update(.05);assert.equal(sky.group.children.length,count);assert.deepEqual(sky.group.children.map(n=>n.uuid),ids);sky.update(.05,{reducedMotion:true});assert(sky.group.children.slice(-2).every(n=>!n.visible));disposeGroup(scene);
});


test('regional globe focus keeps north upright while centring every market',()=>{
 for(const m of MARKETS){const [lat,lon]=m.coordinate.map(T.MathUtils.degToRad),q=facingRegionQuaternion(m.coordinate),p=new T.Vector3(Math.cos(lat)*Math.cos(lon),Math.sin(lat),-Math.cos(lat)*Math.sin(lon)).applyQuaternion(q);assert(Math.abs(p.x)<1e-8);assert(p.z>.998);assert(new T.Vector3(0,1,0).applyQuaternion(q).y>.5);}
});


test('product batching retains every instanced groove and decorative element',()=>{
 const root=new T.Group(),m=new T.InstancedMesh(new T.BoxGeometry(.1,.5,.1),new T.MeshStandardMaterial(),5);m.position.set(0,.7,0);root.add(m);const matrix=new T.Matrix4();for(let i=0;i<5;i++)m.setMatrixAt(i,matrix.makeTranslation(i*.4,0,0));root.updateMatrixWorld(true);const before=new T.Box3().setFromObject(root);batchSample(root);root.updateMatrixWorld(true);const after=new T.Box3().setFromObject(root);assert(before.min.distanceTo(after.min)<1e-6);assert(before.max.distanceTo(after.max)<1e-6);assert.equal(root.children.length,1);assert.equal(root.children[0].geometry.index.count,5*36);disposeGroup(root);
});
