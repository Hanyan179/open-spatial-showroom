import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { QUALITY_PROFILES, qualityProfile, drawingSize } from '../src/spatial/core/render-quality.js';
import { createSurfaceLibrary, surfaceSample, metricBoxUV } from '../src/spatial/rendering/surface-library.js';
test('quality budgets preserve aspect ratio and respect GPU texture limits at all target displays',()=>{
 for(const [w,h] of [[2496,1248],[1920,1080],[1366,768],[3840,2160]])for(const p of QUALITY_PROFILES)for(const dpr of [1,2]){
  const d=drawingSize(w,h,dpr,p.id,8192);assert(d.width*d.height<=p.pixels);assert(d.width<=8192&&d.height<=8192);assert(Math.abs(d.width/d.height-w/h)<.003);
 }
 assert.equal(qualityProfile('obsolete').id,'clear');assert.equal(drawingSize(2496,1248,1,'clear').width,3120);assert.equal(drawingSize(3840,2160,2,'clear').width,3840);
 assert(drawingSize(9000,6000,2,'detail',2048).width<=2048);
});
test('physical box UV density remains constant across different sized meshes',()=>{
 for(const size of [1,3,9]){const g=metricBoxUV(new T.BoxGeometry(size,2,1),'wood');const uv=g.attributes.uv;const p=g.attributes.position,n=g.attributes.normal;const values=[];for(let i=0;i<p.count;i++)if(n.getZ(i)===1)values.push(uv.getX(i));assert(Math.abs(Math.max(...values)-Math.min(...values)-size*1.3)<1e-5);g.dispose();}
});
test('surface maps repeat without seams and stay owned by their room',()=>{
 for(const family of ['wood','woven','limestone','metal','porcelain','plaster']){
  const a=surfaceSample(family,.17,.41),b=surfaceSample(family,1.17,1.41);for(const k of ['height','rough','tint'])assert(Math.abs(a[k]-b[k])<1e-9);
 }
 const one=createSurfaceLibrary(),two=createSurfaceLibrary(),a=new T.MeshStandardMaterial(),b=new T.MeshStandardMaterial();a.name=b.name='wood';one.apply(a);two.apply(b);assert.notEqual(a.map,b.map);assert.equal(a.map.image.width,512);assert.equal(a.map.colorSpace,T.SRGBColorSpace);assert.equal(a.normalMap.colorSpace,T.NoColorSpace);assert.notEqual(a.map,a.roughnessMap);
 let disposed=0;a.map.addEventListener('dispose',()=>disposed++);one.dispose();one.dispose();assert.equal(disposed,1);two.setQuality(4);assert.equal(b.map.anisotropy,4);two.dispose();a.dispose();b.dispose();
});
