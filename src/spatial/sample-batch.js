import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';

export function batchSample(root){
 root.updateMatrixWorld(true);const batches=new Map(),old=[];
 root.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const key=mesh.material.uuid;if(!batches.has(key))batches.set(key,{material:mesh.material,geometries:[]});
  const copies=mesh.isInstancedMesh?mesh.count:1,instance=new T.Matrix4();
  for(let i=0;i<copies;i++){
   const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
   if(!geometry.attributes.uv)geometry.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*2),2));
   if(mesh.isInstancedMesh){mesh.getMatrixAt(i,instance);geometry.applyMatrix4(instance);}
   geometry.applyMatrix4(mesh.matrixWorld);batches.get(key).geometries.push(geometry);
  }
  old.push(mesh);
 });
 const originals=new Set();old.forEach(mesh=>{mesh.removeFromParent();originals.add(mesh.geometry);if(mesh.isInstancedMesh)mesh.dispose();});originals.forEach(g=>g.dispose());
 for(const {material,geometries} of batches.values()){const merged=mergeGeometries(geometries);if(!merged)throw Error('Incompatible sample geometry');const geometry=mergeVertices(merged);merged.dispose();const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);geometries.forEach(g=>g.dispose());}
 return root;
}
