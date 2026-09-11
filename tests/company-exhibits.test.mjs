import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import company from '../public/data/company.json' with {type:'json'};
import { workshop } from '../src/spatial/craft.js';
import { companyGallery } from '../src/spatial/scene-models/company-gallery.js';
import { batchScene } from '../src/spatial/batch-scene.js';
import { resolveAction, hotspotDestination } from '../src/spatial/core/action-router.js';
import { createExhibitResources } from '../src/spatial/exhibit-resources.js';

test('each documented year is a distinct building and retains its chapter action after batching',()=>{
  const a=workshop();companyGallery(a);
  const years=[],targets=new Set(),icons=[];
  a.root.traverse(node=>{if(node.userData.milestone)years.push(node.userData.milestone.year);if(node.userData.icon)icons.push(node.userData.icon.name);});
  assert.deepEqual(years,company.history.map(h=>h.year));
  assert.deepEqual(icons.sort(),['milestones','partners']);
  batchScene(a.root);
  a.root.traverse(node=>{if(node.isMesh&&node.userData.action?.year)targets.add(node.userData.action.year);});
  assert.deepEqual([...targets].sort(),years.toSorted());
  a.root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(a.root);
  assert.ok(bounds.min.x>7.5,'exhibits stay outside the central walking corridor');
});

test('physical year and partner selection survives the shared walk-and-open route',()=>{
  const history={type:'company',id:'history',year:2018};
  const destination=hotspotDestination(history,'lobby','reception');
  assert.equal(destination.point,'story');
  assert.deepEqual(resolveAction(destination.action,'lobby').panel,history);
  const partner={type:'resource',id:'partners',partner:'partner-2'};
  assert.equal(hotspotDestination(partner,'lobby','reception').point,'partners');
  assert.equal(resolveAction(partner,'lobby').panel.partner,'partner-2');
});

test('skyline window animation freezes for reading and reduced motion, and stops after disposal',()=>{
  const root=new T.Group(),tower=new T.Group();root.add(tower);
  tower.userData.milestone={year:2023,index:5,height:1.6,width:.31,depth:.34};
  const feature=createExhibitResources(root);
  const light=tower.children[0];assert.ok(light?.isMesh);
  feature.update(.05,{point:'story'});const value=light.material.opacity;
  for(let i=0;i<20;i++)assert.equal(feature.update(.05,{paused:true,point:'story'}),false);
  assert.equal(light.material.opacity,value);
  feature.update(.05,{reducedMotion:true});assert.equal(light.material.opacity,.55);
  assert.equal(feature.update(.05,{reducedMotion:true}),false);
  feature.dispose();assert.equal(feature.update(.05,{point:'story'}),false);
});
