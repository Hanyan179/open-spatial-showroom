import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, SCENE_DEFINITIONS, FLOORS, REGISTRY } from '../src/spatial/core/scene-registry.js';
import { createSceneRegistry } from '../src/spatial/core/registry.js';
import { orderedStops, areaAt, visiblePins } from '../src/spatial/core/areas.js';
import { resolveAction, hotspotDestination } from '../src/spatial/core/action-router.js';
import { contentLinkErrors } from '../src/spatial/core/content-links.js';
import { buildScene } from '../src/spatial/build-scenes.js';
import { batchScene } from '../src/spatial/batch-scene.js';
import { disposeGroup } from '../src/spatial/runtime.js';

test('rooms can grow beyond three stops; every configured stop has one physical area', () => {
  assert(SCENES.lobby.points.length > 3);
  assert.equal(areaAt(SCENES.lobby,'story').id,'story');
  assert.equal(areaAt(SCENES.lobby,'partners').id,'story');
  assert.deepEqual(orderedStops(SCENES.beauty).map(p=>p.id), ['lipstick','serum','compact','brushes','sponges','library']);
  assert.deepEqual(SCENES.beauty.tour, ['overview',...orderedStops(SCENES.beauty).map(p=>p.id)]);
  assert.deepEqual(SCENES.party.tour, ['overview',...orderedStops(SCENES.party).map(p=>p.id)]);
  const defs=structuredClone(SCENE_DEFINITIONS);
  defs.find(s=>s.id==='beauty').areas[1].points=['lipstick'];
  assert.throws(()=>createSceneRegistry(defs,FLOORS),/missing or repeated stop/);
});
test('only three visible, unoccluded, non-overlapping nearby hotspots are selected', () => {
  const candidates=Array.from({length:6},(_,i)=>({id:String(i),visible:true,distance:6-i,x:i%3*.5,y:Math.floor(i/3)*.5}));
  assert.deepEqual([...visiblePins(candidates)],['5','4','3']);
  candidates[5].visible=false;
  candidates[4].x=candidates[3].x;
  assert.deepEqual([...visiblePins(candidates)],['4','2','1']);
  assert.equal(visiblePins(candidates.map(p=>({...p,visible:false}))).size,0);
});
test('physical direction entries use scene navigation; company and library actions resolve to real stops', () => {
  assert.deepEqual(resolveAction({type:'scene',id:'beauty'},'samples'),{kind:'navigate',scene:'beauty'});
  assert.equal(hotspotDestination({type:'company',id:'history'},'lobby','overview').point,'story');
  assert.equal(hotspotDestination({type:'resource',id:'partners'},'lobby','overview').point,'partners');
  assert.equal(hotspotDestination({type:'resource',id:'products',domain:'beauty'},'beauty','overview').point,'library');
  assert(contentLinkErrors({type:'scene',id:'missing'},'samples',REGISTRY).includes('unknown scene missing'));
  assert.equal(REGISTRY.directory.find(f=>f.id==='products').rooms[0].id,'samples');
});
test('batching retains three real model rotation pivots and their product image mounts', async () => {
  const {root}=await buildScene('beauty');
  batchScene(root);
  const pivots=[];root.traverse(o=>{if(o.userData.inspect)pivots.push(o)});
  assert.equal(pivots.length,3);
  for(const pivot of pivots){
    let meshes=0,refs=0;pivot.traverse(o=>{if(o.isMesh)meshes++;if(o.userData.productReference)refs++});
    assert(meshes>0); assert(refs>0);
  }
  disposeGroup(root);
});
