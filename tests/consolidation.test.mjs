import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createRoomAmbient} from '../src/spatial/ambient.js';
import {COLLECTION,COLLECTION_LENGTH,collectionTrack,collectionParcel,collectionGate,collectionStage} from '../src/spatial/core/consolidation-cycle.js';
import {tourDwell} from '../src/spatial/catalog.js';

test('three parcels follow a continuous closed conveyor without jumps, reversals or collisions',()=>{
  let previous=[0,1,2].map(i=>collectionParcel(i,0));
  for(let t=.01;t<66;t+=.01){
    const boxes=[0,1,2].map(i=>collectionParcel(i,t));
    boxes.forEach((p,i)=>{
      assert(p.distance>=previous[i].distance-1e-8);
      assert(Math.hypot(p.x-previous[i].x,p.z-previous[i].z)<.02,'continuous speed at cycle/curve boundaries');
      const next=collectionParcel(i,t+.001),dx=next.x-p.x,dz=next.z-p.z;
      if(Math.hypot(dx,dz)>1e-8)assert(dx*Math.cos(p.yaw)-dz*Math.sin(p.yaw)>0,'parcel faces forward along its path');
    });
    for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)assert(Math.hypot(boxes[a].x-boxes[b].x,boxes[a].z-boxes[b].z)>.72,'carrier envelopes stay separated');
    previous=boxes;
  }
  for(let i=0;i<3;i++){
    const a=collectionParcel(i,0),b=collectionParcel(i,COLLECTION.period);
    assert(Math.hypot(a.x-b.x,a.z-b.z)<1e-9);assert(Math.abs(b.distance-a.distance-COLLECTION_LENGTH)<1e-9);
  }
});

test('each gate rises only after preceding freight clears it, then all gates lower before dispatch',()=>{
  for(let t=0;t<22;t+=.01){
    const boxes=[0,1,2].map(i=>collectionParcel(i,t));
    for(let i=0;i<3;i++){
      const gate=collectionGate(i,t),x=.9-i*.9+.3075;
      if(gate<.5)continue;
      for(const p of boxes){
        if(Math.abs(p.z-COLLECTION.radius)<.005&&Math.abs(p.yaw)<1e-5)
          assert(Math.abs(p.x-x)>=COLLECTION.trayLength/2+.02,'raised gate never passes through a carrier');
      }
    }
  }
  for(const t of [9.5,10.5,11.5]){
    assert.equal(collectionStage(t),'hold');
    for(let i=0;i<3;i++){assert.equal(collectionGate(i,t),1);assert(Math.abs(collectionParcel(i,t).x-(.9-i*.9))<1e-9);}
  }
  assert([0,1,2].every(i=>collectionGate(i,12.2)===0));
});

test('track tangent is continuous and parcels remain supported at both curved ends',()=>{
  for(let s=0;s<COLLECTION_LENGTH;s+=.01){
    const p=collectionTrack(s),n=collectionTrack(s+.001);
    assert(Math.hypot(p.x-n.x,p.z-n.z)<.001001);
    // Carrier corners stay within the .31 m-wide support on either side of the centreline.
    for(const x of [-.28,.28])for(const z of [-.225,.225]){
      const px=p.x+x*Math.cos(p.yaw)+z*Math.sin(p.yaw),pz=p.z-x*Math.sin(p.yaw)+z*Math.cos(p.yaw);
      let distance=Infinity;
      for(let d=0;d<COLLECTION_LENGTH;d+=.025){const q=collectionTrack(d);distance=Math.min(distance,Math.hypot(px-q.x,pz-q.z));}
      assert(distance<.31,'carrier corners are over the conveyor bed');
    }
  }
});

test('the collection tour stop has time to show a complete workflow cycle',()=>{
  assert(tourDwell('cambodia','delivery')>=COLLECTION.period*1000+2000);
  assert.equal(tourDwell('cambodia','quality'),14000);
});

test('parcel heading survives GLB quaternion-to-Euler normalization and remains upright',()=>{
  const root=new T.Group(),boxes=[0,1,2].map(index=>{
    const p=collectionParcel(index,0),box=new T.Group();
    box.position.set(p.x,1.095,p.z);
    box.quaternion.setFromEuler(new T.Euler(0,p.yaw,0)); // GLTFLoader restores a quaternion, not authored Euler angles.
    box.userData.ambient={kind:'collectionParcel',index};root.add(box);return box;
  });
  const room=createRoomAmbient(root);
  for(let frame=0;frame<1500;frame++){
    room.update(1/60);
    boxes.forEach((b,i)=>{
      const p=collectionParcel(i,room.time()),forward=new T.Vector3(1,0,0).applyQuaternion(b.quaternion);
      assert(forward.distanceTo(new T.Vector3(Math.cos(p.yaw),0,-Math.sin(p.yaw)))<1e-8);
      assert(new T.Vector3(0,1,0).applyQuaternion(b.quaternion).distanceTo(new T.Vector3(0,1,0))<1e-8);
      assert.equal(b.position.y,1.095);
    });
  }
});
